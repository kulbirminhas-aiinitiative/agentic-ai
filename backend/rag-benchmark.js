/**
 * RAG Systems Benchmarking Tool
 * Comprehensive benchmarking and comparison tool for evaluating RAG architectures
 * across different scenarios, metrics, and use cases
 */

const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');

// Benchmarking configuration
const BENCHMARK_CONFIG = {
  baseUrl: process.env.BENCHMARK_BASE_URL || 'http://localhost:3001/api',
  timeout: 60000,
  retries: 2,
  outputDir: 'benchmark-results',
  scenarios: {
    factual_qa: { weight: 0.25, description: 'Factual Question Answering' },
    analytical: { weight: 0.20, description: 'Analytical and Comparative Tasks' },
    technical: { weight: 0.20, description: 'Technical Implementation Questions' },
    business: { weight: 0.15, description: 'Business and Strategic Queries' },
    creative: { weight: 0.10, description: 'Creative and Open-ended Tasks' },
    edge_cases: { weight: 0.10, description: 'Edge Cases and Error Handling' }
  }
};

// Evaluation metrics
const EVALUATION_METRICS = {
  accuracy: { weight: 0.30, description: 'Factual accuracy and correctness' },
  relevance: { weight: 0.25, description: 'Relevance to the query' },
  completeness: { weight: 0.20, description: 'Completeness of the response' },
  clarity: { weight: 0.15, description: 'Clarity and readability' },
  speed: { weight: 0.10, description: 'Response time performance' }
};

class RAGBenchmark {
  constructor() {
    this.results = {};
    this.scenarios = this.getBenchmarkScenarios();
    this.ragSystems = ['self-rag', 'agentic-rag', 'graph-rag', 'hyde-rag', 'corrective-rag'];
  }

