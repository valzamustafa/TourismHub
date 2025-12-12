'use client';

import React, { useState, useEffect } from 'react';
import ActivityApprovalItem from './common/ActivityApprovalItem';
import { Activity } from './utils/types';

const PendingActivities: React.FC = () => {
  const [pendingActivities, setPendingActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPendingActivities();
  }, []);

  const fetchPendingActivities = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/activities`);
      if (response.ok) {
        const activities = await response.json();
     
        const pending = activities.filter((activity: Activity) => 
          activity.status === 'Pending' || activity.status === 'PENDING'
        );
        setPendingActivities(pending);
      }
    } catch (error) {
      console.error('Error fetching pending activities:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-700 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 bg-gray-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-white">
          Pending Activity Approvals 🕐
        </h3>
        <span className="px-4 py-2 bg-yellow-900/30 text-yellow-400 rounded-full text-sm font-bold">
          {pendingActivities.length} pending
        </span>
      </div>
      
      {pendingActivities.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-5xl mb-4">✅</div>
          <p className="text-gray-400">No pending approvals</p>
        </div>
      ) : (
        <div className="space-y-4">
          {pendingActivities.map((activity) => (
            <ActivityApprovalItem key={activity.id} activity={activity} />
          ))}
        </div>
      )}
    </div>
  );
};

export default PendingActivities;