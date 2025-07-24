"use client";
import Navigation from "../components/Navigation";
import AgentManager from "../components/AgentManager";
import FileUpload from "../components/FileUpload";
import AgentSettingsManager from "../components/AgentSettingsManager";
import GeneralSettingsSection from "../components/dashboard/GeneralSettingsSection";
import KnowledgeBaseSection from "../components/dashboard/KnowledgeBaseSection";
import AgentBehaviorSection from "../components/dashboard/AgentBehaviorSection";
import ChannelsSection from "../components/dashboard/ChannelsSection";
import AnalyticsSection from "../components/dashboard/AnalyticsSection";
import VersioningSection from "../components/dashboard/VersioningSection";
import { useState } from "react";

export default function Dashboard() {
  const [activeSection, setActiveSection] = useState<string>("overview");
  const [selectedAgentId, setSelectedAgentId] = useState<number | null>(null);

  const sidebarLinks = [
    { key: "overview", label: "Overview" },
    { key: "general", label: "General Settings" },
    { key: "knowledge", label: "Knowledge Base/Data Sources" },
    { key: "behavior", label: "Agent Behavior/Flows" },
    { key: "channels", label: "Channels & Deployment" },
    { key: "analytics", label: "Analytics & Monitoring" },
    { key: "versioning", label: "Versioning & Collaboration" },
  ];

  // Handle agent selection from overview
  const handleAgentSelect = (agentId: string | null) => {
    setSelectedAgentId(agentId ? Number(agentId) : null);
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc" }}>
      <Navigation />
      <div style={{ display: "flex", minHeight: "calc(100vh - 70px)" }}>
        {/* Sidebar Navigation */}
        <aside style={{ width: 260, background: "#f8fafc", borderRight: "1.5px solid #e2e8f0", padding: "2rem 1.5rem", display: "flex", flexDirection: "column", gap: 16 }}>
        <div style={{ fontWeight: 800, fontSize: 24, marginBottom: 32, color: "#181e2a" }}>Agentic AI</div>
        {sidebarLinks.map(link => (
          <button
            key={link.key}
            onClick={() => setActiveSection(link.key)}
            style={{
              background: activeSection === link.key ? "#e0e7ef" : "transparent",
              color: activeSection === link.key ? "#1e293b" : "#64748b",
              fontWeight: 600,
              borderRadius: 8,
              padding: "10px 16px",
              marginBottom: 8,
              textAlign: "left",
              border: "none",
              cursor: "pointer",
              transition: "background 0.2s, color 0.2s"
            }}
          >
            {link.label}
          </button>
        ))}
      </aside>
      {/* Main Content */}
      <main style={{ flex: 1, background: "#f1f5f9", padding: "2.5rem 2rem" }}>
        {activeSection === "overview" && <AgentManager onSelect={handleAgentSelect} />}
        {activeSection === "general" && <GeneralSettingsSection selectedAgentId={selectedAgentId} />}
        {activeSection === "knowledge" && <KnowledgeBaseSection selectedAgentId={selectedAgentId} />}
        {activeSection === "behavior" && <AgentBehaviorSection selectedAgentId={selectedAgentId} />}
        {activeSection === "channels" && <ChannelsSection selectedAgentId={selectedAgentId} />}
        {activeSection === "analytics" && <AnalyticsSection selectedAgentId={selectedAgentId} />}
        {activeSection === "versioning" && <VersioningSection selectedAgentId={selectedAgentId} />}
      </main>
      </div>
    </div>
  );
}