  // Comprehensive benchmark scenarios
  getBenchmarkScenarios() {
    return {
      factual_qa: [
        {
          query: "What is the capital of France and what is its population?",
          expectedAnswer: "Paris, approximately 2.1 million",
          difficulty: "easy",
          keywords: ["paris", "capital", "france", "population"],
          evaluationCriteria: {
            accuracy: 0.9,
            relevance: 0.9,
            completeness: 0.8,
            clarity: 0.8,
            speed: 0.7
          }
        },
        {
          query: "Explain the process of photosynthesis and its chemical equation.",
          expectedAnswer: "6CO2 + 6H2O + light energy → C6H12O6 + 6O2",
          difficulty: "medium",
          keywords: ["photosynthesis", "co2", "glucose", "oxygen", "chlorophyll"],
          evaluationCriteria: {
            accuracy: 0.85,
            relevance: 0.9,
            completeness: 0.8,
            clarity: 0.7,
            speed: 0.6
          }
        },
        {
          query: "What are the key differences between mitosis and meiosis in cellular biology?",
          expectedAnswer: "Mitosis produces identical diploid cells, meiosis produces genetically diverse haploid gametes",
          difficulty: "hard",
          keywords: ["mitosis", "meiosis", "diploid", "haploid", "cellular"],
          evaluationCriteria: {
            accuracy: 0.8,
            relevance: 0.85,
            completeness: 0.9,
            clarity: 0.7,
            speed: 0.5
          }
        }
      ],
      
      analytical: [
        {
          query: "Compare and contrast the advantages and disadvantages of supervised vs unsupervised machine learning approaches.",
          expectedAnswer: "Supervised uses labeled data for prediction, unsupervised finds patterns in unlabeled data",
          difficulty: "medium",
          keywords: ["supervised", "unsupervised", "labeled", "unlabeled", "advantages", "disadvantages"],
          evaluationCriteria: {
            accuracy: 0.8,
            relevance: 0.9,
            completeness: 0.9,
            clarity: 0.8,
            speed: 0.6
          }
        },
        {
          query: "Analyze the trade-offs between different database types (SQL vs NoSQL) for a high-traffic web application.",
          expectedAnswer: "SQL provides ACID compliance and structured data, NoSQL offers scalability and flexibility",
          difficulty: "hard",
          keywords: ["sql", "nosql", "acid", "scalability", "trade-offs"],
          evaluationCriteria: {
            accuracy: 0.75,
            relevance: 0.85,
            completeness: 0.9,
            clarity: 0.8,
            speed: 0.5
          }
        }
      ],
      
      technical: [
        {
          query: "How would you implement a distributed caching system for a microservices architecture?",
          expectedAnswer: "Use Redis/Memcached with consistent hashing, cache invalidation strategies, and monitoring",
          difficulty: "hard",
          keywords: ["distributed", "caching", "redis", "microservices", "consistent hashing"],
          evaluationCriteria: {
            accuracy: 0.7,
            relevance: 0.9,
            completeness: 0.85,
            clarity: 0.75,
            speed: 0.6
          }
        },
        {
          query: "Explain the implementation details of a REST API with authentication and rate limiting.",
          expectedAnswer: "JWT tokens, middleware for auth, Redis for rate limiting, proper HTTP status codes",
          difficulty: "medium",
          keywords: ["rest", "api", "jwt", "authentication", "rate limiting"],
          evaluationCriteria: {
            accuracy: 0.8,
            relevance: 0.9,
            completeness: 0.8,
            clarity: 0.8,
            speed: 0.7
          }
        }
      ],
      
      business: [
        {
          query: "What are the key factors to consider when scaling a SaaS business from 100 to 10,000 customers?",
          expectedAnswer: "Infrastructure scaling, customer support, pricing models, feature development, team growth",
          difficulty: "medium",
          keywords: ["saas", "scaling", "customers", "infrastructure", "support"],
          evaluationCriteria: {
            accuracy: 0.75,
            relevance: 0.9,
            completeness: 0.85,
            clarity: 0.8,
            speed: 0.7
          }
        },
        {
          query: "How should a company evaluate the ROI of implementing AI chatbots for customer service?",
          expectedAnswer: "Cost savings from reduced human agents, improved response times, customer satisfaction metrics",
          difficulty: "medium",
          keywords: ["roi", "chatbot", "customer service", "cost savings", "metrics"],
          evaluationCriteria: {
            accuracy: 0.8,
            relevance: 0.9,
            completeness: 0.8,
            clarity: 0.85,
            speed: 0.7
          }
        }
      ],
      
      creative: [
        {
          query: "Design an innovative solution for reducing food waste in urban environments.",
          expectedAnswer: "Smart fridges, community sharing apps, AI-powered demand forecasting, composting networks",
          difficulty: "medium",
          keywords: ["food waste", "urban", "innovative", "solution"],
          evaluationCriteria: {
            accuracy: 0.6,
            relevance: 0.8,
            completeness: 0.7,
            clarity: 0.8,
            speed: 0.7
          }
        },
        {
          query: "Propose a creative marketing strategy for a new AI-powered productivity app.",
          expectedAnswer: "Influencer partnerships, freemium model, productivity challenges, workplace integration",
          difficulty: "easy",
          keywords: ["marketing", "strategy", "ai", "productivity", "app"],
          evaluationCriteria: {
            accuracy: 0.6,
            relevance: 0.8,
            completeness: 0.7,
            clarity: 0.8,
            speed: 0.8
          }
        }
      ],
      
      edge_cases: [
        {
          query: "How do you optimize?",
          expectedAnswer: "Incomplete query - need more context",
          difficulty: "edge",
          keywords: ["incomplete", "context"],
          evaluationCriteria: {
            accuracy: 0.8,
            relevance: 0.7,
            completeness: 0.5,
            clarity: 0.9,
            speed: 0.9
          }
        },
        {
          query: "Tell me about artificial intelligence machine learning deep learning neural networks transformers large language models computer vision natural language processing robotics automation ethics bias fairness transparency explainability governance regulation policy deployment production scaling optimization performance monitoring evaluation metrics benchmarking.",
          expectedAnswer: "Very broad query covering multiple AI topics",
          difficulty: "edge",
          keywords: ["artificial intelligence", "machine learning", "broad"],
          evaluationCriteria: {
            accuracy: 0.6,
            relevance: 0.7,
            completeness: 0.4,
            clarity: 0.6,
            speed: 0.3
          }
        },
        {
          query: "🤖💡🧠🚀⚡🔬📊💻🌟🎯",
          expectedAnswer: "Emoji-only query requiring interpretation",
          difficulty: "edge",
          keywords: ["emoji", "interpretation"],
          evaluationCriteria: {
            accuracy: 0.5,
            relevance: 0.6,
            completeness: 0.3,
            clarity: 0.7,
            speed: 0.8
          }
        }
      ]
    };
  }

