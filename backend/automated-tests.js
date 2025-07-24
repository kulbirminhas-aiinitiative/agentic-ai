/**
 * Comprehensive Automated Test Suite for RAG Systems
 * Tests all endpoints, validates responses, and measures performance
 */

const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');

// Test configuration
const TEST_CONFIG = {
  baseUrl: process.env.TEST_BASE_URL || 'http://localhost:3001/api',
  timeout: 30000,
  retries: 3,
  parallel: true
};

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

const log = (message, color = 'reset') => {
  console.log(`${colors[color]}${message}${colors.reset}`);
};

class RAGTestSuite {
  constructor() {
    this.results = {};
    this.startTime = Date.now();
    this.testCount = 0;
    this.passedTests = 0;
    this.failedTests = 0;
  }

  // Test data sets
  getTestQueries() {
    return {
      simple: [
        {
          query: "What is machine learning?",
          expectedKeywords: ["algorithm", "data", "learn", "pattern"],
          category: "basic"
        },
        {
          query: "How does supervised learning work?",
          expectedKeywords: ["labeled", "training", "prediction"],
          category: "basic"
        }
      ],
      complex: [
        {
          query: "Compare the advantages and disadvantages of different neural network architectures for natural language processing tasks.",
          expectedKeywords: ["neural", "network", "nlp", "advantage", "disadvantage"],
          category: "analytical"
        },
        {
          query: "What are the technical implementation challenges when deploying RAG systems at scale?",
          expectedKeywords: ["rag", "scale", "implementation", "challenge"],
          category: "technical"
        }
      ],
      domain_specific: [
        {
          query: "Explain the mathematical foundations behind gradient descent optimization in deep learning.",
          expectedKeywords: ["gradient", "descent", "optimization", "mathematical"],
          category: "mathematical"
        },
        {
          query: "What are the business implications of implementing AI chatbots for customer service?",
          expectedKeywords: ["business", "chatbot", "customer", "service"],
          category: "business"
        }
      ],
      edge_cases: [
        {
          query: "How do?",
          expectedKeywords: [],
          category: "incomplete"
        },
        {
          query: "Tell me about artificial intelligence machine learning deep learning neural networks transformers and large language models.",
          expectedKeywords: ["artificial", "intelligence", "machine", "learning"],
          category: "very_long"
        },
        {
          query: "🤖🧠💡",
          expectedKeywords: [],
          category: "emoji_only"
        }
      ]
    };
  }

  // Validation helpers
  validateResponse(response, expectedStructure) {
    const errors = [];
    
    if (!response.success) {
      errors.push("Response success is false");
    }
    
    if (!response.data) {
      errors.push("Missing data field");
    }
    
    if (expectedStructure.requiresFinalResponse && !response.data?.final_response) {
      errors.push("Missing final_response");
    }
    
    if (expectedStructure.requiresMetadata && !response.metadata) {
      errors.push("Missing metadata");
    }
    
    return errors;
  }

  validateResponseContent(response, expectedKeywords) {
    const finalResponse = response.data?.final_response?.toLowerCase() || '';
    const foundKeywords = expectedKeywords.filter(keyword => 
      finalResponse.includes(keyword.toLowerCase())
    );
    
    return {
      keywordCoverage: foundKeywords.length / Math.max(expectedKeywords.length, 1),
      foundKeywords,
      responseLength: finalResponse.length,
      hasContent: finalResponse.length > 50
    };
  }

  async makeRequest(endpoint, data = {}, method = 'POST') {
    const config = {
      method,
      url: `${TEST_CONFIG.baseUrl}${endpoint}`,
      headers: { 'Content-Type': 'application/json' },
      timeout: TEST_CONFIG.timeout
    };

    if (method === 'POST') {
      config.data = data;
    }

    let lastError;
    for (let attempt = 1; attempt <= TEST_CONFIG.retries; attempt++) {
      try {
        const response = await axios(config);
        return { success: true, data: response.data, status: response.status };
      } catch (error) {
        lastError = error;
        if (attempt < TEST_CONFIG.retries) {
          await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
        }
      }
    }
    
    return { 
      success: false, 
      error: lastError.response?.data || lastError.message,
      status: lastError.response?.status || 0
    };
  }

