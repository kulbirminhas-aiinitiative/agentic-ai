"use client";
import AgentSettingsManager from "../../components/AgentSettingsManager";

export default function GeneralSettingsPage() {
  return (
    <div style={{ maxWidth: 700, margin: "40px auto", background: "#fff", borderRadius: 12, boxShadow: "0 4px 24px #0001", padding: 32 }}>
      <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 24 }}>General Settings</h1>
      <AgentSettingsManager />
    </div>
  );
}
