# Agentic AI - RAG Systems Integration

This document provides comprehensive integration examples and usage instructions for the advanced RAG (Retrieval-Augmented Generation) architectures implemented in the Agentic AI platform.

## 🏗️ Architecture Overview

Our platform implements 5 advanced RAG architectures, each designed for specific use cases:

### 1. **Self-RAG** - Self-Evaluating System
- **Purpose**: Iterative self-improvement with quality assessment
- **Best For**: High-accuracy requirements, self-correcting responses
- **Key Features**: Quality scoring, iterative refinement, confidence tracking

### 2. **Agentic RAG** - Planning-Based System  
- **Purpose**: Multi-step reasoning with tool integration
- **Best For**: Complex queries requiring external data and calculations
- **Key Features**: Planning engine, 5 integrated tools, execution tracking

### 3. **Graph RAG** - Knowledge Graph Enhanced
- **Purpose**: Relationship-aware retrieval using knowledge graphs
- **Best For**: Complex domains with interconnected concepts
- **Key Features**: Entity extraction, graph traversal, relationship modeling

### 4. **HyDE RAG** - Hypothetical Document Embedding
- **Purpose**: Enhanced semantic matching through synthetic documents
- **Best For**: Ambiguous queries, improved retrieval precision
- **Key Features**: Multiple generation styles, ensemble retrieval

### 5. **Corrective RAG (CRAG)** - Error-Detecting System
- **Purpose**: Automated error detection and correction
- **Best For**: High-stakes applications requiring validated responses
- **Key Features**: Error analysis, source validation, correction loops

## 🚀 Quick Start

### Prerequisites
```bash
# Install dependencies
cd backend
npm install

# Set up environment variables
cp .env.example .env
# Configure your OpenAI API key, Pinecone credentials, etc.

# Create data directories
npm run setup-data
```

### Start the Server
```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm start
```

The server will start on `http://localhost:3001`

## 📡 API Endpoints

### Base URL: `http://localhost:3001/api`

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/rag/self-rag` | POST | Self-evaluating RAG queries |
| `/rag/agentic-rag` | POST | Planning-based RAG with tools |
| `/rag/graph-rag` | POST | Knowledge graph-enhanced RAG |
| `/rag/hyde-rag` | POST | Hypothetical document RAG |
| `/rag/corrective-rag` | POST | Error-correcting RAG |
| `/rag/compare` | POST | Compare multiple RAG systems |
| `/rag/upload-documents` | POST | Upload documents for knowledge base |
| `/rag/status` | GET | System status and health check |

## 💡 Usage Examples

### 1. Self-RAG Example

```javascript
const response = await fetch('http://localhost:3001/api/rag/self-rag', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    query: "What are the key differences between supervised and unsupervised machine learning?",
    max_iterations: 3,
    confidence_threshold: 0.8
  })
});

const result = await response.json();
console.log('Self-RAG Response:', result.data.final_response);
console.log('Quality Metrics:', result.data.quality_metrics);
```

**Response Structure:**
```json
{
  "success": true,
  "data": {
    "query": "What are the key differences...",
    "final_response": "Supervised learning uses labeled data...",
    "iteration_history": [...],
    "quality_metrics": {
      "final_confidence_score": 0.92,
      "improvement_achieved": true,
      "converged": true
    }
  },
  "metadata": {
    "rag_type": "Self-RAG",
    "features": ["self-evaluation", "iterative_refinement"]
  }
}
```

### 2. Agentic RAG Example

```javascript
const response = await fetch('http://localhost:3001/api/rag/agentic-rag', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    query: "Calculate the ROI of implementing an AI chatbot for a company with 10,000 monthly inquiries",
    enable_tools: true,
    max_plan_steps: 5
  })
});

const result = await response.json();
console.log('Plan:', result.data.execution_plan);
console.log('Tools Used:', result.data.tools_used);
```

**Available Tools:**
- **knowledge_retrieval**: Search internal knowledge base
- **web_search**: Search external web sources
- **calculate**: Perform mathematical calculations
- **file_operations**: Read/write files for data
- **api_calls**: Make external API requests

### 3. Graph RAG Example

```javascript
const response = await fetch('http://localhost:3001/api/rag/graph-rag', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    query: "Explain the relationships between transformers, attention mechanisms, and BERT in NLP",
    graph_depth: 3,
    entity_threshold: 0.7
  })
});

const result = await response.json();
console.log('Entities Found:', result.data.entities_extracted);
console.log('Graph Metrics:', result.data.graph_metrics);
```

### 4. HyDE RAG Example

```javascript
const response = await fetch('http://localhost:3001/api/rag/hyde-rag', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    query: "Best practices for AI implementation in healthcare",
    generation_style: 'comprehensive',
    num_hypothetical: 4
  })
});

const result = await response.json();
console.log('Hypothetical Documents:', result.data.hypothetical_documents);
```

**Generation Styles:**
- `comprehensive`: Detailed, thorough documents
- `concise`: Brief, focused documents  
- `technical`: Technical specification style
- `conversational`: Natural, conversational tone

### 5. Corrective RAG Example

```javascript
const response = await fetch('http://localhost:3001/api/rag/corrective-rag', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    query: "What are the specific GDPR requirements for AI systems?",
    max_corrections: 3,
    validation_threshold: 0.9
  })
});

