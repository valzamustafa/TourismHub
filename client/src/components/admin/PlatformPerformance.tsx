// components/admin/PlatformPerformance.tsx
'use client';

import React from 'react';

const PlatformPerformance: React.FC = () => {
  const metrics = [
    { label: 'User Satisfaction', value: 92, color: '#4CAF50' },
    { label: 'Booking Completion', value: 87, color: '#2196F3' },
    { label: 'Payment Success', value: 95, color: '#4CAF50' }
  ];

  return (
    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
      <h3 className="text-xl font-bold text-white mb-6">
        Platform Performance 📊
      </h3>
      
      <div className="space-y-6">
        {metrics.map((metric) => (
          <div key={metric.label} className="space-y-2">
            <div className="flex justify-between">
              <span className="text-white text-sm">{metric.label}</span>
              <span className="font-bold" style={{ color: metric.color }}>
                {metric.value}%
              </span>
            </div>
            <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
              <div 
                className="h-full rounded-full transition-all duration-500"
                style={{ 
                  width: `${metric.value}%`,
                  backgroundColor: metric.color
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PlatformPerformance;