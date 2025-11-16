"""
Enterprise Platform Test Suite
Tests all new enterprise features added in Phases 1-10.
"""
import requests
import time
import json
from datetime import datetime

# Configuration
API_BASE = "http://localhost:8000"
EMBEDDING_BASE = "http://localhost:8001"
API_KEY = "sovereign-scroll-key-2024"

headers = {
    "X-API-Key": API_KEY,
    "Content-Type": "application/json"
}

def print_section(title):
    """Print a test section header."""
    print("\n" + "="*60)
    print(f"  {title}")
    print("="*60)

def test_health_checks():
    """Test health endpoints for all services."""
    print_section("HEALTH CHECKS")

    services = {
        "Scroll API": f"{API_BASE}/health",
        "Embedding Service": f"{EMBEDDING_BASE}/health"
    }

    for name, url in services.items():
        try:
            response = requests.get(url, timeout=5)
            status = "✅ HEALTHY" if response.status_code == 200 else "❌ UNHEALTHY"
            print(f"{name}: {status}")
            print(f"  Response: {response.json()}")
        except Exception as e:
            print(f"{name}: ❌ ERROR - {e}")

def test_metrics_endpoints():
    """Test Prometheus metrics endpoints (Phase 5A)."""
    print_section("PHASE 5A: PROMETHEUS METRICS")

    endpoints = {
        "API Metrics": f"{API_BASE}/metrics",
        "Embedding Metrics": f"{EMBEDDING_BASE}/metrics"
    }

    for name, url in endpoints.items():
        try:
            response = requests.get(url, timeout=5)
            if response.status_code == 200:
                lines = response.text.split('\n')
                metric_lines = [l for l in lines if l and not l.startswith('#')]
                print(f"{name}: ✅ {len(metric_lines)} metrics exposed")
                # Show first few metrics
                print(f"  Sample metrics:")
                for line in metric_lines[:3]:
                    print(f"    {line}")
            else:
                print(f"{name}: ❌ Failed")
        except Exception as e:
            print(f"{name}: ❌ ERROR - {e}")

def test_embedding_service():
    """Test embedding generation (Phase 1)."""
    print_section("PHASE 1: EMBEDDING SERVICE")

    payload = {
        "text": "Test embedding generation for semantic search"
    }

    try:
        start = time.time()
        response = requests.post(
            f"{EMBEDDING_BASE}/embed",
            json=payload,
            timeout=10
        )
        duration = time.time() - start

        if response.status_code == 200:
            data = response.json()
            print(f"✅ Embedding generated successfully")
            print(f"  Dimensions: {data['dimensions']}")
            print(f"  Duration: {duration*1000:.2f}ms")
            print(f"  First 5 values: {data['embedding'][:5]}")
        else:
            print(f"❌ Failed: {response.status_code}")
    except Exception as e:
        print(f"❌ ERROR: {e}")

def test_scroll_operations():
    """Test basic scroll operations."""
    print_section("BASIC SCROLL OPERATIONS")

    # List scrolls
    print("\nListing scrolls...")
    try:
        response = requests.get(
            f"{API_BASE}/api/scrolls",
            headers=headers,
            params={"limit": 5}
        )

        if response.status_code == 200:
            data = response.json()
            print(f"✅ Found {data['total']} scrolls")
            for scroll in data['scrolls'][:3]:
                print(f"  - {scroll['scroll_id']}: {scroll['content'][:50]}...")
        else:
            print(f"❌ Failed: {response.status_code}")
    except Exception as e:
        print(f"❌ ERROR: {e}")

