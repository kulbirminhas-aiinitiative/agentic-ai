#!/bin/bash

# Complete Testing Suite for Agentic AI Platform
# Tests both backend (Python/FastAPI) and frontend (Next.js/React) components

echo "🚀 Starting Complete Testing Suite for Agentic AI Platform"
echo "==========================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Logging functions
log_step() {
    echo -e "\n${BLUE}[$(date '+%H:%M:%S')] 🔄 $1${NC}"
}

log_success() {
    echo -e "${GREEN}[$(date '+%H:%M:%S')] ✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}[$(date '+%H:%M:%S')] ⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}[$(date '+%H:%M:%S')] ❌ $1${NC}"
}

log_info() {
    echo -e "${CYAN}[$(date '+%H:%M:%S')] ℹ️  $1${NC}"
}

# Function to check if a command exists
command_exists() {
    log_info "Checking if command '$1' exists..."
    if command -v "$1" >/dev/null 2>&1; then
        log_success "Command '$1' found"
        return 0
    else
        log_error "Command '$1' not found"
        return 1
    fi
}

# Function to check if a port is in use
check_port() {
    local port=$1
    log_info "Checking if port $port is in use..."
    if lsof -i :$port >/dev/null 2>&1; then
        log_success "Port $port is in use"
        return 0
    else
        log_warning "Port $port is not in use"
        return 1
    fi
}

# Step 1: Check prerequisites
log_step "Checking Prerequisites"

if ! command_exists python3; then
    log_error "Python 3 is not installed"
    exit 1
fi

if ! command_exists node; then
    log_error "Node.js is not installed"
    exit 1
fi

if ! command_exists npm; then
    log_error "npm is not installed"
    exit 1
fi

log_success "All prerequisites are installed"

# Step 2: Setup Python environment for backend testing
log_step "Setting up Python environment"

# Check if v-agentic-ai environment exists in parent directory
if [ -d "../v-agentic-ai" ]; then
    log_info "Using existing v-agentic-ai environment"
    log_info "Activating ../v-agentic-ai/bin/activate..."
    source ../v-agentic-ai/bin/activate
    log_success "v-agentic-ai environment activated"
else
    log_warning "v-agentic-ai environment not found, creating temporary venv"
    if [ ! -d "venv" ]; then
        log_info "Creating virtual environment..."
        python3 -m venv venv
        log_success "Virtual environment created"
    fi
    log_info "Activating temporary venv..."
    source venv/bin/activate
    log_success "Temporary venv activated"
fi

# Install Python dependencies
log_info "Installing Python dependencies (requests, beautifulsoup4, selenium)..."
source ../v-agentic-ai/bin/activate && pip install -q requests beautifulsoup4 selenium 2>&1 | tee pip_install.log
if [ ${PIPESTATUS[0]} -eq 0 ]; then
    log_success "Python dependencies installed successfully"
else
    log_error "Failed to install Python dependencies. Check pip_install.log"
    cat pip_install.log
fi

log_success "Python environment ready"

# Step 3: Check if backend is running
log_step "Checking Backend Status"

if check_port 8000; then
    log_success "Backend is running on port 8000"
    BACKEND_RUNNING=true
else
    log_warning "Backend not running. Attempting to start backend"
    
    # Try to start the backend
    if [ -f "../rag_backend.py" ]; then
        log_info "Found backend file: ../rag_backend.py"
        log_info "Starting backend in background with virtual environment..."
        cd .. && source v-agentic-ai/bin/activate && python rag_backend.py > test/backend_startup.log 2>&1 &
        BACKEND_PID=$!
        cd test
        log_info "Backend started with PID: $BACKEND_PID"
        
        log_info "Waiting 10 seconds for backend to initialize..."
        for i in {1..10}; do
            echo -n "."
            sleep 1
        done
        echo ""
        
        if check_port 8000; then
            log_success "Backend started successfully"
            BACKEND_RUNNING=true
            BACKEND_STARTED_BY_SCRIPT=true
        else
            log_error "Failed to start backend after 10 seconds"
            log_info "Backend startup log:"
            cat backend_startup.log | tail -20
            BACKEND_RUNNING=false
        fi
    else
        log_error "Backend file not found: ../rag_backend.py"
        BACKEND_RUNNING=false
    fi
