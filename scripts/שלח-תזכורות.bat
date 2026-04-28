@echo off
cd /d "%~dp0"
echo.
echo ===================================
echo    שולח תזכורות - לא בטוח
echo ===================================
echo.
node send-whatsapp.js --mode reminder
echo.
pause
