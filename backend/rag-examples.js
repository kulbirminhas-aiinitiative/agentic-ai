/**
 * RAG Systems Usage Examples and Testing
 * Comprehensive examples demonstrating how to use each RAG architecture
 */

const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

// Base URL for the RAG API
const BASE_URL = 'http://localhost:3001/api';

// Color codes for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

// Helper function for colored console output
const log = (message, color = 'reset') => {
  console.log(`${colors[color]}${message}${colors.reset}`);
};

// Test queries for different scenarios
const testQueries = {
  technical: "Explain the differences between supervised and unsupervised machine learning algorithms, including their use cases and examples.",
  business: "What are the key factors to consider when implementing AI chatbots for customer service in e-commerce?",
  research: "How do transformer architectures work in natural language processing, and what are their advantages over RNN-based models?",
  practical: "What steps should I follow to deploy a RAG system in production, including infrastructure and monitoring considerations?",
  comparative: "Compare the benefits and drawbacks of different vector databases for similarity search in AI applications."
};

class RAGTester {
  constructor(baseUrl = BASE_URL) {
    this.baseUrl = baseUrl;
    this.results = {};
  }

  // Generic API call method
  async makeRequest(endpoint, data = {}, method = 'POST') {
    try {
      const config = {
        method,
        url: `${this.baseUrl}${endpoint}`,
        headers: {
          'Content-Type': 'application/json',
        }
      };

      if (method === 'POST') {
        config.data = data;
      }

      const response = await axios(config);
      return response.data;
    } catch (error) {
      console.error(`Request failed for ${endpoint}:`, error.response?.data || error.message);
      throw error;
    }
  }

  // 1. Test Self-RAG
  async testSelfRAG() {
    log('\n🧠 TESTING SELF-RAG', 'cyan');
    log('=' .repeat(50), 'cyan');

    const query = testQueries.technical;
    log(`Query: ${query}`, 'yellow');

    try {
      const startTime = Date.now();
      const result = await this.makeRequest('/rag/self-rag', {
        query: query,
        max_iterations: 3,
        confidence_threshold: 0.8
      });

      const duration = Date.now() - startTime;
      
      log(`✅ Success! (${duration}ms)`, 'green');
      log(`Response: ${result.data.final_response.substring(0, 200)}...`, 'bright');
      
      if (result.data.correction_history) {
        log(`📊 Quality Metrics:`, 'magenta');
        log(`   • Iterations: ${result.data.total_iterations}`, 'white');
        log(`   • Final Confidence: ${result.data.quality_metrics?.final_confidence_score?.toFixed(2) || 'N/A'}`, 'white');
        log(`   • Converged: ${result.data.quality_metrics?.converged ? 'Yes' : 'No'}`, 'white');
      }

      this.results.selfRAG = { success: true, duration, result };
      return result;

    } catch (error) {
      log(`❌ Failed: ${error.message}`, 'red');
      this.results.selfRAG = { success: false, error: error.message };
      throw error;
    }
  }

  // 2. Test Agentic RAG
  async testAgenticRAG() {
    log('\n🤖 TESTING AGENTIC RAG', 'cyan');
    log('=' .repeat(50), 'cyan');

    const query = testQueries.practical;
    log(`Query: ${query}`, 'yellow');

    try {
      const startTime = Date.now();
      const result = await this.makeRequest('/rag/agentic-rag', {
        query: query,
        enable_tools: true,
        max_plan_steps: 5
      });

      const duration = Date.now() - startTime;
      
      log(`✅ Success! (${duration}ms)`, 'green');
      log(`Response: ${result.data.final_response?.substring(0, 200) || 'N/A'}...`, 'bright');
      
      if (result.data.execution_plan) {
        log(`🛠️ Execution Plan:`, 'magenta');
        result.data.execution_plan.forEach((step, index) => {
          log(`   ${index + 1}. ${step.action}: ${step.description?.substring(0, 60)}...`, 'white');
        });
      }

      if (result.data.tools_used) {
        log(`🔧 Tools Used: ${result.data.tools_used.join(', ')}`, 'magenta');
      }

      this.results.agenticRAG = { success: true, duration, result };
      return result;

    } catch (error) {
      log(`❌ Failed: ${error.message}`, 'red');
      this.results.agenticRAG = { success: false, error: error.message };
      throw error;
    }
  }

