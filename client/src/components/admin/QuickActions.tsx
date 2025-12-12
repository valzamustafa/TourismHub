// components/admin/QuickActions.tsx
'use client';

import React from 'react';
import QuickActionCard from './common/QuickActionCard';

interface QuickActionsProps {
  setActiveSection: (section: string) => void;
}

const QuickActions: React.FC<QuickActionsProps> = ({ setActiveSection }) => {
  const quickActions = [
    {
      title: 'Manage Users',
      description: 'View and manage user accounts',
      icon: <span>👥</span>,
      color: '#2196F3',
      action: () => setActiveSection('users')
    },
    {
      title: 'Manage Categories',
      description: 'Create and edit activity categories',
      icon: <span>📂</span>,
      color: '#4CAF50',
      action: () => setActiveSection('categories')
    },
    {
      title: 'Manage Activities',
      description: 'Create and manage activities',
      icon: <span>🏔️</span>,
      color: '#FF9800',
      action: () => setActiveSection('activities')
    },
    {
      title: 'View Bookings',
      description: 'Oversee all bookings',
      icon: <span>📅</span>,
      color: '#9C27B0',
      action: () => setActiveSection('bookings')
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {quickActions.map((action, index) => (
        <QuickActionCard key={index} {...action} />
      ))}
    </div>
  );
};

export default QuickActions;