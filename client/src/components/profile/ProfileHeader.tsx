// components/profile/ProfileHeader.tsx
'use client';

import React from 'react';

interface ProfileHeaderProps {
  userName: string;
  userEmail: string;
  memberSince: string;
  onBackClick: () => void;
  onDashboardClick: () => void;
}

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  userName,
  userEmail,
  memberSince,
  onBackClick,
  onDashboardClick
}) => {
  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
            <p className="text-gray-600">Manage your account and bookings</p>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={onBackClick}
              className="px-4 py-2 text-blue-600 hover:text-blue-800"
            >
              ← Back to Activities
            </button>
            <button
              onClick={onDashboardClick}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              Dashboard
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
