/**
 * Agentic AI Backend Server
 * Main server file with RAG endpoints integration
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
const path = require('path');
const fs = require('fs').promises;

// Import route modules
const ragEndpoints = require('./rag-endpoints');

const app = express();
const PORT = process.env.PORT || 3001;

// Security middleware
app.use(helmet({
  contentSecurityPolicy: false, // Disable for development
  crossOriginEmbedderPolicy: false
}));

// CORS configuration
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://your-domain.com'] 
    : ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api', limiter);

// Logging
app.use(morgan('combined'));

// Body parsing middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'agentic-ai-backend',
    version: '1.0.0',
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// API Routes
app.use('/api', ragEndpoints);

// Basic API info endpoint
app.get('/api', (req, res) => {
  res.json({
    name: 'Agentic AI API',
    version: '1.0.0',
    description: 'Advanced RAG architectures and AI agent management',
    timestamp: new Date().toISOString(),
    endpoints: {
      health: '/health',
      rag: {
        'self-rag': '/api/rag/self-rag',
        'agentic-rag': '/api/rag/agentic-rag',
        'graph-rag': '/api/rag/graph-rag',
        'hyde-rag': '/api/rag/hyde-rag',
        'corrective-rag': '/api/rag/corrective-rag',
        'compare': '/api/rag/compare',
        'upload': '/api/rag/upload-documents',
        'status': '/api/rag/status'
      }
    },
    documentation: {
      examples: 'See rag-examples.js for usage examples',
      postman: 'Import the provided Postman collection for testing'
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  
  // Don't leak error details in production
  const isDevelopment = process.env.NODE_ENV !== 'production';
  
  res.status(err.status || 500).json({
    error: 'Internal server error',
    message: isDevelopment ? err.message : 'Something went wrong',
    timestamp: new Date().toISOString(),
    path: req.path,
    method: req.method,
    ...(isDevelopment && { stack: err.stack })
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `The requested endpoint ${req.method} ${req.originalUrl} was not found.`,
    timestamp: new Date().toISOString(),
    availableEndpoints: [
      'GET /health',
      'GET /api',
      'POST /api/rag/self-rag',
      'POST /api/rag/agentic-rag',
      'POST /api/rag/graph-rag',
      'POST /api/rag/hyde-rag',
      'POST /api/rag/corrective-rag',
      'POST /api/rag/compare',
      'POST /api/rag/upload-documents',
      'GET /api/rag/status'
    ]
  });
});

// Graceful shutdown handling
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
    process.exit(0);
  });
});

// Start server
const server = app.listen(PORT, () => {
  console.log('🚀 Agentic AI Backend Server Started');
  console.log('=' .repeat(50));
  console.log(`📡 Server running on: http://localhost:${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🤖 API info: http://localhost:${PORT}/api`);
  console.log('📋 Available RAG Endpoints:');
  console.log('   • POST /api/rag/self-rag');
  console.log('   • POST /api/rag/agentic-rag');
  console.log('   • POST /api/rag/graph-rag');
  console.log('   • POST /api/rag/hyde-rag');
  console.log('   • POST /api/rag/corrective-rag');
  console.log('   • POST /api/rag/compare');
  console.log('   • POST /api/rag/upload-documents');
  console.log('   • GET /api/rag/status');
  console.log('=' .repeat(50));
});

module.exports = app;
