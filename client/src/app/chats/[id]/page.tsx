// app/chats/[id]/page.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import ChatWindow from '@/components/chat/ChatWindow';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5224/api';

interface ChatUser {
  id: string;
  fullName: string;
  profileImage: string | null;
  role: string;
}

interface ChatInfo {
  id: string;
  otherUser: ChatUser;
}

export default function ChatPage() {
  const params = useParams();
  const router = useRouter();
  const [chatInfo, setChatInfo] = useState<ChatInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    const token = localStorage.getItem('token');

    if (!userData || !token) {
      router.push('/login');
      return;
    }

    const parsedUser = JSON.parse(userData);
    setUser(parsedUser);
    fetchChatInfo();
  }, [params.id, router]);

  const fetchChatInfo = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/chats/${params.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setChatInfo(data.chat);
        } else {
          setError('Chat not found');
        }
      } else {
        setError('Failed to load chat');
      }
    } catch (error) {
      console.error('Error fetching chat info:', error);
      setError('Failed to load chat');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error || !chatInfo) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-xl font-bold text-red-600 mb-2">{error || 'Chat not found'}</h2>
          <button
            onClick={() => router.push('/chats')}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg"
          >
            Back to Chats
          </button>
        </div>
      </div>
    );
  }

  return (
      <div className="min-h-screen bg-gray-900"> 
      <div className="max-w-6xl mx-auto p-4">
        <div className="flex items-center mb-6">
          <button
            onClick={() => router.push('/chats')}
            className="mr-4 text-blue-600 hover:text-blue-800"
          >
            ← Back to Chats
          </button>
          <h1 className="text-2xl font-bold">Chat with {chatInfo.otherUser.fullName}</h1>
        </div>
        
        <div className="bg-white rounded-xl shadow-lg p-4">
          {/* HIQ currentUser - dërgo vetëm chatId dhe otherUser */}
          <ChatWindow 
            chatId={params.id as string}
            otherUser={chatInfo.otherUser}
          />
        </div>
      </div>
    </div>
  );
}