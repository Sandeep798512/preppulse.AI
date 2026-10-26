@echo off
title PrepPulse.AI - 1-Click Launcher
color 0B

echo ====================================================================
echo        PrepPulse.AI - AI Placement Prep System Launcher
echo ====================================================================
echo.

:: Check Node.js
where node >nul 2>nul
if %errorlevel% neq 0 (
    color 0C
    echo [ERROR] Node.js is not installed or not added to PATH!
    echo Please download and install Node.js from: https://nodejs.org/
    echo Once installed, double-click this launcher again.
    echo.
    pause
    exit /b
)

echo [*] Node.js detected: 
node -v
echo.

:: Backend dependencies check
if not exist "backend\node_modules\" (
    echo [*] Installing Backend dependencies (one-time setup)...
    cd backend
    call npm install
    cd ..
    echo [OK] Backend dependencies installed.
) else (
    echo [OK] Backend dependencies verified.
)

:: Frontend dependencies check
if not exist "frontend\node_modules\" (
    echo [*] Installing Frontend dependencies (one-time setup)...
    cd frontend
    call npm install
    cd ..
    echo [OK] Frontend dependencies installed.
) else (
    echo [OK] Frontend dependencies verified.
)

echo.
echo ====================================================================
echo  Launching Backend (Port 5000) and Frontend (Port 3000/3001)...
echo ====================================================================
echo.

:: Launch Backend in separate window
start "PrepPulse Backend API (Port 5000)" cmd /k "cd backend && npm run dev"

:: Short delay to allow backend to initialize
timeout /t 3 /nobreak >nul

:: Launch Frontend in separate window
start "PrepPulse Frontend UI" cmd /k "cd frontend && npm run dev"

:: Short delay and open browser
timeout /t 3 /nobreak >nul
start http://localhost:3000

echo.
echo [SUCCESS] Both servers are now running!
echo  - Backend API:  http://localhost:5000/api
echo  - Frontend Web: http://localhost:3000 (or http://localhost:3001)
echo.
echo  Press any key or close this window. To stop the application,
echo  close the two opened command terminal windows.
echo ====================================================================
pause