  async runTest(testName, testFunction) {
    this.testCount++;
    log(`\n🧪 Running Test: ${testName}`, 'cyan');
    log('─'.repeat(60), 'cyan');
    
    const startTime = Date.now();
    
    try {
      const result = await testFunction();
      const duration = Date.now() - startTime;
      
      if (result.passed) {
        this.passedTests++;
        log(`✅ PASSED (${duration}ms)`, 'green');
      } else {
        this.failedTests++;
        log(`❌ FAILED (${duration}ms)`, 'red');
        if (result.errors) {
          result.errors.forEach(error => log(`   • ${error}`, 'red'));
        }
      }
      
      this.results[testName] = {
        ...result,
        duration,
        timestamp: new Date().toISOString()
      };
      
      return result;
      
    } catch (error) {
      this.failedTests++;
      const duration = Date.now() - startTime;
      log(`❌ ERROR (${duration}ms): ${error.message}`, 'red');
      
      this.results[testName] = {
        passed: false,
        error: error.message,
        duration,
        timestamp: new Date().toISOString()
      };
      
      return { passed: false, error: error.message };
    }
  }

  // Test 1: Health Check
  async testHealthCheck() {
    return this.runTest('Health Check', async () => {
      const response = await this.makeRequest('/health', {}, 'GET');
      
      if (!response.success) {
        return { passed: false, errors: ['Health endpoint not accessible'] };
      }
      
      const requiredFields = ['status', 'timestamp', 'service'];
      const missingFields = requiredFields.filter(field => !response.data[field]);
      
      return {
        passed: missingFields.length === 0,
        errors: missingFields.map(field => `Missing field: ${field}`),
        data: response.data
      };
    });
  }

  // Test 2: RAG Status Check
  async testRAGStatus() {
    return this.runTest('RAG Status Check', async () => {
      const response = await this.makeRequest('/rag/status', {}, 'GET');
      
      if (!response.success) {
        return { passed: false, errors: ['RAG status endpoint not accessible'] };
      }
      
      const errors = [];
      if (!response.data.available_architectures) {
        errors.push('Missing available_architectures');
      } else if (response.data.available_architectures.length !== 5) {
        errors.push(`Expected 5 architectures, got ${response.data.available_architectures.length}`);
      }
      
      return {
        passed: errors.length === 0,
        errors,
        architectures: response.data.available_architectures?.length || 0
      };
    });
  }

  // Test 3: Self-RAG Functionality
  async testSelfRAG() {
    return this.runTest('Self-RAG Functionality', async () => {
      const testQueries = this.getTestQueries();
      const errors = [];
      const results = [];
      
      for (const querySet of Object.values(testQueries)) {
        for (const testCase of querySet.slice(0, 1)) { // Test one from each set
          const response = await this.makeRequest('/rag/self-rag', {
            query: testCase.query,
            max_iterations: 2,
            confidence_threshold: 0.7
          });
          
          if (!response.success) {
            errors.push(`Failed for query: "${testCase.query}"`);
            continue;
          }
          
          const structureErrors = this.validateResponse(response.data, {
            requiresFinalResponse: true,
            requiresMetadata: true
          });
          errors.push(...structureErrors);
          
          const contentValidation = this.validateResponseContent(response.data, testCase.expectedKeywords);
          results.push({
            query: testCase.query,
            category: testCase.category,
            keywordCoverage: contentValidation.keywordCoverage,
            responseLength: contentValidation.responseLength,
            hasContent: contentValidation.hasContent
          });
        }
      }
      
      const avgKeywordCoverage = results.reduce((sum, r) => sum + r.keywordCoverage, 0) / results.length;
      const contentfulResponses = results.filter(r => r.hasContent).length;
      
      return {
        passed: errors.length === 0 && avgKeywordCoverage > 0.3 && contentfulResponses > results.length * 0.7,
        errors,
        metrics: {
          avgKeywordCoverage,
          contentfulResponses,
          totalTests: results.length
        },
        results
      };
    });
  }

