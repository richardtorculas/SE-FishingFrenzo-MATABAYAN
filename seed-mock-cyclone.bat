@echo off
REM ============================================
REM MOCK ACTIVE CYCLONE SEEDER
REM ============================================
REM Quick script to seed mock cyclone data
REM Usage: Run this file from project root
REM ============================================

echo.
echo ============================================
echo   MOCK ACTIVE CYCLONE SEEDER
echo ============================================
echo.
echo This will create mock active cyclone data for testing:
echo   - PAOLO (Typhoon, 130 km/h)
echo   - QUEDAN (Severe Tropical Storm, 95 km/h)
echo.
echo The script will:
echo   1. Create cyclone records in MongoDB
echo   2. Trigger alert creation
echo   3. Generate and send SMS messages
echo   4. Display summary
echo.
echo Prerequisites:
echo   - MongoDB running
echo   - Backend running (npm run dev)
echo   - .env configured with SMS credentials
echo.
pause

cd src\backend
node src\seeds\seedMockActiveCyclone.js

pause
