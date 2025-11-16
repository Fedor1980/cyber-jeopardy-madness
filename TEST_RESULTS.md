# Sovereign Scroll Pipeline - Test Results

## Test Date
November 16, 2025

## Test Overview
Successfully tested end-to-end Sovereign Scroll Pipeline on Windows with Docker Desktop.

## Infrastructure Components

| Component | Version | Status |
|-----------|---------|--------|
| Kafka | Confluent Platform 7.5.0 | ✅ Running |
| OPA | Latest | ✅ Running |
| Qdrant | 1.15.5 | ✅ Running |
| Scroll Processor | Custom Python 3.11 | ✅ Running |

## Test Scenarios

### Test 1: Valid Scroll with Consent
- **Scroll ID**: `doc-valid-001`
- **Content**: "The company's Q3 performance showed strong revenue growth..."
- **Consent ID**: `0xAb1C2D3E4F5a6B7c8D9e0F1a2B3c4D5e6F7a8B9c`
- **Result**: ✅ **ACCEPTED**
  - Schema Validation: PASSED
  - OPA Consent Check: ALLOWED
  - Qdrant Storage: SUCCESS

### Test 2: Invalid Schema (Missing Field)
- **Scroll ID**: `doc-invalid-schema-002`
- **Content**: Missing `content` field
- **Consent ID**: `0xAb1C2D3E4F5a6B7c8D9e0F1a2B3c4D5e6F7a8B9c`
- **Result**: ❌ **REJECTED**
  - Schema Validation: FAILED (content field required)
  - OPA Consent Check: Not reached
  - Qdrant Storage: Not attempted

### Test 3: Valid Schema, No Consent
- **Scroll ID**: `doc-no-consent-003`
- **Content**: "Confidential legal notes regarding the new EU AI Act..."
- **Consent ID**: `0xDEADBEEF00000000000000000000000000000000`
- **Result**: ⛔ **REJECTED**
  - Schema Validation: PASSED
  - OPA Consent Check: DENIED
  - Qdrant Storage: Not attempted

## Verification

**Qdrant Collection Status:**
- Collection: `scrolls`
- Points Stored: 1 (doc-valid-001)
- Status: Green
- Vector Size: 384 dimensions

## Pipeline Flow

```
Producer (produce_scrolls.py)
    ↓
Kafka Topic (scrolls.raw)
    ↓
Scroll Processor
    ├─→ Pydantic Schema Validation
    │   ├─→ PASS: Continue to OPA
    │   └─→ FAIL: Reject scroll
    │
    └─→ OPA Consent Verification
        ├─→ ALLOWED: Store in Qdrant
        └─→ DENIED: Reject scroll
```

## Key Features Demonstrated

1. **Schema Validation**: Pydantic enforces data quality
2. **Consent Governance**: OPA policies verify DLT consent records
3. **Selective Storage**: Only valid, consented scrolls reach Qdrant
4. **Real-time Processing**: Kafka enables streaming ingestion
5. **Audit Trail**: All decisions logged in processor output

## Windows-Specific Fixes Applied

1. Updated Pydantic to 2.9.2 (has Windows binary wheels)
2. Switched from `kafka-python` to `kafka-python-ng` (Python 3.13 support)
3. Updated Qdrant client to 1.11.3 (compatibility with server 1.15.5)
4. Used UUID point IDs for Qdrant (string IDs not supported)
5. Configured OPA to load policy and data files on startup

## Conclusion

✅ All test scenarios passed as expected
✅ Pipeline correctly validates, verifies consent, and stores scrolls
✅ Windows environment fully compatible with Docker-based infrastructure