  // Test 4: Agentic RAG Functionality
  async testAgenticRAG() {
    return this.runTest('Agentic RAG Functionality', async () => {
      const response = await this.makeRequest('/rag/agentic-rag', {
        query: "Calculate the estimated cost savings of implementing an AI chatbot for a company with 1000 customer inquiries per day",
        enable_tools: true,
        max_plan_steps: 3
      });
      
      if (!response.success) {
        return { passed: false, errors: ['Agentic RAG endpoint failed'] };
      }
      
      const errors = this.validateResponse(response.data, {
        requiresFinalResponse: true,
        requiresMetadata: true
      });
      
      // Check for planning-specific features
      const hasPlanning = response.data.data?.execution_plan || response.data.data?.tools_used;
      if (!hasPlanning) {
        errors.push('Missing planning or tool usage indicators');
      }
      
      return {
        passed: errors.length === 0,
        errors,
        hasPlanning: !!hasPlanning
      };
    });
  }

  // Test 5: Graph RAG Functionality
  async testGraphRAG() {
    return this.runTest('Graph RAG Functionality', async () => {
      const response = await this.makeRequest('/rag/graph-rag', {
        query: "Explain the relationships between neural networks, deep learning, and artificial intelligence",
        graph_depth: 2,
        entity_threshold: 0.6
      });
      
      if (!response.success) {
        return { passed: false, errors: ['Graph RAG endpoint failed'] };
      }
      
      const errors = this.validateResponse(response.data, {
        requiresFinalResponse: true,
        requiresMetadata: true
      });
      
      return {
        passed: errors.length === 0,
        errors
      };
    });
  }

  // Test 6: HyDE RAG Functionality
  async testHyDERAG() {
    return this.runTest('HyDE RAG Functionality', async () => {
      const response = await this.makeRequest('/rag/hyde-rag', {
        query: "Best practices for machine learning model deployment",
        generation_style: 'comprehensive',
        num_hypothetical: 2
      });
      
      if (!response.success) {
        return { passed: false, errors: ['HyDE RAG endpoint failed'] };
      }
      
      const errors = this.validateResponse(response.data, {
        requiresFinalResponse: true,
        requiresMetadata: true
      });
      
      return {
        passed: errors.length === 0,
        errors
      };
    });
  }

  // Test 7: Corrective RAG Functionality
  async testCorrectiveRAG() {
    return this.runTest('Corrective RAG Functionality', async () => {
      const response = await this.makeRequest('/rag/corrective-rag', {
        query: "What are the key principles of responsible AI development?",
        max_corrections: 2,
        validation_threshold: 0.8
      });
      
      if (!response.success) {
        return { passed: false, errors: ['Corrective RAG endpoint failed'] };
      }
      
      const errors = this.validateResponse(response.data, {
        requiresFinalResponse: true,
        requiresMetadata: true
      });
      
      return {
        passed: errors.length === 0,
        errors
      };
    });
  }

  // Test 8: RAG Comparison Functionality
  async testRAGComparison() {
    return this.runTest('RAG Comparison Functionality', async () => {
      const response = await this.makeRequest('/rag/compare', {
        query: "What is the difference between machine learning and deep learning?",
        rag_types: ['self-rag', 'graph-rag']
      });
      
      if (!response.success) {
        return { passed: false, errors: ['RAG comparison endpoint failed'] };
      }
      
      const errors = [];
      if (!response.data.results) {
        errors.push('Missing results field');
      }
      if (!response.data.comparison_metrics) {
        errors.push('Missing comparison_metrics field');
      }
      
      return {
        passed: errors.length === 0,
        errors,
        comparedSystems: Object.keys(response.data.results || {}).length
      };
    });
  }

