# Simple Upload Test Script
$ErrorActionPreference = "Stop"

Write-Host "🔧 Testing file upload to agent 8..."

# Create multipart form data manually
$boundary = [System.Guid]::NewGuid().ToString()
$filePath = "requirements_enhanced_rag.txt"

# Read file content
$fileBytes = [System.IO.File]::ReadAllBytes($filePath)
$fileName = [System.IO.Path]::GetFileName($filePath)

# Build multipart body
$LF = "`r`n"
$bodyLines = @(
    "--$boundary",
    'Content-Disposition: form-data; name="agent_id"',
    "",
    "8",
    "--$boundary",
    "Content-Disposition: form-data; name=`"file`"; filename=`"$fileName`"",
    "Content-Type: application/octet-stream",
    ""
)

# Convert to bytes
$bodyString = ($bodyLines -join $LF) + $LF
$bodyBytesStart = [System.Text.Encoding]::UTF8.GetBytes($bodyString)
$bodyBytesEnd = [System.Text.Encoding]::UTF8.GetBytes("$LF--$boundary--$LF")

# Combine all bytes
$bodyBytes = $bodyBytesStart + $fileBytes + $bodyBytesEnd

try {
    Write-Host "📤 Uploading file..."
    $response = Invoke-RestMethod -Uri 'http://localhost:3000/api/agent-files' -Method Post -Body $bodyBytes -ContentType "multipart/form-data; boundary=$boundary" -TimeoutSec 30
    
    Write-Host "✅ Upload successful!"
    Write-Host "Message: $($response.message)"
    Write-Host "File Path: $($response.path)"
    
} catch {
    Write-Host "❌ Upload failed!"
    Write-Host "Error: $($_.Exception.Message)"
    
    if ($_.Exception.Response) {
        $statusCode = $_.Exception.Response.StatusCode.value__
        Write-Host "Status Code: $statusCode"
        
        try {
            $errorStream = $_.Exception.Response.GetResponseStream()
            $reader = New-Object System.IO.StreamReader($errorStream)
            $errorText = $reader.ReadToEnd()
            Write-Host "Response Body: $errorText"
        } catch {
            Write-Host "Could not read error response"
        }
    }
}

# Check file system
Write-Host "`n📁 Checking file system..."
$agentDir = "data\agents\8"
if (Test-Path $agentDir) {
    $files = Get-ChildItem $agentDir -File
    if ($files.Count -gt 0) {
        Write-Host "✅ Files found in $agentDir :"
        $files | ForEach-Object { Write-Host "  📄 $($_.Name) ($($_.Length) bytes)" }
    } else {
        Write-Host "⚠️  No files in $agentDir"
    }
} else {
    Write-Host "❌ Directory not found: $agentDir"
}

Write-Host "`n✨ Test complete!"
