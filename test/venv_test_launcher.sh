#!/bin/bash

# Virtual Environment Test Launcher
# Ensures all tests run with proper virtual environment activation

echo "🔧 Virtual Environment Test Launcher"
echo "===================================="

# Set project root
PROJECT_ROOT="/Users/kulbirminhas/Documents/Repo/projects/agentic-ai"
TEST_DIR="$PROJECT_ROOT/test"
VENV_PATH="$PROJECT_ROOT/v-agentic-ai"

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log() {
    echo -e "${BLUE}[$(date '+%H:%M:%S')] $1${NC}"
}

success() {
    echo -e "${GREEN}[$(date '+%H:%M:%S')] ✅ $1${NC}"
}

error() {
    echo -e "${RED}[$(date '+%H:%M:%S')] ❌ $1${NC}"
}

warning() {
    echo -e "${YELLOW}[$(date '+%H:%M:%S')] ⚠️ $1${NC}"
}

# Check if virtual environment exists
if [ ! -d "$VENV_PATH" ]; then
    error "Virtual environment not found at: $VENV_PATH"
    error "Please create the virtual environment first"
    exit 1
fi

success "Virtual environment found: $VENV_PATH"

# Change to project root
cd "$PROJECT_ROOT"
log "Changed to project root: $(pwd)"

# Activate virtual environment
log "Activating virtual environment..."
source "$VENV_PATH/bin/activate"

# Verify activation
if [ "$VIRTUAL_ENV" = "$VENV_PATH" ]; then
    success "Virtual environment activated: $VIRTUAL_ENV"
else
    error "Failed to activate virtual environment"
    exit 1
fi

# Show Python and pip versions
log "Python version: $(python --version)"
log "Pip version: $(pip --version)"
log "Virtual env Python: $(which python)"

# Install required dependencies
log "Installing/updating Python dependencies..."
pip install -q requests beautifulsoup4 selenium >/dev/null 2>&1
if [ $? -eq 0 ]; then
    success "Python dependencies ready"
else
    warning "Some Python dependencies may have failed to install"
fi

# Check Node.js dependencies
log "Checking Node.js dependencies..."
if ! npm list puppeteer >/dev/null 2>&1; then
    log "Installing puppeteer..."
    npm install puppeteer >/dev/null 2>&1
    if [ $? -eq 0 ]; then
        success "Puppeteer installed"
    else
        warning "Puppeteer installation failed"
    fi
else
    success "Puppeteer already available"
fi

# Change to test directory
cd "$TEST_DIR"
log "Changed to test directory: $(pwd)"

# Run tests based on argument
case "$1" in
    "backend")
        log "Running backend-only tests..."
        python backend_only_test.py
        ;;
    "frontend")
        log "Running frontend-only tests..."
        FRONTEND_URL="http://localhost:3000" node test_frontend_ui.js
        ;;
    "comprehensive")
        log "Running comprehensive frontend tests..."
        FRONTEND_URL="http://localhost:3000" node test_comprehensive_frontend.js
        ;;
    "complete")
        log "Running complete system tests..."
        python test_complete_system.py
        ;;
    "full")
        log "Running full test suite..."
        ./run_complete_tests.sh
        ;;
    "diagnostic")
        log "Running diagnostic tests..."
        python diagnostic_test.py
        ;;
    *)
        echo "Usage: $0 {backend|frontend|comprehensive|complete|full|diagnostic}"
        echo ""
        echo "Test Options:"
        echo "  backend      - Run backend API tests only"
        echo "  frontend     - Run basic frontend tests only"
        echo "  comprehensive- Run comprehensive frontend tests (all navigation, buttons, APIs)"
        echo "  complete     - Run complete system tests (backend + basic frontend)"
        echo "  full         - Run full test suite (all tests via shell script)"
        echo "  diagnostic   - Run diagnostic tests for debugging"
        echo ""
        echo "Examples:"
        echo "  $0 backend     # Quick backend validation"
        echo "  $0 comprehensive # Test all frontend components"
        echo "  $0 full        # Complete test suite"
        exit 1
        ;;
esac

exit_code=$?

if [ $exit_code -eq 0 ]; then
    success "Tests completed successfully!"
else
    error "Tests failed with exit code: $exit_code"
fi

# Deactivate virtual environment
deactivate

exit $exit_code
