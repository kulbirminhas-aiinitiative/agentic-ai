# Enhanced Working RAG Backend - Setup & Usage Guide

## 🚀 Overview

The Enhanced Working RAG Backend provides a robust, production-ready RAG (Retrieval-Augmented Generation) system with agent-specific document isolation and comprehensive error handling.

## ✨ Key Features

- **Dual Mode Operation**: Works with or without RAG components
- **Agent-Specific Isolation**: Each agent has its own document space and vector index
- **Robust Error Handling**: Graceful fallbacks when RAG components fail
- **Comprehensive Monitoring**: Health checks, system status, and detailed logging
- **File Management**: Upload, process, and manage documents per agent
- **API Documentation**: Auto-generated OpenAPI docs at `/docs`

## 📋 Requirements

### Minimum (Fallback Mode)
- Python 3.8+
- FastAPI
- Uvicorn
- python-dotenv

### Full RAG Functionality
- All minimum requirements plus:
- LlamaIndex components
- OpenAI API key
- Pinecone API key and index

## 🔧 Installation

### 1. Basic Setup
```bash
pip install fastapi uvicorn python-dotenv requests
```

### 2. Full RAG Setup (Optional)
```bash
pip install llama-index llama-index-core
pip install llama-index-llms-openai llama-index-embeddings-openai
pip install llama-index-vector-stores-pinecone
pip install pinecone-client openai
```

### 3. Environment Configuration
Create a `.env` file with:
```env
OPENAI_API_KEY=your_openai_api_key_here
PINECONE_API_KEY=your_pinecone_api_key_here
PINECONE_INDEX_NAME=llamaindex-demo
```

## 🚀 Quick Start

### Method 1: Batch Script (Windows)
```cmd
START_ENHANCED_BACKEND.bat
```

### Method 2: Direct Python
```bash
python working_rag_backend.py
```

### Method 3: Testing
```bash
python test_enhanced_rag.py
```

## 📡 API Endpoints

### Core Endpoints
- `GET /` - Root endpoint with system info
- `GET /health` - Comprehensive health check
- `GET /system-status` - Detailed system status

### Agent Operations
- `POST /query/` - Query agent documents
- `GET /agent-files/{agent_id}` - List agent files
- `POST /process-agent-file/` - Process agent files
- `POST /upload-file/{agent_id}` - Upload file for agent
- `DELETE /agent-index/{agent_id}` - Clear agent index cache

## 📝 Usage Examples

### Query Agent Documents
```python
import requests

response = requests.post("http://localhost:8000/query/", json={
    "query": "What information do you have about the project?",
    "agent_id": "6",
    "model": "gpt-4o"
})

print(response.json())
```

### Check System Health
```python
import requests

health = requests.get("http://localhost:8000/health")
print(health.json())
```

### Upload Document
```python
import requests

with open("document.pdf", "rb") as f:
    response = requests.post(
        "http://localhost:8000/upload-file/6",
        files={"file": f}
    )
print(response.json())
```

## 🗂️ File Structure

The system expects files to be organized as:
```
data/
  agents/
    6/
      document1.pdf
      document2.txt
    8/
      document3.pdf
```

## 🔍 Monitoring & Debugging

### Health Check
Visit `http://localhost:8000/health` to see:
- Environment variable status
- RAG system status
- File structure
- Active indexes

### System Status
Visit `http://localhost:8000/system-status` for:
- RAG availability
- Active indexes
- API key configuration
- Model information

### API Documentation
Visit `http://localhost:8000/docs` for interactive API documentation.

## 🛠️ Troubleshooting

### RAG Not Working
1. Check API keys in `.env` file
2. Verify Pinecone index exists
3. Check `/system-status` endpoint
4. Review server logs for errors

### Files Not Found
1. Verify file structure under `data/agents/{agent_id}/`
2. Check `/agent-files/{agent_id}` endpoint
3. Use `/process-agent-file/` to refresh indexes

### Server Won't Start
1. Check if port 8000 is available
2. Verify Python dependencies installed
3. Check for conflicting Python processes

## 🔄 Operation Modes

### 1. Full RAG Mode
- All dependencies installed
- API keys configured
- Vector indexes working
- **Response**: Actual document content analysis

### 2. Fallback Mode
- Missing RAG dependencies or API keys
- Files detected but can't be processed
- **Response**: Helpful fallback messages

### 3. No Documents Mode
- No files uploaded for agent
- **Response**: Instructions to upload documents

## 📈 Performance Tips

1. **Index Caching**: Indexes are cached per agent for performance
2. **Batch Processing**: Clear cache after bulk file uploads
3. **Memory Management**: Large documents may require more RAM
4. **API Limits**: Monitor OpenAI and Pinecone usage

## 🔒 Security Notes

- API keys should be kept secure in `.env` file
- CORS is configured for development (adjust for production)
- File uploads are saved directly (add validation for production)
- No authentication implemented (add for production use)

## 📚 Additional Resources

- FastAPI Documentation: https://fastapi.tiangolo.com/
- LlamaIndex Documentation: https://docs.llamaindex.ai/
- Pinecone Documentation: https://docs.pinecone.io/
- OpenAI API Documentation: https://platform.openai.com/docs/

## 🆘 Support

If you encounter issues:
1. Check the console logs
2. Visit `/health` and `/system-status` endpoints
3. Run `test_enhanced_rag.py` for diagnostics
4. Review this guide for troubleshooting steps
