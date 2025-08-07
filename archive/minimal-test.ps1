# Minimal Upload Test
$boundary = "----WebKitFormBoundary7MA4YWxkTrZu0gW"
$fileName = "test-simple.txt"
$fileContent = "test content`n"
$agentId = "8"

# Create proper multipart form data
$body = @"
------WebKitFormBoundary7MA4YWxkTrZu0gW
Content-Disposition: form-data; name="agent_id"

$agentId
------WebKitFormBoundary7MA4YWxkTrZu0gW
Content-Disposition: form-data; name="file"; filename="$fileName"
Content-Type: text/plain

$fileContent
------WebKitFormBoundary7MA4YWxkTrZu0gW--
"@

# Convert to bytes with proper line endings
$bodyBytes = [System.Text.Encoding]::UTF8.GetBytes($body.Replace("`n", "`r`n"))

try {
    Write-Host "Testing minimal upload..."
    $response = Invoke-RestMethod -Uri 'http://localhost:3000/api/agent-files' -Method Post -Body $bodyBytes -ContentType "multipart/form-data; boundary=----WebKitFormBoundary7MA4YWxkTrZu0gW"
    Write-Host "SUCCESS: $($response.message)"
} catch {
    Write-Host "ERROR: $($_.Exception.Message)"
    if ($_.Exception.Response) {
        Write-Host "Status: $($_.Exception.Response.StatusCode.value__)"
    }
}
