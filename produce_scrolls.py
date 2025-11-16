import json
import time
import random
from kafka import KafkaProducer
from pydantic import BaseModel, Field

# --- Configuration ---
KAFKA_BROKER = 'localhost:9092'
KAFKA_TOPIC = 'scrolls.raw'

# --- Mock Data and Schema ---
class Scroll(BaseModel):
    """Defines the structure of the incoming raw scroll data."""
    scroll_id: str = Field(..., description="Unique ID for the scroll.")
    content: str = Field(..., description="The raw textual content (simulating Tika output).")
    source_system: str = Field(..., description="Origin system name (e.g., 'CRM', 'Legal_Sharepoint').")
    consent_id: str = Field(..., description="DLT record ID for governance verification.")

def generate_mock_scrolls():
    """Generates a list of mock scrolls for testing."""
    scrolls = [
        # 1. Valid Scroll: Should pass all checks
        Scroll(
            scroll_id="doc-valid-001",
            content="The company's Q3 performance showed strong revenue growth, resulting in a positive market forecast for the next fiscal year.",
            source_system="Finance_Report",
            consent_id="0xAb1C2D3E4F5a6B7c8D9e0F1a2B3c4D5e6F7a8B9c"
            # This ID must be present in mock_consents.json with "CONSENTED" status
        ),

        # 2. Invalid Schema Scroll: Missing the 'content' field
        # We manually generate the dictionary to violate the Pydantic schema
        {
            "scroll_id": "doc-invalid-schema-002",
            "source_system": "HR_Memo",
            "consent_id": "0xAb1C2D3E4F5a6B7c8D9e0F1a2B3c4D5e6F7a8B9c"
            # The 'content' field is deliberately missing
        },

        # 3. No Consent Scroll: Valid schema, invalid/non-existent consent
        Scroll(
            scroll_id="doc-no-consent-003",
            content="Confidential legal notes regarding the new EU AI Act compliance roadmap.",
            source_system="Legal_Notes",
            consent_id="0xDEADBEEF00000000000000000000000000000000"
            # This ID should not exist or be marked "DENIED" in mock_consents.json
        )
    ]

    # Convert Pydantic models to dictionaries for serialization
    processed_scrolls = []
    for scroll in scrolls:
        if isinstance(scroll, Scroll):
            processed_scrolls.append(scroll.model_dump())
        else:
            processed_scrolls.append(scroll) # Keep the dict for the invalid case

    return processed_scrolls

def produce_messages(producer, messages):
    """Sends the mock messages to the Kafka topic."""
    print(f"Connecting to Kafka broker at {KAFKA_BROKER}...")

    for i, msg in enumerate(messages):
        key = msg['scroll_id'].encode('utf-8')
        try:
            # Pydantic validation step can happen here, before Kafka, or inside the consumer.
            # For this producer, we allow the invalid message to test the consumer's robustness.

            value = json.dumps(msg).encode('utf-8')

            # Send the message
            future = producer.send(
                KAFKA_TOPIC,
                key=key,
                value=value
            )

            # Block for async send to complete
            _ = future.get(timeout=10)

            print(f"[{i+1}/{len(messages)}] Produced Scroll: {msg['scroll_id']} | Status: Success")
            time.sleep(random.uniform(0.5, 1.5)) # Simulate real-world ingestion flow

        except Exception as e:
            print(f"[{i+1}/{len(messages)}] Produced Scroll: {msg.get('scroll_id', 'Unknown')} | Status: FAILED")
            print(f"Error: {e}")

    producer.flush()
    print("\n--- Production finished. ---")


if __name__ == '__main__':
    # Initialize Kafka Producer
    producer = KafkaProducer(
        bootstrap_servers=[KAFKA_BROKER],
        key_serializer=lambda k: k,
        value_serializer=lambda v: v,
        api_version=(2, 0, 0)
    )

    mock_scrolls = generate_mock_scrolls()
    produce_messages(producer, mock_scrolls)
