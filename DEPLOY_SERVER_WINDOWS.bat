@echo off
REM ============================================================================
REM Cyber Jeopardy Madness - Windows Server Deployment Script
REM ============================================================================
REM This script deploys the multiplayer server using Docker Compose
REM Prerequisites: Docker Desktop for Windows must be installed
REM ============================================================================

echo.
echo ========================================================
echo   CYBER JEOPARDY MADNESS - SERVER DEPLOYMENT
echo ========================================================
echo.

REM Check if Docker is installed
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Docker is not installed!
    echo.
    echo Please install Docker Desktop for Windows from:
    echo https://www.docker.com/products/docker-desktop/
    echo.
    pause
    exit /b 1
)

REM Check if Docker Compose is available
docker-compose --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Docker Compose is not available!
    echo.
    echo Docker Compose should be included with Docker Desktop.
    echo Please reinstall Docker Desktop.
    echo.
    pause
    exit /b 1
)

echo [OK] Docker is installed and ready
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
    echo The .env file has been created. You MUST edit it before
    echo continuing. Please configure:
    echo.
    echo   1. Database password (DB_PASSWORD)
    echo   2. JWT secrets (JWT_SECRET and JWT_REFRESH_SECRET)
    echo   3. Your server's IP address or hostname
    echo.
    echo Press any key to open the .env file in Notepad...
    pause >nul
    notepad .env
    echo.
    echo Have you finished configuring the .env file? [Y/N]
    set /p configured=
    if /i not "%configured%"=="Y" (
        echo.
        echo Deployment cancelled. Please configure .env and run this script again.
        pause
        exit /b 0
    )
)

echo.
echo ========================================================
echo   DEPLOYING SERVER
echo ========================================================
echo.

REM Stop any existing containers
echo [1/5] Stopping existing containers...
docker-compose down >nul 2>&1

REM Pull latest images
echo [2/5] Pulling Docker images...
docker-compose pull

REM Build services
echo [3/5] Building application containers...
docker-compose build

REM Start services
echo [4/5] Starting services...
docker-compose up -d

REM Wait for database to be ready
echo [5/5] Waiting for database to initialize...
timeout /t 10 /nobreak >nul

REM Run database migrations
echo.
echo Running database migrations...
docker-compose exec -T backend npm run migrate

REM Seed initial data
echo.
echo Seeding initial game data...
docker-compose exec -T backend npm run seed

echo.
echo ========================================================
echo   DEPLOYMENT COMPLETE!
echo ========================================================
echo.
echo Server is now running at:
echo   - Frontend: http://localhost
echo   - Backend API: http://localhost:3001
echo.
echo Default login credentials:
echo   Username: admin
echo   Password: admin123
echo.
echo IMPORTANT: Change the default password immediately!
echo.
echo To view server logs:
echo   docker-compose logs -f
echo.
echo To stop the server:
echo   docker-compose down
echo.
echo To get your server's IP address for client connections:
echo   ipconfig
echo.
pause
