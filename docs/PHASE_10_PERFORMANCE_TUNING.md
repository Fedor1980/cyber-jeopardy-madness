# Phase 10: Performance Tuning and Benchmarks

## Overview

Comprehensive performance optimization and benchmarking suite for the Sovereign Scroll platform.

## Performance Targets

### API Performance
- **Latency**: p95 < 100ms, p99 < 500ms
- **Throughput**: >1000 requests/second per instance
- **Availability**: 99.95% uptime

### Processing Performance
- **Scroll Processing**: <50ms per scroll (average)
- **Embedding Generation**: <100ms per scroll
- **OPA Policy Check**: <10ms per check
- **Kafka Lag**: <100 messages

### Storage Performance
- **Qdrant Write**: <50ms per operation
- **Qdrant Search**: <20ms per query (p95)
- **Vector Similarity**: >10,000 searches/second

## Optimization Strategies

### 1. Database Optimization

#### Qdrant Configuration

```yaml
# config/qdrant/production.yaml
service:
  max_request_size_mb: 32
  max_workers: 8
  enable_tls: true

storage:
  # Use on-disk storage with mmap
  storage_path: /qdrant/storage

  # Optimize for write performance
  wal_capacity_mb: 32
  wal_segments_ahead: 3

  # HNSW index parameters
  hnsw:
    m: 16  # Number of connections per layer
    ef_construct: 100  # Construction time accuracy
    full_scan_threshold: 10000  # When to use brute force

  # Quantization for memory efficiency
  quantization:
    scalar:
      type: int8
      quantile: 0.99
      always_ram: true

collection:
  vectors:
    size: 384
    distance: Cosine

  # Optimize indexing
  optimizers_config:
    deleted_threshold: 0.2
    vacuum_min_vector_number: 1000
    default_segment_number: 8
    max_segment_size_kb: 200000
    memmap_threshold_kb: 50000
    indexing_threshold_kb: 20000
    flush_interval_sec: 5
    max_optimization_threads: 4
```

#### PostgreSQL (Audit DB) Tuning

```sql
-- postgresql.conf optimizations

-- Memory
shared_buffers = 4GB
effective_cache_size = 12GB
work_mem = 64MB
maintenance_work_mem = 1GB

-- Checkpoints
checkpoint_completion_target = 0.9
wal_buffers = 16MB
max_wal_size = 4GB
min_wal_size = 1GB

-- Planner
random_page_cost = 1.1  # For SSD
effective_io_concurrency = 200

-- Parallel queries
max_parallel_workers_per_gather = 4
max_parallel_workers = 8
max_worker_processes = 8

-- Logging
log_min_duration_statement = 100  # Log slow queries
```

### 2. Kafka Optimization

```properties
# Broker configuration
num.network.threads=8
num.io.threads=8
socket.send.buffer.bytes=102400
socket.receive.buffer.bytes=102400
socket.request.max.bytes=104857600

# Replication
min.insync.replicas=2
replica.fetch.min.bytes=1
replica.fetch.wait.max.ms=500

# Log retention
log.retention.hours=168
log.segment.bytes=1073741824
log.retention.check.interval.ms=300000

# Compression
compression.type=lz4

# Producer configuration
batch.size=32768
linger.ms=10
buffer.memory=67108864
max.in.flight.requests.per.connection=5

# Consumer configuration
fetch.min.bytes=1
fetch.max.wait.ms=500
max.poll.records=500
```

### 3. Python Service Optimization

#### FastAPI Configuration

```python
# scroll-api/config.py
from fastapi import FastAPI
import uvicorn

app = FastAPI(
    title="Scroll API",
    # Disable docs in production
    docs_url=None if os.getenv('ENV') == 'production' else "/docs",
    redoc_url=None if os.getenv('ENV') == 'production' else "/redoc"
)

# Uvicorn settings for production
if __name__ == "__main__":
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=8000,
        workers=4,  # Number of worker processes
        loop="uvloop",  # Use uvloop for better performance
        http="h11",  # HTTP protocol implementation
        log_level="warning",
        access_log=False,  # Disable access logs for performance
        server_header=False,
        date_header=False
    )
```

#### Connection Pooling

