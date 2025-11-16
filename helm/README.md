# Sovereign Scroll Helm Chart

Production-ready Kubernetes deployment for the Sovereign Scroll Platform.

## Prerequisites

- Kubernetes 1.24+
- Helm 3.8+
- PersistentVolume provisioner support (for Kafka, Qdrant)
- Ingress controller (nginx recommended)

## Quick Start

```bash
# Add Helm repository (if hosted)
helm repo add sovereign-scroll https://charts.sovereignscroll.io
helm repo update

# Install with default values
helm install my-scroll sovereign-scroll/sovereign-scroll

# Install with custom values
helm install my-scroll sovereign-scroll/sovereign-scroll -f custom-values.yaml

# Install in specific namespace
helm install my-scroll sovereign-scroll/sovereign-scroll -n sovereign-scroll --create-namespace
```

## Configuration

### Required Values

```yaml
scrollApi:
  apiKey: "YOUR_SECURE_API_KEY_HERE"  # MUST change in production

# Optional: For RAG functionality
scrollApi:
  openaiApiKey: "sk-..."
```

### Recommended Production Values

```yaml
# Enable autoscaling
scrollApi:
  autoscaling:
    enabled: true
    minReplicas: 5
    maxReplicas: 20

# Enable persistence
qdrant:
  persistence:
    enabled: true
    size: 100Gi
    storageClass: "fast-ssd"

kafka:
  persistence:
    enabled: true
    size: 50Gi

# Enable ingress with TLS
ingress:
  enabled: true
  className: "nginx"
  hosts:
    - host: api.your-domain.com
      paths:
        - path: /
  tls:
    - secretName: scroll-api-tls
      hosts:
        - api.your-domain.com

# Enable monitoring
monitoring:
  prometheus:
    enabled: true
  grafana:
    enabled: true
```

## Installation Examples

### Development Environment

```bash
helm install scroll ./sovereign-scroll \
  --set scrollApi.replicas=1 \
  --set embeddingService.replicas=1 \
  --set scrollProcessor.replicas=1 \
  --set qdrant.persistence.enabled=false \
  --set kafka.persistence.enabled=false
```

### Production Environment

```bash
helm install scroll ./sovereign-scroll \
  --set scrollApi.apiKey="$(openssl rand -hex 32)" \
  --set ingress.enabled=true \
  --set ingress.hosts[0].host=api.production.com \
  --set scrollApi.autoscaling.enabled=true \
  --set monitoring.prometheus.enabled=true
```

### AWS EKS

```bash
helm install scroll ./sovereign-scroll \
  --set qdrant.persistence.storageClass="gp3" \
  --set kafka.persistence.storageClass="gp3" \
  --set scrollApi.service.annotations."service\.beta\.kubernetes\.io/aws-load-balancer-type"="nlb"
```

### Azure AKS

```bash
helm install scroll ./sovereign-scroll \
  --set qdrant.persistence.storageClass="managed-premium" \
  --set kafka.persistence.storageClass="managed-premium"
```

### Google GKE

```bash
helm install scroll ./sovereign-scroll \
  --set qdrant.persistence.storageClass="standard-rwo" \
  --set kafka.persistence.storageClass="standard-rwo"
```

## Upgrading

```bash
# Upgrade to new version
helm upgrade scroll ./sovereign-scroll

# Upgrade with new values
helm upgrade scroll ./sovereign-scroll -f new-values.yaml

# Rollback if needed
helm rollback scroll
```

## Uninstall

```bash
helm uninstall scroll

# Remove persistent data (WARNING: DATA LOSS)
kubectl delete pvc -l app.kubernetes.io/instance=scroll
```

## Values Reference

| Parameter | Description | Default |
|-----------|-------------|---------|
| `scrollApi.replicas` | Number of API replicas | `3` |
| `scrollApi.apiKey` | API authentication key | `CHANGE_ME_IN_PRODUCTION` |
| `scrollApi.openaiApiKey` | OpenAI API key for RAG | `""` |
| `embeddingService.replicas` | Number of embedding service replicas | `2` |
| `scrollProcessor.replicas` | Number of processor replicas | `3` |
| `qdrant.persistence.enabled` | Enable Qdrant persistence | `true` |
| `qdrant.persistence.size` | Qdrant PVC size | `20Gi` |
| `kafka.persistence.enabled` | Enable Kafka persistence | `true` |
| `kafka.persistence.size` | Kafka PVC size | `10Gi` |
| `ingress.enabled` | Enable ingress | `true` |
| `monitoring.prometheus.enabled` | Enable Prometheus | `true` |

## Monitoring

Access monitoring:

```bash
# Port-forward Grafana
kubectl port-forward svc/scroll-grafana 3000:80

# Port-forward Prometheus
kubectl port-forward svc/scroll-prometheus 9090:9090
```

Default Grafana credentials:
- Username: `admin`
- Password: Retrieve with `kubectl get secret scroll-grafana -o jsonpath="{.data.admin-password}" | base64 --decode`

## Troubleshooting

### Check pod status
```bash
kubectl get pods -l app.kubernetes.io/instance=scroll
```

### View logs
```bash
kubectl logs -l app.kubernetes.io/component=api
kubectl logs -l app.kubernetes.io/component=processor
```

### Check resource usage
```bash
kubectl top pods -l app.kubernetes.io/instance=scroll
```

### Debug connection issues
```bash
kubectl run debug --rm -it --image=busybox -- /bin/sh
# Inside pod:
wget -O- http://scroll-api:8000/health
```

## Security Notes

1. **Change default API key** in production
2. **Enable TLS** for ingress
3. **Use secrets** for sensitive values
4. **Enable network policies** for pod-to-pod communication
5. **Regular security updates** for all images

## Support

- Documentation: https://docs.sovereignscroll.io
- Issues: https://github.com/Fedor1980/cyber-jeopardy-madness/issues
- Community: https://community.sovereignscroll.io
