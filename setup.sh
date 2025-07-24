#!/bin/bash

# Agentic AI RAG Systems Setup Script
# This script sets up the complete RAG integration environment

echo "🚀 Setting up Agentic AI RAG Systems Integration"
echo "=================================================="

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run this script from the project root."
    exit 1
fi

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Step 1: Check Node.js version
log_info "Checking Node.js version..."
NODE_VERSION=$(node --version 2>/dev/null || echo "not found")
if [[ $NODE_VERSION == "not found" ]]; then
    log_error "Node.js is not installed. Please install Node.js 16 or higher."
    exit 1
elif [[ $NODE_VERSION < "v16" ]]; then
    log_warning "Node.js version $NODE_VERSION is below recommended v16+. Consider upgrading."
else
    log_success "Node.js $NODE_VERSION is installed"
fi

# Step 2: Check Python version
log_info "Checking Python version..."
PYTHON_VERSION=$(python --version 2>/dev/null || python3 --version 2>/dev/null || echo "not found")
if [[ $PYTHON_VERSION == "not found" ]]; then
    log_error "Python is not installed. Please install Python 3.8 or higher."
    exit 1
else
    log_success "Python is installed: $PYTHON_VERSION"
fi

# Step 3: Install frontend dependencies
log_info "Installing frontend dependencies..."
if npm install; then
    log_success "Frontend dependencies installed"
else
    log_error "Failed to install frontend dependencies"
    exit 1
fi

# Step 4: Install backend dependencies
log_info "Installing backend dependencies..."
cd backend
if npm install; then
    log_success "Backend dependencies installed"
else
    log_error "Failed to install backend dependencies"
    exit 1
fi
cd ..

# Step 5: Install Python dependencies for RAG systems
log_info "Installing Python dependencies for RAG systems..."
PYTHON_DEPS=(
    "openai>=1.0.0"
    "llama-index>=0.9.0"
    "pinecone-client>=2.2.4"
    "python-dotenv>=1.0.0"
    "networkx>=3.0"
    "sentence-transformers>=2.2.0"
    "numpy>=1.24.0"
    "pandas>=2.0.0"
    "scikit-learn>=1.3.0"
    "requests>=2.31.0"
    "beautifulsoup4>=4.12.0"
    "aiohttp>=3.8.0"
)

for dep in "${PYTHON_DEPS[@]}"; do
    log_info "Installing $dep..."
    if python -m pip install "$dep" > /dev/null 2>&1 || python3 -m pip install "$dep" > /dev/null 2>&1; then
        log_success "Installed $dep"
    else
        log_warning "Failed to install $dep - please install manually"
    fi
done

# Step 6: Create necessary directories
log_info "Creating necessary directories..."
mkdir -p backend/data/uploads
mkdir -p backend/logs
mkdir -p data
mkdir -p data/documents
log_success "Directories created"

# Step 7: Create environment file template
log_info "Creating environment configuration..."
if [ ! -f "backend/.env" ]; then
    cat > backend/.env << EOL
# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key_here

# Pinecone Configuration
PINECONE_API_KEY=your_pinecone_api_key_here
PINECONE_ENVIRONMENT=us-east-1
PINECONE_INDEX_NAME=rag-index

# Server Configuration
PORT=3001
NODE_ENV=development

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# CORS Configuration
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001

# Logging
LOG_LEVEL=info
LOG_FILE=logs/app.log
EOL
    log_success "Environment template created at backend/.env"
    log_warning "Please update backend/.env with your actual API keys"
else
    log_info "Environment file already exists"
fi

# Step 8: Create sample documents for testing
log_info "Creating sample documents for RAG testing..."
cat > data/sample_ml_document.txt << EOL
# Machine Learning Fundamentals

## Introduction
Machine learning is a subset of artificial intelligence (AI) that focuses on the development of algorithms and statistical models that enable computer systems to improve their performance on a specific task through experience.

## Types of Machine Learning

### Supervised Learning
Supervised learning uses labeled training data to learn a mapping function from inputs to outputs. Common algorithms include:
- Linear Regression
- Decision Trees
- Random Forest
- Support Vector Machines
- Neural Networks

### Unsupervised Learning
Unsupervised learning finds hidden patterns in data without labeled examples. Types include:
- Clustering (K-means, Hierarchical)
- Dimensionality Reduction (PCA, t-SNE)
- Association Rules
- Anomaly Detection

### Reinforcement Learning
Reinforcement learning learns through interaction with an environment, receiving rewards or penalties for actions taken.

## Key Concepts

### Training and Testing
- Training Set: Data used to train the model
- Validation Set: Data used to tune hyperparameters
- Test Set: Data used to evaluate final model performance

### Overfitting and Underfitting
- Overfitting: Model memorizes training data but performs poorly on new data
- Underfitting: Model is too simple to capture underlying patterns
- Regularization techniques help prevent overfitting

### Cross-Validation
A technique to assess model performance by dividing data into multiple folds and training/testing on different combinations.

## Evaluation Metrics

### Classification Metrics
- Accuracy: Percentage of correct predictions
- Precision: True positives / (True positives + False positives)
- Recall: True positives / (True positives + False negatives)
- F1-Score: Harmonic mean of precision and recall

### Regression Metrics
- Mean Squared Error (MSE)
- Root Mean Squared Error (RMSE)
- Mean Absolute Error (MAE)
- R-squared (Coefficient of Determination)