  async makeRequest(endpoint, data, timeout = BENCHMARK_CONFIG.timeout) {
    const config = {
      method: 'POST',
      url: `${BENCHMARK_CONFIG.baseUrl}${endpoint}`,
      headers: { 'Content-Type': 'application/json' },
      data,
      timeout
    };

    let lastError;
    for (let attempt = 1; attempt <= BENCHMARK_CONFIG.retries; attempt++) {
      try {
        const startTime = Date.now();
        const response = await axios(config);
        const responseTime = Date.now() - startTime;
        
        return { 
          success: true, 
          data: response.data, 
          responseTime,
          status: response.status 
        };
      } catch (error) {
        lastError = error;
        if (attempt < BENCHMARK_CONFIG.retries) {
          await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
        }
      }
    }
    
    return { 
      success: false, 
      error: lastError.response?.data || lastError.message,
      responseTime: timeout,
      status: lastError.response?.status || 0
    };
  }

  // Advanced response evaluation using multiple criteria
  evaluateResponse(response, scenario, responseTime) {
    const evaluation = {
      accuracy: 0,
      relevance: 0,
      completeness: 0,
      clarity: 0,
      speed: 0,
      overallScore: 0
    };

    const responseText = response.data?.final_response?.toLowerCase() || '';
    const responseLength = responseText.length;

    // 1. Accuracy - keyword matching and expected answer similarity
    const keywordMatches = scenario.keywords.filter(keyword => 
      responseText.includes(keyword.toLowerCase())
    ).length;
    evaluation.accuracy = Math.min(keywordMatches / scenario.keywords.length, 1.0);

    // 2. Relevance - how well the response addresses the query
    const queryWords = scenario.query.toLowerCase().split(' ');
    const relevantWords = queryWords.filter(word => 
      word.length > 3 && responseText.includes(word)
    ).length;
    evaluation.relevance = Math.min(relevantWords / Math.max(queryWords.length, 1), 1.0);

    // 3. Completeness - response length and depth
    const idealLength = scenario.difficulty === 'easy' ? 200 : 
                       scenario.difficulty === 'medium' ? 400 : 600;
    evaluation.completeness = Math.min(responseLength / idealLength, 1.0);

    // 4. Clarity - readability and structure
    const sentences = responseText.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const avgSentenceLength = responseLength / Math.max(sentences.length, 1);
    evaluation.clarity = Math.max(0, 1 - Math.abs(avgSentenceLength - 80) / 80);

    // 5. Speed - response time performance
    const maxTime = scenario.difficulty === 'easy' ? 5000 : 
                   scenario.difficulty === 'medium' ? 10000 : 15000;
    evaluation.speed = Math.max(0, 1 - (responseTime / maxTime));

    // Calculate weighted overall score
    evaluation.overallScore = 
      evaluation.accuracy * EVALUATION_METRICS.accuracy.weight +
      evaluation.relevance * EVALUATION_METRICS.relevance.weight +
      evaluation.completeness * EVALUATION_METRICS.completeness.weight +
      evaluation.clarity * EVALUATION_METRICS.clarity.weight +
      evaluation.speed * EVALUATION_METRICS.speed.weight;

    return evaluation;
  }

