@echo off
color 0A
title MataBayan - Development

echo ========================================
echo   MataBayan Development Server
echo ========================================
echo.
echo Starting backend and frontend...
echo.
echo Backend:  http://localhost:5000
echo Frontend: http://localhost:3000
echo.
echo ========================================

cd src
start "Backend" cmd /k "cd backend && npm run dev"
timeout /t 2 /nobreak >nul
start "Frontend" cmd /k "cd frontend && npm start"

echo.
echo Servers starting in separate windows...
echo Close those windows to stop servers.
pause
