@echo off
echo ====================================================
echo  🚀 Starting Skill_Map Server...
echo ====================================================

:: Stop any process running on port 5000 if present
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :5000 ^| findstr LISTENING') do (
    echo Freeing port 5000 (PID: %%a)...
    taskkill /F /PID %%a >nul 2>&1
)

cd /d "%~dp0server"

where node >nul 2>nul
if %errorlevel% equ 0 (
    node app.js
) else if exist "C:\Program Files\nodejs\node.exe" (
    echo Using Node.js at C:\Program Files\nodejs...
    "C:\Program Files\nodejs\node.exe" app.js
) else (
    echo [ERROR] Node.js not found. Please install Node.js from https://nodejs.org/
)

pause
