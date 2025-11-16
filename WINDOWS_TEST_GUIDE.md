# 🪟 Windows Testing Guide - Fixed for Your System

## ⚠️ Issues You Hit & How to Fix Them

### Issue 1: Docker Not Installed
**Error:** `docker : The term 'docker' is not recognized`

**Fix:** Install Docker Desktop for Windows

1. Download: https://www.docker.com/products/docker-desktop/
2. Install Docker Desktop
3. **Restart your computer**
4. Open Docker Desktop (it must be running)
5. Verify: Open PowerShell and run `docker --version`

---

### Issue 2: Syntax Error in produce_scrolls.py (FIXED!)
**Error:** `SyntaxError: unterminated string literal (detected at line 36)`

**Status:** ✅ **FIXED!** Pull the latest code:

```powershell
git pull
```

---

### Issue 3: Pydantic Installation Failed (FIXED!)
**Error:** `Cargo, the Rust package manager, is not installed`

**Status:** ✅ **FIXED!** Updated to Pydantic 2.9.2 (has pre-built Windows wheels)

Pull the latest code:
```powershell
git pull
```

---

## 🚀 Complete Windows Test Steps (Copy-Paste Ready)

### Step 1: Install Docker Desktop (ONE TIME ONLY)

1. Download: https://www.docker.com/products/docker-desktop/
2. Install it
3. **Restart Windows**
4. Start Docker Desktop (must see whale icon in system tray)

Verify Docker is working:
```powershell
docker --version
docker compose version
```

---

### Step 2: Get Latest Code (Pull Updates)

**You already cloned it, just pull updates:**

```powershell
cd "C:\Users\owner\Desktop\Projects\Cyber Jeopardy Madness\nexusos-docs\nexusos-docs\cyber-jeopardy-madness"
git pull
```

---

### Step 3: Start Services

```powershell
docker compose up -d
```

**Wait 30 seconds**, then check:

```powershell
docker compose ps
```

You should see:
- ✅ kafka (running)
- ✅ opa (running)
- ✅ scroll-processor (running)
- ✅ qdrant (running)

---

### Step 4: Setup Python (Windows Commands)

```powershell
# Create virtual environment (use 'python' not 'python3' on Windows)
python -m venv venv

# Activate (Windows PowerShell)
.\venv\Scripts\Activate.ps1

# If you get execution policy error, run this ONCE:
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

# Then try activating again:
.\venv\Scripts\Activate.ps1

# Install requirements (now with fixed Pydantic version!)
pip install -r producer_requirements.txt
```

You should see:
```
Successfully installed kafka-python-2.0.2 pydantic-2.9.2 ...
```

---

### Step 5: Run the Test

```powershell
python produce_scrolls.py
```

Expected output:
```
Connecting to Kafka broker at localhost:9092...
[1/3] Produced Scroll: doc-valid-001 | Status: Success ✅
[2/3] Produced Scroll: doc-invalid-schema-002 | Status: Success ✅
[3/3] Produced Scroll: doc-no-consent-003 | Status: Success ✅

--- Production finished. ---
```

---

### Step 6: Watch the Results

**Open a NEW PowerShell window:**

```powershell
cd "C:\Users\owner\Desktop\Projects\Cyber Jeopardy Madness\nexusos-docs\nexusos-docs\cyber-jeopardy-madness"
docker logs -f scroll-processor
```

You should see the processor:
- ✅ Process doc-valid-001 successfully
- ❌ Reject doc-invalid-schema-002 (schema error)
- ⛔ Reject doc-no-consent-003 (consent denied)

Press `Ctrl+C` to stop watching logs.

---

### Step 7: Verify Success

```powershell
# Check Qdrant database
Invoke-WebRequest -Uri "http://localhost:6333/collections/scrolls/points/scroll" | Select-Object -ExpandProperty Content
```

Should show **only 1 document** (doc-valid-001)

Or use curl if you have it:
```powershell
curl http://localhost:6333/collections/scrolls/points/scroll
```

---

## ✅ Success Checklist

- [ ] Docker Desktop installed and running
- [ ] Code updated (`git pull` completed)
- [ ] Services running (`docker compose ps` shows 4 running)
- [ ] Python packages installed without errors
- [ ] Producer sent 3 messages
- [ ] Processor accepted 1, rejected 2
- [ ] Qdrant has only 1 document

---

## 🧹 Clean Up

```powershell
# Stop all services
docker compose down

# Deactivate Python environment
deactivate
```

---

## 🔧 Troubleshooting

### Docker Desktop Won't Start
- Check Windows version (needs Windows 10/11 Pro or Enterprise)
- Enable WSL 2: https://learn.microsoft.com/en-us/windows/wsl/install
- Enable Virtualization in BIOS

### Python Virtual Environment Won't Activate
```powershell
# Run this once as Administrator
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### Kafka Won't Start
```powershell
# Full restart
docker compose down
docker compose up -d
# Wait 60 seconds
docker compose ps
```

### Still Having Issues?
Run the simulation instead (no Docker needed):
```powershell
# Make sure you pulled latest code first!
git pull
.\simulate_test.sh
```

---

## 📝 What Changed to Fix Your Issues

1. ✅ Fixed syntax error in `produce_scrolls.py` line 36
2. ✅ Updated Pydantic to 2.9.2 (has pre-built Windows wheels)
3. ✅ Added Windows-specific commands (PowerShell)
4. ✅ Added Docker Desktop installation instructions

---

## 🎯 Next Steps After You Get It Working

Once the test passes, you can:

1. **Customize test data** - Edit `produce_scrolls.py`
2. **Add more scrolls** - Test with your own documents
3. **Query the vector DB** - Use Qdrant for semantic search
4. **Integrate with RAG** - Connect to Claude/GPT for AI responses

---

**Pull the latest code and try again!**

```powershell
git pull
```

All fixes are committed!
