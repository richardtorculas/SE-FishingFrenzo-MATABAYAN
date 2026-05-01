@echo off
color 0A
title MataBayan - Development Environment

echo ========================================
echo   MataBayan Development Environment
echo ========================================
echo.
echo Starting backend and frontend servers...
echo.
echo Backend:  http://localhost:5000
echo Frontend: http://localhost:3000
echo.
echo Press Ctrl+C in each window to stop
echo ========================================
echo.

start "MataBayan Backend" cmd /k "cd src\backend && npm run dev"
timeout /t 2 /nobreak >nul
start "MataBayan Frontend" cmd /k "cd src\frontend && npm start"

echo.
echo Servers are starting in separate windows...
echo Close this window when done.
pause
