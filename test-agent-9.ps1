# Working Upload Test for Agent 9
$ErrorActionPreference = "Continue"

Write-Host "=== Testing Agent 9 File Upload ==="

# Test if server is responsive first
try {
    $test = Invoke-WebRequest -Uri 'http://localhost:3000' -TimeoutSec 3
    Write-Host "Server is running (Status: $($test.StatusCode))"
} catch {
    Write-Host "ERROR: Server not accessible - $($_.Exception.Message)"
    exit 1
}

# Simple test using .NET WebClient (better for multipart)
$webClient = New-Object System.Net.WebClient
$webClient.Headers.Add("User-Agent", "PowerShell-Test")

try {
    # Try with a simple POST with form data
    $formData = "agent_id=9"
    $response = $webClient.UploadString("http://localhost:3000/api/agent-files", "POST", $formData)
    Write-Host "Response: $response"
} catch {
    Write-Host "Expected error (no file): $($_.Exception.Message)"
}

# Check current files in agent 9 directory
Write-Host "`n=== Current Agent 9 Files ==="
$agent9Dir = "data\agents\9"
if (Test-Path $agent9Dir) {
    $files = Get-ChildItem $agent9Dir -File
    if ($files.Count -gt 0) {
        Write-Host "Files found:"
        $files | ForEach-Object { Write-Host "  - $($_.Name) ($($_.Length) bytes)" }
    } else {
        Write-Host "No files in directory"
    }
} else {
    Write-Host "Directory does not exist: $agent9Dir"
}

Write-Host "`n=== Next Steps ==="
Write-Host "1. Use the web form at: http://localhost:3000/test-upload.html"
Write-Host "2. Change agent_id from 8 to 9 in the HTML form"  
Write-Host "3. Upload any file to test agent 9"
Write-Host "4. Run this script again to check results"

Write-Host "`n=== Bridge API Test ==="
try {
    $bridge = Invoke-RestMethod -Uri 'http://localhost:3000/api/agent-files-bridge?agent_id=9' -Method Get
    Write-Host "Bridge API - Agent 9 files: $($bridge.files.Count)"
    Write-Host "Source: $($bridge.source)"
} catch {
    Write-Host "Bridge API error: $($_.Exception.Message)"
}
