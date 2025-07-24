import React from 'react';

const OverviewSection: React.FC = () => {
  return (
    <section className="p-6">
      <h2 className="text-2xl font-bold mb-4">Agent Overview</h2>
      {/* List and review existing agents/chatbots */}
      <div className="bg-white rounded shadow p-4">
        <p className="mb-2">Here you can view and manage all your agents. Select an agent to view details or edit settings.</p>
        {/* TODO: Implement agent list and selection logic */}
        <div className="border rounded p-4 text-gray-500 text-center">
          Agent list and management UI coming soon.
        </div>
      </div>
    </section>
  );
};

export default OverviewSection;