  // 3. Test Graph RAG
  async testGraphRAG() {
    log('\n🕸️ TESTING GRAPH RAG', 'cyan');
    log('=' .repeat(50), 'cyan');

    const query = testQueries.research;
    log(`Query: ${query}`, 'yellow');

    try {
      const startTime = Date.now();
      const result = await this.makeRequest('/rag/graph-rag', {
        query: query,
        graph_depth: 2,
        entity_threshold: 0.7
      });

      const duration = Date.now() - startTime;
      
      log(`✅ Success! (${duration}ms)`, 'green');
      log(`Response: ${result.data.final_response?.substring(0, 200) || 'N/A'}...`, 'bright');
      
      if (result.data.graph_metrics) {
        log(`📈 Graph Metrics:`, 'magenta');
        log(`   • Entities Found: ${result.data.graph_metrics.total_entities || 'N/A'}`, 'white');
        log(`   • Relationships: ${result.data.graph_metrics.total_relationships || 'N/A'}`, 'white');
        log(`   • Graph Depth Used: ${result.data.graph_metrics.max_depth_used || 'N/A'}`, 'white');
      }

      if (result.data.entities_extracted) {
        log(`🏷️ Key Entities: ${result.data.entities_extracted.slice(0, 5).join(', ')}`, 'magenta');
      }

      this.results.graphRAG = { success: true, duration, result };
      return result;

    } catch (error) {
      log(`❌ Failed: ${error.message}`, 'red');
      this.results.graphRAG = { success: false, error: error.message };
      throw error;
    }
  }

  // 4. Test HyDE RAG
  async testHyDERAG() {
    log('\n📝 TESTING HYDE RAG', 'cyan');
    log('=' .repeat(50), 'cyan');

    const query = testQueries.comparative;
    log(`Query: ${query}`, 'yellow');

    try {
      const startTime = Date.now();
      const result = await this.makeRequest('/rag/hyde-rag', {
        query: query,
        generation_style: 'comprehensive',
        num_hypothetical: 3
      });

      const duration = Date.now() - startTime;
      
      log(`✅ Success! (${duration}ms)`, 'green');
      log(`Response: ${result.data.final_response?.substring(0, 200) || 'N/A'}...`, 'bright');
      
      if (result.data.hypothetical_documents) {
        log(`📋 Hypothetical Documents Generated:`, 'magenta');
        result.data.hypothetical_documents.forEach((doc, index) => {
          log(`   ${index + 1}. ${doc.substring(0, 80)}...`, 'white');
        });
      }

      if (result.data.retrieval_scores) {
        log(`🎯 Retrieval Scores:`, 'magenta');
        log(`   • Ensemble Score: ${result.data.retrieval_scores.ensemble_score?.toFixed(3) || 'N/A'}`, 'white');
        log(`   • Top Match Score: ${result.data.retrieval_scores.top_score?.toFixed(3) || 'N/A'}`, 'white');
      }

      this.results.hydeRAG = { success: true, duration, result };
      return result;

    } catch (error) {
      log(`❌ Failed: ${error.message}`, 'red');
      this.results.hydeRAG = { success: false, error: error.message };
      throw error;
    }
  }

