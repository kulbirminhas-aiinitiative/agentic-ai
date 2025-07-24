"use client";
import React, { useState, useEffect } from 'react';
import './rag-demo.css';

// RAG Architecture types and configurations
const RAG_ARCHITECTURES = {
  'self-rag': {
    name: 'Self-RAG',
    description: 'Self-evaluating RAG with iterative improvement',
    icon: '🧠',
    color: '#6366f1',
    features: ['Self-evaluation', 'Iterative refinement', 'Quality scoring'],
    bestFor: 'High-accuracy requirements, fact-checking',
    defaultParams: {
      max_iterations: 3,
      confidence_threshold: 0.8
    }
  },
  'agentic-rag': {
    name: 'Agentic RAG',
    description: 'Planning-based RAG with tool integration',
    icon: '🤖',
    color: '#10b981',
    features: ['Multi-step planning', 'Tool integration', 'External data access'],
    bestFor: 'Complex queries requiring calculations and external data',
    defaultParams: {
      enable_tools: true,
      max_plan_steps: 5
    }
  },
  'graph-rag': {
    name: 'Graph RAG',
    description: 'Knowledge graph-enhanced retrieval',
    icon: '🕸️',
    color: '#f59e0b',
    features: ['Entity extraction', 'Relationship modeling', 'Graph traversal'],
    bestFor: 'Complex domains with interconnected concepts',
    defaultParams: {
      graph_depth: 2,
      entity_threshold: 0.7
    }
  },
  'hyde-rag': {
    name: 'HyDE RAG',
    description: 'Hypothetical Document Embedding RAG',
    icon: '📝',
    color: '#ec4899',
    features: ['Hypothetical generation', 'Ensemble retrieval', 'Semantic enhancement'],
    bestFor: 'Ambiguous queries, improved retrieval precision',
    defaultParams: {
      generation_style: 'comprehensive',
      num_hypothetical: 3
    }
  },
  'corrective-rag': {
    name: 'Corrective RAG',
    description: 'Error-detecting RAG with automated corrections',
    icon: '🔍',
    color: '#ef4444',
    features: ['Error detection', 'Source validation', 'Iterative correction'],
    bestFor: 'High-stakes applications requiring validated responses',
    defaultParams: {
      max_corrections: 3,
      validation_threshold: 0.8
    }
  }
};

// Sample queries for different domains
const SAMPLE_QUERIES = {
  technical: [
    "What are the key differences between supervised and unsupervised machine learning?",
    "How do transformer architectures work in natural language processing?",
    "Explain the concept of gradient descent in neural network training."
  ],
  business: [
    "What are the benefits of implementing AI chatbots for customer service?",
    "How can companies measure ROI from AI implementations?",
    "What are the key considerations for AI adoption in healthcare?"
  ],
  research: [
    "Compare different vector databases for similarity search applications.",
    "What are the latest developments in large language model architectures?",
    "Explain the principles behind retrieval-augmented generation systems."
  ]
};

