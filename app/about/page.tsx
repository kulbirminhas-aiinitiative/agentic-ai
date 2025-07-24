"use client";
import Navigation from "../components/Navigation";

export default function About() {
  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc" }}>
      <Navigation />
      <main style={{ padding: "4rem 3rem", maxWidth: "1200px", margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: "4rem" }}>
          <h1 style={{ fontSize: "3rem", fontWeight: 800, color: "#181e2a", marginBottom: "1rem" }}>
            About Agentic AI
          </h1>
          <p style={{ fontSize: "1.25rem", color: "#64748b", maxWidth: "600px", margin: "0 auto" }}>
            Empowering businesses to build, manage, and deploy intelligent AI agents with ease.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "2rem", marginBottom: "4rem" }}>
          <div style={{ background: "#fff", padding: "2rem", borderRadius: "12px", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)" }}>
            <h3 style={{ fontSize: "1.5rem", fontWeight: 700, color: "#181e2a", marginBottom: "1rem" }}>Our Mission</h3>
            <p style={{ color: "#64748b", lineHeight: 1.6 }}>
              To democratize AI technology by making it accessible for businesses of all sizes to create intelligent, 
              conversational agents that enhance customer experiences and streamline operations.
            </p>
          </div>

          <div style={{ background: "#fff", padding: "2rem", borderRadius: "12px", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)" }}>
            <h3 style={{ fontSize: "1.5rem", fontWeight: 700, color: "#181e2a", marginBottom: "1rem" }}>Our Vision</h3>
            <p style={{ color: "#64748b", lineHeight: 1.6 }}>
              A world where every business can leverage the power of AI agents to provide exceptional customer service, 
              automate workflows, and drive innovation across multiple channels.
            </p>
          </div>

          <div style={{ background: "#fff", padding: "2rem", borderRadius: "12px", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)" }}>
            <h3 style={{ fontSize: "1.5rem", fontWeight: 700, color: "#181e2a", marginBottom: "1rem" }}>What We Do</h3>
            <p style={{ color: "#64748b", lineHeight: 1.6 }}>
              We provide a comprehensive platform for building, training, and deploying AI agents across multiple channels 
              including email, chat, social media, and custom integrations.
            </p>
          </div>
        </div>

        <div style={{ background: "#fff", padding: "3rem", borderRadius: "12px", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)", marginBottom: "4rem" }}>
          <h2 style={{ fontSize: "2rem", fontWeight: 700, color: "#181e2a", marginBottom: "2rem", textAlign: "center" }}>
            Key Features
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "2rem" }}>
            <div>
              <h4 style={{ fontSize: "1.25rem", fontWeight: 600, color: "#181e2a", marginBottom: "0.5rem" }}>🤖 Intelligent Agents</h4>
              <p style={{ color: "#64748b" }}>Create sophisticated AI agents powered by advanced language models</p>
            </div>
            <div>
              <h4 style={{ fontSize: "1.25rem", fontWeight: 600, color: "#181e2a", marginBottom: "0.5rem" }}>📚 Knowledge Base</h4>
              <p style={{ color: "#64748b" }}>Upload documents, connect databases, and integrate APIs for rich context</p>
            </div>
            <div>
              <h4 style={{ fontSize: "1.25rem", fontWeight: 600, color: "#181e2a", marginBottom: "0.5rem" }}>🔗 Multi-Channel</h4>
              <p style={{ color: "#64748b" }}>Deploy across email, chat, social media, and custom platforms</p>
            </div>
            <div>
              <h4 style={{ fontSize: "1.25rem", fontWeight: 600, color: "#181e2a", marginBottom: "0.5rem" }}>📊 Analytics</h4>
              <p style={{ color: "#64748b" }}>Monitor performance, track costs, and analyze user interactions</p>
            </div>
          </div>
        </div>

        <div style={{ textAlign: "center" }}>
          <h2 style={{ fontSize: "2rem", fontWeight: 700, color: "#181e2a", marginBottom: "2rem" }}>
            Ready to Get Started?
          </h2>
          <p style={{ fontSize: "1.125rem", color: "#64748b", marginBottom: "2rem" }}>
            Join thousands of businesses already using Agentic AI to transform their customer interactions.
          </p>
          <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
            <button style={{
              background: "#38bdf8",
              color: "#fff",
              fontWeight: 700,
              fontSize: "1.125rem",
              border: "none",
              borderRadius: "8px",
              padding: "12px 24px",
              cursor: "pointer",
              boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)"
            }}>
              Start Free Trial
            </button>
            <button style={{
              background: "transparent",
              color: "#38bdf8",
              fontWeight: 700,
              fontSize: "1.125rem",
              border: "2px solid #38bdf8",
              borderRadius: "8px",
              padding: "12px 24px",
              cursor: "pointer"
            }}>
              Contact Sales
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}