  async benchmarkRAGSystem(ragType, scenario, scenarioCategory) {
    console.log(`    Testing ${ragType} on: "${scenario.query.substring(0, 50)}..."`);

    // Configure RAG-specific parameters
    const ragConfigs = {
      'self-rag': { max_iterations: 2, confidence_threshold: 0.8 },
      'agentic-rag': { enable_tools: true, max_plan_steps: 3 },
      'graph-rag': { graph_depth: 2, entity_threshold: 0.7 },
      'hyde-rag': { generation_style: 'comprehensive', num_hypothetical: 2 },
      'corrective-rag': { max_corrections: 2, validation_threshold: 0.8 }
    };

    const requestData = {
      query: scenario.query,
      ...ragConfigs[ragType]
    };

    const result = await this.makeRequest(`/rag/${ragType}`, requestData);

    if (!result.success) {
      return {
        ragType,
        scenario: scenario.query,
        scenarioCategory,
        difficulty: scenario.difficulty,
        success: false,
        error: result.error,
        responseTime: result.responseTime,
        evaluation: null
      };
    }

    const evaluation = this.evaluateResponse(result.data, scenario, result.responseTime);

    return {
      ragType,
      scenario: scenario.query,
      scenarioCategory,
      difficulty: scenario.difficulty,
      success: true,
      response: result.data.data?.final_response || result.data.data?.response,
      responseTime: result.responseTime,
      evaluation,
      metadata: {
        iterations: result.data.data?.total_iterations,
        toolsUsed: result.data.data?.tools_used,
        confidence: result.data.data?.quality_metrics?.final_confidence_score,
        validation: result.data.data?.quality_metrics?.final_validation_score
      }
    };
  }

