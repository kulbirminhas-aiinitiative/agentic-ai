@echo off
echo.
echo 🚀 RAG Backend Startup Script
echo ================================
echo.

echo 🛑 Stopping any existing Python processes...
powershell -Command "Get-Process | Where-Object { $_.ProcessName -eq 'python' } | Stop-Process -Force" 2>nul
timeout /t 2 /nobreak >nul

echo.
echo 🔍 Checking port 8000...
netstat -an | findstr :8000
if %errorlevel% equ 0 (
    echo ⚠️  Port 8000 is still in use
) else (
    echo ✅ Port 8000 is free
)

echo.
echo 🚀 Starting Working RAG Backend...
echo.
echo 📍 Server will be available at: http://localhost:8000
echo 💚 Health check: http://localhost:8000/health
echo 📚 API docs: http://localhost:8000/docs
echo.
echo 🛑 Press Ctrl+C to stop the server
echo.

python working_rag_backend.py

echo.
echo 🛑 Server stopped
pause