fi

# Step 4: Check if frontend is running
log_step "Checking Frontend Status"

if check_port 3000 || check_port 3001; then
    if check_port 3000; then
        FRONTEND_PORT=3000
    else
        FRONTEND_PORT=3001
    fi
    log_success "Frontend is running on port $FRONTEND_PORT"
    FRONTEND_RUNNING=true
else
    log_warning "Frontend not running. Attempting to start frontend"
    
    # Install frontend dependencies if needed
    if [ ! -d "../node_modules" ]; then
        log_info "Node modules not found, installing npm dependencies..."
        cd .. && npm install > ../test/npm_install.log 2>&1 && cd test
        if [ $? -eq 0 ]; then
            log_success "npm dependencies installed"
        else
            log_error "Failed to install npm dependencies. Check npm_install.log"
            cat npm_install.log | tail -10
        fi
    else
        log_info "Node modules already exist, skipping npm install"
    fi
    
    # Start the frontend in development mode
    log_info "Starting frontend in background..."
    cd .. && npm run dev > ../test/frontend_startup.log 2>&1 &
    FRONTEND_PID=$!
    cd test
    log_info "Frontend started with PID: $FRONTEND_PID"
    
    # Wait for frontend to start
    log_info "Waiting up to 60 seconds for frontend to start..."
    for i in {1..60}; do
        if check_port 3000 || check_port 3001; then
            if check_port 3000; then
                FRONTEND_PORT=3000
            else
                FRONTEND_PORT=3001
            fi
            log_success "Frontend started successfully on port $FRONTEND_PORT"
            FRONTEND_RUNNING=true
            FRONTEND_STARTED_BY_SCRIPT=true
            break
        fi
        echo -n "."
        sleep 1
    done
    echo ""
    
    if [ "$FRONTEND_RUNNING" != true ]; then
        log_error "Failed to start frontend after 60 seconds"
        log_info "Frontend startup log:"
        cat frontend_startup.log | tail -20
        FRONTEND_RUNNING=false
    fi
fi

# Step 5: Run Backend API Tests
log_step "Running Backend API Tests"

if [ "$BACKEND_RUNNING" = true ]; then
    if [ -f "test_complete_system.py" ]; then
        log_info "Running Python backend tests with virtual environment..."
        log_info "Test command: source ../v-agentic-ai/bin/activate && python test_complete_system.py"
        source ../v-agentic-ai/bin/activate && python test_complete_system.py 2>&1 | tee backend_test_output.log
        BACKEND_TEST_STATUS=${PIPESTATUS[0]}
        
        if [ $BACKEND_TEST_STATUS -eq 0 ]; then
            log_success "Backend tests completed successfully"
        else
            log_error "Backend tests failed with exit code: $BACKEND_TEST_STATUS"
        fi
    else
        log_error "Backend test file not found: test_complete_system.py"
        BACKEND_TEST_STATUS=1
    fi
else
    log_warning "Skipping backend tests (backend not running)"
    BACKEND_TEST_STATUS=1
fi

# Step 6: Run Frontend UI Tests
log_step "Running Frontend UI Tests"

