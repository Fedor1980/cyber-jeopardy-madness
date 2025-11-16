"""
Prometheus metrics for Scroll Processor
"""
from prometheus_client import Counter, Histogram, Gauge, start_http_server
import time

# Kafka consumer metrics
kafka_messages_consumed_total = Counter(
    'scroll_processor_kafka_messages_consumed_total',
    'Total Kafka messages consumed',
    ['topic']
)

kafka_messages_processed_total = Counter(
    'scroll_processor_kafka_messages_processed_total',
    'Total Kafka messages successfully processed',
    ['topic']
)

kafka_messages_failed_total = Counter(
    'scroll_processor_kafka_messages_failed_total',
    'Total Kafka messages failed to process',
    ['topic', 'reason']
)

kafka_consumer_lag = Gauge(
    'scroll_processor_kafka_consumer_lag',
    'Current Kafka consumer lag',
    ['topic', 'partition']
)

# Scroll processing metrics
scrolls_validated_total = Counter(
    'scroll_processor_scrolls_validated_total',
    'Total scrolls validated'
)

scrolls_invalid_total = Counter(
    'scroll_processor_scrolls_invalid_total',
    'Total invalid scrolls',
    ['reason']
)

scroll_validation_duration_seconds = Histogram(
    'scroll_processor_scroll_validation_duration_seconds',
    'Scroll validation latency in seconds',
    buckets=[0.001, 0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1.0]
)

# OPA policy evaluation metrics
opa_checks_total = Counter(
    'scroll_processor_opa_checks_total',
    'Total OPA policy checks',
    ['result']
)

opa_check_duration_seconds = Histogram(
    'scroll_processor_opa_check_duration_seconds',
    'OPA policy check latency in seconds',
    buckets=[0.001, 0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5]
)

opa_consents_allowed = Counter(
    'scroll_processor_opa_consents_allowed_total',
    'Total consents allowed by OPA'
)

opa_consents_denied = Counter(
    'scroll_processor_opa_consents_denied_total',
    'Total consents denied by OPA',
    ['reason']
)

# Embedding service metrics
embedding_requests_total = Counter(
    'scroll_processor_embedding_requests_total',
    'Total embedding service requests',
    ['status']
)

embedding_request_duration_seconds = Histogram(
    'scroll_processor_embedding_request_duration_seconds',
    'Embedding service request latency in seconds',
    buckets=[0.01, 0.05, 0.1, 0.25, 0.5, 1.0, 2.0, 5.0]
)

embedding_vector_dimensions = Gauge(
    'scroll_processor_embedding_vector_dimensions',
    'Number of dimensions in embedding vectors'
)

# Qdrant storage metrics
qdrant_stores_total = Counter(
    'scroll_processor_qdrant_stores_total',
    'Total Qdrant store operations',
    ['status']
)

qdrant_store_duration_seconds = Histogram(
    'scroll_processor_qdrant_store_duration_seconds',
    'Qdrant store operation latency in seconds',
    buckets=[0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1.0, 2.5, 5.0]
)

# System metrics
processor_uptime_seconds = Gauge(
    'scroll_processor_uptime_seconds',
    'Processor uptime in seconds'
)

active_processing_tasks = Gauge(
    'scroll_processor_active_processing_tasks',
    'Number of currently active processing tasks'
)

# Error metrics
errors_total = Counter(
    'scroll_processor_errors_total',
    'Total errors by type',
    ['error_type']
)

processing_pipeline_duration_seconds = Histogram(
    'scroll_processor_processing_pipeline_duration_seconds',
    'End-to-end processing pipeline latency in seconds',
    ['stage'],
    buckets=[0.01, 0.05, 0.1, 0.25, 0.5, 1.0, 2.0, 5.0, 10.0]
)


def start_metrics_server(port: int = 8080):
    """Start Prometheus metrics HTTP server"""
    start_http_server(port)
    print(f"Metrics server started on port {port}")


class MetricsContext:
    """Context manager for tracking operation metrics"""

    def __init__(self, metric_histogram, labels=None):
        self.metric = metric_histogram
        self.labels = labels or {}
        self.start_time = None

    def __enter__(self):
        self.start_time = time.time()
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        duration = time.time() - self.start_time
        if self.labels:
            self.metric.labels(**self.labels).observe(duration)
        else:
            self.metric.observe(duration)
