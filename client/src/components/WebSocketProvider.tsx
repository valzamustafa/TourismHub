// components/WebSocketProvider.tsx
'use client';

import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { HubConnection, HubConnectionBuilder, HttpTransportType } from '@microsoft/signalr';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  typeValue: number;
  relatedId: string | null;
  isRead: boolean;
  createdAt: string;
  timeAgo: string;
}

interface WebSocketContextType {
  connection: HubConnection | null;
  isConnected: boolean;
  sendNotification: (userId: string, notification: any) => Promise<void>;
}

const WebSocketContext = createContext<WebSocketContextType>({
  connection: null,
  isConnected: false,
  sendNotification: async () => {}
});

export const useWebSocket = () => useContext(WebSocketContext);

// Krijo një hook të pavarur për notification
const useNotificationHook = () => {
  const showNotification = useCallback((notification: { title: string; message: string; type: 'success' | 'error' | 'warning' | 'info' }) => {
    if (typeof window !== 'undefined' && (window as any).showToastNotification) {
      (window as any).showToastNotification(notification);
    } else {
      console.log('Notification would show:', notification);
    }
  }, []);

  return { showNotification };
};

export default function WebSocketProvider({ children }: { children: React.ReactNode }) {
  const [connection, setConnection] = useState<HubConnection | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [isClient, setIsClient] = useState(false);
  const { showNotification } = useNotificationHook();
  
  const connectionRef = useRef<HubConnection | null>(null);
  const isConnectedRef = useRef(false);
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const getTypeFromValue = useCallback((value: number): string => {
    switch (value) {
      case 1: return 'System';
      case 2: return 'Booking';
      case 3: return 'Message';
      case 4: return 'Activity';
      case 5: return 'Payment';
      default: return 'System';
    }
  }, []);

  const getToastType = useCallback((type: string | number): 'success' | 'error' | 'warning' | 'info' => {
    const typeString = typeof type === 'number' ? getTypeFromValue(type) : type;
    
    switch (typeString.toLowerCase()) {
      case 'booking':
      case 'payment':
        return 'success';
      case 'error':
        return 'error';
      case 'warning':
        return 'warning';
      default:
        return 'info';
    }
  }, [getTypeFromValue]);

  const getToken = useCallback(() => {
    if (typeof window === 'undefined') return '';
    return localStorage.getItem('token') || '';
  }, []);

  const createHubConnection = useCallback(async () => {
    if (typeof window === 'undefined') return null;

    const token = getToken();
    if (!token) {
      console.warn('No token available for WebSocket connection');
      return null;
    }

    try {
      const hubUrl = process.env.NEXT_PUBLIC_API_BASE_URL 
        ? `${process.env.NEXT_PUBLIC_API_BASE_URL.replace('/api', '')}/notificationHub`
        : 'http://localhost:5224/notificationHub';

      console.log(`🔌 Connecting to WebSocket: ${hubUrl}`);

      const hubConnection = new HubConnectionBuilder()
        .withUrl(hubUrl, {
          accessTokenFactory: () => token,
          skipNegotiation: true,
          transport: HttpTransportType.WebSockets
        })
        .withAutomaticReconnect({
          nextRetryDelayInMilliseconds: retryState => {
            return Math.min(1000 * Math.pow(2, retryState.previousRetryCount), 30000);
          }
        })
        .configureLogging(process.env.NODE_ENV === 'development' ? 'debug' : 'error')
        .build();

      hubConnection.on("ReceiveNotification", (notification: Notification) => {
        console.log('🔔 New notification received:', notification);
        
        showNotification({
          title: notification.title,
          message: notification.message,
          type: getToastType(notification.typeValue || notification.type)
        });

        playNotificationSound();

        const event = new CustomEvent('notification-received', { detail: notification });
        window.dispatchEvent(event);

        updateNotificationCount();
      });

      hubConnection.onreconnecting((error) => {
        console.log('🔄 SignalR reconnecting due to: ', error);
        setIsConnected(false);
        isConnectedRef.current = false;
      });

      hubConnection.onreconnected(() => {
        console.log('✅ SignalR reconnected');
        setIsConnected(true);
        isConnectedRef.current = true;
        setRetryCount(0);
      });

      hubConnection.onclose((error) => {
        console.log('❌ SignalR connection closed: ', error);
        setIsConnected(false);
        isConnectedRef.current = false;
        
        if (retryCount < 5) {
          retryTimeoutRef.current = setTimeout(() => {
            setRetryCount(prev => prev + 1);
            createHubConnection();
          }, 5000);
        }
      });

      hubConnection.on("ReceiveTest", (message: string) => {
        console.log('🧪 Test message received:', message);
      });

      await hubConnection.start();
      console.log('✅ SignalR Connected');
      
      setConnection(hubConnection);
      connectionRef.current = hubConnection;
      setIsConnected(true);
      isConnectedRef.current = true;
      setRetryCount(0);
      
      return hubConnection;
    } catch (error) {
      console.error('❌ SignalR Connection Error: ', error);
      setIsConnected(false);
      isConnectedRef.current = false;
      return null;
    }
  }, [getToken, retryCount, showNotification, getToastType]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    let mounted = true;
    
    const connect = async () => {
      if (mounted) {
        await createHubConnection();
      }
    };

    const timer = setTimeout(() => {
      connect();
    }, 1000);

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'token' && mounted) {
        if (connectionRef.current) {
          connectionRef.current.stop();
        }
        createHubConnection();
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      mounted = false;
      clearTimeout(timer);
      window.removeEventListener('storage', handleStorageChange);
      
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
      
      if (connectionRef.current) {
        connectionRef.current.stop();
      }
    };
  }, [createHubConnection]);

  const sendNotification = async (userId: string, notification: any) => {
    if (connectionRef.current && isConnectedRef.current) {
      try {
        await connectionRef.current.invoke('SendNotificationToUser', userId, notification);
      } catch (error) {
        console.error('Error sending notification:', error);
      }
    }
  };

  const playNotificationSound = () => {
    if (typeof window === 'undefined') return;
    
    try {
      const audio = new Audio('/notification.mp3');
      audio.volume = 0.3;
      audio.play().catch(e => console.log('Audio play failed:', e));
    } catch (error) {
      console.log('Could not play notification sound:', error);
    }
  };

  const updateNotificationCount = () => {
    if (typeof window === 'undefined') return;
    
    try {
      const currentCount = parseInt(localStorage.getItem('notificationCount') || '0');
      const newCount = currentCount + 1;
      localStorage.setItem('notificationCount', newCount.toString());
      
      const countEvent = new CustomEvent('notification-count-updated', { 
        detail: { count: newCount } 
      });
      window.dispatchEvent(countEvent);
    } catch (error) {
      console.error('Error updating notification count:', error);
    }
  };

  if (!isClient) {
    return <>{children}</>;
  }

  return (
    <WebSocketContext.Provider value={{ 
      connection: connectionRef.current, 
      isConnected: isConnectedRef.current, 
      sendNotification 
    }}>
      {children}
    </WebSocketContext.Provider>
  );
}