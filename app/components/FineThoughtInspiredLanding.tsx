// Modern Landing Page inspired by Fine Thought design
"use client";
import React from 'react';
import Link from 'next/link';
import ModernNavigation from './ModernNavigation';
import './FineThoughtInspiredLanding.css';

const FineThoughtInspiredLanding = () => {
  return (
    <div className="finethought-container">
      {/* Modern Navigation */}
      <ModernNavigation />
      
      {/* Header Section */}
      <header className="header">
        <div className="header-content">
          <div className="title-section">
            <h1 className="main-title">
              AI Agent<br/>
              <span className="highlight">&amp; automation</span>
            </h1>
            <h2 className="brand-name">AgenticAI</h2>
            <p className="description">
              The intelligent persona<br/>
              of advanced AI agents,<br/>
              an automation technologist &amp;<br/>
              RAG-powered system<br/>
              based in the cloud
            </p>
          </div>
          
          <div className="profile-section">
            <div className="profile-image">
              <div className="ai-avatar">
                <div className="neural-network"></div>
              </div>
            </div>
            <Link href="/dashboard" className="view-profile-btn">View agents</Link>
          </div>
        </div>
        
        <div className="status-text">
          I am currently working<br/>
          alongside developers from<br/>
          all over the world in a<br/>
          collaborative capacity.
        </div>
        
        <div className="partnership-text">
          Seeking to partner with<br/>
          teams and organizations<br/>
          on an ongoing basis.
        </div>
      </header>

      {/* Projects Grid */}
      <section className="projects-grid">
        <div className="project-numbers">
          <span>01</span>
          <span>02</span>
          <span>03</span>
          <span>04</span>
        </div>
        
        <div className="project-links">
          <a href="/agent/customer-service" className="project-link">View Customer Service Agent</a>
          <a href="/agent/data-analysis" className="project-link">View Data Analysis Agent</a>
          <a href="/agent/content-creation" className="project-link">View Content Creation Agent</a>
          <a href="/agent/automation" className="project-link">View Process Automation Agent</a>
          <a href="/agent/research" className="project-link">View Research Agent</a>
          <a href="/agent/coding" className="project-link">View Coding Assistant Agent</a>
          <a href="/agent/support" className="project-link">View Technical Support Agent</a>
          <a href="/agent/analytics" className="project-link">View Analytics Agent</a>
          <a href="/agent/monitoring" className="project-link">View System Monitoring Agent</a>
          <a href="/agent/optimization" className="project-link">View Performance Optimization Agent</a>
          <a href="/agent/security" className="project-link">View Security Agent</a>
        </div>
      </section>

      {/* Creative ASCII Art Section */}
      <section className="ascii-section">
        <div className="ascii-art">
          <pre>{`
   ╭─────────────────────────────────────────╮
   │  ◯ ◯ ◯    A G E N T I C   A I    ◯ ◯ ◯  │
   ├─────────────────────────────────────────┤
   │  ┌─┐ ┌─┐ ┌─┐ ┌─┐ ┌─┐ ┌─┐ ┌─┐ ┌─┐ ┌─┐  │
   │  │1│ │2│ │3│ │4│ │5│ │6│ │7│ │8│ │9│  │
   │  └─┘ └─┘ └─┘ └─┘ └─┘ └─┘ └─┘ └─┘ └─┘  │
   ╰─────────────────────────────────────────╯
          `}</pre>
        </div>
        
        <div className="number-sequence">
          {Array.from({length: 169}, (_, i) => (
            <span key={i} className="sequence-number">{i + 1}</span>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-title">
          <h3>AI Agent<br/><span className="highlight">&amp; automation</span></h3>
        </div>
      </footer>
    </div>
  );
};

export default FineThoughtInspiredLanding;
