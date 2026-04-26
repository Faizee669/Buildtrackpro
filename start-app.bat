@echo off
echo Starting BuildTrack Pro+ Local Servers...

:: Kill any existing processes on ports 5000 and 5173
echo Cleaning up old processes...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :5000') do taskkill /f /pid %%a >nul 2>&1
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :5173') do taskkill /f /pid %%a >nul 2>&1

:: Start Backend
echo Starting Backend...
start "BuildTrack Backend" cmd /c "cd artifacts\api-server && pnpm run dev"

:: Wait a moment for backend to initialize
timeout /t 3 /nobreak > nul

:: Start Frontend
echo Starting Frontend...
start "BuildTrack Frontend" cmd /c "cd artifacts\buildtrack && pnpm run dev"

echo.
echo ========================================================
echo APP STARTED!
echo Please open http://localhost:5173 in your browser.
echo ========================================================
pause
