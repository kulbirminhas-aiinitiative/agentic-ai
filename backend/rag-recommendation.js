/**
 * Intelligent RAG Recommendation System
 * Analyzes query characteristics and recommends optimal RAG architecture
 * based on historical performance data and scenario analysis
 */

const fs = require('fs').promises;
const path = require('path');

class RAGRecommendationEngine {
  constructor() {
    this.performanceData = this.getDefaultPerformanceData(); // Initialize with defaults first
    this.scenarioClassifier = new ScenarioClassifier();
    this.loadPerformanceData(); // Then try to load from file
  }

  async loadPerformanceData() {
    try {
      // Try to load existing benchmark data
      const files = await fs.readdir('benchmark-results');
      const latestBenchmark = files
        .filter(f => f.startsWith('benchmark-results-'))
        .sort()
        .pop();

      if (latestBenchmark) {
        const data = await fs.readFile(path.join('benchmark-results', latestBenchmark));
        this.performanceData = JSON.parse(data);
        console.log('✅ Loaded performance data from:', latestBenchmark);
      } else {
        console.log('⚠️  No benchmark data found. Using default recommendations.');
        this.performanceData = this.getDefaultPerformanceData();
      }
    } catch (error) {
      console.log('⚠️  Could not load benchmark data. Using defaults.');
      this.performanceData = this.getDefaultPerformanceData();
    }
  }

  getDefaultPerformanceData() {
    return {
      analysis: {
        ragRankings: {
          'self-rag': {
            overallScore: 0.78,
            categoryPerformance: {
              factual_qa: { averageScore: 0.85 },
              analytical: { averageScore: 0.75 },
              technical: { averageScore: 0.70 },
              business: { averageScore: 0.80 },
              creative: { averageScore: 0.65 },
              edge_cases: { averageScore: 0.75 }
            },
            detailedMetrics: {
              accuracy: 0.82,
              relevance: 0.80,
              completeness: 0.75,
              clarity: 0.78,
              speed: 0.70
            }
          },
          'agentic-rag': {
            overallScore: 0.82,
            categoryPerformance: {
              factual_qa: { averageScore: 0.75 },
              analytical: { averageScore: 0.88 },
              technical: { averageScore: 0.90 },
              business: { averageScore: 0.85 },
              creative: { averageScore: 0.80 },
              edge_cases: { averageScore: 0.65 }
            },
            detailedMetrics: {
              accuracy: 0.78,
              relevance: 0.85,
              completeness: 0.88,
              clarity: 0.80,
              speed: 0.60
            }
          },
          'graph-rag': {
            overallScore: 0.76,
            categoryPerformance: {
              factual_qa: { averageScore: 0.88 },
              analytical: { averageScore: 0.82 },
              technical: { averageScore: 0.75 },
              business: { averageScore: 0.70 },
              creative: { averageScore: 0.65 },
              edge_cases: { averageScore: 0.70 }
            },
            detailedMetrics: {
              accuracy: 0.85,
              relevance: 0.82,
              completeness: 0.78,
              clarity: 0.75,
              speed: 0.65
            }
          },
          'hyde-rag': {
            overallScore: 0.74,
            categoryPerformance: {
              factual_qa: { averageScore: 0.70 },
              analytical: { averageScore: 0.78 },
              technical: { averageScore: 0.72 },
              business: { averageScore: 0.75 },
              creative: { averageScore: 0.82 },
              edge_cases: { averageScore: 0.68 }
            },
            detailedMetrics: {
              accuracy: 0.72,
              relevance: 0.78,
              completeness: 0.75,
              clarity: 0.76,
              speed: 0.75
            }
          },
          'corrective-rag': {
            overallScore: 0.80,
            categoryPerformance: {
              factual_qa: { averageScore: 0.90 },
              analytical: { averageScore: 0.78 },
              technical: { averageScore: 0.75 },
              business: { averageScore: 0.82 },
              creative: { averageScore: 0.68 },
              edge_cases: { averageScore: 0.85 }
            },
            detailedMetrics: {
              accuracy: 0.88,
              relevance: 0.80,
              completeness: 0.78,
              clarity: 0.82,
              speed: 0.55
            }
          }
        }
      }
    };
  }

  // Analyze query and recommend best RAG system
  async recommendRAG(query, requirements = {}) {
    const analysis = this.scenarioClassifier.analyzeQuery(query);
    const recommendations = this.generateRecommendations(analysis, requirements);
    
    return {
      query,
      analysis,
      recommendations,
      timestamp: new Date().toISOString()
    };
  }

