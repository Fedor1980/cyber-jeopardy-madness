@echo off
REM ============================================================================
REM Cyber Jeopardy Madness - Stop Server
REM ============================================================================

echo.
echo ========================================================
echo   STOPPING CYBER JEOPARDY MADNESS SERVER
echo ========================================================
echo.

REM Check if Docker is available (for Docker deployment)
docker --version >nul 2>&1
if %errorlevel% equ 0 (
    echo Checking for Docker containers...
    docker-compose ps >nul 2>&1
    if %errorlevel% equ 0 (
        echo Stopping Docker containers...
        docker-compose down
        echo.
        echo Docker containers stopped successfully.
        goto :end
    )
)

REM If not Docker, just provide instructions
echo This script stops Docker-based deployments.
echo.
echo For direct installations, close the terminal windows
echo running the backend and frontend servers.
echo.
echo Or use Task Manager to end these processes:
echo   - node.exe (Backend server)
echo   - node.exe (Frontend server)
echo.

:end
pause
