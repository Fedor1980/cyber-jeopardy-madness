# End-to-End Testing Guide
## Cyber Jeopardy Madness - Scroll Processing Pipeline

This guide walks through testing the complete scroll ingestion, validation, and consent verification pipeline.

---

## Overview

The testing pipeline validates three critical components:
1. **Ingestion:** Kafka message consumption
2. **Validation:** Pydantic schema validation
3. **Consent Verification:** OPA policy enforcement with mock DLT data

---

## Test Architecture

```
produce_scrolls.py → Kafka (scrolls.raw) → scroll-processor → OPA → Vector DB
                                                ↓
                                          Validation & Consent Check
                                                ↓
                                    [Valid] [Invalid Schema] [No Consent]
```

---

## Prerequisites

### 1. Running Infrastructure

Ensure all services are running:

```bash
docker compose up -d
```

Verify services:

```bash
docker compose ps
```

Expected services:
- `kafka` - Running on port 9092
- `opa` - Running on port 8181
- `scroll-processor` - Consuming from Kafka
- `qdrant` - Vector database on port 6333

### 2. Python Environment

Create a virtual environment:

```bash
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

Install producer dependencies:

```bash
pip install -r producer_requirements.txt
```

---

## Test Scenarios

The `produce_scrolls.py` script generates three test messages:

### Scenario 1: Valid Scroll ✅

**Message:**
```json
{
  "scroll_id": "doc-valid-001",
  "content": "The company's Q3 performance showed strong revenue growth...",
  "source_system": "Finance_Report",
  "consent_id": "0xAb1C2D3E4F5a6B7c8D9e0F1a2B3c4D5e6F7a8B9c"
}
```

**Expected Outcome:**
- ✅ Schema validation passes (all required fields present)
- ✅ OPA consent check passes (consent_id exists in `mock_consents.json` with status "CONSENTED")
- ✅ Message processed and sent to vector database

**Log Output:**
```
[scroll-processor] INFO: Received scroll: doc-valid-001
[scroll-processor] INFO: Schema validation: PASSED
[scroll-processor] INFO: OPA consent check: ALLOWED
[scroll-processor] INFO: Scroll doc-valid-001 processed successfully
```

---

### Scenario 2: Invalid Schema ❌

**Message:**
```json
{
  "scroll_id": "doc-invalid-schema-002",
  "source_system": "HR_Memo",
  "consent_id": "0xAb1C2D3E4F5a6B7c8D9e0F1a2B3c4D5e6F7a8B9c"
  # Missing 'content' field
}
```

**Expected Outcome:**
- ❌ Schema validation fails (missing required field `content`)
- ❌ Message rejected before consent check
- ❌ Error logged, message not processed

**Log Output:**
```
[scroll-processor] ERROR: Schema validation failed for scroll: doc-invalid-schema-002
[scroll-processor] ERROR: ValidationError: Field required: content
[scroll-processor] INFO: Scroll rejected - invalid schema
```

---

### Scenario 3: No Consent ⛔

**Message:**
```json
{
  "scroll_id": "doc-no-consent-003",
  "content": "Confidential legal notes regarding the new EU AI Act...",
  "source_system": "Legal_Notes",
  "consent_id": "0xDEADBEEF00000000000000000000000000000000"
}
```

**Expected Outcome:**
- ✅ Schema validation passes
- ❌ OPA consent check fails (consent_id not in `mock_consents.json` or status is "DENIED")
- ❌ Message rejected with consent failure

**Log Output:**
```
[scroll-processor] INFO: Received scroll: doc-no-consent-003
[scroll-processor] INFO: Schema validation: PASSED
[scroll-processor] WARNING: OPA consent check: DENIED
[scroll-processor] WARNING: Consent denied for consent_id: 0xDEADBEEF...
[scroll-processor] INFO: Scroll rejected - consent denied
```

---

## Running the Test

### Step 1: Verify Mock Consent Data

Check that the valid consent ID exists in OPA's mock data:

```bash
cat config/opa/mock_consents.json
```

Ensure this entry exists:
```json
{
  "consent_id": "0xAb1C2D3E4F5a6B7c8D9e0F1a2B3c4D5e6F7a8B9c",
  "status": "CONSENTED",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

### Step 2: Monitor Processor Logs

In one terminal, tail the scroll-processor logs:

```bash
docker logs -f scroll-processor
```

### Step 3: Run the Producer

In another terminal (with venv activated):

```bash
python produce_scrolls.py
```

**Expected Output:**
```
Connecting to Kafka broker at localhost:9092...
[1/3] Produced Scroll: doc-valid-001 | Status: Success
[2/3] Produced Scroll: doc-invalid-schema-002 | Status: Success
[3/3] Produced Scroll: doc-no-consent-003 | Status: Success

--- Production finished. ---
```

Note: "Success" here means successfully sent to Kafka, not that all passed validation.

### Step 4: Analyze Processor Logs

Watch the scroll-processor terminal for validation results:

```
Expected flow:

Message 1 (doc-valid-001):
  ✅ Consumed from Kafka
  ✅ Schema validation passed
  ✅ OPA consent check passed
  ✅ Processed successfully

Message 2 (doc-invalid-schema-002):
  ✅ Consumed from Kafka
  ❌ Schema validation FAILED
  ⏭️ Skipped (rejected before consent check)

Message 3 (doc-no-consent-003):
  ✅ Consumed from Kafka
  ✅ Schema validation passed
  ❌ OPA consent check FAILED
  ⏭️ Skipped (consent denied)
```

---

## Verification Checklist

After running the test, verify:

- [ ] All 3 messages were sent to Kafka successfully
- [ ] Scroll-processor consumed all 3 messages
- [ ] Message 1 passed all checks and was processed
- [ ] Message 2 failed schema validation (logged error)
- [ ] Message 3 failed consent check (logged warning)
- [ ] No crashes or unhandled exceptions
- [ ] Qdrant received exactly 1 document (from message 1)

---

## Querying Qdrant

Verify that only the valid scroll was stored:

```bash
curl -X POST 'http://localhost:6333/collections/scrolls/points/scroll' \
  -H 'Content-Type: application/json' \
  -d '{
    "limit": 10,
    "with_payload": true,
    "with_vector": false
  }'
```

**Expected Result:**
- 1 point with `scroll_id: "doc-valid-001"`
- No points for `doc-invalid-schema-002` or `doc-no-consent-003`

---

## Troubleshooting

### Producer Can't Connect to Kafka

**Error:** `NoBrokersAvailable` or `KafkaConnectionError`

**Solution:**
```bash
# Verify Kafka is running
docker compose ps kafka

# Check Kafka logs
docker logs kafka

# Restart Kafka if needed
docker compose restart kafka

# Wait 30 seconds for Kafka to be ready
sleep 30
```

### No Messages in Scroll Processor

**Error:** Scroll-processor shows no activity

**Solution:**
```bash
# Verify processor is running
docker compose ps scroll-processor

# Check if it's consuming
docker logs scroll-processor | grep "Connecting to Kafka"

# Verify topic exists
docker exec -it kafka kafka-topics.sh --list --bootstrap-server localhost:9092

# Restart processor
docker compose restart scroll-processor
```

### OPA Returns Errors

**Error:** `OPA connection refused` or `consent check failed unexpectedly`

**Solution:**
```bash
# Verify OPA is running
curl http://localhost:8181/health

# Check OPA loaded the policy
curl http://localhost:8181/v1/policies

# Reload mock data
docker compose restart opa

# Test OPA directly
curl -X POST http://localhost:8181/v1/data/scrolls/allow \
  -H 'Content-Type: application/json' \
  -d '{"input": {"consent_id": "0xAb1C2D3E4F5a6B7c8D9e0F1a2B3c4D5e6F7a8B9c"}}'
```

### Schema Validation Always Passes

**Error:** Invalid schema scroll (message 2) not being rejected

**Solution:**
```bash
# Check Pydantic version in scroll-processor
docker exec scroll-processor pip show pydantic

# Verify processor code has validation logic
docker exec scroll-processor cat /app/processor.py | grep "Scroll.model_validate"

# Check processor logs for validation errors
docker logs scroll-processor | grep -i "validation"
```

---

## Advanced Testing

### Custom Test Messages

Modify `produce_scrolls.py` to test additional scenarios:

```python
# Test expired consent
Scroll(
    scroll_id="doc-expired-consent",
    content="Test content",
    source_system="Test",
    consent_id="0xEXPIRED000000000000000000000000000000000"
)

# Test missing consent_id field
{
    "scroll_id": "doc-missing-consent-field",
    "content": "Test content",
    "source_system": "Test"
    # consent_id field missing entirely
}

# Test malformed JSON (send raw bytes)
producer.send(KAFKA_TOPIC, b'{"scroll_id": "malformed", "content": }')
```

### Load Testing

Generate high volume:

```python
def load_test(count=1000):
    for i in range(count):
        scroll = Scroll(
            scroll_id=f"load-test-{i}",
            content=f"Load test content {i}",
            source_system="LoadTest",
            consent_id="0xAb1C2D3E4F5a6B7c8D9e0F1a2B3c4D5e6F7a8B9c"
        )
        produce_messages(producer, [scroll.model_dump()])
```

Monitor resource usage:
```bash
docker stats
```

### Latency Testing

Measure end-to-end processing time:

```python
import time

start = time.time()
producer.send(KAFKA_TOPIC, message).get(timeout=10)
# Watch scroll-processor logs for completion
end = time.time()
print(f"Processing latency: {end - start:.2f}s")
```

---

## Metrics to Monitor

### Success Metrics
- **Throughput:** Messages/second processed
- **Latency:** Time from producer send to vector DB insert
- **Success Rate:** Valid scrolls processed / Total scrolls received

### Error Metrics
- **Schema Validation Failures:** Count and reasons
- **Consent Denials:** Count by consent_id
- **Processing Errors:** Unhandled exceptions

### System Metrics
- **Kafka Lag:** Consumer offset lag
- **OPA Response Time:** Policy evaluation latency
- **Qdrant Insert Time:** Vector DB write latency

---

## Continuous Testing

Set up automated testing:

```bash
# Run test suite every hour
0 * * * * cd /path/to/cyber-jeopardy-madness && ./run_tests.sh
```

**run_tests.sh:**
```bash
#!/bin/bash
set -e

echo "Starting end-to-end test..."

# Activate venv
source venv/bin/activate

# Run producer
python produce_scrolls.py

# Wait for processing
sleep 10

# Verify results
python verify_results.py

echo "Test complete!"
```

---

## Next Steps

After successful testing:

1. **Integrate with Real DLT:**
   - Replace `mock_consents.json` with Hedera Consensus Service
   - Update OPA policy to query HCS topics

2. **Add Real Document Ingestion:**
   - Integrate Apache Tika for PDF/DOCX extraction
   - Add file upload endpoints

3. **Implement Full RAG Pipeline:**
   - Add query endpoint
   - Integrate Claude/GPT for response generation
   - Implement context retrieval from Qdrant

4. **Production Hardening:**
   - Add authentication & authorization
   - Implement retry logic & dead letter queues
   - Set up monitoring & alerting
   - Add backup & disaster recovery

---

## References

- Kafka Python Client: https://kafka-python.readthedocs.io/
- Pydantic Validation: https://docs.pydantic.dev/
- OPA Policy Language: https://www.openpolicyagent.org/docs/latest/policy-language/
- Qdrant API: https://qdrant.tech/documentation/

---

**Testing Status:** ✅ Ready for End-to-End Validation
**Last Updated:** January 2025
