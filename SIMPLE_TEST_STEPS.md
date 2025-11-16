# 🚀 Simple Test Steps - Copy and Paste These Commands

## Step 1: Get the Code on Your Computer

```bash
# Clone the repository
git clone https://github.com/Fedor1980/cyber-jeopardy-madness.git

# Go into the folder
cd cyber-jeopardy-madness

# Switch to the test branch
git checkout claude/nexusos-docs-platform-spec-01SThqWedijPWA2as2vs4AG1
```

---

## Step 2: Start the Services

```bash
# Start all containers (Kafka, OPA, Qdrant, Processor)
docker compose up -d
```

**Wait 30 seconds** for everything to start.

---

## Step 3: Check Everything is Running

```bash
# See all running services
docker compose ps
```

You should see:
- ✅ kafka
- ✅ opa
- ✅ scroll-processor
- ✅ qdrant

All should say "running"

---

## Step 4: Setup Python

```bash
# Create virtual environment
python3 -m venv venv

# Activate it
source venv/bin/activate

# Install requirements
pip install -r producer_requirements.txt
```

---

## Step 5: Run the Test

```bash
# Send test messages
python produce_scrolls.py
```

You'll see:
```
[1/3] Produced Scroll: doc-valid-001 | Status: Success ✅
[2/3] Produced Scroll: doc-invalid-schema-002 | Status: Success ✅
[3/3] Produced Scroll: doc-no-consent-003 | Status: Success ✅
```

---

## Step 6: Watch the Results

**Open a new terminal** and run:

```bash
cd cyber-jeopardy-madness
docker logs -f scroll-processor
```

You should see the processor:
- ✅ Accept the valid scroll (doc-valid-001)
- ❌ Reject the invalid schema (doc-invalid-schema-002)
- ⛔ Reject the no-consent scroll (doc-no-consent-003)

---

## Step 7: Verify Only Valid Data Was Stored

```bash
# Check what's in the database
curl http://localhost:6333/collections/scrolls/points/scroll
```

You should see **only 1 document**: `doc-valid-001`

The other 2 were correctly rejected!

---

## ✅ Success!

If you saw:
- 3 messages sent
- 1 accepted, 2 rejected
- Only 1 in the database

**The test passed!** 🎉

---

## 🧹 Clean Up

```bash
# Stop everything
docker compose down

# Exit Python environment
deactivate
```

---

## ❓ Troubleshooting

**Don't have Docker?**
- Install from: https://docs.docker.com/get-docker/

**Don't have Python 3?**
- Install from: https://www.python.org/downloads/

**Still stuck?**
- Run the simulation instead: `./simulate_test.sh`
- This shows what you would see without needing Docker

---

**That's it! Only 7 steps.**
