// components/admin/modals/CategoryModal.tsx
'use client';

import React, { useState } from 'react';
import { Category } from '../utils/types';

interface CategoryModalProps {
  onClose: () => void;
  onSave: (categoryData: any) => void;
  category?: Category;
}


const CategoryModal: React.FC<{ onClose: () => void; onSave: (data: any) => void; category?: Category }> = ({ onClose, onSave, category }) => {
  const [formData, setFormData] = useState({
    name: category?.name || '',
    description: category?.description || '',
    imageUrl: category?.imageUrl || '',
    featured: category?.featured || false
  });
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(category?.imageUrl || null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleImageUpload = async (file: File) => {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error('Upload failed');
      }
      
      const data = await response.json();
      
      setFormData(prev => ({ 
        ...prev, 
        imageUrl: data.url 
      }));
      setPreviewUrl(data.url);
      
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Failed to upload image. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);
      handleImageUpload(file);
    }
  };

  const handleRemoveImage = () => {
    setFormData(prev => ({ ...prev, imageUrl: '' }));
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);
      handleImageUpload(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.imageUrl) {
      alert('Please upload a category image');
      return;
    }
    
    onSave(formData);
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.8)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div style={{
        backgroundColor: '#1e1e1e',
        padding: '24px',
        borderRadius: '12px',
        width: '500px',
        maxHeight: '90vh',
        overflowY: 'auto',
        border: '1px solid #333333'
      }}>
        <h3 style={{ color: '#ffffff', fontSize: '20px', fontWeight: 'bold', marginBottom: '20px' }}>
          {category ? 'Edit Category' : 'Add New Category'}
        </h3>
        
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ color: '#b0b0b0', display: 'block', marginBottom: '8px' }}>Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              style={{
                width: '100%',
                padding: '12px',
                backgroundColor: '#2a2a2a',
                border: '1px solid #333333',
                borderRadius: '8px',
                color: '#ffffff'
              }}
              required
            />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ color: '#b0b0b0', display: 'block', marginBottom: '8px' }}>Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              style={{
                width: '100%',
                padding: '12px',
                backgroundColor: '#2a2a2a',
                border: '1px solid #333333',
                borderRadius: '8px',
                color: '#ffffff',
                minHeight: '80px'
              }}
              required
            />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ color: '#b0b0b0', display: 'block', marginBottom: '8px' }}>
              Category Image {!formData.imageUrl && '*'}
            </label>
            {previewUrl ? (
              <div style={{ position: 'relative', marginBottom: '12px' }}>
                <img 
                  src={previewUrl} 
                  alt="Preview" 
                  style={{ 
                    width: '100%', 
                    height: '200px', 
                    objectFit: 'cover', 
                    borderRadius: '8px',
                    border: '2px solid #4CAF50'
                  }} 
                />
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  style={{
                    position: 'absolute',
                    top: '8px',
                    right: '8px',
                    backgroundColor: '#f44336',
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
                  ×
                </button>
              </div>
            ) : (
              <div
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                style={{
                  border: '2px dashed #666666',
                  borderRadius: '8px',
                  padding: '40px 20px',
                  textAlign: 'center',
                  backgroundColor: '#2a2a2a',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
                onClick={() => fileInputRef.current?.click()}
              >
                {uploading ? (
                  <div>
                    <div style={{ color: '#4CAF50', fontSize: '14px', marginBottom: '8px' }}>
                      Uploading...
                    </div>
                    <div style={{ 
                      width: '100%', 
                      height: '4px', 
                      backgroundColor: '#333333',
                      borderRadius: '2px',
                      overflow: 'hidden'
                    }}>
                      <div style={{
                        width: '50%',
                        height: '100%',
                        backgroundColor: '#4CAF50',
                        animation: 'loading 1.5s infinite'
                      }} />
                    </div>
                  </div>
                ) : (
                  <div>
                    <div style={{ fontSize: '48px', marginBottom: '12px' }}>📁</div>
                    <div style={{ color: '#b0b0b0', marginBottom: '8px' }}>
                      Click to upload or drag and drop
                    </div>
                    <div style={{ color: '#666666', fontSize: '12px' }}>
                      PNG, JPG, JPEG up to 5MB
                    </div>
                  </div>
                )}
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              style={{ display: 'none' }}
            />
            {uploading && (
              <div style={{ color: '#4CAF50', fontSize: '12px', marginTop: '8px' }}>
                ⏳ Uploading image...
              </div>
            )}
          </div>

          <div style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <input
              type="checkbox"
              checked={formData.featured}
              onChange={(e) => setFormData({...formData, featured: e.target.checked})}
              style={{ width: '18px', height: '18px' }}
            />
            <label style={{ color: '#b0b0b0' }}>Featured Category</label>
          </div>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '12px 24px',
                backgroundColor: 'transparent',
                border: '1px solid #666666',
                color: '#b0b0b0',
                borderRadius: '8px',
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={uploading || !formData.imageUrl}
              style={{
                padding: '12px 24px',
                backgroundColor: uploading || !formData.imageUrl ? '#666666' : '#4CAF50',
                border: 'none',
                color: 'white',
                borderRadius: '8px',
                cursor: uploading || !formData.imageUrl ? 'not-allowed' : 'pointer',
                fontWeight: 'bold',
                opacity: uploading || !formData.imageUrl ? 0.6 : 1
              }}
            >
              {uploading ? 'Uploading...' : (category ? 'Update' : 'Create') + ' Category'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CategoryModal;