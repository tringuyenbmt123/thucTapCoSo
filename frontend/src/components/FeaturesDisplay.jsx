import React from 'react';

const FeaturesDisplay = ({ features }) => {
  return (
    <div className="mt-6">
      <h2 className="text-xl font-semibold mb-4">Đặc trưng phân tích</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {Object.entries(features).map(([key, value]) => (
          <div key={key} className="bg-gray-50 p-3 rounded-lg border-l-4 border-blue-500">
            <span className="font-medium text-gray-700">{key}:</span>{' '}
            <span className="text-gray-900">{value}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FeaturesDisplay;