# Simple Upload Test
$ErrorActionPreference = "Stop"

Write-Host "Testing file upload to agent 8..."

try {
    # Create test file
    "Test content for agent 8" > test_file.txt
    
    # Test upload using curl
    curl -X POST -F "agent_id=8" -F "file=@test_file.txt" http://localhost:3001/api/agent-files
    
    Write-Host "Upload test completed"
    
    # Clean up
    Remove-Item test_file.txt -ErrorAction SilentlyContinue
    
} catch {
    Write-Host "Error: $($_.Exception.Message)"
}