if [ "$FRONTEND_RUNNING" = true ]; then
    # Install puppeteer if not present
    log_info "Checking Node.js dependencies for frontend testing..."
    cd .. 
    if ! npm list puppeteer >/dev/null 2>&1; then
        log_info "Installing puppeteer for comprehensive frontend testing..."
        npm install puppeteer >/dev/null 2>&1
        if [ $? -eq 0 ]; then
            log_success "Puppeteer installed successfully"
        else
            log_warning "Failed to install puppeteer - comprehensive tests may fail"
        fi
    else
        log_success "Puppeteer already installed"
    fi
    cd test
    
    # Run basic frontend tests first
    if [ -f "test_frontend_ui.js" ]; then
        log_info "Running basic frontend tests..."
        log_info "Frontend URL: http://localhost:$FRONTEND_PORT"
        FRONTEND_URL="http://localhost:$FRONTEND_PORT" node test_frontend_ui.js 2>&1 | tee frontend_test_output.log
        BASIC_FRONTEND_STATUS=${PIPESTATUS[0]}
        
        if [ $BASIC_FRONTEND_STATUS -eq 0 ]; then
            log_success "Basic frontend tests completed successfully"
        else
            log_error "Basic frontend tests failed with exit code: $BASIC_FRONTEND_STATUS"
        fi
    else
        log_warning "Basic frontend test file not found: test_frontend_ui.js"
        BASIC_FRONTEND_STATUS=1
    fi
    
    # Run comprehensive frontend tests
    if [ -f "test_comprehensive_frontend.js" ]; then
        log_info "Running comprehensive frontend tests..."
        log_info "Testing all navigation, buttons, forms, and APIs..."
        FRONTEND_URL="http://localhost:$FRONTEND_PORT" node test_comprehensive_frontend.js 2>&1 | tee comprehensive_frontend_output.log
        COMPREHENSIVE_FRONTEND_STATUS=${PIPESTATUS[0]}
        
        if [ $COMPREHENSIVE_FRONTEND_STATUS -eq 0 ]; then
            log_success "Comprehensive frontend tests completed successfully"
        else
            log_error "Comprehensive frontend tests failed with exit code: $COMPREHENSIVE_FRONTEND_STATUS"
        fi
    else
        log_warning "Comprehensive frontend test file not found: test_comprehensive_frontend.js"
        COMPREHENSIVE_FRONTEND_STATUS=1
    fi
    
    # Overall frontend status (both basic and comprehensive tests must pass)
    if [ $BASIC_FRONTEND_STATUS -eq 0 ] && [ $COMPREHENSIVE_FRONTEND_STATUS -eq 0 ]; then
        FRONTEND_TEST_STATUS=0
        log_success "All frontend tests passed"
    else
        FRONTEND_TEST_STATUS=1
        log_error "Some frontend tests failed (Basic: $BASIC_FRONTEND_STATUS, Comprehensive: $COMPREHENSIVE_FRONTEND_STATUS)"
    fi
else
    log_warning "Skipping frontend tests (frontend not running)"
    FRONTEND_TEST_STATUS=1
fi

# Step 7: Generate Combined Report
echo -e "\n${BLUE}📊 Generating Combined Test Report...${NC}"

TIMESTAMP=$(date '+%Y-%m-%d_%H-%M-%S')
REPORT_FILE="complete_test_report_$TIMESTAMP.md"

cat > "$REPORT_FILE" << EOF
# Complete Testing Report - Agentic AI Platform

**Generated:** $(date)
**Test Suite Version:** Complete System Test v1.0

## Test Environment
- Backend Port: 8000
- Frontend Port: $FRONTEND_PORT
- Python Version: $(python --version)
- Node Version: $(node --version)

## Test Results Summary

### Backend API Tests
EOF

if [ $BACKEND_TEST_STATUS -eq 0 ]; then
    echo "- **Status:** ✅ PASSED" >> "$REPORT_FILE"
else
    echo "- **Status:** ❌ FAILED" >> "$REPORT_FILE"
fi

cat >> "$REPORT_FILE" << EOF
- **Test File:** test_complete_system.py
- **Details:** Check backend_test_results.json for detailed results

### Frontend UI Tests
EOF

if [ $FRONTEND_TEST_STATUS -eq 0 ]; then
    echo "- **Status:** ✅ PASSED" >> "$REPORT_FILE"
else
    echo "- **Status:** ❌ FAILED" >> "$REPORT_FILE"
