// components/profile/ProfileHeader.tsx
'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import NotificationBell from '@/components/NotificationBell';

interface ProfileHeaderProps {
  userName?: string;
  userEmail?: string;
  memberSince?: string;
  onBackClick?: () => void;
  onDashboardClick?: () => void;
  showNotification?: boolean;
  variant?: 'full' | 'simple';
}

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  userName = 'John Doe',
  userEmail = 'john@example.com',
  memberSince = 'January 2024',
  onBackClick,
  onDashboardClick,
  showNotification = true,
  variant = 'simple'
}) => {
  const router = useRouter();

  const handleBackClick = onBackClick || (() => router.back());
  const handleDashboardClick = onDashboardClick || (() => router.push('/dashboard'));

  if (variant === 'simple') {
    return (
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">TourismHub</h1>
                <p className="text-gray-600">Welcome to your tourist dashboard</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {showNotification && (
                <div className="relative">
                  <NotificationBell />
                </div>
              )}
              
              <button
                onClick={handleBackClick}
                className="px-4 py-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
              >
                ← Back
              </button>
            </div>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
              <p className="text-gray-600">Manage your account and bookings</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            {showNotification && (
              <div className="relative">
                <NotificationBell />
              </div>
            )}
            
            <button
              onClick={handleBackClick}
              className="px-4 py-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
            >
              ← Back to Activities
            </button>
            <button
              onClick={handleDashboardClick}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Dashboard
            </button>
          </div>
        </div>
        

        <div className="mt-4 pt-4 border-t">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-lg font-semibold text-gray-900">{userName}</p>
              <p className="text-sm text-gray-600">{userEmail}</p>
            </div>
            <p className="text-sm text-gray-500">
              Member since {memberSince}
            </p>
          </div>
        </div>
      </div>
    </header>
  );
};