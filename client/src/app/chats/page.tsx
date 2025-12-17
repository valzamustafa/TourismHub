// app/chats/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ChatList from '@/components/provider/ChatList';
import ChatWindow from '@/components/chat/ChatWindow'; 

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5224/api';

export default function ChatsPage() {
  const [user, setUser] = useState<any>(null);
  const [activeChat, setActiveChat] = useState<string | null>(null);
  const [activeChatInfo, setActiveChatInfo] = useState<any>(null); 
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const userData = localStorage.getItem('user');
    const token = localStorage.getItem('token');

    if (!userData || !token) {
      router.push('/login');
      return;
    }

    const parsedUser = JSON.parse(userData);
    setUser(parsedUser);
    setLoading(false);
  }, [router]);

  const handleChatSelect = async (chatId: string) => {
    console.log('🟢 Chat selected in parent:', chatId);
    setActiveChat(chatId);
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/chats/${chatId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setActiveChatInfo(data.chat);
        }
      }
    } catch (error) {
      console.error('Error fetching chat info:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <header className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold">My Chats</h1>
              <p className="text-gray-400">Connect with {user?.role === 'Provider' ? 'tourists' : 'providers'}</p>
            </div>
            <button
              onClick={() => {
                if (user?.role === 'Provider') {
                  router.push('/provider');
                } else {
                  router.push('/tourist/activities');
                }
              }}
              className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Chat List */}
          <div className="lg:col-span-1">
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700 p-4">
              <h2 className="text-lg font-semibold mb-4">All Conversations</h2>
              {user && (
                <ChatList 
                  providerId={user.id} 
                  onChatSelect={handleChatSelect}
                />
              )}
            </div>
          </div>

          {/* Chat Window */}
          <div className="lg:col-span-3">
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700 p-6">
              {activeChat && activeChatInfo ? (
                <div className="h-[600px] flex flex-col">
                  {/* Chat Header */}
                  <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-700">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-amber-500 to-orange-600 rounded-full flex items-center justify-center text-white font-bold">
                        {activeChatInfo.otherUser?.fullName?.charAt(0) || 'U'}
                      </div>
                      <div>
                        <h3 className="font-semibold">{activeChatInfo.otherUser?.fullName}</h3>
                        <p className="text-sm text-gray-400">{activeChatInfo.otherUser?.role}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => router.push(`/chats/${activeChat}`)}
                      className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 text-sm"
                    >
                      Open in Full Page
                    </button>
                  </div>
                  
                  {/* Chat Messages  */}
                  <div className="flex-1">
                    <ChatWindow 
                      chatId={activeChat}
                      otherUser={activeChatInfo.otherUser}
                    />
                  </div>
                </div>
              ) : (
                <div className="text-center py-16">
                  <div className="text-6xl mb-4">💬</div>
                  <h3 className="text-xl font-semibold mb-2">No Chat Selected</h3>
                  <p className="text-gray-400 mb-6">
                    Select a conversation from the list to start chatting
                  </p>
                  <p className="text-sm text-gray-500">
                    To start a new chat, go to an activity page and click "Contact Provider"
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}