  // 5. Test Corrective RAG
  async testCorrectiveRAG() {
    log('\n🔍 TESTING CORRECTIVE RAG', 'cyan');
    log('=' .repeat(50), 'cyan');

    const query = testQueries.business;
    log(`Query: ${query}`, 'yellow');

    try {
      const startTime = Date.now();
      const result = await this.makeRequest('/rag/corrective-rag', {
        query: query,
        max_corrections: 3,
        validation_threshold: 0.8
      });

      const duration = Date.now() - startTime;
      
      log(`✅ Success! (${duration}ms)`, 'green');
      log(`Response: ${result.data.final_response?.substring(0, 200) || 'N/A'}...`, 'bright');
      
      if (result.data.correction_history) {
        log(`🔧 Correction History:`, 'magenta');
        result.data.correction_history.forEach((iteration, index) => {
          log(`   Iteration ${index + 1}:`, 'white');
          log(`     • Confidence: ${iteration.confidence_score?.toFixed(2) || 'N/A'}`, 'white');
          log(`     • Validation: ${iteration.validation_score?.toFixed(2) || 'N/A'}`, 'white');
          log(`     • Issues Found: ${iteration.error_analysis?.detected_issues?.length || 0}`, 'white');
        });
      }

      if (result.data.correction_effectiveness) {
        log(`📊 Correction Effectiveness:`, 'magenta');
        log(`   • Errors Detected: ${result.data.correction_effectiveness.errors_detected}`, 'white');
        log(`   • Corrections Applied: ${result.data.correction_effectiveness.corrections_applied}`, 'white');
        log(`   • Quality Improvement: ${result.data.correction_effectiveness.quality_improvement?.toFixed(2) || 'N/A'}`, 'white');
      }

      this.results.correctiveRAG = { success: true, duration, result };
      return result;

    } catch (error) {
      log(`❌ Failed: ${error.message}`, 'red');
      this.results.correctiveRAG = { success: false, error: error.message };
      throw error;
    }
  }

  // 6. Test RAG Comparison
  async testRAGComparison() {
    log('\n⚖️ TESTING RAG COMPARISON', 'cyan');
    log('=' .repeat(50), 'cyan');

    const query = testQueries.technical;
    log(`Query: ${query}`, 'yellow');

    try {
      const startTime = Date.now();
      const result = await this.makeRequest('/rag/compare', {
        query: query,
        rag_types: ['self-rag', 'agentic-rag', 'graph-rag', 'hyde-rag']
      });

      const duration = Date.now() - startTime;
      
      log(`✅ Success! (${duration}ms)`, 'green');
      
      log(`🏆 Comparison Results:`, 'magenta');
      log(`   • Total Architectures: ${result.comparison_metrics.total_architectures}`, 'white');
      log(`   • Successful Responses: ${result.comparison_metrics.successful_responses}`, 'white');
      log(`   • Average Confidence: ${result.comparison_metrics.average_confidence?.toFixed(2) || 'N/A'}`, 'white');

      log(`📏 Response Lengths:`, 'magenta');
      Object.entries(result.comparison_metrics.response_lengths).forEach(([ragType, length]) => {
        log(`   • ${ragType}: ${length} characters`, 'white');
      });

      // Show brief response previews
      log(`📋 Response Previews:`, 'magenta');
      Object.entries(result.results).forEach(([ragType, ragResult]) => {
        if (!ragResult.error && ragResult.final_response) {
          log(`   ${ragType}: ${ragResult.final_response.substring(0, 100)}...`, 'white');
        } else if (ragResult.error) {
          log(`   ${ragType}: ERROR - ${ragResult.error}`, 'red');
        }
      });

      this.results.comparison = { success: true, duration, result };
      return result;

    } catch (error) {
      log(`❌ Failed: ${error.message}`, 'red');
      this.results.comparison = { success: false, error: error.message };
      throw error;
    }
  }

