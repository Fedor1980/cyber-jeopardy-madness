# Building the Windows Client Installer

This directory contains the configuration files for creating a Windows installer (.exe) for client workstations.

## Prerequisites

1. **Inno Setup** - Free Windows installer creator
   - Download from: https://jrsoftware.org/isinfo.php
   - Install the latest version (6.x or higher)

2. **Built Frontend** - The React frontend must be built first
   ```bash
   cd frontend
   npm install
   npm run build
   ```

## Building the Installer

### Method 1: Using Inno Setup Compiler GUI

1. Open **Inno Setup Compiler**
2. Click **File > Open** and select `client-installer.iss`
3. Click **Build > Compile** (or press Ctrl+F9)
4. The installer will be created in the `Output` folder as:
   - `CyberJeopardyMadness-Client-Setup.exe`

### Method 2: Using Command Line

```cmd
"C:\Program Files (x86)\Inno Setup 6\ISCC.exe" client-installer.iss
```

## Installer Features

The created installer will:

1. **Install the game client** to the user's Program Files
2. **Create Start Menu shortcuts** for:
   - Launch Game
   - Configure Server
   - Uninstall
3. **Optionally create a Desktop shortcut**
4. **Prompt for server address** during installation
5. **Include configuration utility** to change server later

## Distribution

After building, distribute the installer:

1. Copy `Output\CyberJeopardyMadness-Client-Setup.exe` to a shared location
2. Users double-click to install
3. Users can launch the game from Start Menu or Desktop

## Client Configuration

Users can reconfigure the server address at any time:

- **During installation** - Installer prompts for server URL
- **After installation** - Run "Configure Server" from Start Menu
- **Manual edit** - Edit `client-config.txt` in the installation folder

## Customization

To customize the installer, edit `client-installer.iss`:

- **Change app name/version** - Modify the `#define` directives at the top
- **Add/remove files** - Edit the `[Files]` section
- **Customize shortcuts** - Edit the `[Icons]` section
- **Change default server** - Edit the `InitializeWizard` procedure

## Alternative: Simple ZIP Distribution

If you don't want to create an installer, you can distribute a simple ZIP:

1. Copy the `installer` folder contents
2. Copy the `frontend/dist` folder
3. Create a ZIP file
4. Users extract and run `LaunchGame.bat`

## Troubleshooting

**Problem:** Installer won't compile
- **Solution:** Ensure frontend is built (`frontend/dist` exists)

**Problem:** Icon missing
- **Solution:** Ensure `public/favicon.ico` exists or comment out `SetupIconFile` line

**Problem:** Users can't connect
- **Solution:** Ensure server IP/hostname is correct in `client-config.txt`
