// src/components/admin/modals/ActivityModal.tsx
'use client';

import React, { useState, useRef } from 'react';
import { Category, NewActivity } from '../utils/types';

interface ActivityModalProps {
  onClose: () => void;
  onSave: (data: NewActivity, images: File[]) => void;
  categories: Category[];
}

const ActivityModal: React.FC<ActivityModalProps> = ({ 
  onClose, 
  onSave, 
  categories 
}) => {
  const [formData, setFormData] = useState<NewActivity>({
    name: '',
    description: '',
    price: 0,
    availableSlots: 1,
    location: '',
    categoryId: '',
    duration: '2 hours',
    providerId: '',
    providerName: '',
    startDate: new Date().toISOString().slice(0, 16),
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
    images: [],
    included: '',
    requirements: '',
    quickFacts: ''
  });

  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingImages, setUploadingImages] = useState(false);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    
    if (files.length > 0) {
      const validFiles = files.filter(file => {
        if (!file.type.startsWith('image/')) {
          alert(`File ${file.name} is not an image`);
          return false;
        }
        if (file.size > 5 * 1024 * 1024) {
          alert(`Image ${file.name} is too large (max 5MB)`);
          return false;
        }
        return true;
      });

      setSelectedImages(prev => [...prev, ...validFiles]);

      validFiles.forEach(file => {
        const reader = new FileReader();
        reader.onload = (e) => {
          setImagePreviews(prev => [...prev, e.target?.result as string]);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const handleRemoveImage = (index: number) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const files = Array.from(event.dataTransfer.files);
    
    if (files.length > 0) {
      const dataTransfer = new DataTransfer();
      files.forEach(file => dataTransfer.items.add(file));
      
      const fakeEvent = {
        target: {
          files: dataTransfer.files
        }
      } as unknown as React.ChangeEvent<HTMLInputElement>;
      
      handleImageUpload(fakeEvent);
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('Form data before submitting:', formData);
    
    const errors: string[] = [];
    
    if (!formData.name || formData.name.trim() === '') {
      errors.push('Please enter activity name');
    }
    
    if (!formData.description || formData.description.trim() === '') {
      errors.push('Please enter activity description');
    }
    
    if (!formData.location || formData.location.trim() === '') {
      errors.push('Please enter activity location');
    }
    
    if (!formData.categoryId) {
      errors.push('Please select a category');
    }
    
    if (!formData.providerName || formData.providerName.trim() === '') {
      errors.push('Please enter provider name');
    }
    
    const startDate = new Date(formData.startDate);
    const endDate = new Date(formData.endDate);
    
    if (isNaN(startDate.getTime())) {
      errors.push('Invalid start date');
    }
    
    if (isNaN(endDate.getTime())) {
      errors.push('Invalid end date');
    }
    
    if (endDate <= startDate) {
      errors.push('End date must be after start date');
    }
    
    if (errors.length > 0) {
      alert('Please fix the following errors:\n\n' + errors.join('\n'));
      return;
    }
    
    console.log('Form data is valid, submitting...');
    onSave(formData, selectedImages);
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
        width: '800px',
        maxHeight: '95vh',
        overflowY: 'auto',
        border: '1px solid #333333'
      }}>
        <h3 style={{ color: '#ffffff', fontSize: '20px', fontWeight: 'bold', marginBottom: '20px' }}>
          Add New Activity
        </h3>
        
        <form onSubmit={handleSubmit}>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ color: '#b0b0b0', display: 'block', marginBottom: '8px' }}>Activity Images (Optional)</label>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageUpload}
              accept="image/*"
              multiple
              style={{ display: 'none' }}
            />
            
            <div 
              onClick={() => fileInputRef.current?.click()}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              style={{
                border: '2px dashed #666666',
                borderRadius: '8px',
                padding: '20px',
                textAlign: 'center',
                backgroundColor: '#2a2a2a',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
            >
              {imagePreviews.length > 0 ? (
                <div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '10px' }}>
                    {imagePreviews.map((preview, index) => (
                      <div key={index} style={{ position: 'relative' }}>
                        <img 
                          src={preview} 
                          alt={`Preview ${index + 1}`}
                          style={{
                            width: '100%',
                            height: '80px',
                            objectFit: 'cover',
                            borderRadius: '6px',
                            border: '1px solid #444444'
                          }}
                        />
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveImage(index);
                          }}
                          style={{
                            position: 'absolute',
                            top: '-5px',
                            right: '-5px',
                            backgroundColor: '#f44336',
                            color: 'white',
                            border: 'none',
                            borderRadius: '50%',
                            width: '20px',
                            height: '20px',
                            fontSize: '12px',
                            cursor: 'pointer'
                          }}
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                  <p style={{ color: '#4CAF50', fontSize: '14px' }}>
                    {selectedImages.length} images selected
                  </p>
                  <p style={{ color: '#b0b0b0', fontSize: '12px' }}>
                    Click or drag to add more images
                  </p>
                </div>
              ) : (
                <>
                  <div style={{ fontSize: '48px', marginBottom: '10px' }}>📁</div>
                  <p style={{ color: '#b0b0b0', marginBottom: '5px' }}>
                    Click to upload or drag and drop images
                  </p>
                  <p style={{ color: '#666666', fontSize: '11px' }}>
                    PNG, JPG, JPEG up to 5MB each
                  </p>
                </>
              )}
            </div>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ color: '#b0b0b0', display: 'block', marginBottom: '8px' }}>Activity Name *</label>
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
              placeholder="Enter activity name"
            />
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
            <div>
              <label style={{ color: '#b0b0b0', display: 'block', marginBottom: '8px' }}>
                Provider ID (Optional)
              </label>
              <input
                type="text"
                value={formData.providerId}
                onChange={(e) => setFormData({...formData, providerId: e.target.value})}
                style={{
                  width: '100%',
                  padding: '12px',
                  backgroundColor: '#2a2a2a',
                  border: '1px solid #333333',
                  borderRadius: '8px',
                  color: '#ffffff'
                }}
                placeholder="Leave empty if provider not in system"
              />
            </div>

            <div>
              <label style={{ color: '#b0b0b0', display: 'block', marginBottom: '8px' }}>
                Provider Name *
              </label>
              <input
                type="text"
                value={formData.providerName}
                onChange={(e) => setFormData({...formData, providerName: e.target.value})}
                style={{
                  width: '100%',
                  padding: '12px',
                  backgroundColor: '#2a2a2a',
                  border: '1px solid #333333',
                  borderRadius: '8px',
                  color: '#ffffff'
                }}
                required
                placeholder="Enter provider name"
              />
              <div style={{ color: '#666666', fontSize: '12px', marginTop: '4px' }}>
                Required if provider ID is not provided
              </div>
            </div>
          </div>
          
          <div style={{ marginBottom: '16px' }}>
            <label style={{ color: '#b0b0b0', display: 'block', marginBottom: '8px' }}>Description *</label>
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
              placeholder="Enter activity description"
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
            <div>
              <label style={{ color: '#b0b0b0', display: 'block', marginBottom: '8px' }}>Start Date & Time *</label>
              <input
                type="datetime-local"
                value={formData.startDate}
                onChange={(e) => setFormData({...formData, startDate: e.target.value})}
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

            <div>
              <label style={{ color: '#b0b0b0', display: 'block', marginBottom: '8px' }}>End Date & Time *</label>
              <input
                type="datetime-local"
                value={formData.endDate}
                onChange={(e) => setFormData({...formData, endDate: e.target.value})}
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
          </div>

          <div style={{ 
            marginBottom: '16px', 
            padding: '12px', 
            backgroundColor: '#2a2a2a', 
            borderRadius: '8px',
            border: '1px solid #333333'
          }}>
            <div style={{ color: '#b0b0b0', fontSize: '12px', marginBottom: '4px' }}>Activity Duration:</div>
            <div style={{ color: '#ffffff', fontSize: '14px', fontWeight: 'bold' }}>
              {(() => {
                const start = new Date(formData.startDate);
                const end = new Date(formData.endDate);
                const diffMs = end.getTime() - start.getTime();
                const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
                const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
                
                let duration = '';
                if (diffDays > 0) duration += `${diffDays} day${diffDays > 1 ? 's' : ''} `;
                if (diffHours > 0) duration += `${diffHours} hour${diffHours > 1 ? 's' : ''} `;
                if (diffMins > 0 && diffDays === 0) duration += `${diffMins} minute${diffMins > 1 ? 's' : ''}`;
                return duration.trim() || '0 minutes';
              })()}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
            <div>
              <label style={{ color: '#b0b0b0', display: 'block', marginBottom: '8px' }}>Price ($) *</label>
              <input
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({...formData, price: parseFloat(e.target.value)})}
                style={{
                  width: '100%',
                  padding: '12px',
                  backgroundColor: '#2a2a2a',
                  border: '1px solid #333333',
                  borderRadius: '8px',
                  color: '#ffffff'
                }}
                min="0"
                step="0.01"
                required
              />
            </div>

            <div>
              <label style={{ color: '#b0b0b0', display: 'block', marginBottom: '8px' }}>Available Slots *</label>
              <input
                type="number"
                value={formData.availableSlots}
                onChange={(e) => setFormData({...formData, availableSlots: parseInt(e.target.value)})}
                style={{
                  width: '100%',
                  padding: '12px',
                  backgroundColor: '#2a2a2a',
                  border: '1px solid #333333',
                  borderRadius: '8px',
                  color: '#ffffff'
                }}
                min="1"
                required
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
            <div>
              <label style={{ color: '#b0b0b0', display: 'block', marginBottom: '8px' }}>Location *</label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({...formData, location: e.target.value})}
                style={{
                  width: '100%',
                  padding: '12px',
                  backgroundColor: '#2a2a2a',
                  border: '1px solid #333333',
                  borderRadius: '8px',
                  color: '#ffffff'
                }}
                required
                placeholder="Enter activity location"
              />
            </div>

          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
            <div>
              <label style={{ color: '#b0b0b0', display: 'block', marginBottom: '8px' }}>Category *</label>
              <select
                value={formData.categoryId}
                onChange={(e) => setFormData({...formData, categoryId: e.target.value})}
                style={{
                  width: '100%',
                  padding: '12px',
                  backgroundColor: '#2a2a2a',
                  border: '1px solid #333333',
                  borderRadius: '8px',
                  color: '#ffffff'
                }}
                required
              >
                <option value="">Select Category</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>{category.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ color: '#b0b0b0', display: 'block', marginBottom: '8px' }}>Included (Optional)</label>
            <textarea
              value={formData.included || ''}
              onChange={(e) => setFormData({...formData, included: e.target.value})}
              style={{
                width: '100%',
                padding: '12px',
                backgroundColor: '#2a2a2a',
                border: '1px solid #333333',
                borderRadius: '8px',
                color: '#ffffff',
                minHeight: '60px'
              }}
              placeholder="What's included in this activity (separate with commas)"
            />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ color: '#b0b0b0', display: 'block', marginBottom: '8px' }}>Requirements (Optional)</label>
            <textarea
              value={formData.requirements || ''}
              onChange={(e) => setFormData({...formData, requirements: e.target.value})}
              style={{
                width: '100%',
                padding: '12px',
                backgroundColor: '#2a2a2a',
                border: '1px solid #333333',
                borderRadius: '8px',
                color: '#ffffff',
                minHeight: '60px'
              }}
              placeholder="Requirements for participants (e.g., age, fitness level)"
            />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ color: '#b0b0b0', display: 'block', marginBottom: '8px' }}>Quick Facts (Optional)</label>
            <textarea
              value={formData.quickFacts || ''}
              onChange={(e) => setFormData({...formData, quickFacts: e.target.value})}
              style={{
                width: '100%',
                padding: '12px',
                backgroundColor: '#2a2a2a',
                border: '1px solid #333333',
                borderRadius: '8px',
                color: '#ffffff',
                minHeight: '60px'
              }}
              placeholder="Interesting facts about the activity"
            />
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
              style={{
                padding: '12px 24px',
                backgroundColor: '#4CAF50',
                border: 'none',
                color: 'white',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: 'bold'
              }}
            >
              Create Activity
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ActivityModal;