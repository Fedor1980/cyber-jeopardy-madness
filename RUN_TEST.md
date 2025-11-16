# 🚀 Quick Test Guide - Run This on Your Local Machine

## Prerequisites Check
```bash
# Verify Docker is installed
docker --version          # Should show Docker version
docker compose version    # Should show Compose version

# Verify Python is installed
python3 --version         # Should be 3.11+
```

---

## 🎯 Run the Complete Test (3 Commands)

### Command 1: Start Infrastructure
```bash
docker compose up -d
```
**Wait 30 seconds** for services to initialize.

### Command 2: Setup Python Environment
```bash
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r producer_requirements.txt
```

### Command 3: Run the Test
```bash
python produce_scrolls.py
```

---

## 📊 Monitor the Results

**In a separate terminal**, watch the processor logs:
```bash
docker logs -f scroll-processor
```

You should see:
- ✅ `doc-valid-001` → Processed successfully
- ❌ `doc-invalid-schema-002` → Schema validation failed
- ⛔ `doc-no-consent-003` → Consent denied

---

## ✅ Verify Success

Check Qdrant database:
```bash
curl -s http://localhost:6333/collections/scrolls | jq
```

Expected: Only 1 document (doc-valid-001) should be stored.

---

## 🎬 Watch the Demo

Don't have Docker installed yet? Run the simulation:
```bash
./simulate_test.sh
```

This shows you **exactly** what you'll see when running the real test.

---

## 🔧 Troubleshooting

**Kafka won't start?**
```bash
docker compose down
docker compose up -d kafka
# Wait 30 seconds
docker compose up -d
```

**Producer can't connect?**
```bash
# Check Kafka is running
docker logs kafka | tail -20

# Verify port 9092 is open
netstat -an | grep 9092
```

**Want to see the simulation first?**
```bash
chmod +x simulate_test.sh
./simulate_test.sh
```

---

## 📁 What Gets Created

After running the test:

```
/scrolls collection in Qdrant
  └── doc-valid-001 (only this one!)
      ├── Embedding vector (384 dimensions)
      ├── Content: "The company's Q3 performance..."
      ├── Source: Finance_Report
      └── Consent ID: 0xAb1C2D3E4F5a6B7c8D9e0F1a2B3c4D5e6F7a8B9c
```

---

## 🎯 Success Criteria

✅ All 3 messages sent to Kafka
✅ 1 message processed (doc-valid-001)
✅ 1 schema validation failure (doc-invalid-schema-002)
✅ 1 consent denial (doc-no-consent-003)
✅ Only 1 document in Qdrant
✅ No crashes or errors in logs

---

## 🔄 Clean Up

```bash
# Stop all services
docker compose down

# Remove volumes (full reset)
docker compose down -v

# Deactivate Python environment
deactivate
```

---

## 📚 Full Documentation

See [TESTING_GUIDE.md](./TESTING_GUIDE.md) for:
- Detailed troubleshooting
- Advanced test scenarios
- Load testing procedures
- Metrics monitoring

---

**Status:** Ready to test! 🚀
