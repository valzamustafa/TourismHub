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
  const [checking, setChecking] = useState(true);

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5224/api';

  useEffect(() => {
    checkIfSaved();
  }, [activityId, userId]);

  const checkIfSaved = async () => {
    if (!activityId || !userId) return;
    
    setChecking(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setChecking(false);
        return;
      }

     
      const response = await fetch(
        `${API_BASE_URL}/savedactivities/check/${userId}/${activityId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        setSaved(data.isSaved || false);
      } else if (response.status === 404) {
    
        setSaved(false);
      } else {
        console.error('Error checking saved status:', response.status);
      }
    } catch (error) {
      console.error('Error checking saved status:', error);
    } finally {
      setChecking(false);
    }
  };

  const handleSaveToggle = async () => {
    if (loading || checking) return;
    
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Please login to save activities');
        return;
      }

      if (saved) {
  
        const response = await fetch(
          `${API_BASE_URL}/savedactivities/unsave/${userId}/${activityId}`,
          {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );

        if (response.ok) {
          setSaved(false);
          onSaveChange?.(false);
        } else {
          const errorData = await response.json();
          console.error('Error unsaving:', errorData);
          alert('Failed to unsave activity');
        }
      } else {
      
        const response = await fetch(
          `${API_BASE_URL}/savedactivities/save/${userId}/${activityId}`,
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );

        if (response.ok) {
          setSaved(true);
          onSaveChange?.(true);
        } else if (response.status === 409) {

          const errorData = await response.json();
          alert(errorData.message || 'Activity already saved');
          setSaved(true); 
        } else {
          const errorData = await response.json();
          console.error('Error saving:', errorData);
          alert('Failed to save activity');
        }
      }
    } catch (error) {
      console.error('Error toggling save:', error);
      alert('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const sizeClasses = {
    small: 'w-8 h-8',
    medium: 'w-10 h-10',
    large: 'w-12 h-12'
  };

  const iconSizes = {
    small: 'w-4 h-4',
    medium: 'w-5 h-5',
    large: 'w-6 h-6'
  };

  if (checking) {
    return (
      <button
        disabled
        className={`${sizeClasses[size]} flex items-center justify-center rounded-full bg-white/90 backdrop-blur-sm text-gray-400`}
      >
        <div className={`${iconSizes[size]} border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin`} />
      </button>
    );
  }

  return (
    <button
      onClick={handleSaveToggle}
      disabled={loading}
      className={`${sizeClasses[size]} flex items-center justify-center rounded-full bg-white/90 backdrop-blur-sm transition-all duration-300 hover:scale-110 ${
        saved 
          ? 'text-red-500 hover:bg-red-50 shadow-lg shadow-red-200' 
          : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
      }`}
      title={saved ? 'Remove from saved' : 'Save activity'}
    >
      {loading ? (
        <div className={`${iconSizes[size]} border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin`} />
      ) : (
        <Heart 
          className={iconSizes[size]} 
          fill={saved ? 'currentColor' : 'none'}
          strokeWidth={2}
        />
      )}
    </button>
  );
};