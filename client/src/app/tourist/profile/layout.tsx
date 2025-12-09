// app/tourist/layout.tsx
'use client';

import { ReactNode } from 'react';


export default function TouristLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
  
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
      
      <footer className="bg-gray-800 text-white py-6 mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-sm">© 2024 TourismHub. All rights reserved.</p>
          <p className="text-xs text-gray-400 mt-2">Adventure awaits!</p>
        </div>
      </footer>
    </div>
  );
}