// components/profile/ProfileInfoCard.tsx
'use client';

import React from 'react';
import { ProfileAvatar } from './ProfileAvatar';

interface ProfileInfoCardProps {
  user: {
    fullName: string;
    email: string;
    profileImage: string | null;
    role: string;
    createdAt: string;
  };
  stats: {
    totalBookings: number;
    completedBookings: number;
    totalSpent: number;
  };
}

export const ProfileInfoCard: React.FC<ProfileInfoCardProps> = ({ user, stats }) => {

  const userName = user?.fullName || 'User';
  const userEmail = user?.email || 'No email';
  const memberSince = user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A';

  return (
    <div className="bg-white rounded-xl shadow-sm border p-6">
      <div className="text-center mb-6">
        <ProfileAvatar
          imageUrl={user?.profileImage}
          userName={userName}
          onImageChange={() => {}}
          showUploadButton={false}
        />
        <h2 className="text-xl font-bold text-gray-900 mt-4">{userName}</h2>
        <p className="text-gray-600 text-sm">{userEmail}</p>
        <p className="text-gray-500 text-sm mt-1">
          Member since {memberSince}
        </p>
      </div>

      <div className="pt-6 border-t">
        <div className="px-4 py-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg">
          <p className="text-sm font-semibold text-gray-900">Activity Stats</p>
          <div className="mt-2 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Total Bookings:</span>
              <span className="font-semibold">{stats.totalBookings}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Completed:</span>
              <span className="font-semibold text-green-600">{stats.completedBookings}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Total Spent:</span>
              <span className="font-semibold text-blue-600">${stats.totalSpent.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
