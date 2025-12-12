// components/admin/common/ImageCarousel.tsx
'use client';

import React, { useState } from 'react';
import { Activity } from '../utils/types';

interface ImageCarouselProps {
  activity?: Activity; 
  images?: string[];  
}
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5224/api';

const ImageCarousel: React.FC<{ activity: Activity }> = ({ activity }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const hasImages = activity.images && activity.images.length > 0;
  const multipleImages = hasImages && activity.images.length > 1;

  const nextImage = () => {
    if (hasImages && multipleImages) {
      setCurrentIndex((prev) => (prev + 1) % activity.images.length);
    }
  };

  const prevImage = () => {
    if (hasImages && multipleImages) {
      setCurrentIndex((prev) => (prev === 0 ? activity.images.length - 1 : prev - 1));
    }
  };

  const getFullImageUrl = (imagePath: string): string => {
    if (!imagePath) {
      return 'https://images.unsplash.com/photo-1501555088652-021faa106b9b?w=500';
    }
    
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      return imagePath;
    }
    
    if (imagePath.startsWith('/')) {
      return `http://localhost:5224${imagePath}`;
    }
    
    return `http://localhost:5224/uploads/activity-images/${imagePath}`;
  };

  const handleDeleteImage = async (imageId: string) => {
    if (imageId === 'default') {
      alert('Cannot delete default image');
      return;
    }

    if (confirm('Are you sure you want to delete this image?')) {
      try {
        const token = localStorage.getItem('token');
        
        if (!imageId || imageId.length < 10) {
          throw new Error('Invalid image ID');
        }
        
        const response = await fetch(`${API_BASE_URL}/activityimages/${imageId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          alert('Image deleted successfully!');
          window.location.reload();
        } else {
          const errorText = await response.text();
          console.error('Delete response error:', errorText);
          throw new Error('Failed to delete image');
        }
      } catch (error) {
        console.error('Error deleting image:', error);
        alert(`Failed to delete image. ${error instanceof Error ? error.message : 'Please try again.'}`);
      }
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      
      Array.from(files).forEach(file => {
        formData.append('image', file);
      });

      const response = await fetch(`${API_BASE_URL}/activityimages/upload/${activity.id}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (response.ok) {
        alert('Images uploaded successfully!');
        window.location.reload();
      } else {
        throw new Error('Upload failed');
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload images. Please try again.');
    }
  };

  return (
    <div style={{ position: 'relative', marginBottom: '16px' }}>
      {hasImages ? (
        <>
          <img
            src={getFullImageUrl(activity.images[currentIndex]?.imageUrl)}
            alt={activity.name}
            style={{
              width: '100%',
              height: '200px',
              objectFit: 'cover',
              borderRadius: '8px',
              border: '2px solid #333333'
            }}
          />
          {multipleImages && (
            <>
              <button
                onClick={prevImage}
                style={{
                  position: 'absolute',
                  left: '8px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  backgroundColor: 'rgba(0,0,0,0.5)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '50%',
                  width: '32px',
                  height: '32px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                ‹
              </button>
              <button
                onClick={nextImage}
                style={{
                  position: 'absolute',
                  right: '8px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  backgroundColor: 'rgba(0,0,0,0.5)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '50%',
                  width: '32px',
                  height: '32px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                ›
              </button>
              <div style={{
                position: 'absolute',
                bottom: '8px',
                left: '50%',
                transform: 'translateX(-50%)',
                display: 'flex',
                gap: '4px'
              }}>
                {activity.images.map((_, index) => (
                  <div
                    key={index}
                    style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      backgroundColor: index === currentIndex ? '#4CAF50' : '#ffffff80'
                    }}
                  />
                ))}
              </div>
            </>
          )}
          <button
            onClick={() => handleDeleteImage(activity.images[currentIndex]?.id)}
            style={{
              position: 'absolute',
              top: '8px',
              right: '8px',
              backgroundColor: '#f44336',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              padding: '4px 8px',
              fontSize: '12px',
              cursor: 'pointer'
            }}
          >
            Delete Image
          </button>
        </>
      ) : (
        <div style={{
          width: '100%',
          height: '200px',
          backgroundColor: '#2a2a2a',
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#b0b0b0',
          border: '2px dashed #333333'
        }}>
          No Image Available
        </div>
      )}
      
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        marginTop: '10px',
        gap: '10px' 
      }}>
        <label style={{
          backgroundColor: '#4CAF50',
          color: 'white',
          padding: '8px 16px',
          borderRadius: '4px',
          cursor: 'pointer',
          fontSize: '14px'
        }}>
          📤 Upload Image
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleImageUpload}
            style={{ display: 'none' }}
          />
        </label>
      </div>
    </div>
  );
};

export default ImageCarousel;