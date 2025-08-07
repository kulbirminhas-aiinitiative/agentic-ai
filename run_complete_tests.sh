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
NC='\033[0m' # No Color

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to check if a port is in use
check_port() {
    local port=$1
    if lsof -i :$port >/dev/null 2>&1; then
        echo -e "${GREEN}✅ Port $port is in use${NC}"
        return 0
    else
        echo -e "${RED}❌ Port $port is not in use${NC}"
        return 1
    fi
}

# Step 1: Check prerequisites
echo -e "\n${BLUE}📋 Checking Prerequisites...${NC}"

if ! command_exists python3; then
    echo -e "${RED}❌ Python 3 is not installed${NC}"
    exit 1
fi

if ! command_exists node; then
    echo -e "${RED}❌ Node.js is not installed${NC}"
    exit 1
fi

if ! command_exists npm; then
    echo -e "${RED}❌ npm is not installed${NC}"
    exit 1
fi

echo -e "${GREEN}✅ All prerequisites are installed${NC}"

# Step 2: Setup Python environment for backend testing
echo -e "\n${BLUE}🐍 Setting up Python environment...${NC}"

if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv
fi

source venv/bin/activate

# Install Python dependencies
echo "Installing Python dependencies..."
pip install -q requests beautifulsoup4 selenium

echo -e "${GREEN}✅ Python environment ready${NC}"

# Step 3: Check if backend is running
echo -e "\n${BLUE}🔍 Checking Backend Status...${NC}"

if check_port 8000; then
    echo -e "${GREEN}✅ Backend is running on port 8000${NC}"
    BACKEND_RUNNING=true
else
    echo -e "${YELLOW}⚠️  Backend not running. Starting backend...${NC}"
    
    # Try to start the backend
    if [ -f "rag_backend.py" ]; then
        echo "Starting backend in background..."
        python rag_backend.py &
        BACKEND_PID=$!
        sleep 5
        
        if check_port 8000; then
            echo -e "${GREEN}✅ Backend started successfully${NC}"
            BACKEND_RUNNING=true
            BACKEND_STARTED_BY_SCRIPT=true
        else
            echo -e "${RED}❌ Failed to start backend${NC}"
            BACKEND_RUNNING=false
        fi
    else
        echo -e "${RED}❌ Backend file not found${NC}"
        BACKEND_RUNNING=false
    fi
fi

# Step 4: Check if frontend is running
echo -e "\n${BLUE}🔍 Checking Frontend Status...${NC}"

if check_port 3001 || check_port 3000; then
    if check_port 3001; then
        FRONTEND_PORT=3001
    else
        FRONTEND_PORT=3000
    fi
    echo -e "${GREEN}✅ Frontend is running on port $FRONTEND_PORT${NC}"
    FRONTEND_RUNNING=true
else
    echo -e "${YELLOW}⚠️  Frontend not running. Starting frontend...${NC}"
    
    # Install frontend dependencies if needed
    if [ ! -d "node_modules" ]; then
        echo "Installing npm dependencies..."
        npm install
    fi
    
    # Start the frontend in development mode
    echo "Starting frontend in background..."
    npm run dev &
    FRONTEND_PID=$!
    
    # Wait for frontend to start
    echo "Waiting for frontend to start..."
    for i in {1..30}; do
        if check_port 3000 || check_port 3001; then
            if check_port 3001; then
                FRONTEND_PORT=3001
            else
                FRONTEND_PORT=3000
            fi
            echo -e "${GREEN}✅ Frontend started successfully on port $FRONTEND_PORT${NC}"
            FRONTEND_RUNNING=true
            FRONTEND_STARTED_BY_SCRIPT=true
            break
        fi
        sleep 2
    done
    
    if [ "$FRONTEND_RUNNING" != true ]; then
        echo -e "${RED}❌ Failed to start frontend${NC}"
        FRONTEND_RUNNING=false
    fi
fi

# Step 5: Run Backend API Tests
echo -e "\n${BLUE}🧪 Running Backend API Tests...${NC}"

if [ "$BACKEND_RUNNING" = true ]; then
    if [ -f "test_complete_system.py" ]; then
        echo "Running Python backend tests..."
        python test_complete_system.py
        BACKEND_TEST_STATUS=$?
    else
        echo -e "${RED}❌ Backend test file not found${NC}"
        BACKEND_TEST_STATUS=1
    fi
else
    echo -e "${RED}❌ Skipping backend tests (backend not running)${NC}"
    BACKEND_TEST_STATUS=1
fi

# Step 6: Run Frontend UI Tests
echo -e "\n${BLUE}🧪 Running Frontend UI Tests...${NC}"

if [ "$FRONTEND_RUNNING" = true ]; then
    if [ -f "test_frontend_ui.js" ]; then
        echo "Running Node.js frontend tests..."
        FRONTEND_URL="http://localhost:$FRONTEND_PORT" node test_frontend_ui.js
        FRONTEND_TEST_STATUS=$?
    else
        echo -e "${RED}❌ Frontend test file not found${NC}"
        FRONTEND_TEST_STATUS=1
    fi
else
    echo -e "${RED}❌ Skipping frontend tests (frontend not running)${NC}"
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
- **Test File:** test_frontend_ui.js  
- **Details:** Check frontend_test_results.json for detailed results

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
- Frontend Results: frontend_test_results.json
- Screenshots: screenshots/ directory
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
echo -e "📊 Detailed results: ${YELLOW}backend_test_results.json, frontend_test_results.json${NC}"

# Exit with appropriate code
if [ "$OVERALL_STATUS" = "PASSED" ]; then
    exit 0
else
    exit 1
fi
