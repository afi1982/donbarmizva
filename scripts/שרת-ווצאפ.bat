@echo off
title WhatsApp Server
cd /d "%~dp0"
echo.
echo ==========================================
echo    WhatsApp Server - Bar Mitzvah
echo ==========================================
echo.

echo Closing any existing server on port 3333...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":3333 " ^| findstr "LISTENING"') do (
    taskkill /F /PID %%a >nul 2>&1
)

echo [1/2] Installing dependencies...
call npm install
if %errorlevel% neq 0 (
    echo ERROR: npm install failed!
    pause
    exit /b 1
)

echo.
echo [2/2] Starting server on port 3333...
echo       Please wait 30-60 seconds for QR code to appear.
echo       Scan QR with WhatsApp: Settings - Linked Devices - Link a Device
echo.
echo ==========================================

node server.js

echo.
echo ==========================================
echo  Server stopped.
echo ==========================================
pause
