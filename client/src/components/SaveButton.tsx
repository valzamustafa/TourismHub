// components/SaveButton.tsx
'use client';

import React, { useState, useEffect } from 'react';

interface SaveButtonProps {
  activityId: string;
  userId: string;
  size?: 'small' | 'medium' | 'large';
  onSaveChange?: (isSaved: boolean) => void;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5224/api';

export const SaveButton: React.FC<SaveButtonProps> = ({
  activityId,
  userId,
  size = 'medium',
  onSaveChange
}) => {
  const [isSaved, setIsSaved] = useState(false);
  const [loading, setLoading] = useState(false);
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    checkIfSaved();
  }, [activityId, userId]);

  const checkIfSaved = async () => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/savedactivities/check/${userId}/${activityId}`
      );
      if (response.ok) {
        const data = await response.json();
        setIsSaved(data.isSaved);
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
      
      if (isSaved) {
        // Unsave
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
          setIsSaved(false);
          onSaveChange?.(false);
        }
      } else {
        // Save
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
          setIsSaved(true);
          onSaveChange?.(true);
        }
      }
    } catch (error) {
      console.error('Error toggling save:', error);
    } finally {
      setLoading(false);
    }
  };

  const getButtonClasses = () => {
    const baseClasses = "transition-all duration-300 rounded-full flex items-center justify-center font-semibold";
    
    const sizeClasses = {
      small: 'px-3 py-1.5 text-sm',
      medium: 'px-4 py-2',
      large: 'px-6 py-3 text-lg'
    };

    const stateClasses = isSaved 
      ? 'bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 hover:border-red-300'
      : 'bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200 hover:border-gray-300';

    return `${baseClasses} ${sizeClasses[size]} ${stateClasses}`;
  };

  const getIcon = () => {
    if (loading) {
      return (
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
      );
    }
    
    if (isSaved) {
      return hovered ? '🗑️' : '❤️';
    }
    
    return '🤍';
  };

  const getText = () => {
    if (loading) return 'Processing...';
    if (isSaved) return hovered ? 'Remove' : 'Saved';
    return 'Save';
  };

  return (
    <button
      onClick={handleSaveToggle}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      disabled={loading}
      className={getButtonClasses()}
      title={isSaved ? "Remove from saved" : "Save activity"}
    >
      <span className="mr-2">{getIcon()}</span>
      {getText()}
    </button>
  );
};