  // 7. Test Document Upload
  async testDocumentUpload() {
    log('\n📄 TESTING DOCUMENT UPLOAD', 'cyan');
    log('=' .repeat(50), 'cyan');

    try {
      // Create a sample document for testing
      const testDoc = `
# Sample AI Document

## Introduction
This is a sample document for testing RAG systems.

## Machine Learning Basics
Machine learning is a subset of artificial intelligence that focuses on algorithms that can learn from data.

### Types of Machine Learning
1. Supervised Learning
2. Unsupervised Learning
3. Reinforcement Learning

## Natural Language Processing
NLP involves the interaction between computers and human language.

### Key NLP Tasks
- Text classification
- Named entity recognition
- Sentiment analysis
- Machine translation

## Conclusion
AI and ML technologies continue to evolve rapidly.
      `;

      const testFilePath = path.join(__dirname, 'test-document.md');
      fs.writeFileSync(testFilePath, testDoc);

      const formData = new FormData();
      formData.append('documents', fs.createReadStream(testFilePath));

      const startTime = Date.now();
      const response = await axios.post(`${this.baseUrl}/rag/upload-documents`, formData, {
        headers: {
          ...formData.getHeaders(),
        },
      });

      const duration = Date.now() - startTime;
      
      log(`✅ Success! (${duration}ms)`, 'green');
      log(`📁 Uploaded Files:`, 'magenta');
      response.data.files.forEach((file, index) => {
        log(`   ${index + 1}. ${file.originalName} (${file.size} bytes)`, 'white');
      });

      log(`🔄 Next Steps:`, 'magenta');
      response.data.next_steps.forEach((step, index) => {
        log(`   ${index + 1}. ${step}`, 'white');
      });

      // Clean up test file
      fs.unlinkSync(testFilePath);

      this.results.documentUpload = { success: true, duration, result: response.data };
      return response.data;

    } catch (error) {
      log(`❌ Failed: ${error.message}`, 'red');
      this.results.documentUpload = { success: false, error: error.message };
      throw error;
    }
  }

  // 8. Test System Status
  async testSystemStatus() {
    log('\n📊 TESTING SYSTEM STATUS', 'cyan');
    log('=' .repeat(50), 'cyan');

    try {
      const startTime = Date.now();
      const result = await this.makeRequest('/rag/status', {}, 'GET');
      const duration = Date.now() - startTime;
      
      log(`✅ Success! (${duration}ms)`, 'green');
      
      log(`🏗️ Available Architectures:`, 'magenta');
      result.available_architectures.forEach((arch, index) => {
        log(`   ${index + 1}. ${arch.name} (${arch.status})`, 'white');
        log(`      ${arch.description}`, 'white');
        log(`      Endpoint: ${arch.endpoint}`, 'white');
      });

      log(`⚙️ System Info:`, 'magenta');
      log(`   • Total Endpoints: ${result.system_info.total_endpoints}`, 'white');
      log(`   • Supported Formats: ${result.system_info.supported_formats.join(', ')}`, 'white');
      log(`   • Max File Size: ${result.system_info.max_file_size}`, 'white');
      log(`   • API Version: ${result.system_info.api_version}`, 'white');

      this.results.systemStatus = { success: true, duration, result };
      return result;

    } catch (error) {
      log(`❌ Failed: ${error.message}`, 'red');
      this.results.systemStatus = { success: false, error: error.message };
      throw error;
    }
  }

