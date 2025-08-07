@echo off
echo 🚀 Starting Enhanced Working RAG Backend
echo.

REM Kill any existing Python processes
echo 🛑 Stopping any existing Python processes...
taskkill /F /IM python.exe /T >nul 2>&1
timeout /t 2 /nobreak >nul

REM Start the enhanced backend
echo ⚡ Starting enhanced working_rag_backend.py...
echo 🌐 Server will be available at: http://localhost:8000
echo 📚 API Documentation: http://localhost:8000/docs
echo 💚 Health Check: http://localhost:8000/health
echo 📊 System Status: http://localhost:8000/system-status
echo.
echo 📋 Features:
echo   - Enhanced RAG functionality with LlamaIndex
echo   - Agent-specific document isolation
echo   - Fallback mode when RAG components unavailable
echo   - Comprehensive error handling
echo   - File upload and processing
echo.
echo 🛑 Press Ctrl+C to stop the server
echo.

python working_rag_backend.py

echo.
echo 🛑 Server stopped
pause
