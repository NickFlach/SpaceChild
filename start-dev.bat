@echo off
echo Starting SpaceChild Development Server...
echo.

REM Kill any existing node processes
taskkill /F /IM node.exe 2>nul

echo Waiting 2 seconds...
timeout /t 2 /nobreak >nul

echo Starting development server...
set NODE_ENV=development
npx tsx server/index.ts
