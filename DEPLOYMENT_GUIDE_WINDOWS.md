# Cyber Jeopardy Madness - Windows Deployment Guide

## Networked Multiplayer Setup

This guide will help you deploy Cyber Jeopardy Madness for **networked multiplayer**, where each user plays from their own workstation connected to a central server.

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Server Deployment](#server-deployment)
   - [Option A: Docker (Recommended)](#option-a-docker-recommended)
   - [Option B: Direct Installation](#option-b-direct-installation)
3. [Client Deployment](#client-deployment)
4. [Network Configuration](#network-configuration)
5. [Testing](#testing)
6. [Troubleshooting](#troubleshooting)

---

## 🎯 Overview

### Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  Workstation 1  │────▶│                 │◀────│  Workstation 2  │
│   (Player 1)    │     │  Game Server    │     │   (Player 2)    │
└─────────────────┘     │  (Your Server)  │     └─────────────────┘
                        │                 │
┌─────────────────┐     │  - Backend API  │     ┌─────────────────┐
│  Workstation 3  │────▶│  - Database     │◀────│  Workstation 4  │
│   (Player 3)    │     │  - Frontend     │     │   (Player 4)    │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

### What You Need

**Server (1 computer):**
- Windows 10/11 or Windows Server 2016+
- 4GB RAM minimum (8GB recommended)
- 20GB free disk space
- Static IP address or hostname on your network
- Either:
  - **Docker Desktop** (easiest), OR
  - **Node.js 18+** and **PostgreSQL 15+**

**Client Workstations (multiple computers):**
- Windows 10/11
- Modern web browser (Chrome, Edge, Firefox)
- Network access to the server

---

## 🖥️ Server Deployment

### Option A: Docker (Recommended)

**Easiest and most reliable method!**

#### Step 1: Install Docker Desktop

1. Download Docker Desktop for Windows: https://www.docker.com/products/docker-desktop/
2. Run the installer
3. Restart your computer
4. Launch Docker Desktop and wait for it to start

#### Step 2: Deploy the Server

1. Extract the Cyber Jeopardy Madness files to a folder (e.g., `C:\CyberJeopardy`)
2. **Double-click** `DEPLOY_SERVER_WINDOWS.bat`
3. The script will:
   - Check Docker installation
   - Create configuration file (`.env`)
   - Open Notepad for you to configure settings

#### Step 3: Configure the Server

When Notepad opens with the `.env` file, **you MUST change these values**:

```env
# CRITICAL: Change these security settings!
DB_PASSWORD=YourSecurePassword123!
JWT_SECRET=a_very_long_random_string_at_least_32_characters_long_abc123
JWT_REFRESH_SECRET=another_different_random_string_at_least_32_chars_xyz789

# Network configuration
CORS_ORIGIN=http://192.168.1.100,http://your-server-name
```

**Important Settings:**
- `DB_PASSWORD` - Choose a strong password
- `JWT_SECRET` - Generate a random 32+ character string
- `JWT_REFRESH_SECRET` - Generate another different random 32+ character string
- `CORS_ORIGIN` - Add your server's IP address (find with `ipconfig`)

#### Step 4: Complete Deployment

1. Save the `.env` file and close Notepad
2. Press `Y` when asked if you've finished configuration
3. Wait for the deployment to complete (5-10 minutes)
4. Note the server URLs displayed at the end

#### Step 5: Get Your Server IP

1. Open Command Prompt
2. Run: `ipconfig`
3. Find your IPv4 Address (e.g., `192.168.1.100`)
4. This is what clients will connect to!

**Server is now running at:**
- Frontend: `http://YOUR-IP-ADDRESS` (e.g., `http://192.168.1.100`)
- Backend: `http://YOUR-IP-ADDRESS:3001`

---

### Option B: Direct Installation

**For advanced users who don't want to use Docker**

#### Prerequisites

1. **Install Node.js**
   - Download: https://nodejs.org/
   - Choose LTS version (20.x)
   - Verify: `node -v` should show v20.x

2. **Install PostgreSQL**
   - Download: https://www.postgresql.org/download/windows/
   - Choose version 15 or 16
   - Note the password you set during installation

#### Deployment Steps

1. **Double-click** `DEPLOY_SERVER_SIMPLE.bat`
2. Configure the `.env` file when it opens:
   ```env
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=cyber_jeopardy
   DB_USER=postgres
   DB_PASSWORD=your_postgresql_password

   JWT_SECRET=your_random_32_char_string
   JWT_REFRESH_SECRET=another_random_32_char_string

   CORS_ORIGIN=http://192.168.1.100
   ```
3. Save and continue
4. Wait for dependencies to install (10-15 minutes)

#### Database Setup

1. Open a new Command Prompt
2. Navigate to the backend folder:
   ```cmd
   cd C:\CyberJeopardy\backend
   ```
3. Run migrations:
   ```cmd
   npm run migrate
   npm run seed
   ```

#### Start the Server

**Option 1: Use the start script**
- Double-click `START_SERVER.bat`

**Option 2: Manual start**
- Open TWO Command Prompts:

Terminal 1 (Backend):
```cmd
cd C:\CyberJeopardy\backend
npm start
```

Terminal 2 (Frontend):
```cmd
cd C:\CyberJeopardy\frontend
npm run preview
```

**Server will be running at:**
- Frontend: `http://YOUR-IP:4173`
- Backend: `http://YOUR-IP:3001`

---

## 💻 Client Deployment

You have **three options** for deploying to client workstations:

### Option 1: Professional Installer (Recommended)

**Best for multiple clients**

1. **Build the installer** (on any Windows PC with Inno Setup):
   - Install Inno Setup from: https://jrsoftware.org/isinfo.php
   - Build the frontend first:
     ```cmd
     cd frontend
     npm install
     npm run build
     ```
   - Open `installer\client-installer.iss` in Inno Setup
   - Click Build > Compile
   - Find `CyberJeopardyMadness-Client-Setup.exe` in `installer\Output`

2. **Distribute the installer**:
   - Copy the `.exe` to a network share or USB drive
   - Users double-click to install

3. **Users configure server**:
   - During installation, enter server address: `http://192.168.1.100:4173`
   - Or use "Configure Server" from Start Menu

### Option 2: Simple Launcher Script

**Quickest method for few clients**

1. Copy the `installer` folder to client workstations
2. Edit `client-config.txt`:
   ```
   SERVER_URL=http://192.168.1.100:4173
   ```
3. Create desktop shortcut to `LaunchGame.bat`
4. Double-click to launch!

### Option 3: Browser Bookmark

**No installation needed**

1. On each client workstation
2. Open browser
3. Navigate to: `http://192.168.1.100:4173` (use your server IP)
4. Bookmark the page
5. Users just click the bookmark to play!

---

## 🌐 Network Configuration

### Firewall Configuration

**On the server**, allow incoming connections on these ports:

- **Port 80** (Frontend - Docker deployment)
- **Port 3001** (Backend API)
- **Port 4173** (Frontend - Direct deployment)

**Windows Firewall:**
1. Open Windows Defender Firewall
2. Click "Advanced settings"
3. Click "Inbound Rules" > "New Rule"
4. Port > TCP > Specific ports: 80,3001,4173
5. Allow the connection
6. Apply to all profiles
7. Name: "Cyber Jeopardy Server"

### Testing Network Connectivity

**From a client workstation:**

1. Open Command Prompt
2. Test connection:
   ```cmd
   ping 192.168.1.100
   curl http://192.168.1.100:3001/api/v1/health
   ```
3. Should see successful responses

### Static IP (Recommended)

**Set a static IP for your server:**

1. Open Network Settings
2. Change adapter settings
3. Right-click network adapter > Properties
4. Select IPv4 > Properties
5. Use the following IP address:
   - IP: `192.168.1.100` (or your preferred address)
   - Subnet: `255.255.255.0`
   - Gateway: `192.168.1.1` (your router)
   - DNS: `8.8.8.8`

---

## 🧪 Testing

### Test the Server (Locally)

1. On the server, open browser
2. Navigate to `http://localhost`
3. Should see the game login screen
4. Default credentials:
   - Username: `admin`
   - Password: `admin123`

### Test Client Connection

1. On a client workstation
2. Open browser
3. Navigate to `http://192.168.1.100` (your server IP)
4. Should see the same login screen
5. Log in and start a game!

### Test Multiplayer

1. Open game on Server browser
2. Open game on Client browser
3. Create a new game session from one browser
4. Join the game from the other browser
5. Play together in real-time!

---

## 🔧 Troubleshooting

### Server Won't Start (Docker)

**Problem:** Docker containers fail to start
**Solutions:**
- Ensure Docker Desktop is running
- Check firewall allows Docker
- Run: `docker-compose logs` to see errors
- Try: `docker-compose down` then `docker-compose up -d`

### Server Won't Start (Direct)

**Problem:** Backend crashes on startup
**Solutions:**
- Ensure PostgreSQL is running
- Check database credentials in `.env`
- Check logs in `backend/logs/app.log`
- Verify Node.js version: `node -v` (should be 18+)

### Clients Can't Connect

**Problem:** Clients get "Connection refused" or timeout
**Solutions:**
1. **Verify server is running**
   - On server, check `http://localhost` works

2. **Check firewall**
   - Server firewall allows ports 80, 3001, 4173
   - Client firewall allows outbound connections

3. **Verify IP address**
   - Use `ipconfig` on server
   - Ping server from client: `ping 192.168.1.100`

4. **Check CORS configuration**
   - In `.env`, ensure `CORS_ORIGIN` includes server IP
   - Restart server after changing

### Database Connection Errors

**Problem:** "Connection refused" or "Authentication failed"
**Solutions:**
- Check PostgreSQL is running: Windows Services > PostgreSQL
- Verify credentials in `.env` match PostgreSQL
- Check `DB_HOST` is correct:
  - Docker: `database`
  - Direct: `localhost` or PostgreSQL server IP

### Client Config Issues

**Problem:** Wrong server address
**Solutions:**
- Edit `client-config.txt` directly
- Or run `ConfigureServer.bat`
- Or reinstall with correct address

### Performance Issues

**Problem:** Slow or laggy gameplay
**Solutions:**
- Check server CPU/RAM usage (Task Manager)
- Reduce number of simultaneous players
- Use wired Ethernet instead of WiFi
- Close unnecessary applications on server

### Port Already in Use

**Problem:** "Port 3001 already in use"
**Solutions:**
- Find what's using the port: `netstat -ano | findstr :3001`
- Kill the process: `taskkill /PID <PID> /F`
- Or change port in `.env`: `PORT=3002`

---

## 📚 Additional Resources

### Server Management Commands

**Docker Deployment:**
```cmd
# View server logs
docker-compose logs -f

# Restart server
docker-compose restart

# Stop server
docker-compose down

# Update and rebuild
docker-compose down
docker-compose build
docker-compose up -d

# Backup database
docker-compose exec database pg_dump -U postgres cyber_jeopardy > backup.sql
```

**Direct Deployment:**
```cmd
# Check server status
curl http://localhost:3001/api/v1/health

# View backend logs
type backend\logs\app.log

# Restart server
# Close terminal windows and run START_SERVER.bat again
```

### Security Recommendations

1. **Change default admin password immediately**
2. **Use strong JWT secrets** (32+ characters)
3. **Enable HTTPS** for production use
4. **Keep server updated** with latest patches
5. **Backup database regularly**
6. **Restrict network access** to trusted users only

### Getting Help

- **Documentation:** See `docs/` folder
- **Issues:** https://github.com/Fedor1980/cyber-jeopardy-madness/issues
- **Email:** Your IT support contact

---

## ✅ Quick Reference

### Server URLs

| Deployment | Frontend | Backend |
|------------|----------|---------|
| Docker | http://YOUR-IP | http://YOUR-IP:3001 |
| Direct | http://YOUR-IP:4173 | http://YOUR-IP:3001 |

### Default Credentials

- Username: `admin`
- Password: `admin123`
- **CHANGE THESE IMMEDIATELY!**

### Required Ports

- 80 (Docker frontend)
- 3001 (Backend API)
- 4173 (Direct frontend)
- 5432 (PostgreSQL - local only)

---

## 🎮 You're Ready!

Your networked multiplayer Cyber Jeopardy setup is complete! Users can now:

1. **Launch the game** from their workstations
2. **Create or join game sessions**
3. **Play together in real-time**
4. **Compete on the leaderboard**

Enjoy training your team in cybersecurity awareness! 🚀
