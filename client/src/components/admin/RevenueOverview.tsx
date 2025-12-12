// components/admin/RevenueOverview.tsx
'use client';

import React from 'react';

const RevenueOverview: React.FC = () => {
  const revenueData = [
    { month: 'Jan', revenue: 4000 },
    { month: 'Feb', revenue: 3000 },
    { month: 'Mar', revenue: 5000 },
    { month: 'Apr', revenue: 4500 },
    { month: 'May', revenue: 6000 },
    { month: 'Jun', revenue: 7000 }
  ];

  const maxRevenue = Math.max(...revenueData.map((d) => d.revenue));

  return (
    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-white">
          Revenue Overview 💰
        </h3>
        <div className="flex items-center text-green-500">
          <span className="mr-2">📈</span>
          <span className="font-bold">+18%</span>
        </div>
      </div>
      
      <div className="flex items-end h-48 gap-2">
        {revenueData.map((data, index) => (
          <div key={data.month} className="flex-1 flex flex-col items-center">
            <div className="text-gray-400 text-sm mb-2">{data.month}</div>
            <div
              className="w-3/4 rounded-t-lg transition-all hover:opacity-90"
              style={{ 
                height: `${(data.revenue / maxRevenue) * 150}px`,
                backgroundColor: index === revenueData.length - 1 ? '#4CAF50' : '#2196F3'
              }}
            />
            <div className="text-white text-xs font-bold mt-2">
              ${(data.revenue / 1000).toFixed(0)}k
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RevenueOverview;