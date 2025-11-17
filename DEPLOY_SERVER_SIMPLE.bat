@echo off
REM ============================================================================
REM Cyber Jeopardy Madness - Simple Windows Server Deployment (No Docker)
REM ============================================================================
REM This script sets up the server using Node.js directly (no Docker required)
REM Prerequisites: Node.js 18+ and PostgreSQL must be installed
REM ============================================================================

echo.
echo ========================================================
echo   CYBER JEOPARDY MADNESS - SIMPLE SERVER SETUP
echo ========================================================
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed!
    echo.
    echo Please install Node.js from:
    echo https://nodejs.org/
    echo.
    echo Recommended version: Node.js 20 LTS
    pause
    exit /b 1
)

REM Check if npm is available
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] npm is not available!
    echo.
    echo npm should be included with Node.js.
    echo Please reinstall Node.js.
    echo.
    pause
    exit /b 1
)

echo [OK] Node.js is installed
echo.

REM Check if .env file exists
if not exist ".env" (
    echo [SETUP] Creating .env configuration file...
    copy .env.example .env
    echo.
    echo ========================================================
    echo   IMPORTANT: CONFIGURE YOUR SERVER
    echo ========================================================
    echo.
    echo The .env file has been created. You MUST edit it:
    echo.
    echo   1. Set DB_HOST to your PostgreSQL server
    echo   2. Set DB_PASSWORD to your PostgreSQL password
    echo   3. Generate secure JWT secrets
    echo   4. Configure CORS_ORIGIN with your server IP
    echo.
    echo Press any key to open the .env file in Notepad...
    pause >nul
    notepad .env
    echo.
    echo Have you finished configuring the .env file? [Y/N]
    set /p configured=
    if /i not "%configured%"=="Y" (
        echo.
        echo Setup cancelled. Please configure .env and run this script again.
        pause
        exit /b 0
    )
)

echo.
echo ========================================================
echo   INSTALLING DEPENDENCIES
echo ========================================================
echo.

REM Install backend dependencies
echo [Backend] Installing dependencies...
cd backend
if not exist "node_modules" (
    call npm install
    if %errorlevel% neq 0 (
        echo.
        echo [ERROR] Failed to install backend dependencies!
        cd ..
        pause
        exit /b 1
    )
)

REM Build backend
echo [Backend] Building TypeScript...
call npm run build
if %errorlevel% neq 0 (
    echo.
    echo [ERROR] Failed to build backend!
    cd ..
    pause
    exit /b 1
)

cd ..

REM Install frontend dependencies
echo.
echo [Frontend] Installing dependencies...
cd frontend
if not exist "node_modules" (
    call npm install
    if %errorlevel% neq 0 (
        echo.
        echo [ERROR] Failed to install frontend dependencies!
        cd ..
        pause
        exit /b 1
    )
)

REM Build frontend
echo [Frontend] Building application...
call npm run build
if %errorlevel% neq 0 (
    echo.
    echo [ERROR] Failed to build frontend!
    cd ..
    pause
    exit /b 1
)

cd ..

echo.
echo ========================================================
echo   SETUP COMPLETE
echo ========================================================
echo.
echo Next steps:
echo.
echo 1. Ensure PostgreSQL is running
echo 2. Run database migrations:
echo      cd backend
echo      npm run migrate
echo      npm run seed
echo.
echo 3. Start the backend server:
echo      cd backend
echo      npm start
echo.
echo 4. In a NEW terminal, start the frontend:
echo      cd frontend
echo      npm run preview
echo.
echo OR use the START_SERVER.bat script to run both automatically.
echo.
pause
