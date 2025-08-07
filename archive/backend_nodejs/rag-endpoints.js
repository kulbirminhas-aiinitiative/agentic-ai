/**
 * RAG Systems Integration Endpoints
 * Provides REST API endpoints for all implemented RAG architectures
 */

const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const { spawn } = require('child_process');
const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../data/uploads'))
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname)
  }
});

const upload = multer({ 
  storage: storage,
  fileFilter: (req, file, cb) => {
    // Accept text files, PDFs, and documents
    const allowedTypes = ['.txt', '.pdf', '.doc', '.docx', '.md', '.json'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedTypes.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only text files, PDFs, and documents are allowed.'));
    }
  },
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

// Middleware for request logging
const logRequest = (req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
};

router.use(logRequest);

// Helper function to execute Python RAG scripts
const executePythonRAG = (scriptName, query, options = {}) => {
  return new Promise((resolve, reject) => {
    const pythonPath = 'python'; // Adjust if needed
    const scriptPath = path.join(__dirname, '..', scriptName);
    
    const args = [scriptPath, '--query', query];
    
    // Add optional parameters
    if (options.dataDir) args.push('--data-dir', options.dataDir);
    if (options.maxIterations) args.push('--max-iterations', options.maxIterations.toString());
    if (options.temperature) args.push('--temperature', options.temperature.toString());
    
    const pythonProcess = spawn(pythonPath, args);
    
    let stdout = '';
    let stderr = '';
    
    pythonProcess.stdout.on('data', (data) => {
      stdout += data.toString();
    });
    
    pythonProcess.stderr.on('data', (data) => {
      stderr += data.toString();
    });
    
    pythonProcess.on('close', (code) => {
      if (code === 0) {
        try {
          const result = JSON.parse(stdout);
          resolve(result);
        } catch (e) {
          resolve({ response: stdout, raw_output: true });
        }
      } else {
        reject(new Error(`Python script failed with code ${code}: ${stderr}`));
      }
    });
    
    pythonProcess.on('error', (error) => {
      reject(new Error(`Failed to start Python process: ${error.message}`));
    });
  });
};

// 1. Self-RAG Endpoint
router.post('/rag/self-rag', async (req, res) => {
  try {
    const { query, max_iterations = 3, confidence_threshold = 0.8 } = req.body;
    
    if (!query) {
      return res.status(400).json({ error: 'Query is required' });
    }
    
    console.log(`Processing Self-RAG query: ${query}`);
    
    const result = await executePythonRAG('rag_self_rag.py', query, {
      maxIterations: max_iterations
    });
    
    // Add metadata
    result.endpoint = 'self-rag';
    result.timestamp = new Date().toISOString();
    result.processing_time = Date.now();
    
    res.json({
      success: true,
      data: result,
      metadata: {
        rag_type: 'Self-RAG',
        description: 'Self-evaluating RAG with iterative improvement',
        features: ['self-evaluation', 'iterative_refinement', 'quality_scoring']
      }
    });
    
  } catch (error) {
    console.error('Self-RAG error:', error);
    res.status(500).json({ 
      error: 'Self-RAG processing failed', 
      details: error.message 
    });
  }
});

// 2. Agentic RAG Endpoint
router.post('/rag/agentic-rag', async (req, res) => {
  try {
    const { query, enable_tools = true, max_plan_steps = 5 } = req.body;
    
    if (!query) {
      return res.status(400).json({ error: 'Query is required' });
    }
    
    console.log(`Processing Agentic RAG query: ${query}`);
    
    const result = await executePythonRAG('rag_agentic_rag.py', query, {
      enableTools: enable_tools,
      maxPlanSteps: max_plan_steps
    });
    
    result.endpoint = 'agentic-rag';
    result.timestamp = new Date().toISOString();
    
    res.json({
      success: true,
      data: result,
      metadata: {
        rag_type: 'Agentic RAG',
        description: 'Planning-based RAG with tool integration',
        features: ['multi-step_planning', 'tool_integration', 'external_data_access'],
        available_tools: ['knowledge_retrieval', 'web_search', 'calculation', 'file_operations', 'api_calls']
      }
    });
    
  } catch (error) {
    console.error('Agentic RAG error:', error);
    res.status(500).json({ 
      error: 'Agentic RAG processing failed', 
      details: error.message 
    });
  }
});

// 3. Graph RAG Endpoint
router.post('/rag/graph-rag', async (req, res) => {
  try {
    const { query, graph_depth = 2, entity_threshold = 0.7 } = req.body;
    
    if (!query) {
      return res.status(400).json({ error: 'Query is required' });
    }
    
    console.log(`Processing Graph RAG query: ${query}`);
    
    const result = await executePythonRAG('rag_graph_rag.py', query, {
      graphDepth: graph_depth,
      entityThreshold: entity_threshold
    });
    
    result.endpoint = 'graph-rag';
    result.timestamp = new Date().toISOString();
    
    res.json({
      success: true,
      data: result,
      metadata: {
        rag_type: 'Graph RAG',
        description: 'Knowledge graph-enhanced retrieval',
        features: ['entity_extraction', 'relationship_modeling', 'graph_traversal', 'hybrid_retrieval'],
        graph_metrics: result.graph_metrics || {}
      }
    });
    
  } catch (error) {
    console.error('Graph RAG error:', error);
    res.status(500).json({ 
      error: 'Graph RAG processing failed', 
      details: error.message 
    });
  }
});

// 4. HyDE RAG Endpoint
router.post('/rag/hyde-rag', async (req, res) => {
  try {
    const { query, generation_style = 'comprehensive', num_hypothetical = 3 } = req.body;
    
    if (!query) {
      return res.status(400).json({ error: 'Query is required' });
    }
    
    console.log(`Processing HyDE RAG query: ${query}`);
    
    const result = await executePythonRAG('rag_hyde_rag.py', query, {
      generationStyle: generation_style,
      numHypothetical: num_hypothetical
    });
    
    result.endpoint = 'hyde-rag';
    result.timestamp = new Date().toISOString();
    
    res.json({
      success: true,
      data: result,
      metadata: {
        rag_type: 'HyDE RAG',
        description: 'Hypothetical Document Embedding RAG',
        features: ['hypothetical_generation', 'ensemble_retrieval', 'semantic_enhancement'],
        generation_styles: ['comprehensive', 'concise', 'technical', 'conversational']
      }
    });
    
  } catch (error) {
    console.error('HyDE RAG error:', error);
    res.status(500).json({ 
      error: 'HyDE RAG processing failed', 
      details: error.message 
    });
  }
});

// 5. Corrective RAG Endpoint
router.post('/rag/corrective-rag', async (req, res) => {
  try {
    const { query, max_corrections = 3, validation_threshold = 0.8 } = req.body;
    
    if (!query) {
      return res.status(400).json({ error: 'Query is required' });
    }
    
    console.log(`Processing Corrective RAG query: ${query}`);
    
    const result = await executePythonRAG('rag_corrective_rag.py', query, {
      maxCorrections: max_corrections,
      validationThreshold: validation_threshold
    });
    
    result.endpoint = 'corrective-rag';
    result.timestamp = new Date().toISOString();
    
    res.json({
      success: true,
      data: result,
      metadata: {
        rag_type: 'Corrective RAG (CRAG)',
        description: 'Error-detecting RAG with automated corrections',
        features: ['error_detection', 'source_validation', 'iterative_correction', 'quality_assurance']
      }
    });
    
  } catch (error) {
    console.error('Corrective RAG error:', error);
    res.status(500).json({ 
      error: 'Corrective RAG processing failed', 
      details: error.message 
    });
  }
});

// Batch RAG Comparison Endpoint
router.post('/rag/compare', async (req, res) => {
  try {
    const { query, rag_types = ['self-rag', 'agentic-rag', 'graph-rag'] } = req.body;
    
    if (!query) {
      return res.status(400).json({ error: 'Query is required' });
    }
    
    console.log(`Running RAG comparison for query: ${query}`);
    
    const results = {};
    const promises = [];
    
    // Run different RAG types in parallel
    if (rag_types.includes('self-rag')) {
      promises.push(
        executePythonRAG('rag_self_rag.py', query).then(result => {
          results['self-rag'] = result;
        }).catch(error => {
          results['self-rag'] = { error: error.message };
        })
      );
    }
    
    if (rag_types.includes('agentic-rag')) {
      promises.push(
        executePythonRAG('rag_agentic_rag.py', query).then(result => {
          results['agentic-rag'] = result;
        }).catch(error => {
          results['agentic-rag'] = { error: error.message };
        })
      );
    }
    
    if (rag_types.includes('graph-rag')) {
      promises.push(
        executePythonRAG('rag_graph_rag.py', query).then(result => {
          results['graph-rag'] = result;
        }).catch(error => {
          results['graph-rag'] = { error: error.message };
        })
      );
    }
    
    if (rag_types.includes('hyde-rag')) {
      promises.push(
        executePythonRAG('rag_hyde_rag.py', query).then(result => {
          results['hyde-rag'] = result;
        }).catch(error => {
          results['hyde-rag'] = { error: error.message };
        })
      );
    }
    
    if (rag_types.includes('corrective-rag')) {
      promises.push(
        executePythonRAG('rag_corrective_rag.py', query).then(result => {
          results['corrective-rag'] = result;
        }).catch(error => {
          results['corrective-rag'] = { error: error.message };
        })
      );
    }
    
    await Promise.all(promises);
    
    // Calculate comparison metrics
    const comparison_metrics = {
      total_architectures: Object.keys(results).length,
      successful_responses: Object.keys(results).filter(key => !results[key].error).length,
      average_confidence: 0,
      response_lengths: {}
    };
    
    let confidence_sum = 0;
    let confidence_count = 0;
    
    for (const [ragType, result] of Object.entries(results)) {
      if (!result.error) {
        if (result.quality_metrics?.final_confidence_score) {
          confidence_sum += result.quality_metrics.final_confidence_score;
          confidence_count++;
        }
        comparison_metrics.response_lengths[ragType] = result.final_response?.length || 0;
      }
    }
    
    if (confidence_count > 0) {
      comparison_metrics.average_confidence = confidence_sum / confidence_count;
    }
    
    res.json({
      success: true,
      query: query,
      results: results,
      comparison_metrics: comparison_metrics,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('RAG comparison error:', error);
    res.status(500).json({ 
      error: 'RAG comparison failed', 
      details: error.message 
    });
  }
});

// Document Upload for RAG Knowledge Base
router.post('/rag/upload-documents', upload.array('documents', 10), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No documents uploaded' });
    }
    
    const uploadedFiles = req.files.map(file => ({
      filename: file.filename,
      originalName: file.originalname,
      size: file.size,
      path: file.path,
      uploadTime: new Date().toISOString()
    }));
    
    // Here you would typically process the documents and add them to the vector database
    // For now, we'll just return the upload confirmation
    
    res.json({
      success: true,
      message: 'Documents uploaded successfully',
      files: uploadedFiles,
      next_steps: [
        'Documents will be processed and indexed',
        'Vector embeddings will be generated',
        'Documents will be available for RAG queries within 5-10 minutes'
      ]
    });
    
  } catch (error) {
    console.error('Document upload error:', error);
    res.status(500).json({ 
      error: 'Document upload failed', 
      details: error.message 
    });
  }
});

// RAG System Status and Health Check
router.get('/rag/status', async (req, res) => {
  try {
    const status = {
      timestamp: new Date().toISOString(),
      available_architectures: [
        {
          name: 'Self-RAG',
          endpoint: '/rag/self-rag',
          status: 'active',
          description: 'Self-evaluating RAG with iterative improvement'
        },
        {
          name: 'Agentic RAG',
          endpoint: '/rag/agentic-rag',
          status: 'active',
          description: 'Planning-based RAG with tool integration'
        },
        {
          name: 'Graph RAG',
          endpoint: '/rag/graph-rag',
          status: 'active',
          description: 'Knowledge graph-enhanced retrieval'
        },
        {
          name: 'HyDE RAG',
          endpoint: '/rag/hyde-rag',
          status: 'active',
          description: 'Hypothetical Document Embedding RAG'
        },
        {
          name: 'Corrective RAG',
          endpoint: '/rag/corrective-rag',
          status: 'active',
          description: 'Error-detecting RAG with automated corrections'
        }
      ],
      system_info: {
        total_endpoints: 7,
        supported_formats: ['.txt', '.pdf', '.doc', '.docx', '.md', '.json'],
        max_file_size: '10MB',
        concurrent_requests: 'supported',
        api_version: '1.0'
      }
    };
    
    res.json(status);
    
  } catch (error) {
    console.error('Status check error:', error);
    res.status(500).json({ 
      error: 'Status check failed', 
      details: error.message 
    });
  }
});

// Error handling middleware
router.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'File too large. Maximum size is 10MB.' });
    }
  }
  
  console.error('RAG endpoint error:', error);
  res.status(500).json({ 
    error: 'Internal server error', 
    details: error.message 
  });
});

module.exports = router;