  // Run all tests
  async runAllTests() {
    log('🚀 STARTING COMPREHENSIVE RAG TESTING', 'bright');
    log('=' .repeat(60), 'bright');

    const startTime = Date.now();

    const tests = [
      { name: 'System Status', method: this.testSystemStatus },
      { name: 'Document Upload', method: this.testDocumentUpload },
      { name: 'Self-RAG', method: this.testSelfRAG },
      { name: 'Agentic RAG', method: this.testAgenticRAG },
      { name: 'Graph RAG', method: this.testGraphRAG },
      { name: 'HyDE RAG', method: this.testHyDERAG },
      { name: 'Corrective RAG', method: this.testCorrectiveRAG },
      { name: 'RAG Comparison', method: this.testRAGComparison }
    ];

    for (let i = 0; i < tests.length; i++) {
      const test = tests[i];
      log(`\n[${i + 1}/${tests.length}] Running ${test.name} test...`, 'blue');
      
      try {
        await test.method.call(this);
        log(`✅ ${test.name} test completed`, 'green');
      } catch (error) {
        log(`❌ ${test.name} test failed`, 'red');
        // Continue with other tests even if one fails
      }
      
      // Add delay between tests
      if (i < tests.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    const totalDuration = Date.now() - startTime;

    // Summary
    log('\n📋 TEST SUMMARY', 'bright');
    log('=' .repeat(40), 'bright');

    const successful = Object.values(this.results).filter(r => r.success).length;
    const total = Object.keys(this.results).length;

    log(`📊 Results: ${successful}/${total} tests passed`, successful === total ? 'green' : 'yellow');
    log(`⏱️ Total Duration: ${totalDuration}ms`, 'blue');

    // Detailed results
    Object.entries(this.results).forEach(([testName, result]) => {
      const status = result.success ? '✅' : '❌';
      const duration = result.duration ? `(${result.duration}ms)` : '';
      log(`   ${status} ${testName} ${duration}`, result.success ? 'green' : 'red');
    });

    return this.results;
  }
}

// Usage Examples
const usageExamples = {
  // Example 1: Basic Self-RAG Query
  selfRAGExample: async () => {
    const response = await axios.post(`${BASE_URL}/rag/self-rag`, {
      query: "What are the advantages of using vector databases for AI applications?",
      max_iterations: 2,
      confidence_threshold: 0.8
    });
    
    console.log('Self-RAG Response:', response.data);
  },

  // Example 2: Agentic RAG with Tools
  agenticRAGExample: async () => {
    const response = await axios.post(`${BASE_URL}/rag/agentic-rag`, {
      query: "Calculate the ROI of implementing an AI chatbot for a company with 10,000 monthly customer inquiries",
      enable_tools: true,
      max_plan_steps: 4
    });
    
    console.log('Agentic RAG Response:', response.data);
  },

  // Example 3: Graph RAG for Complex Relationships
  graphRAGExample: async () => {
    const response = await axios.post(`${BASE_URL}/rag/graph-rag`, {
      query: "Explain the relationships between transformers, attention mechanisms, and BERT in NLP",
      graph_depth: 3,
      entity_threshold: 0.6
    });
    
    console.log('Graph RAG Response:', response.data);
  },

  // Example 4: HyDE RAG for Ambiguous Queries
  hydeRAGExample: async () => {
    const response = await axios.post(`${BASE_URL}/rag/hyde-rag`, {
      query: "Best practices for AI",
      generation_style: 'comprehensive',
      num_hypothetical: 4
    });
    
    console.log('HyDE RAG Response:', response.data);
  },

  // Example 5: Corrective RAG for High Accuracy
  correctiveRAGExample: async () => {
    const response = await axios.post(`${BASE_URL}/rag/corrective-rag`, {
      query: "What are the specific requirements for GDPR compliance in AI systems?",
      max_corrections: 3,
      validation_threshold: 0.9
    });
    
    console.log('Corrective RAG Response:', response.data);
  },

  // Example 6: Compare Multiple RAG Systems
  comparisonExample: async () => {
    const response = await axios.post(`${BASE_URL}/rag/compare`, {
      query: "How do neural networks learn from data?",
      rag_types: ['self-rag', 'graph-rag', 'hyde-rag', 'corrective-rag']
    });
    
    console.log('RAG Comparison Response:', response.data);
  }
};

// Main execution
if (require.main === module) {
  const tester = new RAGTester();
  
  // Run specific test based on command line argument
  const testType = process.argv[2];
  
  switch (testType) {
    case 'self-rag':
      tester.testSelfRAG();
      break;
    case 'agentic-rag':
      tester.testAgenticRAG();
      break;
    case 'graph-rag':
      tester.testGraphRAG();
      break;
    case 'hyde-rag':
      tester.testHyDERAG();
      break;
    case 'corrective-rag':
      tester.testCorrectiveRAG();
      break;
    case 'comparison':
      tester.testRAGComparison();
      break;
    case 'upload':
      tester.testDocumentUpload();
      break;
    case 'status':
      tester.testSystemStatus();
      break;
    case 'all':
    default:
      tester.runAllTests();
      break;
  }
}

module.exports = {
  RAGTester,
  usageExamples,
  testQueries
};