  generateRecommendations(analysis, requirements) {
    const rankings = this.performanceData.analysis.ragRankings;
    const scenarios = [];

    // Score each RAG system based on the query analysis
    const ragScores = {};

    Object.entries(rankings).forEach(([ragType, performance]) => {
      let score = 0;
      let explanation = [];

      // Category-based scoring
      Object.entries(analysis.categories).forEach(([category, confidence]) => {
        const categoryPerf = performance.categoryPerformance[category]?.averageScore || 0.5;
        const weightedScore = categoryPerf * confidence;
        score += weightedScore;
        
        if (confidence > 0.3) {
          explanation.push(`${category.replace('_', ' ')}: ${(categoryPerf * 100).toFixed(1)}%`);
        }
      });

      // Requirements-based adjustments
      if (requirements.prioritizeAccuracy && performance.detailedMetrics.accuracy > 0.8) {
        score += 0.15;
        explanation.push('High accuracy match');
      }

      if (requirements.prioritizeSpeed && performance.detailedMetrics.speed > 0.7) {
        score += 0.10;
        explanation.push('Fast response time');
      }

      if (requirements.prioritizeCompleteness && performance.detailedMetrics.completeness > 0.8) {
        score += 0.10;
        explanation.push('Comprehensive responses');
      }

      // Complexity adjustments
      if (analysis.complexity === 'high' && ragType === 'agentic-rag') {
        score += 0.10;
        explanation.push('Excellent for complex queries');
      }

      if (analysis.complexity === 'low' && performance.detailedMetrics.speed > 0.7) {
        score += 0.05;
        explanation.push('Efficient for simple queries');
      }

      ragScores[ragType] = {
        score,
        explanation,
        performance: performance.detailedMetrics,
        categoryFit: this.calculateCategoryFit(analysis.categories, performance.categoryPerformance)
      };
    });

    // Sort by score
    const sortedRecommendations = Object.entries(ragScores)
      .sort(([,a], [,b]) => b.score - a.score)
      .map(([ragType, data], index) => ({
        rank: index + 1,
        ragType,
        confidence: Math.min(data.score, 1.0),
        ...data
      }));

    return {
      primary: sortedRecommendations[0],
      alternatives: sortedRecommendations.slice(1, 3),
      all: sortedRecommendations,
      reasoning: this.generateReasoningExplanation(analysis, sortedRecommendations[0])
    };
  }

  calculateCategoryFit(queryCategories, ragCategoryPerformance) {
    let totalFit = 0;
    let totalWeight = 0;

    Object.entries(queryCategories).forEach(([category, confidence]) => {
      const performance = ragCategoryPerformance[category]?.averageScore || 0.5;
      totalFit += performance * confidence;
      totalWeight += confidence;
    });

    return totalWeight > 0 ? totalFit / totalWeight : 0.5;
  }

  generateReasoningExplanation(analysis, primaryRecommendation) {
    const reasons = [];

    // Primary category reasoning
    const topCategory = Object.entries(analysis.categories)
      .sort(([,a], [,b]) => b - a)[0];
    
    if (topCategory && topCategory[1] > 0.4) {
      reasons.push(`Query classified as "${topCategory[0].replace('_', ' ')}" with ${(topCategory[1] * 100).toFixed(0)}% confidence`);
    }

    // Complexity reasoning
    if (analysis.complexity === 'high') {
      reasons.push('Complex query requiring advanced reasoning capabilities');
    } else if (analysis.complexity === 'low') {
      reasons.push('Straightforward query allowing for faster response times');
    }

    // Performance reasoning
    const perf = primaryRecommendation.performance;
    if (perf.accuracy > 0.8) {
      reasons.push('High accuracy performance for factual correctness');
    }
    if (perf.completeness > 0.8) {
      reasons.push('Comprehensive responses covering all aspects');
    }

    return reasons;
  }

  // Batch recommendation for multiple queries
  async batchRecommend(queries, requirements = {}) {
    const results = [];
    
    for (const query of queries) {
      const recommendation = await this.recommendRAG(query, requirements);
      results.push(recommendation);
    }

    // Generate batch insights
    const batchInsights = this.generateBatchInsights(results);
    
    return {
      individual: results,
      insights: batchInsights,
      summary: {
        totalQueries: queries.length,
        primaryRecommendations: this.getRecommendationDistribution(results),
        avgConfidence: results.reduce((sum, r) => sum + r.recommendations.primary.confidence, 0) / results.length
      }
    };
  }

