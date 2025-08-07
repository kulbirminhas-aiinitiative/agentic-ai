#!/bin/bash

# Enhanced Test Runner with Timeout and Detailed Logging
# This script provides enhanced debugging capabilities for test execution

set -e  # Exit on any error

# Enhanced colors and logging
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
WHITE='\033[1;37m'
NC='\033[0m'

# Logging with timestamps
log() {
    local level=$1
    shift
    local message="$*"
    local timestamp=$(date '+%H:%M:%S')
    
    case $level in
        "STEP") echo -e "${BLUE}[${timestamp}] 🔄 ${message}${NC}" ;;
        "SUCCESS") echo -e "${GREEN}[${timestamp}] ✅ ${message}${NC}" ;;
        "WARNING") echo -e "${YELLOW}[${timestamp}] ⚠️  ${message}${NC}" ;;
        "ERROR") echo -e "${RED}[${timestamp}] ❌ ${message}${NC}" ;;
        "INFO") echo -e "${CYAN}[${timestamp}] ℹ️  ${message}${NC}" ;;
        "DEBUG") echo -e "${PURPLE}[${timestamp}] 🐛 ${message}${NC}" ;;
        *) echo -e "${WHITE}[${timestamp}] ${message}${NC}" ;;
    esac
}

# Function to run command with timeout
run_with_timeout() {
    local timeout_duration=$1
    local description=$2
    shift 2
    local command="$*"
    
    log "INFO" "Starting: $description"
    log "DEBUG" "Command: $command"
    log "INFO" "Timeout: ${timeout_duration}s"
    
    if timeout $timeout_duration bash -c "$command"; then
        log "SUCCESS" "Completed: $description"
        return 0
    else
        local exit_code=$?
        if [ $exit_code -eq 124 ]; then
            log "ERROR" "TIMEOUT: $description exceeded ${timeout_duration}s"
        else
            log "ERROR" "FAILED: $description (exit code: $exit_code)"
        fi
        return $exit_code
    fi
}

# Check system resources
check_system_resources() {
    log "STEP" "Checking System Resources"
    
    # Check available memory
    if command -v free >/dev/null 2>&1; then
        local memory_info=$(free -h | grep "^Mem:")
        log "INFO" "Memory: $memory_info"
    elif command -v vm_stat >/dev/null 2>&1; then
        local memory_info=$(vm_stat | head -4)
        log "INFO" "Memory stats: $memory_info"
    fi
    
    # Check disk space
    local disk_info=$(df -h . | tail -1)
    log "INFO" "Disk space: $disk_info"
    
    # Check CPU load
    if command -v uptime >/dev/null 2>&1; then
        local load_info=$(uptime)
        log "INFO" "System load: $load_info"
    fi
}

# Check network connectivity
check_network() {
    log "STEP" "Checking Network Connectivity"
    
    # Check if we can resolve DNS
    if run_with_timeout 10 "DNS resolution test" "nslookup google.com"; then
        log "SUCCESS" "DNS resolution working"
    else
        log "WARNING" "DNS resolution may be slow or failing"
    fi
    
    # Check localhost connectivity
    if run_with_timeout 5 "Localhost connectivity" "curl -s http://localhost:8000/health || curl -s http://localhost:3000 || echo 'No local services running'"; then
        log "SUCCESS" "Localhost connectivity check completed"
    fi
}

# Enhanced service startup with detailed monitoring
start_service_with_monitoring() {
    local service_name=$1
    local start_command=$2
    local health_check_url=$3
    local max_wait_time=${4:-60}
    
    log "STEP" "Starting $service_name"
    
    # Start the service in background
    log "INFO" "Executing: $start_command"
    eval "$start_command" &
    local pid=$!
    log "INFO" "$service_name started with PID: $pid"
    
    # Monitor startup
    local wait_time=0
    local check_interval=2
    
    while [ $wait_time -lt $max_wait_time ]; do
        # Check if process is still running
        if ! kill -0 $pid 2>/dev/null; then
            log "ERROR" "$service_name process died (PID: $pid)"
            return 1
        fi
        
        # Check health endpoint if provided
        if [ -n "$health_check_url" ]; then
            if curl -s "$health_check_url" >/dev/null 2>&1; then
                log "SUCCESS" "$service_name is ready (${wait_time}s)"
                return 0
            fi
        fi
        
        echo -n "."
        sleep $check_interval
        wait_time=$((wait_time + check_interval))
    done
    
    echo ""
    log "ERROR" "$service_name failed to start within ${max_wait_time}s"
    return 1
}

# Main execution with comprehensive logging
main() {
    log "STEP" "Enhanced Test Runner Started"
    
    # System checks
    check_system_resources
    check_network
    
    # Change to test directory
    local script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
    cd "$script_dir"
    log "INFO" "Working directory: $(pwd)"
    
    # Clean up any previous test artifacts
    log "INFO" "Cleaning up previous test artifacts"
    rm -f *.log backend_test_results.json frontend_test_results.json
    
    # Run the main test script with timeout
    if run_with_timeout 600 "Complete test suite execution" "./run_complete_tests.sh"; then
        log "SUCCESS" "All tests completed successfully"
        exit 0
    else
        log "ERROR" "Tests failed or timed out"
        
        # Collect diagnostic information
        log "INFO" "Collecting diagnostic information..."
        
        # Show recent log files
        for logfile in *.log; do
            if [ -f "$logfile" ]; then
                log "INFO" "Contents of $logfile (last 20 lines):"
                tail -20 "$logfile"
                echo ""
            fi
        done
        
        # Show running processes
        log "INFO" "Running Node.js and Python processes:"
        ps aux | grep -E "(node|python)" | grep -v grep || log "INFO" "No relevant processes found"
        
        # Show port usage
        log "INFO" "Port usage for 3000, 3001, 8000:"
        lsof -i :3000 || log "INFO" "Port 3000 not in use"
        lsof -i :3001 || log "INFO" "Port 3001 not in use"
        lsof -i :8000 || log "INFO" "Port 8000 not in use"
        
        exit 1
    fi
}

# Trap to cleanup on exit
cleanup() {
    log "INFO" "Cleaning up processes..."
    # Kill any background processes we might have started
    jobs -p | xargs -r kill 2>/dev/null || true
}

trap cleanup EXIT

# Run main function
main "$@"
