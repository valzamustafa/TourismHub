// components/admin/AdminHeader.tsx
'use client';

import React from 'react';
import { LogOut } from 'lucide-react';
import NotificationBell from '../NotificationBell';
import { useRouter } from 'next/navigation';

interface AdminHeaderProps {
  activeSection: string;
}

const AdminHeader: React.FC<AdminHeaderProps> = ({ activeSection }) => {
  const router = useRouter();
  const menuItems = [
    { text: 'Dashboard', section: 'dashboard' },
    { text: 'Users', section: 'users' },
    { text: 'Categories', section: 'categories' },
    { text: 'Activities', section: 'activities' },
    { text: 'Bookings', section: 'bookings' },
    { text: 'Analytics', section: 'analytics' },
    { text: 'Reviews', section: 'reviews' },
    { text: 'About', section: 'about' },
  ];

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/');
  };

  return (
    <header className="bg-gray-800 border-b border-gray-700 px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">
            {menuItems.find(item => item.section === activeSection)?.text || 'Dashboard'}
          </h1>
        </div>
        
        <div className="flex items-center gap-4">
          <NotificationBell />
          
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
              A
            </div>
            <span className="text-white">Admin</span>
          </div>
          
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;