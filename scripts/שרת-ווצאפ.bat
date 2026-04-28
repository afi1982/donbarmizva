@echo off
chcp 65001 >nul
title WhatsApp Server - Bar Mitzvah
cd /d "%~dp0"
echo.
echo ========================================
echo    שרת WhatsApp - בר מצווה
echo ========================================
echo.
echo מתקין חבילות...
npm install
echo.
echo מפעיל שרת...
node server.js
pause