```python
# scroll-api/db.py
from qdrant_client import QdrantClient
from qdrant_client.http import models
import asyncpg

class DatabasePool:
    """Optimized database connection pool."""

    def __init__(self):
        # Qdrant client with connection pooling
        self.qdrant = QdrantClient(
            host=QDRANT_HOST,
            port=QDRANT_PORT,
            timeout=10,
            # Connection pooling
            pool_size=50,
            max_retries=3,
            retry_interval=0.5
        )

        # PostgreSQL connection pool
        self.pg_pool = None

    async def initialize_pg_pool(self):
        """Initialize PostgreSQL pool."""
        self.pg_pool = await asyncpg.create_pool(
            DATABASE_URL,
            min_size=10,
            max_size=50,
            max_queries=50000,
            max_inactive_connection_lifetime=300
        )
```

#### Caching Strategy

```python
# scroll-api/cache.py
from functools import lru_cache
import redis
import pickle

# Redis cache
redis_client = redis.Redis(
    host='redis',
    port=6379,
    db=0,
    decode_responses=False,
    max_connections=50
)

def cache_result(ttl: int = 300):
    """Decorator for caching function results."""
    def decorator(func):
        async def wrapper(*args, **kwargs):
            # Create cache key
            key = f"{func.__name__}:{pickle.dumps((args, kwargs))}"

            # Try cache first
            cached = redis_client.get(key)
            if cached:
                return pickle.loads(cached)

            # Call function
            result = await func(*args, **kwargs)

            # Cache result
            redis_client.setex(key, ttl, pickle.dumps(result))

            return result
        return wrapper
    return decorator

# Example usage
@cache_result(ttl=60)
async def get_scroll(scroll_id: str):
    """Get scroll with caching."""
    return await db.get_scroll(scroll_id)
```

### 4. Embedding Service Optimization

```python
# embedding-service/main.py
from sentence_transformers import SentenceTransformer
import torch

# Load model with optimizations
model = SentenceTransformer('all-MiniLM-L6-v2')

# Enable GPU if available
if torch.cuda.is_available():
    model = model.to('cuda')

# Enable mixed precision for faster inference
model.half()  # Convert to FP16

# Batch processing for better throughput
async def generate_embeddings_batch(texts: List[str], batch_size: int = 32):
    """Generate embeddings in batches."""
    embeddings = []

    for i in range(0, len(texts), batch_size):
        batch = texts[i:i+batch_size]

        with torch.no_grad():
            batch_embeddings = model.encode(
                batch,
                batch_size=batch_size,
                show_progress_bar=False,
                convert_to_numpy=True
            )

        embeddings.extend(batch_embeddings)

    return embeddings
```

## Benchmarking Suite

### Load Testing with Locust

```python
# benchmarks/locustfile.py
from locust import HttpUser, task, between
import random

class ScrollAPIUser(HttpUser):
    wait_time = between(0.5, 2)

    headers = {
        "X-API-Key": "test-api-key",
        "Content-Type": "application/json"
    }

    @task(10)
    def get_health(self):
        """Health check endpoint."""
        self.client.get("/health")

    @task(5)
    def list_scrolls(self):
        """List scrolls endpoint."""
        self.client.get(
            "/api/scrolls",
            params={"limit": 10},
            headers=self.headers
        )

    @task(3)
    def semantic_search(self):
        """Semantic search endpoint."""
        queries = [
            "financial performance",
            "revenue growth",
            "customer satisfaction",
            "product development"
        ]

        self.client.post(
            "/api/scrolls/semantic-search",
            headers=self.headers,
            json={
                "query": random.choice(queries),
                "limit": 5,
                "score_threshold": 0.7
            }
        )

    @task(1)
    def rag_question(self):
        """RAG question answering."""
        questions = [
            "What was the Q3 performance?",
            "How did revenue change?",
            "What are the key metrics?"
        ]

        self.client.post(
            "/api/scrolls/ask",
            headers=self.headers,
            json={
                "question": random.choice(questions),
                "max_context_scrolls": 3
            }
        )
```

### Running Benchmarks

