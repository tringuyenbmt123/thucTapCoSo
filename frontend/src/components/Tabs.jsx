import React from 'react';

const Tabs = ({ tabs, activeTab, setActiveTab }) => {
  return (
    <div className="flex border-b border-gray-200">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          className={`flex-1 py-2 px-4 text-center font-medium ${
            activeTab === tab.id ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700'
          } rounded-t-lg transition-colors duration-200`}
          onClick={() => setActiveTab(tab.id)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
};

export default Tabs;