#!/bin/bash

# Simulation of the Scroll Pipeline End-to-End Test
# This shows what you would see when running the actual test

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║  NexusOS Sovereign Scroll Pipeline - Test Simulation          ║"
echo "║  End-to-End Validation Demo                                   ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

# Step 1: Infrastructure Check
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📦 STEP 1: Checking Infrastructure Status"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
sleep 1

echo "$ docker compose ps"
echo ""
echo "NAME                STATUS              PORTS"
echo "kafka               running             0.0.0.0:9092->9092/tcp"
echo "opa                 running             0.0.0.0:8181->8181/tcp"
echo "scroll-processor    running             (consuming from Kafka)"
echo "qdrant              running             0.0.0.0:6333->6333/tcp"
echo ""
echo "✅ All services running!"
echo ""
sleep 2

# Step 2: Producer Startup
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🚀 STEP 2: Starting Kafka Producer"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
sleep 1

echo "$ python produce_scrolls.py"
echo ""
echo "Connecting to Kafka broker at localhost:9092..."
sleep 1
echo ""

# Message 1: Valid Scroll
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📝 Sending Scroll 1/3: VALID SCROLL"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Scroll ID: doc-valid-001"
echo "Content: The company's Q3 performance showed strong revenue growth..."
echo "Source: Finance_Report"
echo "Consent ID: 0xAb1C2D3E4F5a6B7c8D9e0F1a2B3c4D5e6F7a8B9c"
sleep 1
echo ""
echo "[1/3] Produced Scroll: doc-valid-001 | Status: Success ✅"
echo ""
sleep 2

# Message 2: Invalid Schema
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📝 Sending Scroll 2/3: INVALID SCHEMA (missing content field)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Scroll ID: doc-invalid-schema-002"
echo "Content: [MISSING - This will fail validation!]"
echo "Source: HR_Memo"
echo "Consent ID: 0xAb1C2D3E4F5a6B7c8D9e0F1a2B3c4D5e6F7a8B9c"
sleep 1
echo ""
echo "[2/3] Produced Scroll: doc-invalid-schema-002 | Status: Success ✅"
echo "(Sent to Kafka, but will fail validation in processor)"
echo ""
sleep 2

# Message 3: No Consent
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📝 Sending Scroll 3/3: NO CONSENT (non-existent consent ID)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Scroll ID: doc-no-consent-003"
echo "Content: Confidential legal notes regarding the new EU AI Act..."
echo "Source: Legal_Notes"
echo "Consent ID: 0xDEADBEEF00000000000000000000000000000000"
sleep 1
echo ""
echo "[3/3] Produced Scroll: doc-no-consent-003 | Status: Success ✅"
echo "(Sent to Kafka, but consent will be denied)"
echo ""
sleep 2

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "--- Production finished. ---"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
sleep 2

# Step 3: Processor Logs
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 STEP 3: Scroll Processor Logs (docker logs -f scroll-processor)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
sleep 1
echo ""

# Processing Message 1
echo "════════════════════════════════════════════════════════════════"
echo "Processing Message 1: doc-valid-001"
echo "════════════════════════════════════════════════════════════════"
sleep 1
echo "[scroll-processor] INFO: Connecting to Kafka broker localhost:9092..."
echo "[scroll-processor] INFO: Subscribed to topic: scrolls.raw"
echo "[scroll-processor] INFO: ✅ Kafka consumer ready"
echo ""
sleep 1
echo "[scroll-processor] INFO: 📨 Received message from Kafka"
echo "[scroll-processor] INFO:    Scroll ID: doc-valid-001"
echo "[scroll-processor] INFO:    Source: Finance_Report"
echo ""
sleep 1
echo "[scroll-processor] INFO: 🔍 Step 1: Schema Validation"
echo "[scroll-processor] INFO:    Validating against Pydantic model..."
echo "[scroll-processor] INFO:    ✅ Schema validation PASSED"
echo "[scroll-processor] INFO:       - scroll_id: present ✓"
echo "[scroll-processor] INFO:       - content: present ✓"
echo "[scroll-processor] INFO:       - source_system: present ✓"
echo "[scroll-processor] INFO:       - consent_id: present ✓"
echo ""
sleep 1
echo "[scroll-processor] INFO: 🔐 Step 2: OPA Consent Verification"
echo "[scroll-processor] INFO:    Querying OPA at http://opa:8181/v1/data/scrolls/allow"
echo "[scroll-processor] INFO:    Consent ID: 0xAb1C2D3E4F5a6B7c8D9e0F1a2B3c4D5e6F7a8B9c"
sleep 1
echo "[scroll-processor] INFO:    OPA Response: {\"result\": {\"allow\": true}}"
echo "[scroll-processor] INFO:    ✅ Consent check PASSED"
echo ""
sleep 1
echo "[scroll-processor] INFO: 💾 Step 3: Vector DB Storage"
echo "[scroll-processor] INFO:    Generating embedding for content..."
echo "[scroll-processor] INFO:    Storing in Qdrant collection: scrolls"
sleep 1
echo "[scroll-processor] INFO:    ✅ Stored successfully"
echo "[scroll-processor] INFO:       Point ID: doc-valid-001"
echo "[scroll-processor] INFO:       Vector dimensions: 384"
echo ""
echo "[scroll-processor] INFO: ✅✅✅ Scroll doc-valid-001 PROCESSED SUCCESSFULLY ✅✅✅"
echo ""
sleep 2

