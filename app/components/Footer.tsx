"use client";
import Link from 'next/link';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="modern-footer">
      <div className="footer-container">
        <div className="footer-content">
          {/* Brand Section */}
          <div className="footer-brand">
            <h3 className="footer-brand-title">
              Agentic<span className="footer-brand-accent">AI</span>
            </h3>
            <p className="footer-brand-subtitle">
              Intelligent automation at your fingertips
            </p>
          </div>

          {/* Quick Links */}
          <div className="footer-section">
            <h4 className="footer-section-title">Quick Links</h4>
            <ul className="footer-links">
              <li><Link href="/agents" className="footer-link">My Agents</Link></li>
              <li><Link href="/create-agent" className="footer-link">Create Agent</Link></li>
              <li><Link href="/dashboard" className="footer-link">Dashboard</Link></li>
            </ul>
          </div>

          {/* Resources */}
          <div className="footer-section">
            <h4 className="footer-section-title">Resources</h4>
            <ul className="footer-links">
              <li><Link href="/about" className="footer-link">About</Link></li>
              <li><Link href="/contact" className="footer-link">Contact</Link></li>
              <li><a href="https://github.com/kulbirminhas-aiinitiative/agentic-ai" className="footer-link" target="_blank" rel="noopener noreferrer">GitHub</a></li>
            </ul>
          </div>

          {/* System Status */}
          <div className="footer-section">
            <h4 className="footer-section-title">System</h4>
            <div className="footer-status">
              <div className="status-indicator">
                <span className="status-dot active"></span>
                <span className="status-text">All Systems Operational</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="footer-bottom">
          <div className="footer-bottom-content">
            <p className="footer-copyright">
              © 2025 AgenticAI. Powered by intelligent automation.
            </p>
            <div className="footer-meta">
              <span className="footer-version">v1.0.0</span>
              <span className="footer-separator">•</span>
              <span className="footer-uptime">99.2% Uptime</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
