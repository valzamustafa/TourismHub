// components/SaveButton.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';

interface SaveButtonProps {
  activityId: string;
  userId: string;
  size?: 'small' | 'medium' | 'large';
  onSaveChange?: (saved: boolean) => void;
}

export const SaveButton: React.FC<SaveButtonProps> = ({ 
  activityId, 
  userId,
  size = 'medium',
  onSaveChange
}) => {
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    checkIfSaved();
  }, [activityId, userId]);

  const checkIfSaved = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `http://localhost:5224/api/saved-activities/check?activityId=${activityId}&userId=${userId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        setSaved(data.saved);
      }
    } catch (error) {
      console.error('Error checking saved status:', error);
    }
  };

  const handleSaveToggle = async () => {
    if (loading) return;
    
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      
      if (saved) {
      
        await fetch(`http://localhost:5224/api/saved-activities?activityId=${activityId}&userId=${userId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        setSaved(false);
        onSaveChange?.(false);
      } else {
        // Save
        await fetch('http://localhost:5224/api/saved-activities', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ activityId, userId })
        });
        setSaved(true);
        onSaveChange?.(true);
      }
    } catch (error) {
      console.error('Error toggling save:', error);
    } finally {
      setLoading(false);
    }
  };

  const sizeClasses = {
    small: 'w-8 h-8',
    medium: 'w-10 h-10',
    large: 'w-12 h-12'
  };

  return (
    <button
      onClick={handleSaveToggle}
      disabled={loading}
      className={`${sizeClasses[size]} flex items-center justify-center rounded-full bg-white/90 backdrop-blur-sm transition-all duration-300 ${
        saved 
          ? 'text-red-500 hover:bg-red-50' 
          : 'text-gray-700 hover:bg-gray-100'
      }`}
      title={saved ? 'Remove from saved' : 'Save activity'}
    >
      <Heart 
        className={size === 'small' ? 'w-4 h-4' : 'w-5 h-5'} 
        fill={saved ? 'currentColor' : 'none'}
      />
      {loading && (
        <span className="absolute inset-0 flex items-center justify-center">
          <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin" />
        </span>
      )}
    </button>
  );
};