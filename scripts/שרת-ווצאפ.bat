@echo off
title WhatsApp Server
cd /d "%~dp0"
echo.
echo ========================================
echo    WhatsApp Server - Bar Mitzvah
echo ========================================
echo.
echo Installing dependencies...
npm install
if %errorlevel% neq 0 (
    echo ERROR: npm install failed
    pause
    exit /b 1
)
echo.
echo Starting server...
node server.js
pause