fi

cat >> "$REPORT_FILE" << EOF
- **Test File:** test_frontend_ui.js & test_comprehensive_frontend.js
- **Basic Tests:** $(if [ $BASIC_FRONTEND_STATUS -eq 0 ]; then echo "✅ PASSED"; else echo "❌ FAILED"; fi)
- **Comprehensive Tests:** $(if [ $COMPREHENSIVE_FRONTEND_STATUS -eq 0 ]; then echo "✅ PASSED"; else echo "❌ FAILED"; fi)  
- **Details:** Check frontend_test_results.json and comprehensive_frontend_test_results.json for detailed results

## Overall Status
EOF

if [ $BACKEND_TEST_STATUS -eq 0 ] && [ $FRONTEND_TEST_STATUS -eq 0 ]; then
    echo "🎉 **OVERALL: ALL TESTS PASSED**" >> "$REPORT_FILE"
    OVERALL_STATUS="PASSED"
else
    echo "🚨 **OVERALL: SOME TESTS FAILED**" >> "$REPORT_FILE"
    OVERALL_STATUS="FAILED"
fi

cat >> "$REPORT_FILE" << EOF

## Test Artifacts
- Backend Results: backend_test_results.json
- Frontend Basic Results: frontend_test_results.json
- Frontend Comprehensive Results: comprehensive_frontend_test_results.json
- Screenshots: screenshots/ directory (if comprehensive tests ran)
- Logs: Check console output above

## Next Steps
EOF

if [ "$OVERALL_STATUS" = "FAILED" ]; then
    cat >> "$REPORT_FILE" << EOF
1. Review failed tests in the JSON result files
2. Check screenshots for UI issues
3. Verify all services are running correctly
4. Re-run tests after fixes
EOF
else
    cat >> "$REPORT_FILE" << EOF
1. All tests passed - system is functioning correctly
2. Review test coverage and add more tests as needed
3. Consider implementing CI/CD pipeline with these tests
EOF
fi

echo -e "${GREEN}✅ Test report saved to: $REPORT_FILE${NC}"

# Step 8: Cleanup (stop services if we started them)
echo -e "\n${BLUE}🧹 Cleanup...${NC}"

if [ "$BACKEND_STARTED_BY_SCRIPT" = true ] && [ ! -z "$BACKEND_PID" ]; then
    echo "Stopping backend process..."
    kill $BACKEND_PID 2>/dev/null
fi

if [ "$FRONTEND_STARTED_BY_SCRIPT" = true ] && [ ! -z "$FRONTEND_PID" ]; then
    echo "Stopping frontend process..."
    kill $FRONTEND_PID 2>/dev/null
fi

# Final summary
echo -e "\n${BLUE}📋 FINAL SUMMARY${NC}"
echo "=================="

if [ $BACKEND_TEST_STATUS -eq 0 ]; then
    echo -e "Backend Tests: ${GREEN}✅ PASSED${NC}"
else
    echo -e "Backend Tests: ${RED}❌ FAILED${NC}"
fi

if [ $FRONTEND_TEST_STATUS -eq 0 ]; then
    echo -e "Frontend Tests: ${GREEN}✅ PASSED${NC}"
else
    echo -e "Frontend Tests: ${RED}❌ FAILED${NC}"
fi

echo -e "Overall Status: $(if [ "$OVERALL_STATUS" = "PASSED" ]; then echo -e "${GREEN}✅ ALL TESTS PASSED${NC}"; else echo -e "${RED}❌ SOME TESTS FAILED${NC}"; fi)"

echo -e "\n📄 Report saved to: ${YELLOW}$REPORT_FILE${NC}"
echo -e "📊 Detailed results: ${YELLOW}backend_test_results.json, frontend_test_results.json, comprehensive_frontend_test_results.json${NC}"

# Exit with appropriate code
if [ "$OVERALL_STATUS" = "PASSED" ]; then
    exit 0
else
    exit 1
fi
