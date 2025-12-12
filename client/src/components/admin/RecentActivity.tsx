// components/admin/RecentActivity.tsx
'use client';

import React from 'react';

interface RecentActivityItem {
  id: number;
  user: string;
  action: string;
  target: string;
  time: string;
}

const RecentActivity: React.FC = () => {
  const recentActivities: RecentActivityItem[] = [
    { id: 1, user: 'John Doe', action: 'booked', target: 'Mountain Hiking', time: '10 min ago' },
    { id: 2, user: 'Sarah Smith', action: 'created', target: 'New Activity', time: '1 hour ago' },
    { id: 3, user: 'Mike Johnson', action: 'reviewed', target: 'Beach Camping', time: '2 hours ago' },
    { id: 4, user: 'Emma Wilson', action: 'cancelled', target: 'Booking #123', time: '5 hours ago' }
  ];

  const getActionColor = (action: string) => {
    switch (action) {
      case 'booked': return { bg: 'bg-green-900/30', text: 'text-green-400' };
      case 'created': return { bg: 'bg-blue-900/30', text: 'text-blue-400' };
      case 'reviewed': return { bg: 'bg-yellow-900/30', text: 'text-yellow-400' };
      default: return { bg: 'bg-red-900/30', text: 'text-red-400' };
    }
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
      <h3 className="text-xl font-bold text-white mb-6">
        Recent Activity 📝
      </h3>
      
      <div className="space-y-4">
        {recentActivities.map((activity) => {
          const color = getActionColor(activity.action);
          
          return (
            <div key={activity.id} className="flex justify-between items-center pb-4 border-b border-gray-700 last:border-0">
              <div>
                <p className="text-white">
                  <strong>{activity.user}</strong> {activity.action} {activity.target}
                </p>
                <p className="text-gray-400 text-sm">{activity.time}</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${color.bg} ${color.text}`}>
                {activity.action}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default RecentActivity;