export default function RAGDemo() {
  const [selectedRAG, setSelectedRAG] = useState('self-rag');
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const [comparisonMode, setComparisonMode] = useState(false);
  const [selectedRAGTypes, setSelectedRAGTypes] = useState(['self-rag', 'graph-rag']);

  // API base URL
  const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

  // Handle single RAG query
  const handleSingleQuery = async () => {
    if (!query.trim()) {
      setError('Please enter a query');
      return;
    }

    setIsLoading(true);
    setError(null);
    setResults(null);

    try {
      const ragConfig = RAG_ARCHITECTURES[selectedRAG];
      const requestBody = {
        query: query.trim(),
        ...ragConfig.defaultParams
      };

      const response = await fetch(`${API_BASE}/rag/${selectedRAG}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setResults(data);

    } catch (err) {
      console.error('RAG query error:', err);
      setError(`Failed to process query: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle RAG comparison
  const handleComparison = async () => {
    if (!query.trim()) {
      setError('Please enter a query');
      return;
    }

    if (selectedRAGTypes.length < 2) {
      setError('Please select at least 2 RAG types for comparison');
      return;
    }

    setIsLoading(true);
    setError(null);
    setResults(null);

    try {
      const response = await fetch(`${API_BASE}/rag/compare`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: query.trim(),
          rag_types: selectedRAGTypes
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setResults(data);

    } catch (err) {
      console.error('RAG comparison error:', err);
      setError(`Failed to process comparison: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Load sample query
  const loadSampleQuery = (category, index) => {
    setQuery(SAMPLE_QUERIES[category][index]);
  };

  // Toggle RAG type selection for comparison
  const toggleRAGSelection = (ragType) => {
    setSelectedRAGTypes(prev => {
      if (prev.includes(ragType)) {
        return prev.filter(type => type !== ragType);
      } else {
        return [...prev, ragType];
      }
    });
  };

  return (
    <div className="rag-demo-container">
      <div className="rag-demo-header">
        <h1 className="demo-title">🚀 RAG SYSTEMS DEMO</h1>
        <p className="demo-subtitle">/// ADVANCED_RETRIEVAL_AUGMENTED_GENERATION</p>
        
        <div className="mode-selector">
          <button 
            className={`mode-btn ${!comparisonMode ? 'active' : ''}`}
            onClick={() => setComparisonMode(false)}
          >
            Single RAG
          </button>
          <button 
            className={`mode-btn ${comparisonMode ? 'active' : ''}`}
            onClick={() => setComparisonMode(true)}
          >
            Compare RAGs
          </button>
        </div>
      </div>

      <div className="demo-content">
        {/* Architecture Selection */}
        <div className="architecture-section">
          <h3 className="section-title">SELECT_ARCHITECTURE</h3>
          
          {!comparisonMode ? (
            <div className="architecture-grid">
              {Object.entries(RAG_ARCHITECTURES).map(([key, config]) => (
                <div 
                  key={key}
                  className={`architecture-card ${selectedRAG === key ? 'selected' : ''}`}
                  onClick={() => setSelectedRAG(key)}
                  style={{ '--card-color': config.color }}
                >
                  <div className="card-header">
                    <span className="card-icon">{config.icon}</span>
                    <h4 className="card-title">{config.name}</h4>
                  </div>
                  <p className="card-description">{config.description}</p>
                  <div className="card-features">
                    {config.features.map((feature, idx) => (
                      <span key={idx} className="feature-tag">{feature}</span>
                    ))}
                  </div>
                  <div className="card-best-for">
                    <strong>Best for:</strong> {config.bestFor}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="comparison-selection">
              <p className="selection-instruction">Select multiple RAG types to compare:</p>
              <div className="comparison-grid">
                {Object.entries(RAG_ARCHITECTURES).map(([key, config]) => (
                  <div 
                    key={key}
                    className={`comparison-card ${selectedRAGTypes.includes(key) ? 'selected' : ''}`}
                    onClick={() => toggleRAGSelection(key)}
                  >
                    <span className="card-icon">{config.icon}</span>
                    <span className="card-name">{config.name}</span>
                    {selectedRAGTypes.includes(key) && <span className="selected-indicator">✓</span>}
                  </div>
                ))}
              </div>
              <p className="selected-count">
                Selected: {selectedRAGTypes.length} / {Object.keys(RAG_ARCHITECTURES).length}
              </p>
            </div>
          )}
        </div>

        {/* Sample Queries */}
        <div className="samples-section">
          <h3 className="section-title">SAMPLE_QUERIES</h3>
          <div className="samples-grid">
            {Object.entries(SAMPLE_QUERIES).map(([category, queries]) => (
              <div key={category} className="sample-category">
                <h4 className="category-title">{category.toUpperCase()}</h4>
                {queries.map((sampleQuery, idx) => (
                  <button 
                    key={idx}
                    className="sample-query-btn"
                    onClick={() => loadSampleQuery(category, idx)}
                  >
                    {sampleQuery}
                  </button>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Query Input */}
        <div className="query-section">
          <h3 className="section-title">ENTER_QUERY</h3>
          <div className="query-input-container">
            <textarea
              className="query-input"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Enter your question here..."
              rows={4}
            />
            <div className="query-actions">
              <button 
                className="clear-btn"
                onClick={() => setQuery('')}
                disabled={!query}
              >
                Clear
              </button>
              <button 
                className="execute-btn"
                onClick={comparisonMode ? handleComparison : handleSingleQuery}
                disabled={isLoading || !query.trim()}
              >
                {isLoading ? (
                  <>
                    <span className="loading-spinner"></span>
                    Processing...
                  </>
                ) : comparisonMode ? (
                  <>🔍 Compare RAGs</>
                ) : (
                  <>🚀 Execute Query</>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="error-section">
            <div className="error-message">
              <span className="error-icon">⚠️</span>
              {error}
            </div>
          </div>
        )}

        {/* Results Display */}
        {results && (
          <div className="results-section">
            <h3 className="section-title">RESULTS</h3>
            
            {!comparisonMode ? (
              // Single RAG Results
              <div className="single-result">
                <div className="result-header">
                  <span className="result-icon">{RAG_ARCHITECTURES[selectedRAG].icon}</span>
                  <h4 className="result-title">{RAG_ARCHITECTURES[selectedRAG].name} Response</h4>
                  {results.data?.quality_metrics && (
                    <div className="quality-indicators">
                      {results.data.quality_metrics.final_confidence_score && (
                        <span className="quality-metric">
                          Confidence: {(results.data.quality_metrics.final_confidence_score * 100).toFixed(1)}%
                        </span>
                      )}
                      {results.data.quality_metrics.final_validation_score && (
                        <span className="quality-metric">
                          Validation: {(results.data.quality_metrics.final_validation_score * 100).toFixed(1)}%
                        </span>
                      )}
                    </div>
                  )}
                </div>
                
                <div className="result-content">
                  <div className="response-text">
                    {results.data?.final_response || results.data?.response || 'No response available'}
                  </div>
                  
                  {/* Additional Metrics */}
                  {results.data && (
                    <div className="result-metrics">
                      {results.data.total_iterations && (
                        <div className="metric-item">
                          <strong>Iterations:</strong> {results.data.total_iterations}
                        </div>
                      )}
                      {results.data.tools_used && (
                        <div className="metric-item">
                          <strong>Tools Used:</strong> {results.data.tools_used.join(', ')}
                        </div>
                      )}
                      {results.data.entities_extracted && (
                        <div className="metric-item">
                          <strong>Entities:</strong> {results.data.entities_extracted.slice(0, 5).join(', ')}
                          {results.data.entities_extracted.length > 5 && '...'}
                        </div>
                      )}
                      {results.data.hypothetical_documents && (
                        <div className="metric-item">
                          <strong>Hypothetical Docs:</strong> {results.data.hypothetical_documents.length} generated
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              // Comparison Results
              <div className="comparison-results">
                <div className="comparison-header">
                  <h4 className="comparison-title">RAG Architecture Comparison</h4>
                  <div className="comparison-stats">
                    <span className="stat-item">
                      Architectures: {results.comparison_metrics?.total_architectures || 0}
                    </span>
                    <span className="stat-item">
                      Successful: {results.comparison_metrics?.successful_responses || 0}
                    </span>
                    {results.comparison_metrics?.average_confidence && (
                      <span className="stat-item">
                        Avg Confidence: {(results.comparison_metrics.average_confidence * 100).toFixed(1)}%
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="comparison-grid-results">
                  {Object.entries(results.results || {}).map(([ragType, ragResult]) => (
                    <div key={ragType} className="comparison-result-card">
                      <div className="card-header">
                        <span className="card-icon">{RAG_ARCHITECTURES[ragType]?.icon}</span>
                        <h5 className="card-title">{RAG_ARCHITECTURES[ragType]?.name}</h5>
                        {ragResult.error && <span className="error-indicator">❌</span>}
                      </div>
                      
                      <div className="card-content">
                        {ragResult.error ? (
                          <div className="error-text">Error: {ragResult.error}</div>
                        ) : (
                          <>
                            <div className="response-preview">
                              {(ragResult.final_response || ragResult.response || 'No response').substring(0, 200)}
                              {(ragResult.final_response || ragResult.response || '').length > 200 && '...'}
                            </div>
                            
                            <div className="response-metrics">
                              {ragResult.quality_metrics?.final_confidence_score && (
                                <span className="metric">
                                  Confidence: {(ragResult.quality_metrics.final_confidence_score * 100).toFixed(1)}%
                                </span>
                              )}
                              <span className="metric">
                                Length: {results.comparison_metrics?.response_lengths?.[ragType] || 0} chars
                              </span>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
