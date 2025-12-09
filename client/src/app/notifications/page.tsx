// app/notifications/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Bell, Check, Trash2, Filter } from 'lucide-react';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  relatedId: string | null;
  isRead: boolean;
  createdAt: string;
  timeAgo: string;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5224/api';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [selectedNotifications, setSelectedNotifications] = useState<string[]>([]);
  const router = useRouter();

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const userData = localStorage.getItem('user');

      if (!token || !userData) {
        router.push('/');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/notifications?pageSize=50`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setNotifications(data.notifications);
        }
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      const token = localStorage.getItem('token');
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
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`${API_BASE_URL}/notifications/read-all`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      setNotifications(prev =>
        prev.map(n => ({ ...n, isRead: true }))
      );
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const deleteSelected = async () => {
    try {
      const token = localStorage.getItem('token');
      await Promise.all(
        selectedNotifications.map(id =>
          fetch(`${API_BASE_URL}/notifications/${id}`, {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${token}`
            }
          })
        )
      );

      setNotifications(prev =>
        prev.filter(n => !selectedNotifications.includes(n.id))
      );
      setSelectedNotifications([]);
    } catch (error) {
      console.error('Error deleting notifications:', error);
    }
  };

  const deleteAll = async () => {
    if (confirm('Are you sure you want to delete all notifications?')) {
      try {
        const token = localStorage.getItem('token');
        await fetch(`${API_BASE_URL}/notifications`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        setNotifications([]);
        setSelectedNotifications([]);
      } catch (error) {
        console.error('Error deleting all notifications:', error);
      }
    }
  };

  const getFilteredNotifications = () => {
    let filtered = notifications;

    if (filter === 'unread') {
      filtered = filtered.filter(n => !n.isRead);
    } else if (filter === 'read') {
      filtered = filtered.filter(n => n.isRead);
    }

    if (typeFilter !== 'all') {
      filtered = filtered.filter(n => n.type === typeFilter);
    }

    return filtered;
  };

  const getTypeColor = (type: string) => {
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
    markAsRead(notification.id);

    // Navigate based on notification type
    if (notification.relatedId) {
      switch (notification.type) {
        case 'Booking':
          router.push(`/bookings/${notification.relatedId}`);
          break;
        case 'Message':
          router.push(`/chats/${notification.relatedId}`);
          break;
        case 'Activity':
          router.push(`/activities/${notification.relatedId}`);
          break;
        default:
          break;
      }
    }
  };

  const filteredNotifications = getFilteredNotifications();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <header className="bg-gray-800/50 backdrop-blur-sm border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.back()}
                className="p-2 rounded-lg hover:bg-gray-700/50 transition-colors"
              >
                ←
              </button>
              <div>
                <h1 className="text-2xl font-bold text-white">Notifications</h1>
                <p className="text-gray-400 text-sm">
                  {notifications.length} total • {notifications.filter(n => !n.isRead).length} unread
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              {selectedNotifications.length > 0 && (
                <>
                  <button
                    onClick={() => {
                      selectedNotifications.forEach(markAsRead);
                      setSelectedNotifications([]);
                    }}
                    className="px-4 py-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-colors flex items-center space-x-2"
                  >
                    <Check className="w-4 h-4" />
                    <span>Mark as read</span>
                  </button>
                  <button
                    onClick={deleteSelected}
                    className="px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors flex items-center space-x-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Delete</span>
                  </button>
                </>
              )}
              <button
                onClick={markAllAsRead}
                className="px-4 py-2 bg-amber-500/20 text-amber-400 rounded-lg hover:bg-amber-500/30 transition-colors"
              >
                Mark all as read
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="mb-8 bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700 p-6">
          <div className="flex items-center space-x-4 mb-4">
            <Filter className="w-5 h-5 text-amber-400" />
            <h2 className="text-lg font-semibold text-white">Filters</h2>
          </div>
          
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center space-x-2">
              <span className="text-gray-400">Status:</span>
              <div className="flex space-x-2">
                {(['all', 'unread', 'read'] as const).map((status) => (
                  <button
                    key={status}
                    onClick={() => setFilter(status)}
                    className={`px-4 py-2 rounded-lg transition-colors ${
                      filter === status
                        ? 'bg-amber-500 text-white'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-gray-400">Type:</span>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="px-4 py-2 bg-gray-700 text-gray-300 rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value="all">All Types</option>
                <option value="System">System</option>
                <option value="Booking">Booking</option>
                <option value="Message">Message</option>
                <option value="Activity">Activity</option>
                <option value="Payment">Payment</option>
              </select>
            </div>
          </div>
        </div>

        {/* Notifications List */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700 overflow-hidden">
          {loading ? (
            <div className="p-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500 mx-auto"></div>
              <p className="mt-4 text-gray-400">Loading notifications...</p>
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="p-12 text-center">
              <Bell className="w-16 h-16 text-gray-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-400 mb-2">No notifications</h3>
              <p className="text-gray-500">
                {filter !== 'all' || typeFilter !== 'all'
                  ? 'No notifications match your filters'
                  : "You're all caught up!"}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-700">
              {filteredNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-6 hover:bg-gray-700/30 transition-colors cursor-pointer ${
                    !notification.isRead ? 'bg-gray-900/30' : ''
                  }`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex items-start space-x-4">
                    <input
                      type="checkbox"
                      checked={selectedNotifications.includes(notification.id)}
                      onChange={(e) => {
                        e.stopPropagation();
                        if (e.target.checked) {
                          setSelectedNotifications(prev => [...prev, notification.id]);
                        } else {
                          setSelectedNotifications(prev => 
                            prev.filter(id => id !== notification.id)
                          );
                        }
                      }}
                      onClick={(e) => e.stopPropagation()}
                      className="mt-1"
                    />
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center space-x-3">
                          <h3 className={`text-lg font-semibold ${
                            notification.isRead ? 'text-gray-300' : 'text-white'
                          }`}>
                            {notification.title}
                          </h3>
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getTypeColor(notification.type)}`}>
                            {notification.type}
                          </span>
                          {!notification.isRead && (
                            <span className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></span>
                          )}
                        </div>
                        <span className="text-sm text-gray-500 whitespace-nowrap">
                          {notification.timeAgo}
                        </span>
                      </div>
                      
                      <p className="text-gray-400 mb-3">
                        {notification.message}
                      </p>
                      
                      {notification.relatedId && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleNotificationClick(notification);
                          }}
                          className="text-sm text-amber-400 hover:text-amber-300 transition-colors"
                        >
                          View Details →
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Bulk Actions */}
        {selectedNotifications.length > 0 && (
          <div className="mt-6 p-4 bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700 flex justify-between items-center">
            <span className="text-gray-300">
              {selectedNotifications.length} notification(s) selected
            </span>
            <div className="flex space-x-3">
              <button
                onClick={() => {
                  selectedNotifications.forEach(markAsRead);
                  setSelectedNotifications([]);
                }}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center space-x-2"
              >
                <Check className="w-4 h-4" />
                <span>Mark as read</span>
              </button>
              <button
                onClick={deleteSelected}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center space-x-2"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete selected</span>
              </button>
              <button
                onClick={() => setSelectedNotifications([])}
                className="px-4 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors"
              >
                Clear selection
              </button>
            </div>
          </div>
        )}

        {/* Delete All */}
        {notifications.length > 0 && (
          <div className="mt-8 text-center">
            <button
              onClick={deleteAll}
              className="px-6 py-3 bg-red-500/20 text-red-400 rounded-xl hover:bg-red-500/30 transition-colors flex items-center space-x-2 mx-auto"
            >
              <Trash2 className="w-5 h-5" />
              <span>Delete All Notifications</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}