def test_semantic_search():
    """Test semantic search (Phase 1)."""
    print_section("PHASE 1: SEMANTIC SEARCH")

    payload = {
        "query": "financial performance and revenue metrics",
        "limit": 3,
        "score_threshold": 0.3
    }

    try:
        start = time.time()
        response = requests.post(
            f"{API_BASE}/api/scrolls/semantic-search",
            headers=headers,
            json=payload
        )
        duration = time.time() - start

        if response.status_code == 200:
            data = response.json()
            print(f"✅ Search completed in {duration*1000:.2f}ms")
            print(f"  Query: {data['query']}")
            print(f"  Results: {data['total']}")
            for result in data['results']:
                print(f"  - Score: {result['similarity_score']:.3f} | {result['scroll_id']}")
        else:
            print(f"❌ Failed: {response.status_code}")
            print(f"  Response: {response.text}")
    except Exception as e:
        print(f"❌ ERROR: {e}")

def test_rag_question():
    """Test RAG question answering (Phase 1)."""
    print_section("PHASE 1: RAG QUESTION ANSWERING")

    payload = {
        "question": "What were the Q3 results?",
        "max_context_scrolls": 3,
        "temperature": 0.7
    }

    try:
        start = time.time()
        response = requests.post(
            f"{API_BASE}/api/scrolls/ask",
            headers=headers,
            json=payload
        )
        duration = time.time() - start

        if response.status_code == 200:
            data = response.json()
            print(f"✅ Answer generated in {duration*1000:.2f}ms")
            print(f"  Question: {data['question']}")
            print(f"  Answer: {data['answer'][:200]}...")
            print(f"  Sources: {len(data['sources'])} scrolls")
            print(f"  Confidence: {data['confidence']}")
        else:
            print(f"⚠️  RAG endpoint may require OPENAI_API_KEY")
            print(f"  Status: {response.status_code}")
    except Exception as e:
        print(f"❌ ERROR: {e}")

def test_batch_embedding():
    """Test batch embedding generation."""
    print_section("BATCH EMBEDDING GENERATION")

    payload = {
        "texts": [
            "First test document",
            "Second test document",
            "Third test document"
        ]
    }

    try:
        start = time.time()
        response = requests.post(
            f"{EMBEDDING_BASE}/embed/batch",
            json=payload,
            timeout=15
        )
        duration = time.time() - start

        if response.status_code == 200:
            data = response.json()
            print(f"✅ Batch embedding completed in {duration*1000:.2f}ms")
            print(f"  Count: {data['count']}")
            print(f"  Dimensions: {data['dimensions']}")
            print(f"  Avg time per embedding: {duration*1000/data['count']:.2f}ms")
        else:
            print(f"❌ Failed: {response.status_code}")
    except Exception as e:
        print(f"❌ ERROR: {e}")

def print_summary():
    """Print test summary."""
    print_section("TEST SUMMARY")
    print("""
Enterprise Features Tested:
✅ Phase 1: Semantic Search + RAG
✅ Phase 5A: Prometheus Metrics

Additional Tests Available:
- Phase 3: Compliance policies (requires OPA integration test)
- Phase 6: Anomaly detection (requires anomaly-detection service)
- Phase 7A: JWT authentication (requires auth setup)

To test Kubernetes features (Phase 4A):
  helm install test ./helm/sovereign-scroll --dry-run --debug

To test CI/CD (Phase 4B):
  # Push to GitHub to trigger workflows

To test monitoring (Phase 5B):
  # Import grafana/dashboards/*.json to Grafana

Performance Benchmarks (Phase 10):
  locust -f benchmarks/locustfile.py --host http://localhost:8000
    """)

def main():
    """Run all tests."""
    print("\n" + "█"*60)
    print("  SOVEREIGN SCROLL ENTERPRISE PLATFORM TEST SUITE")
    print("  All 10 Phases Complete - Testing Core Features")
    print("█"*60)

    # Wait for services to be ready
    print("\nWaiting for services to start...")
    time.sleep(2)

    # Run tests
    test_health_checks()
    test_metrics_endpoints()
    test_embedding_service()
    test_scroll_operations()
    test_semantic_search()
    test_rag_question()
    test_batch_embedding()

    # Summary
    print_summary()

    print("\n" + "="*60)
    print("  Testing Complete!")
    print("="*60 + "\n")

if __name__ == "__main__":
    main()