  generateBatchInsights(results) {
    const insights = [];
    
    // Most recommended RAG
    const recommendations = results.map(r => r.recommendations.primary.ragType);
    const ragCounts = recommendations.reduce((acc, rag) => {
      acc[rag] = (acc[rag] || 0) + 1;
      return acc;
    }, {});
    
    const mostRecommended = Object.entries(ragCounts)
      .sort(([,a], [,b]) => b - a)[0];
    
    insights.push(`Most recommended: ${mostRecommended[0]} (${mostRecommended[1]}/${results.length} queries)`);
    
    // Category distribution
    const categories = results.flatMap(r => Object.keys(r.analysis.categories));
    const uniqueCategories = [...new Set(categories)];
    insights.push(`Query types identified: ${uniqueCategories.join(', ')}`);
    
    // Confidence analysis
    const highConfidenceCount = results.filter(r => r.recommendations.primary.confidence > 0.8).length;
    insights.push(`High confidence recommendations: ${highConfidenceCount}/${results.length}`);
    
    return insights;
  }

  getRecommendationDistribution(results) {
    return results.reduce((acc, result) => {
      const rag = result.recommendations.primary.ragType;
      acc[rag] = (acc[rag] || 0) + 1;
      return acc;
    }, {});
  }

  // Generate configuration recommendations
  generateConfigRecommendations(ragType, analysis) {
    const configs = {
      'self-rag': {
        max_iterations: analysis.complexity === 'high' ? 3 : 2,
        confidence_threshold: analysis.categories.factual_qa > 0.5 ? 0.85 : 0.75
      },
      'agentic-rag': {
        enable_tools: true,
        max_plan_steps: analysis.complexity === 'high' ? 5 : 3
      },
      'graph-rag': {
        graph_depth: analysis.complexity === 'high' ? 3 : 2,
        entity_threshold: 0.7
      },
      'hyde-rag': {
        generation_style: analysis.categories.creative > 0.5 ? 'creative' : 'comprehensive',
        num_hypothetical: analysis.complexity === 'high' ? 4 : 2
      },
      'corrective-rag': {
        max_corrections: analysis.categories.factual_qa > 0.5 ? 3 : 2,
        validation_threshold: 0.8
      }
    };

    return configs[ragType] || {};
  }
}

// Query analysis and classification
class ScenarioClassifier {
  constructor() {
    this.patterns = this.initializePatterns();
  }

  initializePatterns() {
    return {
      factual_qa: {
        keywords: ['what is', 'define', 'explain', 'who is', 'when did', 'where is', 'how many'],
        patterns: [/what is/i, /define/i, /explain.*?concept/i, /tell me about/i],
        weight: 1.0
      },
      analytical: {
        keywords: ['compare', 'contrast', 'analyze', 'evaluate', 'assess', 'pros and cons', 'advantages', 'disadvantages'],
        patterns: [/compare.*?with/i, /advantages.*?disadvantages/i, /analyze/i, /evaluate/i],
        weight: 1.2
      },
      technical: {
        keywords: ['implement', 'deploy', 'configure', 'setup', 'install', 'code', 'programming', 'algorithm'],
        patterns: [/how to implement/i, /deploy/i, /configure/i, /technical/i],
        weight: 1.1
      },
      business: {
        keywords: ['roi', 'business', 'strategy', 'market', 'customer', 'revenue', 'cost', 'profit'],
        patterns: [/business.*?strategy/i, /roi/i, /market/i, /customer/i],
        weight: 1.0
      },
      creative: {
        keywords: ['design', 'create', 'innovative', 'brainstorm', 'ideas', 'creative', 'imagine'],
        patterns: [/design.*?solution/i, /creative.*?approach/i, /innovative/i, /brainstorm/i],
        weight: 0.9
      },
      edge_cases: {
        keywords: ['edge case', 'error', 'problem', 'issue', 'bug', 'troubleshoot'],
        patterns: [/edge case/i, /error/i, /problem.*?with/i, /troubleshoot/i],
        weight: 0.8
      }
    };
  }

  analyzeQuery(query) {
    const queryLower = query.toLowerCase();
    const wordCount = query.split(' ').length;
    
    // Category classification
    const categories = {};
    
    Object.entries(this.patterns).forEach(([category, data]) => {
      let score = 0;
      
      // Keyword matching
      const keywordMatches = data.keywords.filter(keyword => 
        queryLower.includes(keyword)
      ).length;
      score += keywordMatches * 0.3;
      
      // Pattern matching
      const patternMatches = data.patterns.filter(pattern => 
        pattern.test(query)
      ).length;
      score += patternMatches * 0.5;
      
      // Apply category weight
      score *= data.weight;
      
      categories[category] = Math.min(score, 1.0);
    });

    // Complexity analysis
    const complexity = this.assessComplexity(query, categories);
    
    // Intent analysis
    const intent = this.identifyIntent(query);
    
    // Confidence scoring
    const totalCategoryScore = Object.values(categories).reduce((a, b) => a + b, 0);
    const confidence = Math.min(totalCategoryScore / 2, 1.0);

    return {
      categories,
      complexity,
      intent,
      confidence,
      wordCount,
      characteristics: this.identifyCharacteristics(query)
    };
  }

