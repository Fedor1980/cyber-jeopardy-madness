# Phase 7B: mTLS and Encryption Implementation

## Overview
Mutual TLS (mTLS) provides service-to-service authentication and encryption for the Sovereign Scroll platform.

## Architecture

```
┌──────────────┐     mTLS      ┌──────────────┐
│  Scroll API  │◄─────────────►│   Qdrant     │
└──────────────┘                └──────────────┘
       │                               │
       │ mTLS                          │ mTLS
       ▼                               ▼
┌──────────────┐                ┌──────────────┐
│  Embedding   │                │     OPA      │
│   Service    │                └──────────────┘
└──────────────┘
```

## Implementation Steps

### 1. Certificate Authority (CA) Setup

```bash
# Generate CA private key
openssl genrsa -out ca-key.pem 4096

# Generate CA certificate
openssl req -new -x509 -days 3650 -key ca-key.pem -out ca-cert.pem \
  -subj "/C=US/ST=State/L=City/O=SovereignScroll/CN=Sovereign Scroll CA"
```

### 2. Service Certificates

Generate certificates for each service:

```bash
#!/bin/bash
# generate-service-certs.sh

SERVICES=("scroll-api" "embedding-service" "scroll-processor" "qdrant" "opa")

for service in "${SERVICES[@]}"; do
  # Generate private key
  openssl genrsa -out "${service}-key.pem" 4096

  # Generate CSR
  openssl req -new -key "${service}-key.pem" -out "${service}-csr.pem" \
    -subj "/C=US/ST=State/L=City/O=SovereignScroll/CN=${service}"

  # Sign with CA
  openssl x509 -req -in "${service}-csr.pem" -CA ca-cert.pem -CAkey ca-key.pem \
    -CAcreateserial -out "${service}-cert.pem" -days 365

  # Create Kubernetes secret
  kubectl create secret tls "${service}-tls" \
    --cert="${service}-cert.pem" \
    --key="${service}-key.pem" \
    --namespace=sovereign-scroll
done
```

### 3. Kubernetes ConfigMap for CA Certificate

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: ca-certificates
  namespace: sovereign-scroll
data:
  ca-cert.pem: |
    -----BEGIN CERTIFICATE-----
    [CA Certificate Content]
    -----END CERTIFICATE-----
```

### 4. Service Mesh Integration (Istio)

```yaml
apiVersion: security.istio.io/v1beta1
kind: PeerAuthentication
metadata:
  name: default
  namespace: sovereign-scroll
spec:
  mtls:
    mode: STRICT

---
apiVersion: networking.istio.io/v1beta1
kind: DestinationRule
metadata:
  name: scroll-api-mtls
  namespace: sovereign-scroll
spec:
  host: scroll-api.sovereign-scroll.svc.cluster.local
  trafficPolicy:
    tls:
      mode: ISTIO_MUTUAL
```

### 5. Python Client Configuration

Update services to use mTLS:

```python
# scroll-api/client_mtls.py
import ssl
import requests
from requests.adapters import HTTPAdapter
from urllib3.util.ssl_ import create_urllib3_context

class MTLSAdapter(HTTPAdapter):
    def __init__(self, cert_file, key_file, ca_file):
        self.cert_file = cert_file
        self.key_file = key_file
        self.ca_file = ca_file
        super().__init__()

    def init_poolmanager(self, *args, **kwargs):
        context = create_urllib3_context()
        context.load_cert_chain(
            certfile=self.cert_file,
            keyfile=self.key_file
        )
        context.load_verify_locations(self.ca_file)
        context.verify_mode = ssl.CERT_REQUIRED
        kwargs['ssl_context'] = context
        return super().init_poolmanager(*args, **kwargs)

# Usage
session = requests.Session()
session.mount('https://', MTLSAdapter(
    cert_file='/certs/scroll-api-cert.pem',
    key_file='/certs/scroll-api-key.pem',
    ca_file='/certs/ca-cert.pem'
))

