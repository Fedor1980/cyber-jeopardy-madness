"""
Prometheus metrics for Scroll API
"""
from prometheus_client import Counter, Histogram, Gauge, generate_latest, CONTENT_TYPE_LATEST
from fastapi import Response
import time

# Request metrics
http_requests_total = Counter(
    'scroll_api_http_requests_total',
    'Total HTTP requests',
    ['method', 'endpoint', 'status_code']
)

http_request_duration_seconds = Histogram(
    'scroll_api_http_request_duration_seconds',
    'HTTP request latency in seconds',
    ['method', 'endpoint'],
    buckets=[0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1.0, 2.5, 5.0, 10.0]
)

# Scroll operation metrics
scrolls_stored_total = Counter(
    'scroll_api_scrolls_stored_total',
    'Total number of scrolls stored'
)

scrolls_retrieved_total = Counter(
    'scroll_api_scrolls_retrieved_total',
    'Total number of scrolls retrieved'
)

scrolls_search_total = Counter(
    'scroll_api_scrolls_search_total',
    'Total number of semantic search requests',
    ['search_type']
)

# RAG metrics
rag_questions_total = Counter(
    'scroll_api_rag_questions_total',
    'Total number of RAG questions asked'
)

rag_question_duration_seconds = Histogram(
    'scroll_api_rag_question_duration_seconds',
    'RAG question answering latency in seconds',
    buckets=[0.1, 0.5, 1.0, 2.0, 5.0, 10.0, 30.0, 60.0]
)

rag_context_scrolls = Histogram(
    'scroll_api_rag_context_scrolls',
    'Number of scrolls used in RAG context',
    buckets=[1, 2, 3, 5, 10, 20, 50]
)

# Qdrant metrics
qdrant_operations_total = Counter(
    'scroll_api_qdrant_operations_total',
    'Total Qdrant operations',
    ['operation', 'status']
)

qdrant_operation_duration_seconds = Histogram(
    'scroll_api_qdrant_operation_duration_seconds',
    'Qdrant operation latency in seconds',
    ['operation'],
    buckets=[0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1.0, 2.5, 5.0]
)

# Embedding service metrics
embedding_requests_total = Counter(
    'scroll_api_embedding_requests_total',
    'Total embedding service requests',
    ['status']
)

embedding_request_duration_seconds = Histogram(
    'scroll_api_embedding_request_duration_seconds',
    'Embedding service request latency in seconds',
    buckets=[0.01, 0.05, 0.1, 0.25, 0.5, 1.0, 2.0, 5.0]
)

# OpenAI metrics
openai_requests_total = Counter(
    'scroll_api_openai_requests_total',
    'Total OpenAI API requests',
    ['status']
)

openai_request_duration_seconds = Histogram(
    'scroll_api_openai_request_duration_seconds',
    'OpenAI API request latency in seconds',
    buckets=[0.5, 1.0, 2.0, 5.0, 10.0, 20.0, 30.0, 60.0]
)

openai_tokens_used = Counter(
    'scroll_api_openai_tokens_used_total',
    'Total OpenAI tokens used',
    ['model', 'type']
)

# System metrics
active_connections = Gauge(
    'scroll_api_active_connections',
    'Number of active connections'
)

# Error metrics
errors_total = Counter(
    'scroll_api_errors_total',
    'Total number of errors',
    ['error_type']
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