  // Test 9: Error Handling
  async testErrorHandling() {
    return this.runTest('Error Handling', async () => {
      const errorTests = [
        {
          name: 'Empty query',
          endpoint: '/rag/self-rag',
          data: { query: '' },
          expectedStatus: 400
        },
        {
          name: 'Missing query',
          endpoint: '/rag/self-rag',
          data: {},
          expectedStatus: 400
        },
        {
          name: 'Invalid RAG type',
          endpoint: '/rag/compare',
          data: { query: 'test', rag_types: ['invalid-rag'] },
          expectedStatus: 500
        }
      ];
      
      const results = [];
      for (const test of errorTests) {
        const response = await this.makeRequest(test.endpoint, test.data);
        results.push({
          name: test.name,
          handledCorrectly: !response.success,
          actualStatus: response.status,
          expectedStatus: test.expectedStatus
        });
      }
      
      const correctlyHandled = results.filter(r => r.handledCorrectly).length;
      
      return {
        passed: correctlyHandled === errorTests.length,
        errors: results.filter(r => !r.handledCorrectly).map(r => 
          `${r.name}: Expected error but got success`
        ),
        errorHandlingRate: correctlyHandled / errorTests.length,
        results
      };
    });
  }

  // Test 10: Performance Testing
  async testPerformance() {
    return this.runTest('Performance Testing', async () => {
      const performanceTests = [
        {
          name: 'Self-RAG Response Time',
          endpoint: '/rag/self-rag',
          data: { query: 'What is artificial intelligence?', max_iterations: 1 },
          maxTime: 15000
        },
        {
          name: 'Simple Query Performance',
          endpoint: '/rag/hyde-rag',
          data: { query: 'Define machine learning', num_hypothetical: 1 },
          maxTime: 10000
        }
      ];
      
      const results = [];
      for (const test of performanceTests) {
        const startTime = Date.now();
        const response = await this.makeRequest(test.endpoint, test.data);
        const duration = Date.now() - startTime;
        
        results.push({
          name: test.name,
          duration,
          maxTime: test.maxTime,
          withinLimit: duration <= test.maxTime,
          success: response.success
        });
      }
      
      const passedPerformance = results.filter(r => r.withinLimit && r.success).length;
      
      return {
        passed: passedPerformance === performanceTests.length,
        errors: results.filter(r => !r.withinLimit || !r.success).map(r => 
          `${r.name}: ${r.duration}ms (limit: ${r.maxTime}ms)`
        ),
        results
      };
    });
  }

  // Test 11: Concurrent Request Handling
  async testConcurrency() {
    return this.runTest('Concurrent Request Handling', async () => {
      const concurrentRequests = 3;
      const promises = Array.from({length: concurrentRequests}, (_, i) => 
        this.makeRequest('/rag/self-rag', {
          query: `Test query ${i + 1}: What is machine learning?`,
          max_iterations: 1
        })
      );
      
      const startTime = Date.now();
      const results = await Promise.all(promises);
      const totalDuration = Date.now() - startTime;
      
      const successCount = results.filter(r => r.success).length;
      const avgResponseTime = totalDuration / concurrentRequests;
      
      return {
        passed: successCount === concurrentRequests,
        errors: successCount < concurrentRequests ? 
          [`Only ${successCount}/${concurrentRequests} requests succeeded`] : [],
        concurrentRequests,
        successCount,
        totalDuration,
        avgResponseTime
      };
    });
  }

