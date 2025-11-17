@echo off
REM ============================================================================
REM Cyber Jeopardy Madness - Server Configuration
REM ============================================================================

setlocal enabledelayedexpansion

REM Get the directory where this script is located
set "SCRIPT_DIR=%~dp0"
cd /d "%SCRIPT_DIR%"

set "CONFIG_FILE=%SCRIPT_DIR%client-config.txt"

echo.
echo ========================================================
echo   CYBER JEOPARDY MADNESS - SERVER CONFIGURATION
echo ========================================================
echo.

REM Read current configuration
set "CURRENT_URL=Not configured"
if exist "%CONFIG_FILE%" (
    for /f "tokens=1,2 delims==" %%a in (%CONFIG_FILE%) do (
        if "%%a"=="SERVER_URL" set "CURRENT_URL=%%b"
    )
)

echo Current server address: %CURRENT_URL%
echo.
echo Enter the new server address (IP or hostname):
echo.
echo Examples:
echo   - Local server: http://localhost:4173
echo   - Network server: http://192.168.1.100:4173
echo   - Remote server: http://server.company.com
echo.
set /p NEW_URL="Server URL: "

REM Validate input
if "%NEW_URL%"=="" (
    echo.
    echo Error: Server URL cannot be empty.
    echo Configuration unchanged.
    pause
    exit /b 1
)

REM Save to config file
echo SERVER_URL=%NEW_URL%> "%CONFIG_FILE%"

echo.
echo ========================================================
echo   CONFIGURATION SAVED
echo ========================================================
echo.
echo Server address: %NEW_URL%
echo.
echo You can now launch the game using LaunchGame.bat
echo or the desktop shortcut.
echo.
pause
