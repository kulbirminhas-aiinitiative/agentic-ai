@echo off
echo 🔧 Installing Enhanced RAG Backend Dependencies
echo.

echo 📦 Installing required packages...
pip install fastapi uvicorn python-dotenv requests

echo.
echo ✅ Basic dependencies installed!
echo.

echo 🧪 Testing the fix...
python test_join_fix.py

echo.
echo 🚀 Starting the enhanced backend...
echo Press Ctrl+C to stop
echo.

python working_rag_backend.py

pause
