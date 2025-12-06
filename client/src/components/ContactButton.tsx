// components/ContactButton.tsx
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

interface ContactButtonProps {
  currentUserId: string;
  otherUserId: string;
  currentUserName: string;
  otherUserName: string;
  activityId?: string;
  activityName?: string;
  variant?: 'button' | 'icon';
  size?: 'sm' | 'md' | 'lg';
}

const ContactButton: React.FC<ContactButtonProps> = ({
  currentUserId,
  otherUserId,
  currentUserName,
  otherUserName,
  activityId,
  activityName,
  variant = 'button',
  size = 'md'
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5224/api';

  const handleStartChat = async () => {
    console.log('🟢 ContactButton clicked!', { 
      currentUserId, 
      otherUserId,
      currentUserName,
      otherUserName 
    });

    if (!currentUserId || !otherUserId) {
      setError('User information missing');
      console.log('🔴 Missing user IDs');
      return;
    }

    if (currentUserId === otherUserId) {
      setError('You cannot chat with yourself');
      alert('You cannot chat with yourself');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      console.log('🟡 Token exists:', !!token);
      
      if (!token) {
        router.push('/login');
        return;
      }


      console.log('🟡 Starting new chat with:', otherUserId);
      
      const response = await fetch(`${API_BASE_URL}/chats/start`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ otherUserId })
      });

      console.log('🟡 Response status:', response.status);

      if (response.ok) {
        const result = await response.json();
        console.log('🟢 API Response:', result);
        
        if (result.success && result.chatId) {
          console.log('🟢 Chat created! Redirecting to:', `/chats/${result.chatId}`);
  
          router.push(`/chats/${result.chatId}`);
          return;
        } else {
          throw new Error('Failed to start chat: No chatId returned');
        }
      } else if (response.status === 400) {
       
        console.log('🟡 Chat might already exist, fetching existing chats...');
        
        const chatsResponse = await fetch(`${API_BASE_URL}/chats/my-chats`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (chatsResponse.ok) {
          const chatsData = await chatsResponse.json();
          console.log('🟡 Existing chats:', chatsData);
          
          if (chatsData.success && chatsData.chats) {
   
            const existingChat = chatsData.chats.find((chat: any) => 
              chat.OtherUser?.id === otherUserId
            );
            
            if (existingChat) {
              console.log('🟢 Found existing chat:', existingChat.Id);
              router.push(`/chats/${existingChat.Id}`);
              return;
            }
          }
        }
        
  
        throw new Error('Chat not found and could not create new one');
      } else {
        const errorText = await response.text();
        console.log('🔴 API Error response:', errorText);
        throw new Error(errorText || `HTTP ${response.status}`);
      }
    } catch (err) {
      console.error('🔴 Error starting chat:', err);
      setError(err instanceof Error ? err.message : 'Failed to start chat');
      alert('Failed to start chat: ' + (err instanceof Error ? err.message : 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg'
  };

  return (
    <div className="relative">
      <button
        onClick={handleStartChat}
        disabled={loading}
        className={`flex items-center justify-center ${sizeClasses[size]} bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-300 font-semibold disabled:opacity-50 disabled:cursor-not-allowed`}
      >
        {loading ? (
          <>
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
            Connecting...
          </>
        ) : (
          <>
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            Contact {otherUserName}
          </>
        )}
      </button>
      
      {error && (
        <div className="absolute top-full left-0 mt-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm max-w-xs z-10">
          {error}
          <button 
            onClick={() => setError(null)}
            className="ml-2 text-red-800 font-bold"
          >
            ×
          </button>
        </div>
      )}
    </div>
  );
};

export default ContactButton;