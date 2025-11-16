#!/usr/bin/env python3
"""
Test script for Semantic Search and RAG endpoints.
"""
import requests
import json

API_BASE = "http://localhost:8000"
API_KEY = "sovereign-scroll-key-2024"
headers = {
    "X-API-Key": API_KEY,
    "Content-Type": "application/json"
}

def test_semantic_search():
    """Test semantic search endpoint."""
    print("\n" + "="*80)
    print("TESTING SEMANTIC SEARCH")
    print("="*80)

    # Test query about financial performance
    payload = {
        "query": "financial performance and revenue",
        "limit": 5,
        "score_threshold": 0.3
    }

    response = requests.post(
        f"{API_BASE}/api/scrolls/semantic-search",
        headers=headers,
        json=payload
    )

    print(f"\nQuery: {payload['query']}")
    print(f"Status: {response.status_code}")

    if response.status_code == 200:
        result = response.json()
        print(f"Found {result['total']} results:\n")
        for r in result['results']:
            print(f"  - {r['scroll_id']} (score: {r['similarity_score']:.3f})")
            print(f"    {r['content'][:100]}...")
            print()
    else:
        print(f"Error: {response.text}")


def test_rag_question():
    """Test RAG question answering endpoint."""
    print("\n" + "="*80)
    print("TESTING RAG QUESTION ANSWERING")
    print("="*80)

    questions = [
        "What was the Q3 performance like?",
        "Tell me about revenue growth",
        "What are the market forecasts?"
    ]

    for question in questions:
        payload = {
            "question": question,
            "max_context_scrolls": 3,
            "temperature": 0.7
        }

        response = requests.post(
            f"{API_BASE}/api/scrolls/ask",
            headers=headers,
            json=payload
        )

        print(f"\nQuestion: {question}")
        print(f"Status: {response.status_code}")

        if response.status_code == 200:
            result = response.json()
            print(f"Answer: {result['answer']}")
            print(f"Confidence: {result['confidence']}")
            print(f"Sources: {len(result['sources'])} scrolls")
        else:
            print(f"Error: {response.text}")

        print("-" * 80)


if __name__ == "__main__":
    print("=" * 80)
    print("SEMANTIC SEARCH & RAG TEST SUITE")
    print("=" * 80)
    print(f"API: {API_BASE}")
    print(f"Note: Ensure scrolls are loaded and embedding service is running")

    try:
        test_semantic_search()
        test_rag_question()

        print("\n" + "="*80)
        print("✅ ALL TESTS COMPLETED")
        print("="*80)
        print("\nNote: RAG requires OPENAI_API_KEY environment variable")
        print("Set it in docker-compose.scroll-pipeline.yml or .env file")

    except requests.exceptions.ConnectionError:
        print("\n❌ ERROR: Could not connect to API")
        print("Make sure services are running:")
        print("  docker compose -f docker-compose.scroll-pipeline.yml up -d")
    except Exception as e:
        print(f"\n❌ ERROR: {e}")
