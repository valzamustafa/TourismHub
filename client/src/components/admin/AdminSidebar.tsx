// components/admin/AdminSidebar.tsx
'use client';

import React from 'react';

interface AdminSidebarProps {
  activeSection: string;
  setActiveSection: (section: string) => void;
}

const AdminSidebar: React.FC<AdminSidebarProps> = ({ 
  activeSection, 
  setActiveSection 
}) => {
  const menuItems = [
    { text: 'Dashboard', icon: '📊', section: 'dashboard' },
    { text: 'Users', icon: '👥', section: 'users' },
    { text: 'Categories', icon: '📂', section: 'categories' },
    { text: 'Activities', icon: '🏔️', section: 'activities' },
    { text: 'Bookings', icon: '📅', section: 'bookings' },
    { text: 'Analytics', icon: '📈', section: 'analytics' },
    { text: 'Reviews', icon: '⭐', section: 'reviews' },
    { text: 'About', icon: '📝', section: 'about' },
  ];

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-64 bg-gray-800 border-r border-gray-700 p-6">
      <div className="text-2xl font-bold text-white mb-8">
        TourismHub Admin
      </div>
      
      <nav className="space-y-2">
        {menuItems.map((item) => (
          <button
            key={item.section}
            onClick={() => setActiveSection(item.section)}
            className={`w-full text-left px-4 py-3 rounded-lg transition-all flex items-center gap-3 ${
              activeSection === item.section
                ? 'bg-blue-900/30 text-blue-400 border-l-4 border-blue-500'
                : 'text-gray-300 hover:bg-gray-700 hover:text-white'
            }`}
          >
            <span>{item.icon}</span>
            <span className="font-medium">{item.text}</span>
          </button>
        ))}
      </nav>
    </aside>
  );
};

export default AdminSidebar;