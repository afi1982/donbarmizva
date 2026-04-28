@echo off
title WhatsApp Server
cd /d "%~dp0"
echo.
echo ==========================================
echo    WhatsApp Server - Bar Mitzvah
echo ==========================================
echo.

echo [1/2] Installing dependencies...
call npm install
if %errorlevel% neq 0 (
    echo.
    echo ERROR: npm install failed!
    pause
    exit /b 1
)

echo.
echo [2/2] Starting server on port 3333...
echo       Please wait 30-60 seconds for WhatsApp to connect.
echo       If QR code appears - scan it with your phone.
echo       (WhatsApp - Settings - Linked Devices - Link a Device)
echo.
echo ==========================================

node server.js

echo.
echo ==========================================
echo  Server stopped. See error above if any.
echo ==========================================
pause
