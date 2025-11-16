# 🚀 Quick Start - Test Enterprise Platform

## Prerequisites
- Docker Desktop running on Windows
- Terminal open in project directory: `cyber-jeopardy-madness/`
- All previous scrolls cleared (fresh start)

## Step 1: Start All Services

```bash
# Clean up any previous containers
docker compose -f docker-compose.scroll-pipeline.yml down -v

# Start all services
docker compose -f docker-compose.scroll-pipeline.yml up -d

# Wait 60 seconds for all services to start
timeout 60
```

## Step 2: Verify Services Are Running

```bash
# Check service status
docker compose -f docker-compose.scroll-pipeline.yml ps

# You should see all services as "running":
# - kafka
# - qdrant
# - opa
# - scroll-processor
# - embedding-service
# - scroll-api
```

## Step 3: Produce Test Scrolls

```bash
# Install Python dependencies (if not already done)
pip install kafka-python-ng pydantic

# Produce 3 test scrolls (1 valid, 2 invalid)
python produce_scrolls.py
```

**Expected Output:**
```
Produced scroll: doc-valid-001 - Consent: 0xAb1C2D3E4F5a6B7c8D9e0F1a2B3c4D5e6F7a8B9c
Produced scroll: doc-invalid-002 - Consent: 0xDEADBEEF...
Produced scroll: doc-no-consent-003 - Consent: None
```

## Step 4: Run Enterprise Feature Tests

```bash
# Install test dependencies
pip install requests

# Run comprehensive test suite
python test_enterprise_features.py
```

**Expected Tests:**
- ✅ Health checks (API + Embedding Service)
- ✅ Prometheus metrics endpoints
- ✅ Embedding generation
- ✅ Scroll listing
- ✅ Semantic search
- ✅ RAG question answering (requires OPENAI_API_KEY)
- ✅ Batch embedding generation

## Step 5: Test Individual Features

### Test Health
```bash
curl http://localhost:8000/health
curl http://localhost:8001/health
```

### Test Metrics (Phase 5A)
```bash
# API metrics
curl http://localhost:8000/metrics

# Embedding service metrics
curl http://localhost:8001/metrics
```

### Test Semantic Search (Phase 1)
```bash
curl -X POST http://localhost:8000/api/scrolls/semantic-search \
  -H "X-API-Key: sovereign-scroll-key-2024" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "financial performance",
    "limit": 5,
    "score_threshold": 0.3
  }'
```

### Test Embedding Generation (Phase 1)
```bash
curl -X POST http://localhost:8001/embed \
  -H "Content-Type: application/json" \
  -d '{
    "text": "This is a test document for embedding generation"
  }'
```

### Test RAG Question Answering (Phase 1)
**Note:** Requires OPENAI_API_KEY environment variable

```bash
# Set OpenAI API key (if you have one)
export OPENAI_API_KEY="sk-..."

# Restart scroll-api with the key
docker compose -f docker-compose.scroll-pipeline.yml restart scroll-api

# Ask a question
curl -X POST http://localhost:8000/api/scrolls/ask \
  -H "X-API-Key: sovereign-scroll-key-2024" \
  -H "Content-Type: application/json" \
  -d '{
    "question": "What were the Q3 results?",
    "max_context_scrolls": 3,
    "temperature": 0.7
  }'
```

### View Stored Scrolls
```bash
python view_scrolls.py
```

## Step 6: Check Logs

```bash
# View all logs
docker compose -f docker-compose.scroll-pipeline.yml logs

# View specific service logs
docker compose -f docker-compose.scroll-pipeline.yml logs scroll-api
docker compose -f docker-compose.scroll-pipeline.yml logs scroll-processor
docker compose -f docker-compose.scroll-pipeline.yml logs embedding-service

# Follow logs in real-time
docker compose -f docker-compose.scroll-pipeline.yml logs -f
```

## Step 7: Test Performance (Phase 10)

```bash
# Install locust
pip install locust

# Run load test (100 users, 5 minutes)
locust -f benchmarks/locustfile.py \
       --host http://localhost:8000 \
       --users 100 \
       --spawn-rate 10 \
       --run-time 5m \
       --html load-test-report.html
```

## Expected Results

### ✅ Success Indicators

1. **Scroll Processing:**
   - 1 valid scroll accepted and stored
   - 2 invalid scrolls rejected (wrong consent, missing consent)

2. **Semantic Search:**
   - Returns relevant scrolls ranked by similarity
   - Response time < 100ms

3. **Embeddings:**
   - 384-dimensional vectors generated
   - Response time < 100ms per embedding

4. **Metrics:**
   - Prometheus metrics exposed on `/metrics`
   - Counters, histograms, and gauges visible

5. **RAG (if API key provided):**
   - Natural language answers generated
   - Sources cited from scroll database

## Troubleshooting

### Services Not Starting
```bash
# Check Docker Desktop is running
docker info

# Restart Docker Desktop
# Then retry: docker compose up -d
```

### Connection Refused Errors
```bash
# Wait longer for services to initialize
timeout 30

# Check service health
docker compose ps
docker compose logs scroll-api
```

### No Scrolls Found
```bash
# Check processor logs
docker compose logs scroll-processor

# Check Qdrant
curl http://localhost:6333/collections/scrolls

# Re-run producer
python produce_scrolls.py
```

### Import Errors
```bash
# Install all dependencies
pip install -r scroll-api/requirements.txt
pip install -r embedding-service/requirements.txt
pip install -r scroll-processor/requirements.txt
```

## Testing Advanced Features

### Phase 3: Compliance Policies
- Already active via OPA
- Check logs for policy decisions
- Templates in `config/opa/templates/`

### Phase 4A: Kubernetes
```bash
# Lint Helm chart
helm lint helm/sovereign-scroll

# Dry-run deployment
helm install test helm/sovereign-scroll --dry-run --debug
```

### Phase 4B: CI/CD
- Push code to GitHub to trigger workflows
- Check `.github/workflows/` for pipeline definitions

### Phase 5B: Grafana Dashboard
- Import `grafana/dashboards/scroll-api-overview.json`
- Point to Prometheus at `http://localhost:9090`

### Phase 6: Anomaly Detection
```bash
# Build anomaly detection service
cd anomaly-detection
docker build -t anomaly-detection:latest .

# Run service
docker run -p 8002:8002 anomaly-detection:latest

# Test detection
curl http://localhost:8002/health
```

### Phase 7A: JWT Authentication
- Code in `scroll-api/auth.py`
- Requires database setup for production
- Currently using API key for simplicity

## Cleanup

```bash
# Stop all services
docker compose -f docker-compose.scroll-pipeline.yml down

# Remove all data (fresh start)
docker compose -f docker-compose.scroll-pipeline.yml down -v
```

## Next Steps

1. ✅ **Verify basic functionality works**
2. 🚀 **Configure OPENAI_API_KEY for RAG** (optional)
3. 📊 **Set up Grafana for monitoring** (optional)
4. ☸️  **Deploy to Kubernetes** for production
5. 🔐 **Enable JWT auth** for production
6. 🔗 **Configure enterprise connectors** (S3, Snowflake, etc.)

---

**Need Help?**
- Review `ENTERPRISE_PLATFORM_COMPLETE.md` for full documentation
- Check service logs: `docker compose logs [service-name]`
- See implementation guides in `docs/` folder
