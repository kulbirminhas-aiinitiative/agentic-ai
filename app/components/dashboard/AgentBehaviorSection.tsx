
import React from "react";

const AgentBehaviorSection: React.FC = () => {
  return (
    <section style={{ padding: 0 }}>
      <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 24 }}>Agent Behavior / Flows</h2>
      <div style={{ maxWidth: 700, margin: '0 auto', background: '#fff', borderRadius: 10, boxShadow: '0 1px 3px rgba(0,0,0,0.06)', padding: 32, display: 'flex', flexDirection: 'column', gap: 28 }}>
        {/* Intent Management */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
          <label style={{ flex: '0 0 220px', fontWeight: 600, fontSize: 16 }}>Intent Management</label>
          <span style={{ flex: 1, color: '#64748b', fontSize: 15 }}>Define and manage agent intents (UI stub). <span style={{ color: '#a3a3a3', marginLeft: 8 }}>Intent management UI coming soon.</span></span>
        </div>
        {/* Responses / Outputs */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
          <label style={{ flex: '0 0 220px', fontWeight: 600, fontSize: 16 }}>Responses / Outputs</label>
          <span style={{ flex: 1, color: '#64748b', fontSize: 15 }}>Configure agent responses and output templates (UI stub). <span style={{ color: '#a3a3a3', marginLeft: 8 }}>Responses UI coming soon.</span></span>
        </div>
        {/* Actions / Tools */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
          <label style={{ flex: '0 0 220px', fontWeight: 600, fontSize: 16 }}>Actions / Tools</label>
          <span style={{ flex: 1, color: '#64748b', fontSize: 15 }}>Manage agent actions and tool integrations (UI stub). <span style={{ color: '#a3a3a3', marginLeft: 8 }}>Actions/tools UI coming soon.</span></span>
        </div>
        {/* Context Management / Memory */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
          <label style={{ flex: '0 0 220px', fontWeight: 600, fontSize: 16 }}>Context Management / Memory</label>
          <span style={{ flex: 1, color: '#64748b', fontSize: 15 }}>Configure agent memory and context settings (UI stub). <span style={{ color: '#a3a3a3', marginLeft: 8 }}>Context management UI coming soon.</span></span>
        </div>
      </div>
    </section>
  );
};

export default AgentBehaviorSection;