# Processing Message 2
echo "════════════════════════════════════════════════════════════════"
echo "Processing Message 2: doc-invalid-schema-002"
echo "════════════════════════════════════════════════════════════════"
sleep 1
echo "[scroll-processor] INFO: 📨 Received message from Kafka"
echo "[scroll-processor] INFO:    Scroll ID: doc-invalid-schema-002"
echo "[scroll-processor] INFO:    Source: HR_Memo"
echo ""
sleep 1
echo "[scroll-processor] INFO: 🔍 Step 1: Schema Validation"
echo "[scroll-processor] INFO:    Validating against Pydantic model..."
sleep 1
echo "[scroll-processor] ERROR: ❌ Schema validation FAILED"
echo "[scroll-processor] ERROR:    ValidationError: Field required: 'content'"
echo "[scroll-processor] ERROR:    Missing required field detected"
echo ""
echo "[scroll-processor] WARNING: ⏭️  Skipping scroll doc-invalid-schema-002"
echo "[scroll-processor] WARNING:    Reason: Invalid schema"
echo "[scroll-processor] INFO:    Message not processed (rejected before consent check)"
echo ""
sleep 2

# Processing Message 3
echo "════════════════════════════════════════════════════════════════"
echo "Processing Message 3: doc-no-consent-003"
echo "════════════════════════════════════════════════════════════════"
sleep 1
echo "[scroll-processor] INFO: 📨 Received message from Kafka"
echo "[scroll-processor] INFO:    Scroll ID: doc-no-consent-003"
echo "[scroll-processor] INFO:    Source: Legal_Notes"
echo ""
sleep 1
echo "[scroll-processor] INFO: 🔍 Step 1: Schema Validation"
echo "[scroll-processor] INFO:    Validating against Pydantic model..."
echo "[scroll-processor] INFO:    ✅ Schema validation PASSED"
echo ""
sleep 1
echo "[scroll-processor] INFO: 🔐 Step 2: OPA Consent Verification"
echo "[scroll-processor] INFO:    Querying OPA at http://opa:8181/v1/data/scrolls/allow"
echo "[scroll-processor] INFO:    Consent ID: 0xDEADBEEF00000000000000000000000000000000"
sleep 1
echo "[scroll-processor] INFO:    OPA Response: {\"result\": {\"allow\": false}}"
echo "[scroll-processor] WARNING: ❌ Consent check FAILED"
echo "[scroll-processor] WARNING:    Consent ID not found in approved list"
echo "[scroll-processor] WARNING:    DLT verification: DENIED"
echo ""
echo "[scroll-processor] WARNING: ⏭️  Skipping scroll doc-no-consent-003"
echo "[scroll-processor] WARNING:    Reason: Consent denied"
echo "[scroll-processor] INFO:    Message not processed (consent verification failed)"
echo ""
sleep 2

# Step 4: Summary
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📈 STEP 4: Test Results Summary"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Total Scrolls Sent:     3"
echo "Successfully Processed: 1  ✅"
echo "Schema Failures:        1  ❌"
echo "Consent Denials:        1  ⛔"
echo ""
echo "┌────────────────────────────┬─────────────┬─────────────┬────────────┐"
echo "│ Scroll ID                  │ Schema OK   │ Consent OK  │ Stored     │"
echo "├────────────────────────────┼─────────────┼─────────────┼────────────┤"
echo "│ doc-valid-001              │ ✅ PASS     │ ✅ PASS     │ ✅ YES     │"
echo "│ doc-invalid-schema-002     │ ❌ FAIL     │ ⏭️  SKIPPED │ ❌ NO      │"
echo "│ doc-no-consent-003         │ ✅ PASS     │ ❌ FAIL     │ ❌ NO      │"
echo "└────────────────────────────┴─────────────┴─────────────┴────────────┘"
echo ""
sleep 2

# Step 5: Verify Qdrant
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔍 STEP 5: Verifying Qdrant Vector Database"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
sleep 1
echo ""
echo "$ curl -s http://localhost:6333/collections/scrolls/points/scroll | jq"
echo ""
sleep 1
echo "{"
echo "  \"result\": {"
echo "    \"points\": ["
echo "      {"
echo "        \"id\": \"doc-valid-001\","
echo "        \"payload\": {"
echo "          \"scroll_id\": \"doc-valid-001\","
echo "          \"content\": \"The company's Q3 performance showed strong...\","
echo "          \"source_system\": \"Finance_Report\","
echo "          \"consent_id\": \"0xAb1C2D3E4F5a6B7c8D9e0F1a2B3c4D5e6F7a8B9c\","
echo "          \"processed_at\": \"2025-01-16T00:32:45.123Z\""
echo "        },"
echo "        \"vector\": [0.123, -0.456, 0.789, ... ] // 384 dimensions"
echo "      }"
echo "    ],"
echo "    \"count\": 1"
echo "  }"
echo "}"
echo ""
echo "✅ Only the valid scroll (doc-valid-001) is stored in Qdrant!"
echo "✅ Invalid schema and no-consent scrolls were correctly rejected!"
echo ""
sleep 2

# Final Summary
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║                    TEST COMPLETED SUCCESSFULLY! ✅              ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""
echo "What was validated:"
echo "  ✅ Kafka message ingestion"
echo "  ✅ Pydantic schema validation"
echo "  ✅ OPA policy enforcement"
echo "  ✅ DLT consent verification"
echo "  ✅ Qdrant vector storage"
echo "  ✅ Error handling and logging"
echo "  ✅ End-to-end data flow"
echo ""
echo "Pipeline Status: 🟢 FULLY OPERATIONAL"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Next Steps:"
echo "  1. Review logs for processing details"
echo "  2. Query Qdrant for semantic search"
echo "  3. Integrate with RAG pipeline"
echo "  4. Deploy to production!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
