@echo off
chcp 65001 >nul
title MegaChat Server

echo.
echo ==========================================
echo    MegaChat - Starting server...
echo ==========================================
echo.

REM Check Node.js
where node >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Node.js not installed!
    echo Download from https://nodejs.org
    pause
    exit /b 1
)

REM Go to project root
cd /d "%~dp0"

REM Check if dist exists, if not build
if not exist "dist\" (
    echo [INFO] Building frontend...
    call npm run build
    echo.
)

REM Go to server folder
cd /d "%~dp0server"

REM Check node_modules
if not exist "node_modules\" (
    echo [INFO] Installing server dependencies...
    call npm install
    echo.
)

echo [INFO] Starting server...
echo.
echo ==========================================
echo    MegaChat Server
echo    http://localhost:3001
echo    Open in browser!
echo ==========================================
echo.

start http://localhost:3001
node server.js

pause
