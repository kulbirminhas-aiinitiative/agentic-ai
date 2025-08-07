# Complete Testing Framework for Agentic AI Platform

This `test/` directory contains a comprehensive testing suite that validates all navigation, buttons, selections, and REST APIs for the Agentic AI platform.

## Testing Components

### 1. Backend API Testing (`test_complete_system.py`)
- **Purpose**: Tests all REST API endpoints
- **Coverage**: 
  - Health checks and system status
  - Agent CRUD operations (Create, Read, Update, Delete)
  - File upload and management
  - RAG query processing
  - Database connectivity
  - Error handling and edge cases

### 2. Frontend UI Testing (`test_frontend_ui.js`)
- **Purpose**: Tests user interface and navigation
- **Coverage**:
  - Page loading and navigation
  - Button clicks and form interactions
  - Responsive design (desktop, tablet, mobile)
  - Accessibility compliance
  - Footer and header components
  - Mobile menu functionality

### 3. Complete Test Suite (`run_complete_tests.sh`)
- **Purpose**: Orchestrates both backend and frontend tests
- **Features**:
  - Automatic service startup (if not running)
  - Dependency checking and installation
  - Combined reporting
  - Cleanup and teardown

### 4. Quick Launcher (`quick_test_launcher.py`)
- **Purpose**: Python-based test launcher with dependency management
- **Features**:
  - Automatic dependency installation
  - Service health checking
  - Simplified execution
  - JSON report generation

## Quick Start

### Option 1: Shell Script (Recommended)
```bash
# Navigate to test directory
cd test

# Make executable (first time only)
chmod +x run_complete_tests.sh

# Run complete test suite
./run_complete_tests.sh
```

### Option 2: Python Launcher
```bash
# Navigate to test directory
cd test

# Run Python launcher
python quick_test_launcher.py
```

### Option 3: Individual Tests

#### Backend Tests Only
```bash
cd test
python test_complete_system.py
```

#### Frontend Tests Only
```bash
cd test
node test_frontend_ui.js
```

## Prerequisites

### System Requirements
- **Python 3.8+** with pip
- **Node.js 16+** with npm
- **Python Virtual Environment**: Uses existing `v-agentic-ai/` environment (preferred) or creates temporary `venv` if needed
- **Running services**:
  - Backend: `http://localhost:8000`
  - Frontend: `http://localhost:3000` (primary) or `http://localhost:3001` (fallback)

### Python Dependencies
**Note**: The test scripts will automatically use the existing `v-agentic-ai` virtual environment if available.

```bash
# If running manually, activate the environment first:
source ../v-agentic-ai/bin/activate
pip install requests beautifulsoup4 fastapi uvicorn
```

### Node.js Dependencies
```bash
npm install puppeteer
```

## Test Coverage

### Backend API Endpoints Tested
- `GET /health` - System health check
- `GET /agents` - List all agents
- `POST /agents` - Create new agent
- `GET /agents/{id}` - Get specific agent
- `PUT /agents/{id}` - Update agent
- `DELETE /agents/{id}` - Delete agent
- `POST /agents/{id}/upload` - Upload files to agent
- `GET /agents/{id}/files` - List agent files
- `POST /agents/{id}/query` - Query agent with RAG
- `GET /system/status` - System status

### Frontend Pages/Components Tested
- **Home Page** (`/`) - Landing page and navigation
- **Dashboard** (`/dashboard`) - Stats and quick actions
- **Agents** (`/agents`) - Agent listing and management
- **Create Agent** (`/create-agent`) - Agent creation form
- **Chat** (`/chat`) - Chat interface
- **Navigation** - Header and mobile menu
- **Footer** - Links and system status
- **Responsive Design** - Desktop, tablet, mobile views
- **Accessibility** - Alt text, headings, focus indicators

### Test Types
- **Functional Testing** - All features work as expected
- **Integration Testing** - Components work together
- **UI/UX Testing** - Interface is user-friendly
- **Responsive Testing** - Works on all device sizes
- **API Testing** - All endpoints respond correctly
- **Error Testing** - Graceful error handling

## Test Output

### Report Files Generated
- `backend_test_results.json` - Detailed backend test results
- `frontend_test_results.json` - Detailed frontend test results
- `complete_test_report_[timestamp].md` - Combined markdown report
- `test_summary_[timestamp].json` - Summary report (from Python launcher)

### Screenshots
- `test/screenshots/` directory contains UI screenshots for debugging
- Generated for responsive design tests and failures

### Console Output
- Real-time test progress with ✅/❌ indicators
- Detailed error messages for failures
- Performance metrics and timing
- Service startup/shutdown logs

## Customization

### Environment Variables
```bash
# Frontend URL (if different from default)
export FRONTEND_URL="http://localhost:3000"

# Backend URL (if different from default)
export BACKEND_URL="http://localhost:8000"

# Test timeout (seconds)
export TEST_TIMEOUT="30"
```

### Configuration Options
- **Headless Mode**: Edit `test_frontend_ui.js` to run browser tests without GUI
- **Test Scope**: Comment out sections in test files to run partial tests
- **Viewport Sizes**: Modify responsive test viewports in frontend tests
- **API Endpoints**: Add/remove endpoints in backend tests

## Troubleshooting

### Common Issues

#### Backend Not Starting
```bash
# Check if backend file exists
ls -la ../rag_backend.py

# Check Python dependencies
pip install -r ../requirements.txt

# Start backend manually from project root
cd .. && python rag_backend.py
```

#### Frontend Not Starting
```bash
# Install dependencies from project root
cd .. && npm install

# Start frontend manually from project root
cd .. && npm run dev
```

#### Tests Failing
1. Check service status: `curl http://localhost:8000/health`
2. Review error logs in test output
3. Check screenshots in `test/screenshots/` directory
4. Verify all dependencies are installed

#### Permission Issues
```bash
# Make scripts executable
chmod +x test/run_complete_tests.sh
chmod +x test/quick_test_launcher.py
```

### Browser Issues (Frontend Tests)
- **Puppeteer Installation**: `npm install puppeteer`
- **Chrome/Chromium**: Puppeteer downloads Chrome automatically
- **Headless Mode**: Set `headless: true` in test file for CI/CD

## CI/CD Integration

### GitHub Actions Example
```yaml
name: Complete Test Suite
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Run Tests
        run: cd test && ./run_complete_tests.sh
```

### Docker Integration
```dockerfile
# Add to your Dockerfile
COPY test/ ./test/
RUN chmod +x test/run_complete_tests.sh
CMD ["test/run_complete_tests.sh"]
```

## Contributing

To add new tests:

1. **Backend Tests**: Add methods to `AgenticAITester` class in `test/test_complete_system.py`
2. **Frontend Tests**: Add methods to `FrontendTester` class in `test/test_frontend_ui.js`
3. **Update Coverage**: Document new test coverage in this README

## Support

For issues with the testing framework:

1. Check the troubleshooting section above
2. Review test output and error messages
3. Ensure all services are running correctly
4. Verify dependencies are properly installed

## Version History

- **v1.0** - Initial comprehensive testing framework
  - Backend API testing with 15+ endpoints
  - Frontend UI testing with responsive design
  - Complete test orchestration and reporting
  - Automatic service management and cleanup
