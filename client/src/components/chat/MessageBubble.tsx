// components/chat/MessageBubble.tsx - Version i ri
'use client';

import React from 'react';

interface Message {
  id: string;
  content: string;
  sentAt: string;
  isRead: boolean;
  isSender: boolean;
  sender: {
    id: string;
    fullName: string;
    profileImage: string | null;
  };
}

interface MessageBubbleProps {
  message: Message;
}

export default function MessageBubble({ message }: MessageBubbleProps) {
  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div className={`flex ${message.isSender ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-[70%] rounded-xl p-4 ${message.isSender
          ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-br-none'
          : 'bg-gray-200 text-gray-800 rounded-bl-none'
        }`}>
        <p className="whitespace-pre-wrap">{message.content}</p>
        <div className={`text-xs mt-2 ${message.isSender ? 'text-blue-200' : 'text-gray-500'}`}>
          {formatTime(message.sentAt)}
          {message.isSender && (
            <span className="ml-2">
              {message.isRead ? '✓✓' : '✓'}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}