// components/NotificationManager.tsx
'use client';

import React, { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { ToastNotification } from './ToastNotification';

interface Toast {
  id: string;
  title: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
}

interface NotificationContextType {
  showNotification: (toast: Omit<Toast, 'id'>) => void;
  clearNotifications: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    console.warn('useNotification called outside NotificationProvider');

    return {
      showNotification: (toast: Omit<Toast, 'id'>) => {
        console.log('Default notification:', toast);
      },
      clearNotifications: () => {}
    };
  }
  return context;
};

export function NotificationManager({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const showNotification = (toast: Omit<Toast, 'id'>) => {
    const id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
    setToasts(prev => [...prev, { ...toast, id }]);
  };

  const clearNotifications = () => {
    setToasts([]);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).showToastNotification = showNotification;
    }
    return () => {
      if (typeof window !== 'undefined') {
        delete (window as any).showToastNotification;
      }
    };
  }, []);

  const contextValue: NotificationContextType = {
    showNotification,
    clearNotifications
  };

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
      
  
      {isClient && (
        <div className="fixed top-4 right-4 z-[9999] w-96 max-w-full">
          {toasts.map(toast => (
            <ToastNotification
              key={toast.id}
              {...toast}
              onClose={removeToast}
              duration={toast.type === 'error' ? 8000 : 5000}
            />
          ))}
        </div>
      )}
    </NotificationContext.Provider>
  );
}