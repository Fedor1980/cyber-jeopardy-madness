# 🚀 Quick Start: Networked Multiplayer Setup

Get your networked multiplayer Cyber Jeopardy server running in **15 minutes**!

---

## 🎯 What You're Setting Up

**Server Setup** → Multiple workstations connect to play together in real-time

---

## 📋 Prerequisites

### Server Computer (1 PC)
- [ ] Windows 10/11
- [ ] 4GB+ RAM
- [ ] Install Docker Desktop: https://www.docker.com/products/docker-desktop/

### Client Workstations (Multiple PCs)
- [ ] Windows 10/11
- [ ] Modern web browser
- [ ] Network connection to server

---

## ⚡ Server Setup (10 minutes)

### Step 1: Deploy Server

1. Extract project to `C:\CyberJeopardy`
2. **Double-click** `DEPLOY_SERVER_WINDOWS.bat`
3. Wait for configuration file to open

### Step 2: Configure (3 settings to change)

When Notepad opens, change these 3 lines:

```env
DB_PASSWORD=ChooseAStrongPassword123!
JWT_SECRET=random_string_at_least_32_characters_abc123xyz789
JWT_REFRESH_SECRET=different_random_string_32_chars_def456uvw012
```

**Important:** Replace with your own values!

### Step 3: Finish Installation

1. Save and close Notepad
2. Press `Y` to continue
3. Wait 5-10 minutes for installation
4. Done!

### Step 4: Get Your Server IP

1. Open Command Prompt
2. Type: `ipconfig`
3. Find **IPv4 Address** (example: `192.168.1.100`)
4. **Write this down** - clients will need it!

---

## 💻 Client Setup (2 minutes per workstation)

### Method 1: Browser Bookmark (Fastest!)

1. Open browser on client workstation
2. Go to: `http://192.168.1.100:80` ← **Use your server IP**
3. Bookmark the page
4. Click bookmark to play!

### Method 2: Desktop Launcher

1. Copy `installer\LaunchGame.bat` to desktop
2. Edit `client-config.txt`:
   ```
   SERVER_URL=http://192.168.1.100:80
   ```
3. Double-click to launch!

### Method 3: Professional Installer (See full guide)

For creating a full Windows installer, see: `DEPLOYMENT_GUIDE_WINDOWS.md`

---

## 🧪 Test It Works

### Test 1: Server Local Access
1. On server, open browser
2. Go to: `http://localhost`
3. Should see login screen ✓

### Test 2: Client Remote Access
1. On client workstation
2. Go to: `http://192.168.1.100` ← **Use your server IP**
3. Should see login screen ✓

### Test 3: Multiplayer Game
1. Open game on Server browser
2. Open game on Client browser
3. Create game from one browser
4. Join from other browser
5. Play together! ✓

---

## 🔐 First Login

**Default Credentials:**
- Username: `admin`
- Password: `admin123`

**⚠️ CHANGE THIS PASSWORD IMMEDIATELY!**

---

## 🔧 Common Issues

### "Can't connect to server"
**Fix:** Check firewall allows ports 80 and 3001
1. Windows Security → Firewall
2. Allow app through firewall
3. Add ports: 80, 3001

### "Docker not found"
**Fix:** Install Docker Desktop
- Download: https://www.docker.com/products/docker-desktop/
- Install and restart computer

### Wrong server IP
**Fix:** Get correct IP
```cmd
ipconfig
```
Look for "IPv4 Address"

---

## 📚 Next Steps

- **Full Documentation:** See `DEPLOYMENT_GUIDE_WINDOWS.md`
- **Create Installer:** See `installer\BUILD_INSTALLER_README.md`
- **Server Management:** See docker-compose commands in full guide

---

## 🎮 You're Done!

Your networked multiplayer server is running!

**Server URL:** `http://192.168.1.100` ← Share this with users

**Server Management:**
```cmd
# View logs
docker-compose logs -f

# Restart server
docker-compose restart

# Stop server
docker-compose down
```

---

## 📞 Need Help?

See the full deployment guide: **DEPLOYMENT_GUIDE_WINDOWS.md**

**Enjoy your multiplayer cybersecurity training! 🔐🎯**
