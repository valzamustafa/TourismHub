// app/provider/layout.tsx
'use client';

import { ReactNode } from 'react';

export default function ProviderLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-900">
      <div className="bg-gradient-to-r from-gray-900 to-gray-800">
        {children}
      </div>
      
      <footer className="bg-gray-800 border-t border-gray-700 text-white py-6 mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-sm">© 2024 TrailGuide Pro Provider Dashboard</p>
          <p className="text-xs text-gray-400 mt-2">Manage your adventure experiences</p>
        </div>
      </footer>
    </div>
  );
}