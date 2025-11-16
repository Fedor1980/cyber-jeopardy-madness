#!/usr/bin/env python3
"""
Test script for Sovereign Scroll API.
Demonstrates all API endpoints with proper authentication.
"""
import requests
import json

# Configuration
API_BASE_URL = "http://localhost:8000"
API_KEY = "sovereign-scroll-key-2024"

# Headers with API key
headers = {
    "X-API-Key": API_KEY,
    "Content-Type": "application/json"
}

def print_section(title):
    """Print a formatted section header."""
    print("\n" + "=" * 80)
    print(f"  {title}")
    print("=" * 80)

def print_response(response):
    """Print formatted API response."""
    print(f"Status: {response.status_code}")
    if response.status_code == 200:
        print(json.dumps(response.json(), indent=2))
    else:
        print(f"Error: {response.text}")

def test_root():
    """Test root endpoint (no auth required)."""
    print_section("1. API Info (GET /)")
    response = requests.get(f"{API_BASE_URL}/")
    print_response(response)

def test_health():
    """Test health check endpoint (no auth required)."""
    print_section("2. Health Check (GET /health)")
    response = requests.get(f"{API_BASE_URL}/health")
    print_response(response)

def test_list_scrolls():
    """Test list scrolls endpoint."""
    print_section("3. List All Scrolls (GET /api/scrolls)")
    response = requests.get(
        f"{API_BASE_URL}/api/scrolls",
        headers=headers,
        params={"limit": 10}
    )
    print_response(response)
    return response.json() if response.status_code == 200 else None

def test_get_scroll(scroll_id):
    """Test get specific scroll endpoint."""
    print_section(f"4. Get Specific Scroll (GET /api/scrolls/{scroll_id})")
    response = requests.get(
        f"{API_BASE_URL}/api/scrolls/{scroll_id}",
        headers=headers
    )
    print_response(response)

def test_search_scrolls():
    """Test search scrolls endpoint."""
    print_section("5. Search Scrolls (POST /api/scrolls/search)")

    print("\n--- Search by source_system: Finance_Report ---")
    response = requests.post(
        f"{API_BASE_URL}/api/scrolls/search",
        headers=headers,
        json={
            "source_system": "Finance_Report",
            "limit": 10
        }
    )
    print_response(response)

    print("\n--- Search all (no filter) ---")
    response = requests.post(
        f"{API_BASE_URL}/api/scrolls/search",
        headers=headers,
        json={"limit": 10}
    )
    print_response(response)

def test_unauthorized():
    """Test unauthorized access (wrong API key)."""
    print_section("6. Unauthorized Access Test (Wrong API Key)")
    response = requests.get(
        f"{API_BASE_URL}/api/scrolls",
        headers={"X-API-Key": "wrong-key"}
    )
    print(f"Status: {response.status_code}")
    print(f"Response: {response.json()}")

def main():
    """Run all API tests."""
    print("=" * 80)
    print("  SOVEREIGN SCROLL API - TEST SUITE")
    print("=" * 80)
    print(f"\nAPI Base URL: {API_BASE_URL}")
    print(f"API Key: {API_KEY[:20]}...")

    try:
        # Test endpoints
        test_root()
        test_health()

        # List scrolls and get first scroll_id
        scrolls_data = test_list_scrolls()
        if scrolls_data and scrolls_data.get('scrolls'):
            first_scroll_id = scrolls_data['scrolls'][0]['scroll_id']
            test_get_scroll(first_scroll_id)

        test_search_scrolls()
        test_unauthorized()

        print_section("✅ All Tests Completed")
        print("\nAPI Documentation: http://localhost:8000/docs")
        print("Interactive API: http://localhost:8000/redoc")

    except requests.exceptions.ConnectionError:
        print("\n❌ ERROR: Could not connect to API")
        print("\nMake sure the API is running:")
        print("  docker compose -f docker-compose.scroll-pipeline.yml up -d scroll-api")
    except Exception as e:
        print(f"\n❌ ERROR: {e}")

if __name__ == "__main__":
    main()