## Applications
Machine learning is used in various domains including:
- Computer Vision (image recognition, object detection)
- Natural Language Processing (translation, sentiment analysis)
- Recommendation Systems (Netflix, Amazon)
- Healthcare (diagnosis, drug discovery)
- Finance (fraud detection, algorithmic trading)
- Autonomous Vehicles (self-driving cars)
EOL

cat > data/sample_ai_document.txt << EOL
# Artificial Intelligence and Deep Learning

## Neural Networks
Neural networks are computing systems inspired by biological neural networks. They consist of layers of interconnected nodes (neurons) that process information.

### Architecture Components
- Input Layer: Receives input data
- Hidden Layers: Process information through weighted connections
- Output Layer: Produces final predictions
- Activation Functions: Add non-linearity (ReLU, Sigmoid, Tanh)

### Deep Learning
Deep learning uses neural networks with multiple hidden layers to learn complex patterns in data.

## Transformer Architecture
Transformers have revolutionized natural language processing and are the foundation of large language models.

### Key Components
- Self-Attention Mechanism: Allows the model to focus on relevant parts of the input
- Multi-Head Attention: Multiple attention mechanisms running in parallel
- Positional Encoding: Provides information about token positions
- Feed-Forward Networks: Process attention outputs

### Popular Models
- BERT: Bidirectional Encoder Representations from Transformers
- GPT: Generative Pre-trained Transformer
- T5: Text-to-Text Transfer Transformer
- RoBERTa: Robustly Optimized BERT Pretraining Approach

## Vector Databases
Vector databases are specialized databases designed to store and query high-dimensional vectors efficiently.

### Use Cases
- Semantic Search: Find similar documents or text
- Recommendation Systems: Find similar items or users
- Image Search: Find visually similar images
- Anomaly Detection: Identify outliers in vector space

### Popular Vector Databases
- Pinecone: Managed vector database service
- Weaviate: Open-source vector database
- Chroma: Open-source embedding database
- Qdrant: Vector similarity search engine

## Retrieval-Augmented Generation (RAG)
RAG combines retrieval systems with generative models to provide factual and up-to-date responses.

### RAG Process
1. Query Processing: Convert user query to embeddings
2. Retrieval: Find relevant documents using vector similarity
3. Context Assembly: Combine retrieved documents with query
4. Generation: Use language model to generate response
5. Post-processing: Format and validate output

### Benefits
- Reduces hallucinations in language models
- Provides access to up-to-date information
- Allows citation of sources
- Enables domain-specific knowledge integration
EOL

log_success "Sample documents created in data/ directory"

# Step 9: Create startup scripts
log_info "Creating startup scripts..."

cat > start-backend.sh << 'EOL'
#!/bin/bash
echo "🚀 Starting Agentic AI Backend Server..."
cd backend
npm run dev
EOL

cat > start-frontend.sh << 'EOL'
#!/bin/bash
echo "🌐 Starting Agentic AI Frontend..."
npm run dev
EOL

cat > test-rag-systems.sh << 'EOL'
#!/bin/bash
echo "🧪 Testing RAG Systems..."
cd backend
npm test
EOL

chmod +x start-backend.sh start-frontend.sh test-rag-systems.sh
log_success "Startup scripts created and made executable"

# Step 10: Create development commands in package.json
log_info "Adding development commands to package.json..."
if command -v jq >/dev/null 2>&1; then
    # Use jq if available for proper JSON manipulation
    jq '.scripts += {
        "backend": "cd backend && npm run dev",
        "test:rag": "cd backend && npm test",
        "setup:data": "cd backend && npm run setup-data",
        "start:all": "concurrently \"npm run backend\" \"npm run dev\""
    }' package.json > package.json.tmp && mv package.json.tmp package.json
    log_success "Development commands added to package.json"
else
    log_warning "jq not found - please manually add development scripts to package.json"
fi

# Step 11: Final verification
log_info "Running final verification..."

# Check if backend dependencies are properly installed
if [ -f "backend/node_modules/.bin/nodemon" ]; then
    log_success "Backend dependencies verification passed"
else
    log_error "Backend dependencies may not be properly installed"
fi

# Check if Python can import required modules
PYTHON_CMD="python"
if ! command -v python >/dev/null 2>&1; then
    PYTHON_CMD="python3"
fi

$PYTHON_CMD -c "import openai, llama_index, pinecone" 2>/dev/null
if [ $? -eq 0 ]; then
    log_success "Python dependencies verification passed"
else
    log_warning "Some Python dependencies may not be properly installed"
fi

echo ""
echo "🎉 Setup Complete!"
echo "==================="
log_success "Agentic AI RAG Systems Integration is ready!"
echo ""
echo "📋 Next Steps:"
echo "1. Update backend/.env with your API keys (OpenAI, Pinecone)"
echo "2. Start the backend server: ./start-backend.sh"
echo "3. Start the frontend server: ./start-frontend.sh"
echo "4. Test RAG systems: ./test-rag-systems.sh"
echo ""
echo "🔗 Useful URLs:"
echo "   Frontend: http://localhost:3000"
echo "   Backend API: http://localhost:3001/api"
echo "   Health Check: http://localhost:3001/health"
echo "   API Status: http://localhost:3001/api/rag/status"
echo ""
echo "📚 Documentation:"
echo "   Backend README: backend/README.md"
echo "   Usage Examples: backend/rag-examples.js"
echo "   RAG Architectures: backend/rag_*.py"
echo ""
echo "🧪 Testing:"
echo "   Run all tests: npm run test:rag"
echo "   Test specific RAG: cd backend && npm run test:self-rag"
echo ""
log_warning "Remember to configure your API keys in backend/.env before starting!"
echo "=================================================="
