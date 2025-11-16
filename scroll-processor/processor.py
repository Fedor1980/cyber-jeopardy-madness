import json
import time
import os
import sys
import uuid
from kafka import KafkaConsumer
from pydantic import BaseModel, Field, ValidationError
import requests
from qdrant_client import QdrantClient
from qdrant_client.models import Distance, VectorParams, PointStruct

# --- Configuration from Environment ---
KAFKA_BROKER = os.getenv('KAFKA_BROKER', 'localhost:9092')
KAFKA_TOPIC = os.getenv('KAFKA_TOPIC', 'scrolls.raw')
KAFKA_GROUP_ID = os.getenv('KAFKA_GROUP_ID', 'scroll-processor-group')
OPA_URL = os.getenv('OPA_URL', 'http://localhost:8181')
QDRANT_HOST = os.getenv('QDRANT_HOST', 'localhost')
QDRANT_PORT = int(os.getenv('QDRANT_PORT', '6333'))
COLLECTION_NAME = 'scrolls'

# --- Pydantic Schema ---
class Scroll(BaseModel):
    """Defines the structure of the incoming raw scroll data."""
    scroll_id: str = Field(..., description="Unique ID for the scroll.")
    content: str = Field(..., description="The raw textual content.")
    source_system: str = Field(..., description="Origin system name.")
    consent_id: str = Field(..., description="DLT record ID for governance verification.")


def check_consent_with_opa(consent_id: str) -> bool:
    """
    Queries OPA to verify if the consent_id is authorized.
    Returns True if consent is granted, False otherwise.
    """
    try:
        response = requests.post(
            f"{OPA_URL}/v1/data/scrolls/consent/allow",
            json={"input": {"consent_id": consent_id}},
            timeout=5
        )

        if response.status_code == 200:
            result = response.json()
            allowed = result.get('result', False)
            print(f"  OPA Consent Check for {consent_id}: {'ALLOWED' if allowed else 'DENIED'}")
            return allowed
        else:
            print(f"  OPA returned status {response.status_code}, denying by default")
            return False

    except Exception as e:
        print(f"  Error checking consent with OPA: {e}")
        return False


def initialize_qdrant():
    """
    Initialize Qdrant client and create collection if it doesn't exist.
    """
    client = QdrantClient(host=QDRANT_HOST, port=QDRANT_PORT)

    # Check if collection exists
    try:
        client.get_collection(collection_name=COLLECTION_NAME)
        print(f"Collection '{COLLECTION_NAME}' already exists")
    except Exception:
        # Create collection with a simple vector configuration
        # Using a placeholder dimension since we're not doing actual embeddings yet
        client.create_collection(
            collection_name=COLLECTION_NAME,
            vectors_config=VectorParams(size=384, distance=Distance.COSINE)
        )
        print(f"Created collection '{COLLECTION_NAME}'")

    return client


def store_in_qdrant(client, scroll_data: dict):
    """
    Stores validated scroll in Qdrant vector database.
    For now, using a dummy vector since we're not generating embeddings yet.
    """
    try:
        # Create a simple dummy vector (in production, this would be from an embedding model)
        dummy_vector = [0.1] * 384

        # Generate a deterministic UUID from the scroll_id
        point_id = str(uuid.uuid5(uuid.NAMESPACE_DNS, scroll_data['scroll_id']))

        point = PointStruct(
            id=point_id,
            vector=dummy_vector,
            payload={
                'scroll_id': scroll_data['scroll_id'],
                'content': scroll_data['content'],
                'source_system': scroll_data['source_system'],
                'consent_id': scroll_data['consent_id']
            }
        )

        client.upsert(
            collection_name=COLLECTION_NAME,
            points=[point]
        )

        print(f"  Stored in Qdrant: {scroll_data['scroll_id']}")
        return True

    except Exception as e:
        print(f"  Error storing in Qdrant: {e}")
        return False


def process_message(message, qdrant_client):
    """
    Process a single Kafka message through the validation and consent pipeline.
    """
    try:
        # Parse the message
        scroll_data = json.loads(message.value.decode('utf-8'))
        scroll_id = scroll_data.get('scroll_id', 'unknown')

        print(f"\n--- Processing Scroll: {scroll_id} ---")

        # Step 1: Pydantic Schema Validation
        try:
            validated_scroll = Scroll(**scroll_data)
            print(f"  Schema Validation: PASSED")
        except ValidationError as e:
            print(f"  Schema Validation: FAILED")
            print(f"  Validation errors: {e}")
            print(f"  Scroll {scroll_id} REJECTED (Invalid Schema)")
            return

        # Step 2: OPA Consent Check
        consent_allowed = check_consent_with_opa(validated_scroll.consent_id)

        if not consent_allowed:
            print(f"  Scroll {scroll_id} REJECTED (Consent Denied)")
            return

        # Step 3: Store in Qdrant
        stored = store_in_qdrant(qdrant_client, validated_scroll.model_dump())

        if stored:
            print(f"  Scroll {scroll_id} ACCEPTED")
        else:
            print(f"  Scroll {scroll_id} FAILED to store")

    except json.JSONDecodeError as e:
        print(f"  Error decoding JSON: {e}")
    except Exception as e:
        print(f"  Unexpected error: {e}")


def main():
    """
    Main entry point for the scroll processor.
    """
    print("=" * 60)
    print("Sovereign Scroll Processor Starting...")
    print("=" * 60)
    print(f"Kafka Broker: {KAFKA_BROKER}")
    print(f"Kafka Topic: {KAFKA_TOPIC}")
    print(f"OPA URL: {OPA_URL}")
    print(f"Qdrant: {QDRANT_HOST}:{QDRANT_PORT}")
    print("=" * 60)

    # Initialize Qdrant
    print("\nInitializing Qdrant...")
    qdrant_client = initialize_qdrant()

    # Wait for Kafka to be ready
    print("\nConnecting to Kafka...")
    retry_count = 0
    max_retries = 30

    while retry_count < max_retries:
        try:
            consumer = KafkaConsumer(
                KAFKA_TOPIC,
                bootstrap_servers=[KAFKA_BROKER],
                group_id=KAFKA_GROUP_ID,
                auto_offset_reset='earliest',
                enable_auto_commit=True,
                value_deserializer=lambda m: m
            )
            print(f"Connected to Kafka topic: {KAFKA_TOPIC}")
            break
        except Exception as e:
            retry_count += 1
            print(f"Waiting for Kafka... (attempt {retry_count}/{max_retries})")
            time.sleep(2)

    if retry_count >= max_retries:
        print("Failed to connect to Kafka after maximum retries")
        sys.exit(1)

    print("\nListening for scrolls...")
    print("=" * 60)

    # Process messages
    try:
        for message in consumer:
            process_message(message, qdrant_client)
    except KeyboardInterrupt:
        print("\n\nShutting down scroll processor...")
    finally:
        consumer.close()
        print("Scroll processor stopped")


if __name__ == '__main__':
    main()
