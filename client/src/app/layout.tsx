// app/layout.tsx
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { NotificationManager } from '@/components/NotificationManager';
import WebSocketProvider from '@/components/WebSocketProvider';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'TourismHub',
  description: 'Adventure tourism platform',
};

// SHTO KËTË: Krijo një komponent të ndarë për Providers
function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WebSocketProvider>
      <NotificationManager>
        {children}
      </NotificationManager>
    </WebSocketProvider>
  );
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        {/* Përdor komponentin Providers */}
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}