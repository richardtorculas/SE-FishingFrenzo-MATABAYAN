@echo off
color 0E
title MataBayan - Database Viewer

echo ========================================
echo   MataBayan - Database Viewer
echo ========================================
echo.
echo Database: matabayan
echo Collection: users
echo.

mongosh mongodb://localhost:27017/matabayan --eval "print('=== REGISTERED USERS ==='); db.users.find().forEach(u => print(JSON.stringify(u, null, 2)))"

echo.
echo ========================================
pause
