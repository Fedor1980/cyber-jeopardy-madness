"""
Prometheus metrics for Embedding Service
"""
from prometheus_client import Counter, Histogram, Gauge, generate_latest, CONTENT_TYPE_LATEST
from fastapi import Response
import time

# Request metrics
http_requests_total = Counter(
    'embedding_service_http_requests_total',
    'Total HTTP requests',
    ['method', 'endpoint', 'status_code']
)

http_request_duration_seconds = Histogram(
    'embedding_service_http_request_duration_seconds',
    'HTTP request latency in seconds',
    ['method', 'endpoint'],
    buckets=[0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1.0, 2.5, 5.0]
)

# Embedding generation metrics
embeddings_generated_total = Counter(
    'embedding_service_embeddings_generated_total',
    'Total number of embeddings generated'
)

embedding_generation_duration_seconds = Histogram(
    'embedding_service_embedding_generation_duration_seconds',
    'Embedding generation latency in seconds',
    buckets=[0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1.0, 2.0, 5.0]
)

embedding_text_length_characters = Histogram(
    'embedding_service_embedding_text_length_characters',
    'Length of input text for embeddings',
    buckets=[10, 50, 100, 250, 500, 1000, 2500, 5000, 10000]
)

# Model metrics
model_load_duration_seconds = Gauge(
    'embedding_service_model_load_duration_seconds',
    'Time taken to load the embedding model'
)

model_memory_usage_bytes = Gauge(
    'embedding_service_model_memory_usage_bytes',
    'Memory used by the embedding model'
)

model_loaded = Gauge(
    'embedding_service_model_loaded',
    'Whether the model is loaded (1) or not (0)'
)

batch_processing_size = Histogram(
    'embedding_service_batch_processing_size',
    'Number of texts in batch processing',
    buckets=[1, 5, 10, 20, 50, 100]
)

# System metrics
active_connections = Gauge(
    'embedding_service_active_connections',
    'Number of active connections'
)

# Error metrics
errors_total = Counter(
    'embedding_service_errors_total',
    'Total number of errors',
    ['error_type']
)

# Cache metrics (if caching is implemented)
cache_hits_total = Counter(
    'embedding_service_cache_hits_total',
    'Total cache hits'
)

cache_misses_total = Counter(
    'embedding_service_cache_misses_total',
    'Total cache misses'
)


def get_metrics() -> Response:
    """Return Prometheus metrics"""
    return Response(
        content=generate_latest(),
        media_type=CONTENT_TYPE_LATEST
    )


class MetricsMiddleware:
    """Middleware to track request metrics"""

    async def __call__(self, request, call_next):
        # Track active connections
        active_connections.inc()

        # Track request timing
        start_time = time.time()

        try:
            response = await call_next(request)

            # Record metrics
            duration = time.time() - start_time
            http_requests_total.labels(
                method=request.method,
                endpoint=request.url.path,
                status_code=response.status_code
            ).inc()

            http_request_duration_seconds.labels(
                method=request.method,
                endpoint=request.url.path
            ).observe(duration)

            return response

        except Exception as e:
            errors_total.labels(error_type=type(e).__name__).inc()
            raise

        finally:
            active_connections.dec()
