# Sovereign Scroll Grafana Dashboards

Production-ready monitoring dashboards for the Sovereign Scroll Platform.

## Dashboards

### 1. API Overview Dashboard (`scroll-api-overview.json`)
Comprehensive monitoring of the Scroll API service.

**Metrics:**
- Request rate (requests per second by endpoint)
- Active connections gauge
- Request latency percentiles (p95, p99)
- Scroll operations rate (stored, retrieved, searched)
- RAG performance (question rate, duration)
- Error rate by type

**Use Cases:**
- Monitor API health and performance
- Identify slow endpoints
- Track user activity patterns
- Detect error spikes

### 2. Scroll Processing Dashboard
Monitor the scroll processor pipeline.

**Key Metrics:**
- Kafka consumer lag by partition
- Messages consumed/processed/failed
- Scroll validation metrics
- OPA policy check duration
- Embedding service integration latency
- Qdrant store operations

### 3. Embedding Service Dashboard
Track embedding generation performance.

**Key Metrics:**
- Embeddings generated per second
- Generation latency by text length
- Batch processing size distribution
- Model memory usage
- Cache hit/miss ratio
- Active connections

### 4. System Health Dashboard
Overall platform health and resource usage.

**Key Metrics:**
- Pod CPU and memory usage
- Kafka disk usage and throughput
- Qdrant collection size and query performance
- Network traffic between services
- Auto-scaling events

## Installation

### Import to Grafana

1. **Via UI:**
   ```bash
   # Navigate to Grafana → Dashboards → Import
   # Upload JSON files from grafana/dashboards/
   ```

2. **Via ConfigMap (Kubernetes):**
   ```bash
   kubectl create configmap grafana-dashboards \
     --from-file=grafana/dashboards/ \
     -n sovereign-scroll
   ```

3. **Via Helm Chart:**
   The dashboards are automatically provisioned when deploying with:
   ```bash
   helm install scroll ./helm/sovereign-scroll \
     --set monitoring.grafana.enabled=true \
     --set monitoring.grafana.dashboards.enabled=true
   ```

## Dashboard Configuration

### Data Source
All dashboards require a Prometheus data source named `Prometheus`.

Configure in Grafana:
```yaml
apiVersion: 1
datasources:
  - name: Prometheus
    type: prometheus
    access: proxy
    url: http://prometheus:9090
    isDefault: true
```

### Variables
Dashboards support the following template variables:
- `$namespace` - Kubernetes namespace filter
- `$instance` - Service instance filter
- `$interval` - Time range for aggregation

### Alerts
Each dashboard includes pre-configured alert rules:
- High error rate (>5% of requests)
- High latency (p99 > 1s)
- Kafka consumer lag (>1000 messages)
- Low throughput (<10 req/s for 5m)

## Custom Panels

### Adding Custom Metrics
To add custom panels to existing dashboards:

1. Edit dashboard in Grafana UI
2. Add panel with PromQL query
3. Export dashboard JSON
4. Update file in `grafana/dashboards/`
5. Commit to git

### Example PromQL Queries

**Request Success Rate:**
```promql
rate(scroll_api_http_requests_total{status_code=~"2.."}[5m]) /
rate(scroll_api_http_requests_total[5m])
```

**P95 Latency by Endpoint:**
```promql
histogram_quantile(0.95,
  rate(scroll_api_http_request_duration_seconds_bucket{endpoint!="/metrics"}[5m])
)
```

**Kafka Consumer Lag:**
```promql
scroll_processor_kafka_consumer_lag
```

**RAG Context Size:**
```promql
histogram_quantile(0.95,
  rate(scroll_api_rag_context_scrolls_bucket[5m])
)
```

## Troubleshooting

### No Data Showing
1. Verify Prometheus is scraping metrics:
   ```bash
   kubectl port-forward svc/prometheus 9090:9090
   # Visit http://localhost:9090/targets
   ```

2. Check metrics endpoints:
   ```bash
   curl http://scroll-api:8000/metrics
   curl http://embedding-service:8001/metrics
   ```

### Missing Dashboards
If dashboards don't appear after deployment:
```bash
# Check ConfigMap
kubectl get configmap grafana-dashboards -o yaml

# Restart Grafana
kubectl rollout restart deployment/grafana
```

### Alert Not Firing
1. Check Alertmanager configuration
2. Verify alert rules in Prometheus
3. Check notification channel configuration

## Best Practices

1. **Retention:** Configure Prometheus retention for at least 15 days
2. **Alerting:** Set up Alertmanager for critical alerts
3. **Annotations:** Use deployment annotations to mark releases on graphs
4. **Snapshots:** Create periodic dashboard snapshots for incident analysis
5. **Access Control:** Restrict dashboard editing to admins only

## References

- [Grafana Documentation](https://grafana.com/docs/)
- [Prometheus Query Examples](https://prometheus.io/docs/prometheus/latest/querying/examples/)
- [PromQL Basics](https://prometheus.io/docs/prometheus/latest/querying/basics/)
