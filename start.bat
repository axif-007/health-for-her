@echo off
title Asifa Recovery Companion - Startup

echo ====================================
echo  Asifa - Recovery Companion Startup
echo ====================================
echo.

echo Starting Backend (FastAPI)...
start "Asifa Backend" cmd /k "cd /d "%~dp0backend" && python seed.py && uvicorn main:app --reload --port 8001"

echo Waiting for backend to start...
timeout /t 4 /nobreak >nul

echo.
echo Starting Frontend (React + Vite)...
start "Asifa Frontend" cmd /k "cd /d "%~dp0frontend" && npm run dev -- --port 5174"

echo.
echo ====================================
echo  Both servers started!
echo.
echo  Backend:  http://localhost:8001
echo  API Docs: http://localhost:8001/docs
echo  Frontend: http://localhost:5174
echo.
echo  Login: asifa / asifa123
echo ====================================
echo.
pause