  // Run all tests
  async runAllTests() {
    log('🚀 STARTING COMPREHENSIVE RAG TEST SUITE', 'bright');
    log('=' .repeat(80), 'bright');
    log(`Base URL: ${TEST_CONFIG.baseUrl}`, 'blue');
    log(`Timeout: ${TEST_CONFIG.timeout}ms`, 'blue');
    log(`Retries: ${TEST_CONFIG.retries}`, 'blue');
    log('=' .repeat(80), 'bright');

    const testSuite = [
      this.testHealthCheck,
      this.testRAGStatus,
      this.testSelfRAG,
      this.testAgenticRAG,
      this.testGraphRAG,
      this.testHyDERAG,
      this.testCorrectiveRAG,
      this.testRAGComparison,
      this.testErrorHandling,
      this.testPerformance,
      this.testConcurrency
    ];

    // Run tests sequentially to avoid overwhelming the server
    for (const testFunction of testSuite) {
      await testFunction.call(this);
      
      // Short delay between tests
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    await this.generateTestReport();
    return this.results;
  }

  async generateTestReport() {
    const totalDuration = Date.now() - this.startTime;
    const passRate = (this.passedTests / this.testCount * 100).toFixed(1);
    
    log('\n📊 COMPREHENSIVE TEST REPORT', 'bright');
    log('=' .repeat(80), 'bright');
    
    // Summary
    log(`📈 Summary:`, 'cyan');
    log(`   Total Tests: ${this.testCount}`, 'white');
    log(`   Passed: ${this.passedTests}`, 'green');
    log(`   Failed: ${this.failedTests}`, 'red');
    log(`   Pass Rate: ${passRate}%`, passRate >= 80 ? 'green' : 'yellow');
    log(`   Total Duration: ${totalDuration}ms`, 'blue');
    
    // Detailed Results
    log(`\n📋 Detailed Results:`, 'cyan');
    Object.entries(this.results).forEach(([testName, result]) => {
      const status = result.passed ? '✅' : '❌';
      const duration = result.duration ? `(${result.duration}ms)` : '';
      log(`   ${status} ${testName} ${duration}`, result.passed ? 'green' : 'red');
      
      if (result.errors && result.errors.length > 0) {
        result.errors.forEach(error => {
          log(`      • ${error}`, 'red');
        });
      }
    });
    
    // Performance Analysis
    const performanceData = Object.values(this.results)
      .filter(r => r.duration)
      .map(r => r.duration);
      
    if (performanceData.length > 0) {
      const avgDuration = performanceData.reduce((a, b) => a + b, 0) / performanceData.length;
      const maxDuration = Math.max(...performanceData);
      const minDuration = Math.min(...performanceData);
      
      log(`\n⚡ Performance Analysis:`, 'cyan');
      log(`   Average Response Time: ${avgDuration.toFixed(0)}ms`, 'white');
      log(`   Fastest Response: ${minDuration}ms`, 'green');
      log(`   Slowest Response: ${maxDuration}ms`, 'yellow');
    }
    
    // Save detailed report
    const reportData = {
      summary: {
        totalTests: this.testCount,
        passed: this.passedTests,
        failed: this.failedTests,
        passRate: parseFloat(passRate),
        totalDuration,
        timestamp: new Date().toISOString()
      },
      results: this.results,
      config: TEST_CONFIG
    };
    
    try {
      await fs.writeFile(
        path.join(__dirname, 'test-report.json'),
        JSON.stringify(reportData, null, 2)
      );
      log(`\n💾 Detailed report saved to: test-report.json`, 'green');
    } catch (error) {
      log(`\n❌ Failed to save report: ${error.message}`, 'red');
    }
    
    log('=' .repeat(80), 'bright');
  }
}

// Export for use in other modules
module.exports = RAGTestSuite;

// Run tests if this file is executed directly
if (require.main === module) {
  const testSuite = new RAGTestSuite();
  testSuite.runAllTests().then(() => {
    process.exit(testSuite.failedTests > 0 ? 1 : 0);
  }).catch(error => {
    console.error('Test suite failed:', error);
    process.exit(1);
  });
}
