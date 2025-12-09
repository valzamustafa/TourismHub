'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Bell, Check, Trash2, RefreshCw } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useWebSocket } from './WebSocketProvider';
import { useNotification } from './NotificationManager';

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

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5224/api';

const getTypeFromValue = (value: number): string => {
  switch (value) {
    case 1: return 'System';
    case 2: return 'Booking';
    case 3: return 'Message';
    case 4: return 'Activity';
    case 5: return 'Payment';
    default: return 'System';
  }
};

export default function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { isConnected } = useWebSocket();
  const { showNotification } = useNotification();
  const router = useRouter();

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        console.warn('No token found for fetching notifications');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/notifications?page=1&pageSize=10`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setNotifications(data.notifications);
     
          const unread = data.notifications.filter((n: Notification) => !n.isRead).length;
          setUnreadCount(unread);
        }
      } else if (response.status === 401) {
        console.warn('Unauthorized - token may be expired');
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchUnreadCount = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) return;

      const response = await fetch(`${API_BASE_URL}/notifications/unread-count`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Cache-Control': 'no-cache'
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setUnreadCount(data.unreadCount);
        }
      }
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  }, []);


  useEffect(() => {
    try {
      const savedCount = localStorage.getItem('notificationCount');
      if (savedCount) {
        setUnreadCount(parseInt(savedCount));
      }
    } catch (error) {
      console.error('Error loading notification count:', error);
    }
  }, []);


  useEffect(() => {

    if (typeof window === 'undefined') return;

    fetchNotifications();
    fetchUnreadCount();
    
    const handleNotificationReceived = (event: CustomEvent) => {
      const notification = event.detail;
      
   
      setNotifications(prev => [notification, ...prev.slice(0, 9)]);
      

      setUnreadCount(prev => {
        const newCount = prev + 1;
        localStorage.setItem('notificationCount', newCount.toString());
        return newCount;
      });
    };

    const handleNotificationCountUpdated = (event: CustomEvent) => {
      setUnreadCount(event.detail.count);
    };

    window.addEventListener('notification-received', handleNotificationReceived as EventListener);
    window.addEventListener('notification-count-updated', handleNotificationCountUpdated as EventListener);

    let interval: NodeJS.Timeout;
    if (!isConnected) {
      interval = setInterval(() => {
        fetchUnreadCount();
      }, 30000);
    }

    return () => {
      window.removeEventListener('notification-received', handleNotificationReceived as EventListener);
      window.removeEventListener('notification-count-updated', handleNotificationCountUpdated as EventListener);
      if (interval) clearInterval(interval);
    };
  }, [fetchNotifications, fetchUnreadCount, isConnected]);

  const markAsRead = async (notificationId: string) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      await fetch(`${API_BASE_URL}/notifications/${notificationId}/read`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

   
      setNotifications(prev =>
        prev.map(n =>
          n.id === notificationId ? { ...n, isRead: true } : n
        )
      );

      const newCount = Math.max(0, unreadCount - 1);
      setUnreadCount(newCount);
      localStorage.setItem('notificationCount', newCount.toString());
    } catch (error) {
      console.error('Error marking as read:', error);
      showNotification({
        title: 'Error',
        message: 'Failed to mark notification as read',
        type: 'error'
      });
    }
  };

  const markAllAsRead = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      await fetch(`${API_BASE_URL}/notifications/read-all`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });


      setNotifications(prev =>
        prev.map(n => ({ ...n, isRead: true }))
      );
      
      setUnreadCount(0);
      localStorage.setItem('notificationCount', '0');
      
      showNotification({
        title: 'Success',
        message: 'All notifications marked as read',
        type: 'success'
      });
    } catch (error) {
      console.error('Error marking all as read:', error);
      showNotification({
        title: 'Error',
        message: 'Failed to mark all notifications as read',
        type: 'error'
      });
    }
  };

  const getTypeIcon = (typeValue: number) => {
    const type = getTypeFromValue(typeValue);
    switch (type) {
      case 'Booking':
        return '📅';
      case 'Message':
        return '💬';
      case 'Activity':
        return '🏔️';
      case 'Payment':
        return '💰';
      case 'System':
        return '🔔';
      default:
        return 'ℹ️';
    }
  };

  const getTypeColor = (typeValue: number) => {
    const type = getTypeFromValue(typeValue);
    switch (type) {
      case 'Booking':
        return 'bg-blue-500/20 text-blue-400';
      case 'Message':
        return 'bg-green-500/20 text-green-400';
      case 'Activity':
        return 'bg-amber-500/20 text-amber-400';
      case 'Payment':
        return 'bg-emerald-500/20 text-emerald-400';
      case 'System':
        return 'bg-purple-500/20 text-purple-400';
      default:
        return 'bg-gray-500/20 text-gray-400';
    }
  };

  const handleNotificationClick = (notification: Notification) => {
  
    if (!notification.isRead) {
      markAsRead(notification.id);
    }
    
  
    if (notification.relatedId) {
      const type = getTypeFromValue(notification.typeValue);
      switch (type) {
        case 'Booking':
          router.push(`/bookings/${notification.relatedId}`);
          break;
        case 'Message':
          router.push(`/chats/${notification.relatedId}`);
          break;
        case 'Activity':
          router.push(`/activities/${notification.relatedId}`);
          break;
        case 'Payment':
          router.push(`/payments/${notification.relatedId}`);
          break;
        default:
          break;
      }
    }
    setIsOpen(false);
  };

  const clearAllNotifications = async () => {
    if (!confirm('Are you sure you want to delete all notifications?')) return;
    
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      await fetch(`${API_BASE_URL}/notifications`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      setNotifications([]);
      setUnreadCount(0);
      localStorage.setItem('notificationCount', '0');
      
      showNotification({
        title: 'Success',
        message: 'All notifications cleared',
        type: 'success'
      });
    } catch (error) {
      console.error('Error clearing notifications:', error);
      showNotification({
        title: 'Error',
        message: 'Failed to clear notifications',
        type: 'error'
      });
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen) {
            fetchNotifications();
          }
        }}
        className="relative p-2 rounded-full hover:bg-gray-800/50 transition-colors group"
        aria-label="Notifications"
        title={`${unreadCount} unread notifications`}
      >
        <Bell className={`w-6 h-6 ${unreadCount > 0 ? 'text-amber-400' : 'text-gray-300'} group-hover:text-white transition-colors`} />
        
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold px-1">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
        
 
        <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-gray-800 ${
          isConnected ? 'bg-green-500' : 'bg-red-500'
        }`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-gray-800 border border-gray-700 rounded-xl shadow-2xl z-50 animate-slideDown">
          <div className="p-4 border-b border-gray-700">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <h3 className="text-lg font-semibold text-white">Notifications</h3>
                {!isConnected && (
                  <span className="text-xs text-yellow-500 bg-yellow-500/20 px-2 py-1 rounded-full">
                    Reconnecting...
                  </span>
                )}
              </div>
              <div className="flex items-center space-x-3">
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-sm text-amber-400 hover:text-amber-300 transition-colors flex items-center"
                    title="Mark all as read"
                  >
                    <Check className="w-4 h-4 mr-1" />
                    Mark all
                  </button>
                )}
                <button
                  onClick={fetchNotifications}
                  disabled={loading}
                  className="text-sm text-gray-400 hover:text-gray-300 transition-colors disabled:opacity-50"
                  title="Refresh notifications"
                >
                  <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                </button>
              </div>
            </div>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <div className="p-4 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500 mx-auto"></div>
                <p className="mt-2 text-sm text-gray-400">Loading notifications...</p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center">
                <div className="text-4xl mb-4">🔔</div>
                <p className="text-gray-400">No notifications yet</p>
                <p className="text-sm text-gray-500 mt-2">You're all caught up!</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-700">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 hover:bg-gray-700/50 transition-colors cursor-pointer group ${
                      !notification.isRead ? 'bg-gray-900/30' : ''
                    }`}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="text-xl flex-shrink-0">
                        {getTypeIcon(notification.typeValue)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start">
                          <h4 className={`font-semibold truncate ${
                            notification.isRead ? 'text-gray-300' : 'text-white'
                          }`}>
                            {notification.title}
                          </h4>
                          <span className="text-xs text-gray-500 flex-shrink-0 ml-2">
                            {notification.timeAgo}
                          </span>
                        </div>
                        <p className="text-sm text-gray-400 mt-1 line-clamp-2">
                          {notification.message}
                        </p>
                        {!notification.isRead && (
                          <div className="inline-flex items-center mt-2">
                            <span className="w-2 h-2 bg-amber-500 rounded-full mr-2 animate-pulse"></span>
                            <span className="text-xs text-amber-500">New</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="p-4 border-t border-gray-700">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-400">
                Showing {notifications.length} notifications
              </span>
              <div className="flex space-x-2">
                <button
                  onClick={clearAllNotifications}
                  className="text-sm text-red-400 hover:text-red-300 transition-colors flex items-center"
                  disabled={notifications.length === 0}
                >
                  <Trash2 className="w-4 h-4 mr-1" />
                  Clear All
                </button>
                <button
                  onClick={() => {
                    router.push('/notifications');
                    setIsOpen(false);
                  }}
                  className="text-sm text-amber-400 hover:text-amber-300 transition-colors font-semibold"
                >
                  View All →
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}