const result = await response.json();
console.log('Correction History:', result.data.correction_history);
console.log('Final Validation Score:', result.data.quality_metrics.final_validation_score);
```

### 6. RAG Comparison Example

```javascript
const response = await fetch('http://localhost:3001/api/rag/compare', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    query: "How do neural networks learn from data?",
    rag_types: ['self-rag', 'graph-rag', 'hyde-rag', 'corrective-rag']
  })
});

const result = await response.json();
console.log('Comparison Metrics:', result.comparison_metrics);
console.log('Individual Results:', result.results);
```

### 7. Document Upload Example

```javascript
const formData = new FormData();
formData.append('documents', fileInput.files[0]);

const response = await fetch('http://localhost:3001/api/rag/upload-documents', {
  method: 'POST',
  body: formData
});

const result = await response.json();
console.log('Upload Status:', result.message);
```

## 🧪 Testing Framework

Run comprehensive tests using the provided testing framework:

```bash
# Run all tests
npm test

# Run specific RAG tests
npm run test:self-rag
npm run test:agentic-rag
npm run test:graph-rag
npm run test:hyde-rag
npm run test:corrective-rag

# Test comparison functionality
npm run test:comparison

# Test system status
npm run test:status

# Test document upload
npm run test:upload
```

### Manual Testing with curl

```bash
# Test Self-RAG
curl -X POST http://localhost:3001/api/rag/self-rag \
  -H "Content-Type: application/json" \
  -d '{
    "query": "What is machine learning?",
    "max_iterations": 2
  }'

# Test system status
curl -X GET http://localhost:3001/api/rag/status
```

## 📊 Performance Considerations

### Response Times (Typical)
- **Self-RAG**: 3-8 seconds (depends on iterations)
- **Agentic RAG**: 5-15 seconds (depends on tools used)
- **Graph RAG**: 4-10 seconds (depends on graph complexity)
- **HyDE RAG**: 3-7 seconds (depends on hypothetical documents)
- **Corrective RAG**: 6-20 seconds (depends on corrections needed)

### Optimization Tips
1. **Caching**: Implement response caching for repeated queries
2. **Parallel Processing**: Use comparison endpoint for batch analysis
3. **Context Management**: Limit document size and context length
4. **Rate Limiting**: Configure appropriate rate limits for your use case

## 🔒 Security & Best Practices

### API Security
- **Rate Limiting**: 100 requests per 15 minutes per IP
- **Input Validation**: All inputs are sanitized and validated
- **File Upload Limits**: 10MB max file size, specific file types only
- **CORS Configuration**: Properly configured for your domain

### Data Privacy
- **No Data Persistence**: Queries are not stored permanently
- **Secure Transmission**: All data transmitted over HTTPS in production
- **API Key Management**: Environment-based configuration

### Error Handling
- **Graceful Failures**: All endpoints handle errors gracefully
- **Detailed Logging**: Comprehensive logging for debugging
- **Fallback Responses**: Meaningful error messages for users

## 🌟 Advanced Integration Patterns

### 1. Hybrid RAG Pipeline
```javascript
// Use multiple RAG systems for different query types
async function intelligentRAGRouting(query) {
  const queryType = await classifyQuery(query);
  
  switch(queryType) {
    case 'factual':
      return await callCorrectiveRAG(query);
    case 'analytical':
      return await callAgenticRAG(query);
    case 'relational':
      return await callGraphRAG(query);
    default:
      return await callSelfRAG(query);
  }
}
```

### 2. Response Ensemble
```javascript
// Combine multiple RAG responses for higher confidence
async function ensembleRAG(query) {
  const responses = await Promise.all([
    callSelfRAG(query),
    callGraphRAG(query),
    callHyDERAG(query)
  ]);
  
  return combineResponses(responses);
}
```

### 3. Iterative Refinement
```javascript
// Use one RAG to refine another's response
async function iterativeRAG(query) {
  const initial = await callHyDERAG(query);
  const refined = await callCorrectiveRAG(initial.response);
  const final = await callSelfRAG(refined.response);
  
  return final;
}
```

## 📈 Monitoring & Analytics

### Key Metrics to Track
- **Response Quality**: Confidence scores, validation scores
- **Performance**: Response times, success rates
- **Usage Patterns**: Popular RAG types, query categories
- **Error Rates**: Failed requests, correction frequency

### Health Monitoring
```javascript
// Regular health checks
const healthCheck = await fetch('http://localhost:3001/health');
const status = await healthCheck.json();
console.log('System Health:', status);
```

## 🤝 Contributing

1. **Add New RAG Architecture**: Follow the existing pattern in `rag_*.py`
2. **Extend API**: Add new endpoints in `rag-endpoints.js`
3. **Add Tests**: Include tests in `rag-examples.js`
4. **Update Documentation**: Keep this README current

## 🆘 Troubleshooting

### Common Issues

**1. "Python script not found"**
- Ensure Python RAG scripts are in the correct directory
- Check Python installation and dependencies

**2. "Rate limit exceeded"**
- Implement request throttling in your client
- Consider upgrading rate limits for production

**3. "Large response times"**
- Optimize document chunking and context size
- Consider caching frequently requested queries

**4. "OpenAI API errors"**
- Check API key configuration
- Monitor API usage and rate limits

### Debug Mode
```bash
# Enable detailed logging
DEBUG=* npm run dev
```

## 📞 Support

- **Documentation**: This README and inline code comments
- **Testing**: Comprehensive test suite with examples
- **Issues**: GitHub issues for bug reports and feature requests

---

**Built with ❤️ by the Agentic AI Team**

*Last updated: January 2025*
