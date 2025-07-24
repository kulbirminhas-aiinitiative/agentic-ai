@echo off
title RAG Backend Fix and Start

echo.
echo ================================================================
echo                   RAG BACKEND FIX ^& START
echo ================================================================
echo.

echo 🛑 Step 1: Stopping problematic Python processes...
taskkill /F /IM python.exe >nul 2>&1
timeout /t 3 /nobreak >nul

echo ✅ Step 2: Verifying port 8000 is free...
netstat -an | findstr ":8000" >nul
if %errorlevel% equ 0 (
    echo    ⚠️  Port 8000 still in use, but proceeding...
) else (
    echo    ✅ Port 8000 is free
)

echo.
echo 🚀 Step 3: Starting WORKING RAG Backend...
echo.
echo    📍 Server: http://localhost:8000
echo    💚 Health: http://localhost:8000/health  
echo    📚 Docs:   http://localhost:8000/docs
echo.
echo    🛑 Press Ctrl+C to stop the server
echo.
echo ================================================================

python working_rag_backend.py

echo.
echo 🛑 Server stopped
echo.
pause
