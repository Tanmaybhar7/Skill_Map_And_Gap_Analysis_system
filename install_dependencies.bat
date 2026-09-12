@echo off
echo ====================================================
echo  Skill_Map Dependency Installer
echo ====================================================
cd /d "%~dp0server"

where npm >nul 2>nul
if %errorlevel% equ 0 (
    call npm install
) else if exist "C:\Program Files\nodejs\npm.cmd" (
    echo Using Node.js at C:\Program Files\nodejs...
    call "C:\Program Files\nodejs\npm.cmd" install
) else (
    echo [ERROR] Node.js / NPM not found. Please install Node.js from https://nodejs.org/
)

pause
