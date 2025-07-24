@echo off
REM Agentic AI RAG Systems Setup Script for Windows
REM This script sets up the complete RAG integration environment

echo 🚀 Setting up Agentic AI RAG Systems Integration
echo ==================================================

REM Check if we're in the right directory
if not exist "package.json" (
    echo ❌ Error: package.json not found. Please run this script from the project root.
    pause
    exit /b 1
)

echo ℹ️  Checking Node.js version...
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js is not installed. Please install Node.js 16 or higher.
    pause
    exit /b 1
) else (
    echo ✅ Node.js is installed
)

echo ℹ️  Checking Python version...
python --version >nul 2>&1
if errorlevel 1 (
    python3 --version >nul 2>&1
    if errorlevel 1 (
        echo ❌ Python is not installed. Please install Python 3.8 or higher.
        pause
        exit /b 1
    ) else (
        echo ✅ Python is installed
    )
) else (
    echo ✅ Python is installed
)

echo ℹ️  Installing frontend dependencies...
call npm install
if errorlevel 1 (
    echo ❌ Failed to install frontend dependencies
    pause
    exit /b 1
) else (
    echo ✅ Frontend dependencies installed
)

echo ℹ️  Installing backend dependencies...
cd backend
call npm install
if errorlevel 1 (
    echo ❌ Failed to install backend dependencies
    pause
    exit /b 1
) else (
    echo ✅ Backend dependencies installed
)
cd ..

echo ℹ️  Installing Python dependencies for RAG systems...
pip install openai>=1.0.0 llama-index>=0.9.0 pinecone-client>=2.2.4 python-dotenv>=1.0.0 networkx>=3.0 sentence-transformers>=2.2.0 numpy>=1.24.0 pandas>=2.0.0 scikit-learn>=1.3.0 requests>=2.31.0 beautifulsoup4>=4.12.0 aiohttp>=3.8.0
echo ✅ Python dependencies installed

echo ℹ️  Creating necessary directories...
if not exist "backend\data\uploads" mkdir backend\data\uploads
if not exist "backend\logs" mkdir backend\logs
if not exist "data" mkdir data
if not exist "data\documents" mkdir data\documents
echo ✅ Directories created

echo ℹ️  Creating environment configuration...
if not exist "backend\.env" (
    (
        echo # OpenAI Configuration
        echo OPENAI_API_KEY=your_openai_api_key_here
        echo.
        echo # Pinecone Configuration
        echo PINECONE_API_KEY=your_pinecone_api_key_here
        echo PINECONE_ENVIRONMENT=us-east-1
        echo PINECONE_INDEX_NAME=rag-index
        echo.
        echo # Server Configuration
        echo PORT=3001
        echo NODE_ENV=development
        echo.
        echo # Rate Limiting
        echo RATE_LIMIT_WINDOW_MS=900000
        echo RATE_LIMIT_MAX_REQUESTS=100
        echo.
        echo # CORS Configuration
        echo ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001
        echo.
        echo # Logging
        echo LOG_LEVEL=info
        echo LOG_FILE=logs/app.log
    ) > backend\.env
    echo ✅ Environment template created at backend\.env
    echo ⚠️  Please update backend\.env with your actual API keys
) else (
    echo ℹ️  Environment file already exists
)

echo ℹ️  Creating sample documents for RAG testing...
(
    echo # Machine Learning Fundamentals
    echo.
    echo ## Introduction
    echo Machine learning is a subset of artificial intelligence ^(AI^) that focuses on the development of algorithms and statistical models that enable computer systems to improve their performance on a specific task through experience.
    echo.
    echo ## Types of Machine Learning
    echo.
    echo ### Supervised Learning
    echo Supervised learning uses labeled training data to learn a mapping function from inputs to outputs. Common algorithms include:
    echo - Linear Regression
    echo - Decision Trees
    echo - Random Forest
    echo - Support Vector Machines
    echo - Neural Networks
    echo.
    echo ### Unsupervised Learning
    echo Unsupervised learning finds hidden patterns in data without labeled examples. Types include:
    echo - Clustering ^(K-means, Hierarchical^)
    echo - Dimensionality Reduction ^(PCA, t-SNE^)
    echo - Association Rules
    echo - Anomaly Detection
    echo.
    echo ### Reinforcement Learning
    echo Reinforcement learning learns through interaction with an environment, receiving rewards or penalties for actions taken.
) > data\sample_ml_document.txt

(
    echo # Artificial Intelligence and Deep Learning
    echo.
    echo ## Neural Networks
    echo Neural networks are computing systems inspired by biological neural networks. They consist of layers of interconnected nodes ^(neurons^) that process information.
    echo.
    echo ### Architecture Components
    echo - Input Layer: Receives input data
    echo - Hidden Layers: Process information through weighted connections
    echo - Output Layer: Produces final predictions
    echo - Activation Functions: Add non-linearity ^(ReLU, Sigmoid, Tanh^)
    echo.
    echo ### Deep Learning
    echo Deep learning uses neural networks with multiple hidden layers to learn complex patterns in data.
    echo.
    echo ## Transformer Architecture
    echo Transformers have revolutionized natural language processing and are the foundation of large language models.
    echo.
    echo ### Key Components
    echo - Self-Attention Mechanism: Allows the model to focus on relevant parts of the input
    echo - Multi-Head Attention: Multiple attention mechanisms running in parallel
    echo - Positional Encoding: Provides information about token positions
    echo - Feed-Forward Networks: Process attention outputs
) > data\sample_ai_document.txt

echo ✅ Sample documents created in data\ directory

echo ℹ️  Creating startup scripts...
(
    echo @echo off
    echo echo 🚀 Starting Agentic AI Backend Server...
    echo cd backend
    echo npm run dev
) > start-backend.bat

(
    echo @echo off
    echo echo 🌐 Starting Agentic AI Frontend...
    echo npm run dev
) > start-frontend.bat

(
    echo @echo off
    echo echo 🧪 Testing RAG Systems...
    echo cd backend
    echo npm test
) > test-rag-systems.bat

echo ✅ Startup scripts created

echo.
echo 🎉 Setup Complete!
echo ===================
echo ✅ Agentic AI RAG Systems Integration is ready!
echo.
echo 📋 Next Steps:
echo 1. Update backend\.env with your API keys ^(OpenAI, Pinecone^)
echo 2. Start the backend server: start-backend.bat
echo 3. Start the frontend server: start-frontend.bat
echo 4. Test RAG systems: test-rag-systems.bat
echo.
echo 🔗 Useful URLs:
echo    Frontend: http://localhost:3000
echo    Backend API: http://localhost:3001/api
echo    Health Check: http://localhost:3001/health
echo    API Status: http://localhost:3001/api/rag/status
echo.
echo 📚 Documentation:
echo    Backend README: backend\README.md
echo    Usage Examples: backend\rag-examples.js
echo    RAG Architectures: backend\rag_*.py
echo.
echo 🧪 Testing:
echo    Run all tests: cd backend ^&^& npm test
echo    Test specific RAG: cd backend ^&^& npm run test:self-rag
echo.
echo ⚠️  Remember to configure your API keys in backend\.env before starting!
echo ==================================================
pause
