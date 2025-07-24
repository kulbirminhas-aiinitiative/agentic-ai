# Test File Upload Script
$ErrorActionPreference = "Continue"

# Check if servers are running
Write-Host "🔍 Checking server status..."

try {
    $nextjs = Invoke-WebRequest -Uri 'http://localhost:3000' -TimeoutSec 3
    Write-Host "✅ Next.js server is running (Status: $($nextjs.StatusCode))"
} catch {
    Write-Host "❌ Next.js server not responding: $($_.Exception.Message)"
    Write-Host "Please start the server with: npm run dev"
    exit 1
}

# Test file upload to agent 8
Write-Host "`n📤 Testing file upload to agent 8..."

$filePath = "requirements_enhanced_rag.txt"

if (-not (Test-Path $filePath)) {
    Write-Host "❌ Test file not found: $filePath"
    exit 1
}

# Create multipart form data
$boundary = [System.Guid]::NewGuid().ToString()
$fileBytes = [System.IO.File]::ReadAllBytes($filePath)
$fileName = [System.IO.Path]::GetFileName($filePath)

$bodyParts = @()
$bodyParts += "--$boundary"
$bodyParts += 'Content-Disposition: form-data; name="agent_id"'
$bodyParts += ''
$bodyParts += '8'
$bodyParts += "--$boundary"
$bodyParts += "Content-Disposition: form-data; name=`"file`"; filename=`"$fileName`""
$bodyParts += 'Content-Type: text/plain'
$bodyParts += ''

$bodyString = ($bodyParts -join "`r`n") + "`r`n"
$bodyBytes = [System.Text.Encoding]::UTF8.GetBytes($bodyString)
$bodyBytes += $fileBytes
$bodyBytes += [System.Text.Encoding]::UTF8.GetBytes("`r`n--$boundary--`r`n")

try {
    $response = Invoke-RestMethod -Uri 'http://localhost:3000/api/agent-files' -Method Post -Body $bodyBytes -ContentType "multipart/form-data; boundary=$boundary" -TimeoutSec 30
    Write-Host "✅ Upload successful!"
    Write-Host "Response: $($response | ConvertTo-Json -Depth 3)"
} catch {
    Write-Host "❌ Upload failed: $($_.Exception.Message)"
    if ($_.Exception.Response) {
        $statusCode = $_.Exception.Response.StatusCode
        Write-Host "Status Code: $statusCode"
    }
}

# Check if file was saved to filesystem
Write-Host "`n📁 Checking file system..."
$agentDir = "data\agents\8"
if (Test-Path $agentDir) {
    $files = Get-ChildItem $agentDir -File
    if ($files) {
        Write-Host "✅ Files found in $agentDir :"
        $files | ForEach-Object { Write-Host "  - $($_.Name)" }
    } else {
        Write-Host "⚠️  No files found in $agentDir"
    }
} else {
    Write-Host "❌ Agent directory not found: $agentDir"
}

# Test bridge API
Write-Host "`n🌉 Testing bridge API..."
try {
    $bridgeResponse = Invoke-RestMethod -Uri 'http://localhost:3000/api/agent-files-bridge?agent_id=8' -Method Get
    Write-Host "✅ Bridge API response:"
    Write-Host "Files found: $($bridgeResponse.files.Count)"
    Write-Host "Source: $($bridgeResponse.source)"
} catch {
    Write-Host "❌ Bridge API failed: $($_.Exception.Message)"
}

Write-Host "`n✨ Test complete!"
