// app/provider/layout.tsx
'use client';

import { ReactNode } from 'react';

export default function ProviderLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
      
      <footer className="bg-gray-800 text-white py-6 mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-sm">© 2024 TourismHub Provider Dashboard</p>
          <p className="text-xs text-gray-400 mt-2">Manage your tourism services</p>
        </div>
      </footer>
    </div>
  );
}