  async runComprehensiveBenchmark() {
    console.log('🏁 STARTING COMPREHENSIVE RAG BENCHMARKING');
    console.log('=' .repeat(80));
    console.log(`📊 Scenarios: ${Object.keys(this.scenarios).length}`);
    console.log(`🤖 RAG Systems: ${this.ragSystems.length}`);
    console.log(`⏱️  Timeout: ${BENCHMARK_CONFIG.timeout}ms`);
    console.log('=' .repeat(80));

    const startTime = Date.now();
    const benchmarkResults = [];

    // Create output directory
    try {
      await fs.mkdir(BENCHMARK_CONFIG.outputDir, { recursive: true });
    } catch (error) {
      console.warn('Could not create output directory:', error.message);
    }

    // Run benchmarks for each scenario category
    for (const [categoryName, scenarios] of Object.entries(this.scenarios)) {
      console.log(`\n📋 Testing Category: ${categoryName.toUpperCase()}`);
      console.log(`   Description: ${BENCHMARK_CONFIG.scenarios[categoryName].description}`);
      console.log(`   Scenarios: ${scenarios.length}`);
      
      for (let i = 0; i < scenarios.length; i++) {
        const scenario = scenarios[i];
        console.log(`\n  🎯 Scenario ${i + 1}/${scenarios.length} (${scenario.difficulty}):`);
        
        // Test each RAG system on this scenario
        for (const ragType of this.ragSystems) {
          const result = await this.benchmarkRAGSystem(ragType, scenario, categoryName);
          benchmarkResults.push(result);
          
          if (result.success) {
            console.log(`    ✅ ${ragType}: ${(result.evaluation.overallScore * 100).toFixed(1)}% (${result.responseTime}ms)`);
          } else {
            console.log(`    ❌ ${ragType}: Failed - ${result.error}`);
          }
        }
        
        // Small delay between scenarios
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }

    const totalDuration = Date.now() - startTime;
    
    // Generate comprehensive analysis
    const analysis = this.generateBenchmarkAnalysis(benchmarkResults, totalDuration);
    
    // Save results
    await this.saveBenchmarkResults(benchmarkResults, analysis);
    
    // Display summary
    this.displayBenchmarkSummary(analysis);
    
    return { results: benchmarkResults, analysis };
  }

  generateBenchmarkAnalysis(results, totalDuration) {
    const analysis = {
      summary: {
        totalTests: results.length,
        successfulTests: results.filter(r => r.success).length,
        totalDuration,
        timestamp: new Date().toISOString()
      },
      ragRankings: {},
      scenarioAnalysis: {},
      performanceMetrics: {},
      recommendations: {}
    };

    // Analyze each RAG system
    for (const ragType of this.ragSystems) {
      const ragResults = results.filter(r => r.ragType === ragType && r.success);
      
      if (ragResults.length === 0) {
        analysis.ragRankings[ragType] = {
          overallScore: 0,
          successRate: 0,
          avgResponseTime: 0,
          strengths: [],
          weaknesses: ['System unavailable or all tests failed']
        };
        continue;
      }

      const scores = ragResults.map(r => r.evaluation.overallScore);
      const responseTimes = ragResults.map(r => r.responseTime);
      
      const overallScore = scores.reduce((a, b) => a + b, 0) / scores.length;
      const avgResponseTime = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;
      const successRate = ragResults.length / results.filter(r => r.ragType === ragType).length;

      // Analyze performance by category
      const categoryPerformance = {};
      for (const [category, scenarios] of Object.entries(this.scenarios)) {
        const categoryResults = ragResults.filter(r => r.scenarioCategory === category);
        if (categoryResults.length > 0) {
          categoryPerformance[category] = {
            averageScore: categoryResults.reduce((sum, r) => sum + r.evaluation.overallScore, 0) / categoryResults.length,
            count: categoryResults.length
          };
        }
      }

      // Identify strengths and weaknesses
      const strengths = [];
      const weaknesses = [];
      
      Object.entries(categoryPerformance).forEach(([category, perf]) => {
        if (perf.averageScore > 0.75) {
          strengths.push(`Excellent at ${category.replace('_', ' ')}`);
        } else if (perf.averageScore < 0.5) {
          weaknesses.push(`Struggles with ${category.replace('_', ' ')}`);
        }
      });

      if (avgResponseTime < 5000) strengths.push('Fast response times');
      else if (avgResponseTime > 15000) weaknesses.push('Slow response times');

      analysis.ragRankings[ragType] = {
        overallScore,
        successRate,
        avgResponseTime,
        categoryPerformance,
        strengths,
        weaknesses,
        detailedMetrics: {
          accuracy: ragResults.reduce((sum, r) => sum + r.evaluation.accuracy, 0) / ragResults.length,
          relevance: ragResults.reduce((sum, r) => sum + r.evaluation.relevance, 0) / ragResults.length,
          completeness: ragResults.reduce((sum, r) => sum + r.evaluation.completeness, 0) / ragResults.length,
          clarity: ragResults.reduce((sum, r) => sum + r.evaluation.clarity, 0) / ragResults.length,
          speed: ragResults.reduce((sum, r) => sum + r.evaluation.speed, 0) / ragResults.length
        }
      };
    }

    // Rank RAG systems
    const rankedSystems = Object.entries(analysis.ragRankings)
      .sort(([,a], [,b]) => b.overallScore - a.overallScore)
      .map(([ragType, metrics], index) => ({
        rank: index + 1,
        ragType,
        ...metrics
      }));

    analysis.finalRankings = rankedSystems;

    // Generate scenario-specific analysis
    for (const [category, scenarios] of Object.entries(this.scenarios)) {
      const categoryResults = results.filter(r => r.scenarioCategory === category && r.success);
      
      if (categoryResults.length > 0) {
        const bestRAG = categoryResults.reduce((best, current) => 
          current.evaluation.overallScore > best.evaluation.overallScore ? current : best
        );
        
        analysis.scenarioAnalysis[category] = {
          description: BENCHMARK_CONFIG.scenarios[category].description,
          weight: BENCHMARK_CONFIG.scenarios[category].weight,
          bestPerformer: bestRAG.ragType,
          bestScore: bestRAG.evaluation.overallScore,
          averageScore: categoryResults.reduce((sum, r) => sum + r.evaluation.overallScore, 0) / categoryResults.length,
          totalTests: categoryResults.length
        };
      }
    }

    // Generate recommendations
    analysis.recommendations = this.generateRecommendations(rankedSystems, analysis.scenarioAnalysis);

    return analysis;
  }

  generateRecommendations(rankedSystems, scenarioAnalysis) {
    const recommendations = {
      general: [],
      useCase: {},
      optimization: []
    };

    // General recommendations
    if (rankedSystems.length > 0) {
      const topPerformer = rankedSystems[0];
      recommendations.general.push(
        `🏆 Overall best performer: ${topPerformer.ragType} (${(topPerformer.overallScore * 100).toFixed(1)}%)`
      );

      if (topPerformer.avgResponseTime < 5000) {
        recommendations.general.push('✅ Top performer also has excellent response times');
      }

      // Identify consistent performers
      const consistentPerformers = rankedSystems.filter(r => 
        r.successRate > 0.9 && r.overallScore > 0.6
      );
      
      if (consistentPerformers.length > 0) {
        recommendations.general.push(
          `🎯 Most reliable systems: ${consistentPerformers.map(r => r.ragType).join(', ')}`
        );
      }
    }

    // Use case specific recommendations
    Object.entries(scenarioAnalysis).forEach(([category, analysis]) => {
      recommendations.useCase[category] = {
        recommended: analysis.bestPerformer,
        reason: `Best performance in ${analysis.description.toLowerCase()} (${(analysis.bestScore * 100).toFixed(1)}%)`,
        category: analysis.description
      };
    });

    // Optimization recommendations
    const slowSystems = rankedSystems.filter(r => r.avgResponseTime > 10000);
    if (slowSystems.length > 0) {
      recommendations.optimization.push(
        `⚡ Consider optimizing response times for: ${slowSystems.map(r => r.ragType).join(', ')}`
      );
    }

    const lowAccuracySystems = rankedSystems.filter(r => r.detailedMetrics.accuracy < 0.6);
    if (lowAccuracySystems.length > 0) {
      recommendations.optimization.push(
        `🎯 Improve accuracy for: ${lowAccuracySystems.map(r => r.ragType).join(', ')}`
      );
    }

    return recommendations;
  }

  async saveBenchmarkResults(results, analysis) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    
    try {
      // Save detailed results
      await fs.writeFile(
        path.join(BENCHMARK_CONFIG.outputDir, `benchmark-results-${timestamp}.json`),
        JSON.stringify({ results, analysis }, null, 2)
      );

      // Save CSV for easy analysis
      const csv = this.generateCSVReport(results);
      await fs.writeFile(
        path.join(BENCHMARK_CONFIG.outputDir, `benchmark-results-${timestamp}.csv`),
        csv
      );

      // Save human-readable report
      const report = this.generateHumanReadableReport(analysis);
      await fs.writeFile(
        path.join(BENCHMARK_CONFIG.outputDir, `benchmark-report-${timestamp}.md`),
        report
      );

      console.log(`\n💾 Results saved to: ${BENCHMARK_CONFIG.outputDir}/`);
      
    } catch (error) {
      console.error('❌ Failed to save results:', error.message);
    }
  }