response = session.get('https://qdrant:6333/collections')
```

### 6. Qdrant mTLS Configuration

```yaml
# qdrant-config.yaml
service:
  enable_tls: true
  tls:
    cert: /certs/qdrant-cert.pem
    key: /certs/qdrant-key.pem
    ca_cert: /certs/ca-cert.pem
    verify_client_cert: true
```

### 7. Kafka mTLS Configuration

```yaml
# kafka-mtls.properties
security.protocol=SSL
ssl.truststore.location=/certs/truststore.jks
ssl.truststore.password=changeit
ssl.keystore.location=/certs/keystore.jks
ssl.keystore.password=changeit
ssl.key.password=changeit
ssl.client.auth=required
ssl.endpoint.identification.algorithm=
```

## Encryption at Rest

### 1. Qdrant Storage Encryption

```yaml
# qdrant storage encryption
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: qdrant-storage
  annotations:
    volume.beta.kubernetes.io/storage-class: encrypted-ssd
spec:
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 100Gi
```

### 2. Kafka Encryption

```yaml
# Kafka broker encryption
KAFKA_LISTENERS: SSL://0.0.0.0:9093
KAFKA_ADVERTISED_LISTENERS: SSL://kafka:9093
KAFKA_SSL_KEYSTORE_LOCATION: /certs/keystore.jks
KAFKA_SSL_KEYSTORE_PASSWORD: changeit
KAFKA_SSL_KEY_PASSWORD: changeit
KAFKA_SSL_TRUSTSTORE_LOCATION: /certs/truststore.jks
KAFKA_SSL_TRUSTSTORE_PASSWORD: changeit
KAFKA_SSL_CLIENT_AUTH: required
```

## Testing mTLS

```bash
# Test mTLS connection
curl --cert scroll-api-cert.pem \
     --key scroll-api-key.pem \
     --cacert ca-cert.pem \
     https://qdrant:6333/collections

# Verify certificate
openssl x509 -in scroll-api-cert.pem -text -noout

# Check certificate validity
openssl verify -CAfile ca-cert.pem scroll-api-cert.pem
```

## Certificate Rotation

```bash
#!/bin/bash
# rotate-certificates.sh

# 1. Generate new certificates with new expiration
./generate-service-certs.sh

# 2. Update Kubernetes secrets
for service in scroll-api embedding-service scroll-processor; do
  kubectl create secret tls "${service}-tls" \
    --cert="${service}-cert.pem" \
    --key="${service}-key.pem" \
    --namespace=sovereign-scroll \
    --dry-run=client -o yaml | kubectl apply -f -
done

# 3. Rolling restart services
kubectl rollout restart deployment/scroll-api -n sovereign-scroll
kubectl rollout restart deployment/embedding-service -n sovereign-scroll
kubectl rollout restart deployment/scroll-processor -n sovereign-scroll
```

## Monitoring

```promql
# Certificate expiration monitoring
probe_ssl_earliest_cert_expiry{job="scroll-api"} - time()

# Alert when certificates expire in < 30 days
alert: CertificateExpiryWarning
expr: probe_ssl_earliest_cert_expiry - time() < 30 * 24 * 3600
labels:
  severity: warning
annotations:
  summary: "Certificate expires soon"
```

## Security Best Practices

1. **Key Management**: Use HashiCorp Vault or AWS KMS for key storage
2. **Certificate Rotation**: Automate rotation every 90 days
3. **Monitoring**: Alert on certificate expiration
4. **Mutual Authentication**: Require client certificates for all service-to-service communication
5. **Strong Ciphers**: Use TLS 1.3 with strong cipher suites only

## Production Checklist

- [ ] CA certificates generated and secured
- [ ] Service certificates generated for all components
- [ ] Kubernetes secrets created
- [ ] mTLS enabled on all services
- [ ] Certificate rotation automation configured
- [ ] Monitoring alerts configured
- [ ] Encryption at rest enabled
- [ ] Backup of CA private key secured
- [ ] Documentation updated
- [ ] Team trained on certificate management
