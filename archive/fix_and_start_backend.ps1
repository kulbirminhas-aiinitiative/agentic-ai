# PowerShell script to fix RAG backend issues
Write-Host "🔧 RAG Backend Fix & Start" -ForegroundColor Cyan
Write-Host "=" * 30

# Stop Python processes
Write-Host "🛑 Stopping Python processes..."
Get-Process -Name "python" -ErrorAction SilentlyContinue | Stop-Process -Force
Start-Sleep -Seconds 2

# Check port
Write-Host "🔍 Checking port 8000..."
$portCheck = netstat -an | Select-String ":8000"
if ($portCheck) {
    Write-Host "⚠️  Port 8000 still in use" -ForegroundColor Yellow
} else {
    Write-Host "✅ Port 8000 is free" -ForegroundColor Green
}

# Start working backend
if (Test-Path "working_rag_backend.py") {
    Write-Host ""
    Write-Host "🚀 Starting working RAG backend..." -ForegroundColor Green
    Write-Host "📍 Server will be at: http://localhost:8000"
    Write-Host "💚 Health check: http://localhost:8000/health"
    Write-Host "🛑 Press Ctrl+C to stop"
    Write-Host ""
    
    python working_rag_backend.py
} else {
    Write-Host "❌ working_rag_backend.py not found!" -ForegroundColor Red
    Write-Host "🔧 Please ensure you have the working backend file"
}