  generateCSVReport(results) {
    const headers = [
      'RAG_Type', 'Scenario_Category', 'Difficulty', 'Success', 'Response_Time',
      'Overall_Score', 'Accuracy', 'Relevance', 'Completeness', 'Clarity', 'Speed'
    ];

    const rows = results.map(result => [
      result.ragType,
      result.scenarioCategory,
      result.difficulty,
      result.success,
      result.responseTime,
      result.evaluation?.overallScore || 0,
      result.evaluation?.accuracy || 0,
      result.evaluation?.relevance || 0,
      result.evaluation?.completeness || 0,
      result.evaluation?.clarity || 0,
      result.evaluation?.speed || 0
    ]);

    return [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
  }

  generateHumanReadableReport(analysis) {
    let report = `# RAG Systems Benchmark Report\n\n`;
    report += `Generated: ${analysis.summary.timestamp}\n`;
    report += `Duration: ${(analysis.summary.totalDuration / 1000).toFixed(1)}s\n`;
    report += `Total Tests: ${analysis.summary.totalTests}\n`;
    report += `Success Rate: ${((analysis.summary.successfulTests / analysis.summary.totalTests) * 100).toFixed(1)}%\n\n`;

    // Rankings
    report += `## 🏆 Overall Rankings\n\n`;
    analysis.finalRankings.forEach(system => {
      report += `${system.rank}. **${system.ragType}** - ${(system.overallScore * 100).toFixed(1)}%\n`;
      report += `   - Success Rate: ${(system.successRate * 100).toFixed(1)}%\n`;
      report += `   - Avg Response Time: ${system.avgResponseTime.toFixed(0)}ms\n`;
      report += `   - Strengths: ${system.strengths.join(', ') || 'None identified'}\n`;
      report += `   - Areas for Improvement: ${system.weaknesses.join(', ') || 'None identified'}\n\n`;
    });

    // Scenario Analysis
    report += `## 📊 Scenario Analysis\n\n`;
    Object.entries(analysis.scenarioAnalysis).forEach(([category, data]) => {
      report += `### ${category.replace('_', ' ').toUpperCase()}\n`;
      report += `- **Best Performer**: ${data.bestPerformer} (${(data.bestScore * 100).toFixed(1)}%)\n`;
      report += `- **Average Score**: ${(data.averageScore * 100).toFixed(1)}%\n`;
      report += `- **Weight**: ${(data.weight * 100).toFixed(0)}%\n\n`;
    });

    // Recommendations
    report += `## 💡 Recommendations\n\n`;
    report += `### General\n`;
    analysis.recommendations.general.forEach(rec => {
      report += `- ${rec}\n`;
    });
    
    report += `\n### Use Case Specific\n`;
    Object.entries(analysis.recommendations.useCase).forEach(([useCase, rec]) => {
      report += `- **${useCase.replace('_', ' ')}**: ${rec.recommended} - ${rec.reason}\n`;
    });

    if (analysis.recommendations.optimization.length > 0) {
      report += `\n### Optimization\n`;
      analysis.recommendations.optimization.forEach(rec => {
        report += `- ${rec}\n`;
      });
    }

    return report;
  }

  displayBenchmarkSummary(analysis) {
    console.log('\n🏆 BENCHMARK SUMMARY');
    console.log('=' .repeat(80));
    
    console.log(`📊 Overall Results:`);
    console.log(`   Total Tests: ${analysis.summary.totalTests}`);
    console.log(`   Successful: ${analysis.summary.successfulTests}`);
    console.log(`   Duration: ${(analysis.summary.totalDuration / 1000).toFixed(1)}s`);
    
    console.log(`\n🥇 Top 3 RAG Systems:`);
    analysis.finalRankings.slice(0, 3).forEach((system, index) => {
      const medal = ['🥇', '🥈', '🥉'][index];
      console.log(`   ${medal} ${system.ragType}: ${(system.overallScore * 100).toFixed(1)}% (${system.avgResponseTime.toFixed(0)}ms avg)`);
    });
    
    console.log(`\n🎯 Best by Category:`);
    Object.entries(analysis.scenarioAnalysis).forEach(([category, data]) => {
      console.log(`   ${category.replace('_', ' ')}: ${data.bestPerformer} (${(data.bestScore * 100).toFixed(1)}%)`);
    });
    
    console.log(`\n💡 Key Recommendations:`);
    analysis.recommendations.general.slice(0, 3).forEach(rec => {
      console.log(`   • ${rec}`);
    });
    
    console.log('=' .repeat(80));
  }

  // Quick comparison for specific scenarios
  async quickComparison(queries, ragTypes = null) {
    console.log('⚡ QUICK RAG COMPARISON');
    console.log('=' .repeat(50));

    ragTypes = ragTypes || this.ragSystems;
    const results = [];

    for (const query of queries) {
      console.log(`\n🔍 Query: "${query}"`);
      
      for (const ragType of ragTypes) {
        const result = await this.makeRequest(`/rag/${ragType}`, { query });
        
        if (result.success) {
          const responseLength = result.data.data?.final_response?.length || 0;
          console.log(`   ${ragType}: ${result.responseTime}ms, ${responseLength} chars`);
          results.push({
            query,
            ragType,
            responseTime: result.responseTime,
            responseLength,
            success: true
          });
        } else {
          console.log(`   ${ragType}: FAILED`);
          results.push({
            query,
            ragType,
            success: false,
            error: result.error
          });
        }
      }
    }

    return results;
  }
}

// Export for use in other modules
module.exports = RAGBenchmark;

// CLI interface
if (require.main === module) {
  const benchmark = new RAGBenchmark();
  
  const command = process.argv[2];
  
  switch (command) {
    case 'full':
      benchmark.runComprehensiveBenchmark();
      break;
    case 'quick':
      const queries = process.argv.slice(3);
      if (queries.length === 0) {
        queries.push("What is machine learning?", "How do neural networks work?");
      }
      benchmark.quickComparison(queries);
      break;
    default:
      console.log('Usage:');
      console.log('  node rag-benchmark.js full              - Run full benchmark suite');
      console.log('  node rag-benchmark.js quick [queries]   - Quick comparison');
      break;
  }
}