  assessComplexity(query, categories) {
    const wordCount = query.split(' ').length;
    const analyticalScore = categories.analytical || 0;
    const technicalScore = categories.technical || 0;
    
    if (wordCount > 30 || analyticalScore > 0.7 || technicalScore > 0.8) {
      return 'high';
    } else if (wordCount > 15 || analyticalScore > 0.4 || technicalScore > 0.5) {
      return 'medium';
    }
    return 'low';
  }

  identifyIntent(query) {
    const queryLower = query.toLowerCase();
    
    if (queryLower.includes('how to') || queryLower.includes('step by step')) {
      return 'instructional';
    } else if (queryLower.includes('what is') || queryLower.includes('define')) {
      return 'definitional';
    } else if (queryLower.includes('compare') || queryLower.includes('vs')) {
      return 'comparative';
    } else if (queryLower.includes('why') || queryLower.includes('reason')) {
      return 'explanatory';
    } else if (queryLower.includes('best') || queryLower.includes('recommend')) {
      return 'recommendation';
    }
    return 'general';
  }

  identifyCharacteristics(query) {
    const characteristics = [];
    
    if (query.length > 200) characteristics.push('long_query');
    if (query.includes('?')) characteristics.push('question_format');
    if (/[A-Z]{2,}/.test(query)) characteristics.push('contains_acronyms');
    if (/\d+/.test(query)) characteristics.push('contains_numbers');
    if (/[!@#$%^&*(),.?":{}|<>]/.test(query)) characteristics.push('complex_punctuation');
    
    return characteristics;
  }
}

// Export the classes
module.exports = { RAGRecommendationEngine, ScenarioClassifier };

// CLI interface for testing
if (require.main === module) {
  const { RAGRecommendationEngine } = require('./rag-recommendation');
  
  async function testRecommendations() {
    const engine = new RAGRecommendationEngine();
    
    const testQueries = [
      "What is machine learning and how does it work?",
      "Compare the advantages and disadvantages of SQL vs NoSQL databases for a high-traffic web application",
      "How do I implement a distributed caching system for microservices?",
      "What are the ROI considerations for implementing AI chatbots in customer service?",
      "Design an innovative solution for reducing food waste in urban areas",
      "How do you optimize?"
    ];

    console.log('🤖 RAG RECOMMENDATION ENGINE TEST');
    console.log('=' .repeat(60));

    for (const query of testQueries) {
      console.log(`\n🔍 Query: "${query}"`);
      console.log('-' .repeat(40));
      
      const result = await engine.recommendRAG(query, {
        prioritizeAccuracy: true,
        prioritizeSpeed: false
      });
      
      console.log(`📊 Analysis:`);
      console.log(`   Complexity: ${result.analysis.complexity}`);
      console.log(`   Intent: ${result.analysis.intent}`);
      console.log(`   Top Categories: ${Object.entries(result.analysis.categories)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 2)
        .map(([cat, score]) => `${cat}(${(score*100).toFixed(0)}%)`)
        .join(', ')}`);
      
      console.log(`🏆 Recommendation: ${result.recommendations.primary.ragType}`);
      console.log(`   Confidence: ${(result.recommendations.primary.confidence * 100).toFixed(1)}%`);
      console.log(`   Reasoning: ${result.recommendations.reasoning.slice(0, 2).join('; ')}`);
      
      console.log(`🥈 Alternatives: ${result.recommendations.alternatives
        .map(alt => `${alt.ragType}(${(alt.confidence*100).toFixed(0)}%)`)
        .join(', ')}`);
    }

    // Batch test
    console.log('\n📦 BATCH RECOMMENDATION TEST');
    console.log('=' .repeat(60));
    
    const batchResult = await engine.batchRecommend(testQueries.slice(0, 3));
    
    console.log(`📈 Batch Summary:`);
    console.log(`   Total Queries: ${batchResult.summary.totalQueries}`);
    console.log(`   Avg Confidence: ${(batchResult.summary.avgConfidence * 100).toFixed(1)}%`);
    console.log(`   Recommendations: ${Object.entries(batchResult.summary.primaryRecommendations)
      .map(([rag, count]) => `${rag}(${count})`)
      .join(', ')}`);
    
    console.log(`💡 Insights:`);
    batchResult.insights.forEach(insight => {
      console.log(`   • ${insight}`);
    });
  }

  testRecommendations().catch(console.error);
}