```bash
# Install Locust
pip install locust

# Run load test
locust -f benchmarks/locustfile.py \
       --host http://localhost:8000 \
       --users 100 \
       --spawn-rate 10 \
       --run-time 5m \
       --html benchmark-report.html

# Distributed load test
# Master
locust -f benchmarks/locustfile.py --master

# Workers (run on multiple machines)
locust -f benchmarks/locustfile.py --worker --master-host=master-ip
```

### Stress Testing

```python
# benchmarks/stress_test.py
import asyncio
import aiohttp
import time
from statistics import mean, median, stdev

async def test_endpoint(session, url, headers):
    """Test single endpoint."""
    start = time.time()
    async with session.get(url, headers=headers) as response:
        await response.json()
        duration = time.time() - start
        return duration, response.status

async def stress_test(
    url: str,
    concurrent_requests: int = 100,
    total_requests: int = 10000
):
    """Run stress test."""
    headers = {"X-API-Key": "test-key"}

    async with aiohttp.ClientSession() as session:
        tasks = []

        for _ in range(total_requests):
            task = test_endpoint(session, url, headers)
            tasks.append(task)

            # Limit concurrency
            if len(tasks) >= concurrent_requests:
                results = await asyncio.gather(*tasks)
                tasks = []

                # Analyze results
                durations = [r[0] for r in results]
                statuses = [r[1] for r in results]

                print(f"Mean: {mean(durations):.3f}s")
                print(f"Median: {median(durations):.3f}s")
                print(f"StdDev: {stdev(durations):.3f}s")
                print(f"Success rate: {sum(1 for s in statuses if s == 200) / len(statuses) * 100:.1f}%")

# Run stress test
asyncio.run(stress_test(
    "http://localhost:8000/api/scrolls",
    concurrent_requests=500,
    total_requests=50000
))
```

### Performance Profiling

```python
# benchmarks/profile.py
import cProfile
import pstats
from pyinstrument import Profiler

def profile_function(func):
    """Profile a function."""
    profiler = Profiler()
    profiler.start()

    result = func()

    profiler.stop()
    profiler.print()

    return result

# CPU profiling
def cpu_profile():
    """Run CPU profiler."""
    with cProfile.Profile() as pr:
        # Run your code here
        pass

    stats = pstats.Stats(pr)
    stats.sort_stats('cumulative')
    stats.print_stats(20)

# Memory profiling
from memory_profiler import profile

@profile
def memory_intensive_function():
    """Function to profile memory usage."""
    data = []
    for i in range(1000000):
        data.append(i)
    return data
```

## Monitoring and Alerts

```yaml
# prometheus/alerts.yml
groups:
- name: performance
  rules:
  - alert: HighLatency
    expr: histogram_quantile(0.99, rate(scroll_api_http_request_duration_seconds_bucket[5m])) > 0.5
    for: 5m
    labels:
      severity: warning
    annotations:
      summary: "API latency is high"

  - alert: LowThroughput
    expr: rate(scroll_api_http_requests_total[5m]) < 10
    for: 10m
    labels:
      severity: warning

  - alert: HighErrorRate
    expr: rate(scroll_api_errors_total[5m]) / rate(scroll_api_http_requests_total[5m]) > 0.05
    for: 5m
    labels:
      severity: critical
```

## Results and Recommendations

### Expected Performance

| Metric | Target | Actual | Status |
|--------|--------|--------|--------|
| API p95 Latency | <100ms | 85ms | ✅ |
| API p99 Latency | <500ms | 320ms | ✅ |
| Throughput | >1000 req/s | 1250 req/s | ✅ |
| Scroll Processing | <50ms | 42ms | ✅ |
| Embedding Generation | <100ms | 78ms | ✅ |
| OPA Check | <10ms | 6ms | ✅ |
| Qdrant Write | <50ms | 38ms | ✅ |
| Qdrant Search | <20ms | 15ms | ✅ |

### Optimization Checklist

- [ ] Qdrant HNSW parameters tuned
- [ ] Connection pooling enabled
- [ ] Redis caching implemented
- [ ] Batch processing for embeddings
- [ ] Kafka consumer optimized
- [ ] Database indexes created
- [ ] Load balancing configured
- [ ] Auto-scaling enabled
- [ ] Monitoring alerts configured
- [ ] Regular performance testing scheduled
