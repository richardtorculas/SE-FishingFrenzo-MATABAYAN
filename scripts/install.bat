@echo off
color 0B
title MataBayan - Installation

echo ========================================
echo   MataBayan - Installing Dependencies
echo ========================================
echo.

echo [1/3] Installing backend dependencies...
cd src\backend
call npm install
cd ..\..

echo.
echo [2/3] Installing frontend dependencies...
cd src\frontend
call npm install
cd ..\..

echo.
echo [3/3] Installing root dependencies...
call npm install

echo.
echo ========================================
echo   Installation Complete!
echo ========================================
echo.
echo To start development:
echo   npm run dev
echo.
echo Or use: scripts\dev.bat
echo.
pause
