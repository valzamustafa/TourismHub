// components/profile/ProfileAvatar.tsx
'use client';

import React, { useState } from 'react';

interface ProfileAvatarProps {
  imageUrl: string | null;
  userName: string;
  onImageChange: (file: File) => void;
  showUploadButton?: boolean;
  uploading?: boolean;
}

export const ProfileAvatar: React.FC<ProfileAvatarProps> = ({
  imageUrl,
  userName,
  onImageChange,
  showUploadButton = true,
  uploading = false
}) => {
  const [hovered, setHovered] = useState(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onImageChange(file);
    }
  };


  const getInitial = () => {
    if (!userName || userName.length === 0) return 'U';
    return userName.charAt(0).toUpperCase();
  };

  return (
    <div 
      className="relative w-32 h-32 mx-auto mb-4"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="w-full h-full rounded-full overflow-hidden border-4 border-white shadow-lg">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={userName || 'User'}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-blue-400 to-purple-500 flex items-center justify-center text-white text-4xl font-bold">
            {getInitial()}
          </div>
        )}
      </div>

      {showUploadButton && (
        <label className={`absolute bottom-0 right-0 bg-white p-2 rounded-full shadow-lg cursor-pointer transition-all duration-200 ${
          hovered ? 'scale-110' : ''
        } ${uploading ? 'cursor-not-allowed opacity-50' : 'hover:bg-gray-50'}`}>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
            disabled={uploading}
          />
          {uploading ? (
            <div className="animate-spin w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full"></div>
          ) : (
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          )}
        </label>
      )}
    </div>
  );
};
