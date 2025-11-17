@echo off
REM ============================================================================
REM Cyber Jeopardy Madness - Client Launcher
REM ============================================================================

setlocal enabledelayedexpansion

REM Get the directory where this script is located
set "SCRIPT_DIR=%~dp0"
cd /d "%SCRIPT_DIR%"

REM Read server configuration
set "CONFIG_FILE=%SCRIPT_DIR%client-config.txt"
set "SERVER_URL=http://localhost:4173"

if exist "%CONFIG_FILE%" (
    for /f "tokens=1,2 delims==" %%a in (%CONFIG_FILE%) do (
        if "%%a"=="SERVER_URL" set "SERVER_URL=%%b"
    )
)

echo.
echo ========================================================
echo   CYBER JEOPARDY MADNESS
echo ========================================================
echo.
echo Connecting to server: %SERVER_URL%
echo.
echo Opening game in your default browser...
echo.

REM Open the game in the default browser
start "" "%SERVER_URL%"

REM Wait a moment and close
timeout /t 2 /nobreak >nul

echo Game launched!
echo.
echo If the game doesn't open, please check:
echo   1. Server is running at %SERVER_URL%
echo   2. You have network connectivity
echo   3. Your firewall allows the connection
echo.
echo To change the server address, run: ConfigureServer.bat
echo.

exit /b 0
