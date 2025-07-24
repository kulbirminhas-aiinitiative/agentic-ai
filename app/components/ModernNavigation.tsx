// Fine Thought Inspired Navigation Component
"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import './ModernNavigation.css';

const ModernNavigation = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { data: session, status } = useSession();

  const navigationItems = [
    { label: 'Home', href: '/', icon: '◯' },
    { label: 'My Agents', href: '/agents', icon: '◎' },
    { label: 'Dashboard', href: '/dashboard', icon: '◐' },
    { label: 'Create Agent', href: '/create-agent', icon: '◑' },
    { label: 'Chat', href: '/chat', icon: '◒' },
    { label: 'About', href: '/about', icon: '◓' },
  ];

  return (
    <nav className="modern-nav">
      <div className="nav-container">
        {/* Logo/Brand */}
        <div className="nav-brand">
          <h1 className="brand-title">
            Agentic<span className="brand-accent">AI</span>
          </h1>
          <p className="brand-subtitle">intelligent automation</p>
        </div>

        {/* Desktop Navigation */}
        <div className="nav-menu">
          {navigationItems.map((item, index) => (
            <Link 
              key={index} 
              href={item.href} 
              className="nav-item"
              data-icon={item.icon}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
              <span className="nav-underline"></span>
            </Link>
          ))}
        </div>

        {/* Mobile Menu Toggle */}
        <button 
          className={`mobile-toggle ${isMenuOpen ? 'active' : ''}`}
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

        {/* Contact CTA */}
        <div className="nav-cta">
          <Link href="/contact" className="contact-btn">
            Contact AI
          </Link>
          
          {/* Authentication Section */}
          <div className="auth-section">
            {status === "loading" ? (
              <div className="auth-loading">...</div>
            ) : session ? (
              <div className="user-profile">
                <div className="user-info">
                  {session.user?.image && (
                    <img 
                      src={session.user.image} 
                      alt="Profile" 
                      className="user-avatar"
                    />
                  )}
                  <span className="user-name">
                    {session.user?.name || session.user?.email}
                  </span>
                </div>
                <button 
                  onClick={() => signOut()}
                  className="logout-btn"
                  title="Sign Out"
                >
                  ⏻
                </button>
              </div>
            ) : (
              <Link href="/login" className="login-btn">
                <span className="login-icon">→</span>
                <span className="login-text">Login</span>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div className={`mobile-menu ${isMenuOpen ? 'open' : ''}`}>
        {navigationItems.map((item, index) => (
          <Link 
            key={index} 
            href={item.href} 
            className="mobile-nav-item"
            onClick={() => setIsMenuOpen(false)}
          >
            <span className="mobile-nav-icon">{item.icon}</span>
            <span className="mobile-nav-label">{item.label}</span>
          </Link>
        ))}
        <Link href="/contact" className="mobile-contact-btn">
          Contact AI
        </Link>
        
        {/* Mobile Authentication */}
        <div className="mobile-auth">
          {status === "loading" ? (
            <div className="mobile-auth-loading">Loading...</div>
          ) : session ? (
            <div className="mobile-user-profile">
              <div className="mobile-user-info">
                {session.user?.image && (
                  <img 
                    src={session.user.image} 
                    alt="Profile" 
                    className="mobile-user-avatar"
                  />
                )}
                <span className="mobile-user-name">
                  {session.user?.name || session.user?.email}
                </span>
              </div>
              <button 
                onClick={() => signOut()}
                className="mobile-logout-btn"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <Link 
              href="/login" 
              className="mobile-login-btn"
              onClick={() => setIsMenuOpen(false)}
            >
              <span className="mobile-login-icon">→</span>
              <span className="mobile-login-text">Login</span>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default ModernNavigation;
