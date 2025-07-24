
import React from "react";

const ChannelsSection: React.FC = () => {
  return (
    <section className="p-6">
      <h2 className="text-2xl font-bold mb-4">Channels & Deployment</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded shadow p-6 mb-6">
          <h3 className="font-semibold mb-2">Integration Options</h3>
          <p className="text-gray-500 text-sm mb-2">Embed, WhatsApp, Slack, etc. (UI stub)</p>
          <div className="border rounded p-4 text-gray-400 text-center">Integration UI coming soon.</div>
        </div>
        <div className="bg-white rounded shadow p-6 mb-6">
          <h3 className="font-semibold mb-2">Webhooks</h3>
          <p className="text-gray-500 text-sm mb-2">Manage webhooks for events (UI stub)</p>
          <div className="border rounded p-4 text-gray-400 text-center">Webhooks UI coming soon.</div>
        </div>
        <div className="bg-white rounded shadow p-6 mb-6">
          <h3 className="font-semibold mb-2">Testing Environment</h3>
          <p className="text-gray-500 text-sm mb-2">Test agent integrations (UI stub)</p>
          <div className="border rounded p-4 text-gray-400 text-center">Testing UI coming soon.</div>
        </div>
        <div className="bg-white rounded shadow p-6 mb-6">
          <h3 className="font-semibold mb-2">Deployment Status</h3>
          <p className="text-gray-500 text-sm mb-2">View deployment status (UI stub)</p>
          <div className="border rounded p-4 text-gray-400 text-center">Deployment status UI coming soon.</div>
        </div>
      </div>
    </section>
  );
};

export default ChannelsSection;
