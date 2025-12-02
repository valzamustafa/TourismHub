// components/profile/ProfileNavigation.tsx
'use client';

import React from 'react';

interface ProfileNavigationProps {
  activeTab: 'profile' | 'bookings' | 'saved' | 'settings';
  onTabChange: (tab: 'profile' | 'bookings' | 'saved' | 'settings') => void;
  pendingBookingsCount?: number;
  savedItemsCount?: number;
}

export const ProfileNavigation: React.FC<ProfileNavigationProps> = ({
  activeTab,
  onTabChange,
  pendingBookingsCount = 0,
  savedItemsCount = 0
}) => {
  const tabs = [
    {
      id: 'profile',
      label: 'Profile Information',
      icon: (
        <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
      badge: null
    },
    {
      id: 'bookings',
      label: 'My Bookings',
      icon: (
        <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      badge: pendingBookingsCount > 0 ? pendingBookingsCount : null
    },
    {
      id: 'saved',
      label: 'Saved Items',
      icon: (
        <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
        </svg>
      ),
      badge: savedItemsCount > 0 ? savedItemsCount : null
    },
    {
      id: 'settings',
      label: 'Account Settings',
      icon: (
        <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      badge: null
    }
  ];

  return (
    <nav className="space-y-2">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id as any)}
          className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
            activeTab === tab.id
              ? 'bg-blue-50 text-blue-600 border-l-4 border-blue-500'
              : 'text-gray-700 hover:bg-gray-50'
          }`}
        >
          <div className="flex items-center">
            {tab.icon}
            {tab.label}
            {tab.badge !== null && (
              <span className={`ml-auto text-xs font-semibold px-2 py-1 rounded-full ${
                tab.id === 'bookings' 
                  ? 'bg-yellow-100 text-yellow-800'
                  : 'bg-blue-100 text-blue-800'
              }`}>
                {tab.badge}
              </span>
            )}
          </div>
        </button>
      ))}
    </nav>
  );
};
