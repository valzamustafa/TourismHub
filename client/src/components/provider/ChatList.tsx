'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { MessageSquare, Clock, User, Mail } from 'lucide-react';

interface Chat {
  id: string;
  otherUser: {
    id: string;
    fullName: string;
    profileImage: string | null;
    role: string;
  };
  lastMessage: string;
  lastMessageAt: string;
  unreadCount: number;
  isOnline?: boolean;
}

interface ChatListProps {
  providerId: string;
  compact?: boolean;
  onChatSelect?: (chatId: string) => void; 
}

const ChatList: React.FC<ChatListProps> = ({ providerId, compact = false ,onChatSelect }) => {
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5224/api';

  useEffect(() => {
    fetchChats();
    

    const interval = setInterval(fetchChats, 15000);
    
    return () => clearInterval(interval);
  }, [providerId]);

  const fetchChats = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/chats/my-chats`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setChats(data.chats);
        }
      } else {
        setError('Failed to load chats');
      }
    } catch (error) {
      console.error('Error fetching chats:', error);
      setError('Failed to connect to server');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 60) {
      return `${diffMins}m ago`;
    } else if (diffHours < 24) {
      return `${diffHours}h ago`;
    } else if (diffDays < 7) {
      return `${diffDays}d ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const getStatusColor = (role: string) => {
    switch (role.toLowerCase()) {
      case 'provider':
        return 'bg-gradient-to-r from-amber-500 to-orange-600';
      case 'tourist':
        return 'bg-gradient-to-r from-blue-500 to-cyan-600';
      case 'admin':
        return 'bg-gradient-to-r from-purple-500 to-pink-600';
      default:
        return 'bg-gradient-to-r from-gray-500 to-gray-600';
    }
  };

  const totalUnread = chats.reduce((sum, chat) => sum + chat.unreadCount, 0);

  if (loading) {
    return (
      <div className="p-4">
        <div className="animate-pulse space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-gray-700/50 rounded-xl"></div>
          ))}
        </div>
      </div>
    );
  }

  if (compact) {
    return (
      <div className="space-y-2">
        {chats.slice(0, 3).map((chat) => (
          <div
            key={chat.id}
            onClick={() => {
              if (onChatSelect) {
                onChatSelect(chat.id);
              } else {
                router.push(`/chats/${chat.id}`);
              }
            }}
            className="p-3 bg-gray-700/30 rounded-lg border border-gray-600 hover:border-amber-500/30 cursor-pointer transition-all group"
          >
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className={`w-8 h-8 ${getStatusColor(chat.otherUser.role)} rounded-full flex items-center justify-center text-white text-xs font-bold`}>
                  {chat.otherUser.fullName?.charAt(0) || 'U'}
                </div>
                {chat.unreadCount > 0 && (
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold border-2 border-gray-800">
                    {chat.unreadCount}
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center">
                  <h3 className="font-semibold text-white text-sm truncate">
                    {chat.otherUser.fullName}
                  </h3>
                  <span className="text-xs text-gray-400 whitespace-nowrap">
                    {formatTime(chat.lastMessageAt)}
                  </span>
                </div>
                <p className="text-gray-400 text-xs truncate">
                  {chat.lastMessage}
                </p>
              </div>
            </div>
          </div>
        ))}
        {chats.length > 3 && (
          <button
            onClick={() => router.push('/chats')}
            className="w-full py-2 text-center text-amber-400 text-sm hover:text-amber-300 transition-colors"
          >
            View all {chats.length} chats
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700 p-4">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-r from-amber-500 to-orange-600 rounded-xl flex items-center justify-center">
            <MessageSquare className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Messages</h3>
            <p className="text-gray-400 text-sm">Connect with {providerId ? 'tourists' : 'providers'}</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          {totalUnread > 0 && (
            <span className="px-3 py-1 bg-gradient-to-r from-red-500 to-pink-600 text-white text-sm font-semibold rounded-full border border-red-500/30 flex items-center">
              <Mail className="w-3 h-3 mr-1" />
              {totalUnread} unread
            </span>
          )}
          <button
            onClick={() => router.push('/chats')}
            className="px-3 py-1 text-amber-400 text-sm hover:text-amber-300 transition-colors"
          >
            View All
          </button>
        </div>
      </div>

      {error && (
        <div className="p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-400 text-sm mb-4">
          {error}
        </div>
      )}

      {chats.length === 0 ? (
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-gray-700/50 rounded-full flex items-center justify-center mx-auto mb-4">
            <MessageSquare className="w-8 h-8 text-gray-400" />
          </div>
          <h4 className="text-lg font-semibold text-white mb-2">No messages yet</h4>
          <p className="text-gray-400 text-sm max-w-md mx-auto mb-6">
            {providerId 
              ? 'Tourists will appear here when they contact you about your activities.'
              : 'Start chatting with activity providers by contacting them on their activity pages.'}
          </p>
          <button
            onClick={() => router.push(providerId ? '/provider/dashboard' : '/tourist/activities')}
            className="px-4 py-2 bg-gradient-to-r from-amber-600 to-orange-700 text-white rounded-lg hover:from-amber-700 hover:to-orange-800 transition-all duration-300 text-sm font-semibold"
          >
            {providerId ? 'Back to Dashboard' : 'Browse Activities'}
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {chats.map((chat) => (
            <div
              key={chat.id}
              onClick={() => {
                if (onChatSelect) {
                  onChatSelect(chat.id);
                } else {
                  router.push(`/chats/${chat.id}`);
                }
              }}
              className="bg-gray-700/30 rounded-xl p-4 border border-gray-600 hover:border-amber-500/30 cursor-pointer transition-all hover:scale-[1.02] group"
            >
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <div className={`w-12 h-12 ${getStatusColor(chat.otherUser.role)} rounded-full flex items-center justify-center text-white font-bold text-lg`}>
                    {chat.otherUser.fullName?.charAt(0) || 'U'}
                  </div>
                  {chat.unreadCount > 0 && (
                    <div className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold border-2 border-gray-800">
                      {chat.unreadCount}
                    </div>
                  )}
                  {chat.isOnline && (
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-gray-800"></div>
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-semibold text-white text-lg truncate group-hover:text-amber-400 transition-colors">
                        {chat.otherUser.fullName}
                      </h3>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className="text-xs px-2 py-1 bg-gray-600 text-gray-300 rounded-full">
                          {chat.otherUser.role}
                        </span>
                        {chat.isOnline && (
                          <span className="text-xs px-2 py-1 bg-green-500/20 text-green-400 rounded-full border border-green-500/30">
                            Online
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-400 whitespace-nowrap">
                        {formatTime(chat.lastMessageAt)}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <p className="text-gray-400 text-sm truncate pr-4">
                      {chat.lastMessage}
                    </p>
                    {chat.unreadCount > 0 && (
                      <span className="flex-shrink-0 px-2 py-1 bg-gradient-to-r from-amber-500 to-orange-600 text-white text-xs font-semibold rounded-full">
                        {chat.unreadCount} new
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="text-gray-500 group-hover:text-amber-400 transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {chats.length > 0 && (
        <div className="mt-6 pt-4 border-t border-gray-700">
          <div className="flex justify-between items-center text-sm text-gray-400">
            <span>Total chats: {chats.length}</span>
            <span>Total unread: {totalUnread}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatList;