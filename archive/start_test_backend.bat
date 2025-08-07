@echo off
echo 🚀 Starting Test RAG Backend...
echo.
echo 🛑 Stopping any existing backends...
powershell -Command "Get-Process | Where-Object { $_.ProcessName -eq 'python' } | Stop-Process -Force" 2>nul

echo.
echo 🧪 Starting test_rag_backend.py...
python test_rag_backend.py

pause
