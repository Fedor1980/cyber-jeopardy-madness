@echo off
REM ============================================================================
REM Cyber Jeopardy Madness - Start Server (Both Backend and Frontend)
REM ============================================================================

echo.
echo ========================================================
echo   STARTING CYBER JEOPARDY MADNESS SERVER
echo ========================================================
echo.

REM Check if backend is built
if not exist "backend\dist" (
    echo [ERROR] Backend is not built!
    echo Please run DEPLOY_SERVER_SIMPLE.bat first.
    echo.
    pause
    exit /b 1
)

REM Check if frontend is built
if not exist "frontend\dist" (
    echo [ERROR] Frontend is not built!
    echo Please run DEPLOY_SERVER_SIMPLE.bat first.
    echo.
    pause
    exit /b 1
)

echo Starting backend server...
start "Cyber Jeopardy Backend" cmd /k "cd backend && npm start"

REM Wait a moment for backend to start
timeout /t 5 /nobreak >nul

echo Starting frontend server...
start "Cyber Jeopardy Frontend" cmd /k "cd frontend && npm run preview"

echo.
echo ========================================================
echo   SERVERS STARTED
echo ========================================================
echo.
echo Backend running at: http://localhost:3001
echo Frontend running at: http://localhost:4173
echo.
echo Two command windows have been opened.
echo Close those windows to stop the servers.
echo.
echo To get your server IP for client connections, run:
echo   ipconfig
echo.
pause
