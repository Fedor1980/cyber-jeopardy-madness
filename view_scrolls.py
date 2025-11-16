#!/usr/bin/env python3
"""
Simple script to view all stored scrolls in Qdrant.
"""
import requests
import json

QDRANT_URL = "http://localhost:6333"
COLLECTION_NAME = "scrolls"

def view_scrolls():
    """Fetch and display all scrolls from Qdrant."""

    print("=" * 80)
    print("SOVEREIGN SCROLL DATABASE - STORED SCROLLS")
    print("=" * 80)

    # Get collection info
    try:
        response = requests.get(f"{QDRANT_URL}/collections/{COLLECTION_NAME}")
        if response.status_code == 200:
            info = response.json()["result"]
            print(f"\nCollection: {COLLECTION_NAME}")
            print(f"Status: {info['status']}")
            print(f"Total Scrolls: {info['points_count']}")
            print(f"Indexed Vectors: {info['indexed_vectors_count']}")
        else:
            print(f"Error getting collection info: {response.status_code}")
            return
    except Exception as e:
        print(f"Error connecting to Qdrant: {e}")
        print("\nMake sure the pipeline is running:")
        print("  docker compose -f docker-compose.scroll-pipeline.yml up -d")
        return

    # Scroll through all points
    print("\n" + "-" * 80)
    print("STORED SCROLLS")
    print("-" * 80)

    try:
        # Use scroll API to get all points with their payloads
        response = requests.post(
            f"{QDRANT_URL}/collections/{COLLECTION_NAME}/points/scroll",
            json={
                "limit": 100,
                "with_payload": True,
                "with_vector": False
            }
        )

        if response.status_code == 200:
            result = response.json()["result"]
            points = result.get("points", [])

            if not points:
                print("\nNo scrolls stored yet.")
                print("\nTo add test scrolls, run:")
                print("  python produce_scrolls.py")
            else:
                for idx, point in enumerate(points, 1):
                    payload = point["payload"]
                    print(f"\n[Scroll {idx}]")
                    print(f"  UUID: {point['id']}")
                    print(f"  Scroll ID: {payload['scroll_id']}")
                    print(f"  Source System: {payload['source_system']}")
                    print(f"  Consent ID: {payload['consent_id']}")
                    print(f"  Content Preview: {payload['content'][:100]}...")
                    print()
        else:
            print(f"Error fetching scrolls: {response.status_code}")
            print(response.text)

    except Exception as e:
        print(f"Error fetching scrolls: {e}")

    print("=" * 80)
    print(f"\nQdrant Dashboard: {QDRANT_URL}/dashboard")
    print("=" * 80)


if __name__ == "__main__":
    view_scrolls()
