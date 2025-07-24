
import React from "react";

const AnalyticsSection: React.FC = () => {
  return (
    <section className="p-6">
      <h2 className="text-2xl font-bold mb-4">Analytics & Monitoring</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded shadow p-6 mb-6">
          <h3 className="font-semibold mb-2">Conversation Logs</h3>
          <p className="text-gray-500 text-sm mb-2">View and search conversation logs (UI stub)</p>
          <div className="border rounded p-4 text-gray-400 text-center">Conversation logs UI coming soon.</div>
        </div>
        <div className="bg-white rounded shadow p-6 mb-6">
          <h3 className="font-semibold mb-2">Performance Metrics</h3>
          <p className="text-gray-500 text-sm mb-2">Monitor agent performance (UI stub)</p>
          <div className="border rounded p-4 text-gray-400 text-center">Performance metrics UI coming soon.</div>
        </div>
        <div className="bg-white rounded shadow p-6 mb-6">
          <h3 className="font-semibold mb-2">User Feedback</h3>
          <p className="text-gray-500 text-sm mb-2">Collect and review user feedback (UI stub)</p>
          <div className="border rounded p-4 text-gray-400 text-center">User feedback UI coming soon.</div>
        </div>
        <div className="bg-white rounded shadow p-6 mb-6">
          <h3 className="font-semibold mb-2">Error Reporting</h3>
          <p className="text-gray-500 text-sm mb-2">Track and resolve errors (UI stub)</p>
          <div className="border rounded p-4 text-gray-400 text-center">Error reporting UI coming soon.</div>
        </div>
        <div className="bg-white rounded shadow p-6 mb-6 md:col-span-2">
          <h3 className="font-semibold mb-2">Cost Tracking</h3>
          <p className="text-gray-500 text-sm mb-2">Monitor usage and costs (UI stub)</p>
          <div className="border rounded p-4 text-gray-400 text-center">Cost tracking UI coming soon.</div>
        </div>
      </div>
    </section>
  );
};

export default AnalyticsSection;
