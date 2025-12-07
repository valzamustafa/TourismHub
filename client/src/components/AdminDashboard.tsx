// components/AdminDashboard.tsx
import React, { useState, useEffect } from 'react';
import AnalyticsReports from './AnalyticsReports';
interface StatCardProps {
  title: string;
  value: string | number;
  subtitle: string;
  icon: React.ReactElement;
  color: string;
  progress?: number;
}

interface QuickActionProps {
  title: string;
  description: string;
  icon: React.ReactElement;
  action: () => void;
  color: string;
  count?: number;
}

interface Activity {
  id: string;
  name: string;
  description: string;
  price: number;
  availableSlots: number;
  location: string;
  category: string;
  categoryId: string;
  providerName: string;
  providerId: string;
  duration: string;
  status: string;
  images: ActivityImage[];
  createdAt: string;
  startDate: string;
  endDate: string;
}
interface ActivityStatusUpdateDto {
  Status: number;  // Numeric status value
}
interface RecentActivity {
  id: number;
  user: string;
  action: string;
  target: string;
  time: string;
}

interface ActivityImage {
  id: string;
  imageUrl: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  joinDate: string;
  status: string;
  isActive: boolean;
}

interface Category {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  featured: boolean;
  activityCount: number;
}

interface Booking {
  id: string;
  activityName: string;
  userName: string;
  userId: string;
  activityId: string;
  bookingDate: string;
  numberOfPeople: number;
  totalAmount: number;
  status: string;
  paymentStatus: string;
}

interface Provider {
  id: string;
  name: string;
  email: string;
}

interface NewActivity {
  name: string;
  description: string;
  price: number;
  availableSlots: number;
  location: string;
  categoryId: string;
  duration: string;
  providerId: string;
  providerName: string;
  images: string[];
  startDate: string;
  endDate: string;
  included?: string;
  requirements?: string;
  quickFacts?: string;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5224/api';

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

const ActivityModal: React.FC<{ 
  onClose: () => void; 
  onSave: (data: any) => void; 
  categories: Category[];
}> = ({ onClose, onSave, categories }) => {
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
        width: '700px',
        maxHeight: '90vh',
        overflowY: 'auto',
        border: '1px solid #333333'
      }}>
        <h3 style={{ color: '#ffffff', fontSize: '20px', fontWeight: 'bold', marginBottom: '20px' }}>
          Add New Activity
        </h3>
        
        <form onSubmit={handleSubmit}>
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

            <div>
              <label style={{ color: '#b0b0b0', display: 'block', marginBottom: '8px' }}>Duration *</label>
              <select
                value={formData.duration}
                onChange={(e) => setFormData({...formData, duration: e.target.value})}
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
                <option value="2 hours">2 hours</option>
                <option value="4 hours">4 hours</option>
                <option value="1 day">1 day</option>
                <option value="2 days">2 days</option>
                <option value="1 week">1 week</option>
              </select>
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

const ActivityEditModal: React.FC<{ 
  activity: Activity;
  onClose: () => void; 
  onSave: (data: any) => void; 
  categories: Category[];
}> = ({ activity, onClose, onSave, categories }) => {
  const [formData, setFormData] = useState({
    name: activity.name,
    description: activity.description,
    price: activity.price,
    availableSlots: activity.availableSlots,
    location: activity.location,
    categoryId: activity.categoryId,
    duration: activity.duration,
    providerId: activity.providerId,
    startDate: activity.startDate,
    endDate: activity.endDate,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.categoryId) {
      alert('Please select a category');
      return;
    }

    if (!formData.providerId) {
      alert('Please enter provider ID');
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
        width: '600px',
        maxHeight: '90vh',
        overflowY: 'auto',
        border: '1px solid #333333'
      }}>
        <h3 style={{ color: '#ffffff', fontSize: '20px', fontWeight: 'bold', marginBottom: '20px' }}>
          Edit Activity
        </h3>
        
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ color: '#b0b0b0', display: 'block', marginBottom: '8px' }}>Activity Name</label>
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

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
            <div>
              <label style={{ color: '#b0b0b0', display: 'block', marginBottom: '8px' }}>Price ($)</label>
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
              <label style={{ color: '#b0b0b0', display: 'block', marginBottom: '8px' }}>Available Slots</label>
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
              <label style={{ color: '#b0b0b0', display: 'block', marginBottom: '8px' }}>Location</label>
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
              />
            </div>

            <div>
              <label style={{ color: '#b0b0b0', display: 'block', marginBottom: '8px' }}>Duration</label>
              <select
                value={formData.duration}
                onChange={(e) => setFormData({...formData, duration: e.target.value})}
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
                <option value="2 hours">2 hours</option>
                <option value="4 hours">4 hours</option>
                <option value="1 day">1 day</option>
                <option value="2 days">2 days</option>
                <option value="1 week">1 week</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
            <div>
              <label style={{ color: '#b0b0b0', display: 'block', marginBottom: '8px' }}>Category</label>
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

            <div>
              <label style={{ color: '#b0b0b0', display: 'block', marginBottom: '8px' }}>Provider ID</label>
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
                required
              />
            </div>
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
              Update Activity
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const StatCard: React.FC<StatCardProps> = ({ title, value, subtitle, icon, color, progress }) => (
  <div style={{ 
    height: '100%', 
    background: `linear-gradient(135deg, ${color}20 0%, #1e1e1e 100%)`,
    border: `1px solid ${color}40`,
    transition: 'all 0.3s ease',
    borderRadius: '12px',
    padding: '16px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.2)'
  }}>
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <div>
        <div style={{ color: '#b0b0b0', fontSize: '12px', fontWeight: 'bold', marginBottom: '8px' }}>
          {title}
        </div>
        <div style={{ fontSize: '32px', fontWeight: 'bold', color: color }}>
          {value}
        </div>
        <div style={{ color: '#b0b0b0', fontSize: '14px' }}>
          {subtitle}
        </div>
      </div>
      <div
        style={{
          backgroundColor: color,
          borderRadius: '50%',
          padding: '12px',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        {icon}
      </div>
    </div>
    {progress !== undefined && (
      <div style={{ marginTop: '16px' }}>
        <div style={{ 
          borderRadius: '5px',
          height: '8px',
          backgroundColor: `${color}30`,
          overflow: 'hidden'
        }}>
          <div 
            style={{
              height: '100%',
              backgroundColor: color,
              width: `${progress}%`,
              transition: 'width 0.3s ease'
            }}
          />
        </div>
      </div>
    )}
  </div>
);

const QuickActionCard: React.FC<QuickActionProps> = ({ title, description, icon, action, color, count }) => (
  <div 
    style={{ 
      cursor: 'pointer', 
      transition: 'all 0.3s ease',
      background: `linear-gradient(135deg, ${color}20 0%, #1e1e1e 100%)`,
      border: `1px solid ${color}40`,
      borderRadius: '12px',
      padding: '24px',
      textAlign: 'center',
      boxShadow: '0 2px 10px rgba(0,0,0,0.2)'
    }}
    onClick={action}
  >
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <div
        style={{
          backgroundColor: color,
          borderRadius: '50%',
          padding: '16px',
          display: 'inline-flex',
          marginBottom: '16px',
          color: 'white'
        }}
      >
        {icon}
      </div>
      {count && (
        <div style={{
          position: 'absolute',
          top: '-8px',
          right: '-8px',
          backgroundColor: '#f44336',
          color: 'white',
          borderRadius: '50%',
          width: '20px',
          height: '20px',
          fontSize: '12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 'bold'
        }}>
          {count}
        </div>
      )}
    </div>
    <div style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '8px', color: '#ffffff' }}>
      {title}
    </div>
    <div style={{ color: '#b0b0b0', fontSize: '14px' }}>
      {description}
    </div>
  </div>
);

const ActivityApprovalItem: React.FC<{ activity: Activity }> = ({ activity }) => (
  <div
    style={{
      padding: '16px',
      marginBottom: '16px',
      border: '1px solid #333333',
      borderRadius: '8px',
      backgroundColor: '#1e1e1e',
      transition: 'all 0.3s ease'
    }}
  >
    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
      <div style={{
        width: '60px',
        height: '60px',
        backgroundColor: '#2196F3',
        borderRadius: '8px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        fontWeight: 'bold',
        fontSize: '1.5rem'
      }}>
        🏔️
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#ffffff' }}>
          {activity.name}
        </div>
        <div style={{ color: '#b0b0b0', fontSize: '14px' }}>
          by {activity.providerName}
        </div>
        <div style={{ marginTop: '8px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            padding: '4px 8px',
            border: '1px solid #2196F3',
            borderRadius: '16px',
            fontSize: '12px',
            color: '#2196F3'
          }}>
            📍 {activity.location}
          </div>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            padding: '4px 8px',
            border: '1px solid #9C27B0',
            borderRadius: '16px',
            fontSize: '12px',
            color: '#9C27B0'
          }}>
            {activity.category}
          </div>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            padding: '4px 8px',
            border: '1px solid #b0b0b0',
            borderRadius: '16px',
            fontSize: '12px',
            color: '#b0b0b0'
          }}>
            ⏰ {activity.duration}
          </div>
        </div>
      </div>
      <div>
        <div style={{ fontSize: '18px', color: '#2196F3', fontWeight: 'bold' }}>
          ${activity.price}
        </div>
        <div style={{ fontSize: '12px', color: '#b0b0b0', textAlign: 'center' }}>
          {activity.availableSlots} slots
        </div>
      </div>
    </div>
    
    <div style={{ marginTop: '16px', display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
      <button
        style={{
          padding: '8px 16px',
          border: '1px solid #f44336',
          borderRadius: '4px',
          backgroundColor: 'transparent',
          color: '#f44336',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '4px'
        }}
      >
        ❌ Reject
      </button>
      <button
        style={{
          padding: '8px 16px',
          border: 'none',
          borderRadius: '4px',
          backgroundColor: '#4CAF50',
          color: 'white',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          marginLeft: '8px'
        }}
      >
        ✅ Approve
      </button>
    </div>
  </div>
);

const RecentUsersTable: React.FC<{ users: User[] }> = ({ users }) => {
  return (
    <div style={{ borderRadius: '12px', overflow: 'hidden', boxShadow: '0 2px 10px rgba(0,0,0,0.2)', backgroundColor: '#1e1e1e' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead style={{ backgroundColor: '#333333' }}>
          <tr>
            <th style={{ color: 'white', fontWeight: 'bold', padding: '12px', textAlign: 'left' }}>User</th>
            <th style={{ color: 'white', fontWeight: 'bold', padding: '12px', textAlign: 'left' }}>Email</th>
            <th style={{ color: 'white', fontWeight: 'bold', padding: '12px', textAlign: 'left' }}>Role</th>
            <th style={{ color: 'white', fontWeight: 'bold', padding: '12px', textAlign: 'left' }}>Join Date</th>
            <th style={{ color: 'white', fontWeight: 'bold', padding: '12px', textAlign: 'left' }}>Status</th>
          </tr>
        </thead>
        <tbody>
          {users.slice(0, 5).map((user) => (
            <tr key={user.id} style={{ borderBottom: '1px solid #333333' }}>
              <td style={{ padding: '12px', color: '#ffffff' }}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <div style={{ 
                    width: '32px', 
                    height: '32px', 
                    backgroundColor: '#2196F3', 
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontWeight: 'bold',
                    marginRight: '8px'
                  }}>
                    {user.name.charAt(0)}
                  </div>
                  {user.name}
                </div>
              </td>
              <td style={{ padding: '12px', color: '#ffffff' }}>{user.email}</td>
              <td style={{ padding: '12px' }}>
                <div style={{
                  display: 'inline-flex',
                  padding: '4px 8px',
                  border: '1px solid #2196F3',
                  borderRadius: '16px',
                  fontSize: '12px',
                  color: user.role === 'Provider' ? '#2196F3' : 
                         user.role === 'Admin' ? '#4CAF50' : '#b0b0b0',
                  borderColor: user.role === 'Provider' ? '#2196F3' : 
                              user.role === 'Admin' ? '#4CAF50' : '#b0b0b0'
                }}>
                  {user.role}
                </div>
              </td>
              <td style={{ padding: '12px', color: '#ffffff' }}>{user.joinDate}</td>
              <td style={{ padding: '12px' }}>
                <div style={{
                  display: 'inline-flex',
                  padding: '4px 8px',
                  borderRadius: '16px',
                  fontSize: '12px',
                  backgroundColor: user.isActive ? '#4CAF5030' : '#f4433630',
                  color: user.isActive ? '#4CAF50' : '#f44336',
                  fontWeight: 'bold'
                }}>
                  {user.isActive ? 'Active' : 'Inactive'}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const UsersManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newUser, setNewUser] = useState({
    fullName: '',
    email: '',
    password: '',
    role: 'Tourist'
  });
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

 const fetchUsers = async () => {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch('http://localhost:5224/api/users', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (response.ok) {
      const usersData = await response.json();
      
      const activeUsers = usersData.filter((user: User) => 
        user.isActive === true || 
        user.status === 'Active' || 
        !user.email.includes('_deleted_')
      );
      setUsers(activeUsers);
    } else {
      console.error('Failed to fetch users');
    }
  } catch (error) {
    console.error('Error fetching users:', error);
  } finally {
    setLoading(false);
  }
};

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);

    try {
      const token = localStorage.getItem('token');
      
      const requestData = {
        FullName: newUser.fullName,
        Email: newUser.email,
        Password: newUser.password,
        Role: newUser.role
      };

      const response = await fetch('http://localhost:5224/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(requestData)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      setShowCreateModal(false);
      setNewUser({
        fullName: '',
        email: '',
        password: '',
        role: 'Tourist'
      });
      fetchUsers();
      alert('User created successfully!');
      
    } catch (error) {
      console.error('Error creating user:', error);
      alert(`Error creating user: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5224/api/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        fetchUsers();
        alert('User deleted successfully!');
      } else {
        const errorData = await response.json();
        alert(`Failed to delete user: ${errorData.message}`);
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('Error deleting user. Please try again.');
    }
  };

const handleUpdateRole = async (userId: string, newRole: string) => {
  try {
    const token = localStorage.getItem('token');
    
    const roleEnum = newRole === 'Admin' ? 0 : 
                     newRole === 'Provider' ? 1 : 2; 
    
    const response = await fetch(`http://localhost:5224/api/users/${userId}/role`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ 
        role: roleEnum 
      })
    });

    if (response.ok) {
      fetchUsers();
      alert('User role updated successfully!');
    } else {
      const errorData = await response.json();
      alert(`Failed to update role: ${errorData.message || 'Unknown error'}`);
    }
  } catch (error) {
    console.error('Error updating role:', error);
    alert('Error updating role. Please try again.');
  }
};

 const handleUpdateStatus = async (userId: string, isActive: boolean) => {
  try {
    const token = localStorage.getItem('token');
    
    if (!isActive) {
      if (confirm('Are you sure you want to deactivate this user? This will mark them as inactive.')) {
        const response = await fetch(`http://localhost:5224/api/users/${userId}/soft-delete`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          fetchUsers();
          alert('User deactivated successfully!');
        } else {
          const errorData = await response.json();
          alert(`Failed to deactivate user: ${errorData.message}`);
        }
      }
    } else {
    
      const response = await fetch(`http://localhost:5224/api/users/${userId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ isActive: true })
      });

      if (response.ok) {
        fetchUsers();
        alert('User activated successfully!');
      } else {
        const errorData = await response.json();
        alert(`Failed to activate user: ${errorData.message}`);
      }
    }
  } catch (error) {
    console.error('Error updating status:', error);
    alert('Error updating status. Please try again.');
  }
};

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '20px' }}>
        <div style={{ 
          animation: 'spin 1s linear infinite',
          border: '2px solid #f3f3f3',
          borderTop: '2px solid #3498db',
          borderRadius: '50%',
          width: '40px',
          height: '40px'
        }}></div>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px', backgroundColor: '#1e1e1e', borderRadius: '12px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h2 style={{ color: '#ffffff', fontSize: '24px', fontWeight: 'bold' }}>Users Management</h2>
        <button
          onClick={() => setShowCreateModal(true)}
          style={{
            padding: '12px 24px',
            backgroundColor: '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
        >
          + Add User
        </button>
      </div>

      <div style={{ borderRadius: '12px', overflow: 'hidden', boxShadow: '0 2px 10px rgba(0,0,0,0.2)', backgroundColor: '#1e1e1e' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead style={{ backgroundColor: '#333333' }}>
            <tr>
              <th style={{ color: 'white', fontWeight: 'bold', padding: '12px', textAlign: 'left' }}>User</th>
              <th style={{ color: 'white', fontWeight: 'bold', padding: '12px', textAlign: 'left' }}>Email</th>
              <th style={{ color: 'white', fontWeight: 'bold', padding: '12px', textAlign: 'left' }}>Role</th>
              <th style={{ color: 'white', fontWeight: 'bold', padding: '12px', textAlign: 'left' }}>Join Date</th>
              <th style={{ color: 'white', fontWeight: 'bold', padding: '12px', textAlign: 'left' }}>Status</th>
              <th style={{ color: 'white', fontWeight: 'bold', padding: '12px', textAlign: 'left' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} style={{ borderBottom: '1px solid #333333' }}>
                <td style={{ padding: '12px', color: '#ffffff' }}>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <div style={{ 
                      width: '32px', 
                      height: '32px', 
                      backgroundColor: '#2196F3', 
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontWeight: 'bold',
                      marginRight: '8px'
                    }}>
                      {user.name.charAt(0)}
                    </div>
                    {user.name}
                  </div>
                </td>
                <td style={{ padding: '12px', color: '#ffffff' }}>{user.email}</td>
                <td style={{ padding: '12px' }}>
                  <select
                    value={user.role}
                    onChange={(e) => handleUpdateRole(user.id, e.target.value)}
                    style={{
                      padding: '6px 12px',
                      borderRadius: '4px',
                      backgroundColor: '#2a2a2a',
                      color: '#ffffff',
                      border: '1px solid #444444',
                      cursor: 'pointer'
                    }}
                  >
                    <option value="Tourist">Tourist</option>
                    <option value="Provider">Provider</option>
                    <option value="Admin">Admin</option>
                  </select>
                </td>
                <td style={{ padding: '12px', color: '#ffffff' }}>{user.joinDate}</td>
                <td style={{ padding: '12px' }}>
                  <button
                    onClick={() => handleUpdateStatus(user.id, !user.isActive)}
                    style={{
                      padding: '6px 12px',
                      borderRadius: '16px',
                      fontSize: '12px',
                      backgroundColor: user.isActive ? '#4CAF5030' : '#f4433630',
                      color: user.isActive ? '#4CAF50' : '#f44336',
                      border: 'none',
                      cursor: 'pointer',
                      fontWeight: 'bold'
                    }}
                  >
                    {user.isActive ? 'Active' : 'Inactive'}
                  </button>
                </td>
                <td style={{ padding: '12px' }}>
                  <button
                    onClick={() => handleDeleteUser(user.id)}
                    style={{
                      padding: '6px 12px',
                      backgroundColor: '#f44336',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '12px'
                    }}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showCreateModal && (
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
            border: '1px solid #333333'
          }}>
            <h3 style={{ color: '#ffffff', fontSize: '20px', fontWeight: 'bold', marginBottom: '20px' }}>
              Create New User
            </h3>
            
            <form onSubmit={handleCreateUser}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ color: '#b0b0b0', display: 'block', marginBottom: '8px' }}>Full Name</label>
                <input
                  type="text"
                  value={newUser.fullName}
                  onChange={(e) => setNewUser({...newUser, fullName: e.target.value})}
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
                <label style={{ color: '#b0b0b0', display: 'block', marginBottom: '8px' }}>Email</label>
                <input
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({...newUser, email: e.target.value})}
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
                <label style={{ color: '#b0b0b0', display: 'block', marginBottom: '8px' }}>Password</label>
                <input
                  type="password"
                  value={newUser.password}
                  onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '12px',
                    backgroundColor: '#2a2a2a',
                    border: '1px solid #333333',
                    borderRadius: '8px',
                    color: '#ffffff'
                  }}
                  required
                  minLength={6}
                />
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label style={{ color: '#b0b0b0', display: 'block', marginBottom: '8px' }}>Role</label>
                <select
                  value={newUser.role}
                  onChange={(e) => setNewUser({...newUser, role: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '12px',
                    backgroundColor: '#2a2a2a',
                    border: '1px solid #333333',
                    borderRadius: '8px',
                    color: '#ffffff'
                  }}
                >
                  <option value="Tourist">Tourist</option>
                  <option value="Provider">Provider</option>
                  <option value="Admin">Admin</option>
                </select>
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
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
                  disabled={creating}
                  style={{
                    padding: '12px 24px',
                    backgroundColor: creating ? '#666666' : '#4CAF50',
                    border: 'none',
                    color: 'white',
                    borderRadius: '8px',
                    cursor: creating ? 'not-allowed' : 'pointer',
                    fontWeight: 'bold'
                  }}
                >
                  {creating ? 'Creating...' : 'Create User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const CategoriesManagement: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/categories`);
      if (!response.ok) throw new Error('Failed to fetch categories');
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCategory = async (categoryData: any) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/categories`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(categoryData)
      });
      
      if (response.ok) {
        fetchCategories();
        setShowAddModal(false);
        alert('Category created successfully!');
      } else {
        throw new Error('Failed to create category');
      }
    } catch (error) {
      console.error('Error adding category:', error);
      alert('Failed to create category. Please try again.');
    }
  };

  const handleUpdateCategory = async (categoryData: any) => {
    if (!editingCategory) return;
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/categories/${editingCategory.id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(categoryData)
      });
      
      if (response.ok) {
        fetchCategories();
        setEditingCategory(null);
        alert('Category updated successfully!');
      } else {
        throw new Error('Failed to update category');
      }
    } catch (error) {
      console.error('Error updating category:', error);
      alert('Failed to update category. Please try again.');
    }
  };

  const handleDeleteCategory = async (categoryId: string) => {
    if (confirm('Are you sure you want to delete this category?')) {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE_URL}/categories/${categoryId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (response.ok) {
          fetchCategories();
          alert('Category deleted successfully!');
        } else {
          throw new Error('Failed to delete category');
        }
      } catch (error) {
        console.error('Error deleting category:', error);
        alert('Failed to delete category. Please try again.');
      }
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '20px' }}>
        <div style={{ 
          animation: 'spin 1s linear infinite',
          border: '2px solid #f3f3f3',
          borderTop: '2px solid #3498db',
          borderRadius: '50%',
          width: '40px',
          height: '40px'
        }}></div>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px', backgroundColor: '#1e1e1e', borderRadius: '12px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h2 style={{ color: '#ffffff', fontSize: '24px', fontWeight: 'bold' }}>Categories Management</h2>
        <button
          onClick={() => setShowAddModal(true)}
          style={{
            padding: '12px 24px',
            backgroundColor: '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
        >
          + Add Category
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px' }}>
        {categories.map((category) => (
          <div key={category.id} style={{
            backgroundColor: '#2a2a2a',
            borderRadius: '12px',
            padding: '16px',
            border: '1px solid #333333'
          }}>
            <img 
              src={category.imageUrl} 
              alt={category.name}
              style={{
                width: '100%',
                height: '200px',
                objectFit: 'cover',
                borderRadius: '8px',
                marginBottom: '12px'
              }}
            />
            <h3 style={{ color: '#ffffff', fontSize: '18px', fontWeight: 'bold', marginBottom: '8px' }}>
              {category.name}
            </h3>
            <p style={{ color: '#b0b0b0', fontSize: '14px', marginBottom: '12px' }}>
              {category.description}
            </p>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{
                padding: '4px 8px',
                borderRadius: '16px',
                fontSize: '12px',
                backgroundColor: category.featured ? '#4CAF5030' : '#66666630',
                color: category.featured ? '#4CAF50' : '#b0b0b0'
              }}>
                {category.featured ? '⭐ Featured' : 'Standard'}
              </span>
              <span style={{ color: '#2196F3', fontSize: '14px' }}>
                {category.activityCount} activities
              </span>
            </div>
            <div style={{ marginTop: '16px', display: 'flex', gap: '8px' }}>
              <button
                onClick={() => setEditingCategory(category)}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#2196F3',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  flex: 1
                }}
              >
                Edit
              </button>
              <button
                onClick={() => handleDeleteCategory(category.id)}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#f44336',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  flex: 1
                }}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {categories.length === 0 && (
        <div style={{ textAlign: 'center', padding: '40px', color: '#b0b0b0' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>📂</div>
          <h3 style={{ fontSize: '20px', marginBottom: '8px' }}>No Categories Found</h3>
          <p>Create your first category to get started!</p>
        </div>
      )}

      {showAddModal && (
        <CategoryModal
          onClose={() => setShowAddModal(false)}
          onSave={handleAddCategory}
        />
      )}

      {editingCategory && (
        <CategoryModal
          onClose={() => setEditingCategory(null)}
          onSave={handleUpdateCategory}
          category={editingCategory}
        />
      )}
    </div>
  );
};

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

const ActivitiesManagement: React.FC = () => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);
  const [loading, setLoading] = useState(true);

  const checkActivityStatus = (activity: Activity): string => {

    if (activity.status && activity.status.trim() !== '' && activity.status !== 'Pending') {
      return activity.status;
    }
    const now = new Date();
    const endDate = activity.endDate ? new Date(activity.endDate) : null;
    const startDate = activity.startDate ? new Date(activity.startDate) : new Date(activity.createdAt);
    
    if (!endDate) {
      return activity.status || 'Pending';
    }
    
    if (endDate < now) {
      return 'Expired';
    }
    
    if (startDate > now) {
      return 'Upcoming';
    }
    
    if (startDate <= now && endDate >= now) {
      return 'Active';
    }
    
    return activity.status || 'Pending';
  };

  const isActivityBookable = (activity: Activity): boolean => {
    const status = checkActivityStatus(activity);
    return status === 'Active' || status === 'Upcoming';
  };

  useEffect(() => {
    fetchActivities();
    fetchCategories();
  }, []);

  const fetchActivities = async () => {
    try {
      console.log('Fetching activities...');
      const response = await fetch(`${API_BASE_URL}/activities?t=${Date.now()}`, {
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      });
      
      if (!response.ok) throw new Error('Failed to fetch activities');
      const data = await response.json();
      
      console.log('Fetched activities data:', data);
      
      const activitiesWithImages = await Promise.all(
        data.map(async (activity: any) => {
          try {
            const imagesResponse = await fetch(
              `${API_BASE_URL}/activityimages/activity/${activity.id}?t=${Date.now()}`,
              {
                headers: {
                  'Cache-Control': 'no-cache, no-store, must-revalidate'
                }
              }
            );
            
            let images: ActivityImage[] = [];
            if (imagesResponse.ok) {
              const imagesData = await imagesResponse.json();
              images = (imagesData.data || []).map((img: any) => ({
                id: img.id || `img-${Math.random()}`,
                imageUrl: img.imageUrl || img
              }));
            }
            
            console.log(`Activity ${activity.id} - Name: ${activity.name}, Status: ${activity.status}`);
            
            return {
              ...activity,
              images: images.length > 0 ? images : [{
                id: 'default',
                imageUrl: 'https://images.unsplash.com/photo-1501555088652-021faa106b9b?w=500'
              }],
              startDate: activity.startDate || activity.createdAt,
              endDate: activity.endDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
              status: activity.status || 'Pending'
            };
          } catch (error) {
            console.error(`Error fetching images for activity ${activity.id}:`, error);
            return {
              ...activity,
              images: [{
                id: 'default',
                imageUrl: 'https://images.unsplash.com/photo-1501555088652-021faa106b9b?w=500'
              }],
              startDate: activity.startDate || activity.createdAt,
              endDate: activity.endDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
              status: activity.status || 'Pending' 
            };
          }
        })
      );

      console.log('Final activities list with statuses:', 
        activitiesWithImages.map(a => ({ id: a.id, name: a.name, status: a.status }))
      );
      setActivities(activitiesWithImages);
    } catch (error) {
      console.error('Error fetching activities:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/categories`);
      if (!response.ok) throw new Error('Failed to fetch categories');
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleAddActivity = async (activityData: NewActivity) => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        alert('You need to login first!');
        return;
      }
      
      const formData = new FormData();
      
      formData.append('Name', activityData.name.trim());
      formData.append('Description', activityData.description.trim());
      formData.append('Price', activityData.price.toString());
      formData.append('AvailableSlots', activityData.availableSlots.toString());
      formData.append('Location', activityData.location.trim());
      formData.append('CategoryId', activityData.categoryId);
      formData.append('Duration', activityData.duration);
      formData.append('ProviderName', activityData.providerName?.trim() || 'Unknown Provider');
      
      if (activityData.providerId && activityData.providerId.trim()) {
        formData.append('ProviderId', activityData.providerId.trim());
      }
      
      formData.append('StartDate', new Date(activityData.startDate).toISOString());
      formData.append('EndDate', new Date(activityData.endDate).toISOString());
      
      if (activityData.included && activityData.included.trim()) {
        formData.append('Included', activityData.included.trim());
      } else {
        formData.append('Included', '');
      }
      
      if (activityData.requirements && activityData.requirements.trim()) {
        formData.append('Requirements', activityData.requirements.trim());
      } else {
        formData.append('Requirements', '');
      }
      
      if (activityData.quickFacts && activityData.quickFacts.trim()) {
        formData.append('QuickFacts', activityData.quickFacts.trim());
      } else {
        formData.append('QuickFacts', '');
      }
      
      console.log('=== FORM DATA ===');
      const formDataObj: Record<string, string> = {};
      for (const [key, value] of formData.entries()) {
        formDataObj[key] = value.toString();
      }
      console.table(formDataObj);
      
      const response = await fetch(`${API_BASE_URL}/activities`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });
      
      console.log('Response status:', response.status);
      const responseText = await response.text();
      console.log('Response text:', responseText);
      
      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}: Failed to create activity`;
        try {
          const errorData = JSON.parse(responseText);
          console.error('Error details:', errorData);
          
          if (errorData.errors) {
            const validationErrors = Object.entries(errorData.errors)
              .flatMap(([key, errors]: [string, any]) => 
                Array.isArray(errors) 
                  ? errors.map(err => `• ${key}: ${err}`)
                  : `• ${key}: ${errors}`
              );
            errorMessage = `Validation failed:\n${validationErrors.join('\n')}`;
          } else if (errorData.message) {
            errorMessage = errorData.message;
          }
        } catch {
          if (responseText.includes('Validation failed')) {
            errorMessage = responseText;
          }
        }
        throw new Error(errorMessage);
      }
      
      const result = JSON.parse(responseText);
      console.log('✅ Success:', result);
      
      await fetchActivities();
      setShowAddModal(false);
      alert('✅ Activity created successfully!');
      
    } catch (error) {
      console.error('❌ Full error:', error);
      alert(`❌ Failed to create activity:\n\n${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleEditActivity = async (activityData: any) => {
    if (!editingActivity) return;
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/activities/${editingActivity.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(activityData)
      });
      
      if (response.ok) {
        fetchActivities();
        setShowEditModal(false);
        setEditingActivity(null);
        alert('Activity updated successfully!');
      } else {
        throw new Error('Failed to update activity');
      }
    } catch (error) {
      console.error('Error updating activity:', error);
      alert('Failed to update activity. Please try again.');
    }
  };

  const handleDeleteActivity = async (activityId: string) => {
    if (confirm('Are you sure you want to delete this activity?')) {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE_URL}/activities/${activityId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (response.ok) {
          fetchActivities();
          alert('Activity deleted successfully!');
        } else {
          throw new Error('Failed to delete activity');
        }
      } catch (error) {
        console.error('Error deleting activity:', error);
        alert('Failed to delete activity. Please try again.');
      }
    }
  };

const handleUpdateActivityStatus = async (activityId: string, status: string) => {
  try {
    const token = localStorage.getItem('token');
    
    const requestBody = {
      Status: status  
    };
    
    console.log('Sending status update:', requestBody);
    
    const response = await fetch(`${API_BASE_URL}/activities/${activityId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache'
      },
      body: JSON.stringify(requestBody)
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Error response:', errorText);
      throw new Error(`Failed to update activity status: ${response.status}`);
    }
    
    const result = await response.json();
    console.log('Update successful:', result);
    
    setActivities(prev => prev.map(activity => 
      activity.id === activityId 
        ? { ...activity, status: status }
        : activity
    ));
    
    alert(`Activity status updated to ${status}!`);
    
  } catch (error) {
    console.error('Error updating activity status:', error);
    alert(`Failed to update activity status. ${error instanceof Error ? error.message : 'Please try again.'}`);
  }
};

  const startEditActivity = (activity: Activity) => {
    setEditingActivity(activity);
    setShowEditModal(true);
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '20px' }}>
        <div style={{ 
          animation: 'spin 1s linear infinite',
          border: '2px solid #f3f3f3',
          borderTop: '2px solid #3498db',
          borderRadius: '50%',
          width: '40px',
          height: '40px'
        }}></div>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px', backgroundColor: '#1e1e1e', borderRadius: '12px', minHeight: '100vh' }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '32px',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div>
          <h2 style={{ color: '#ffffff', fontSize: '28px', fontWeight: 'bold', marginBottom: '8px' }}>
            Activities Management
          </h2>
          <div style={{ color: '#b0b0b0', fontSize: '16px' }}>
            Manage all activities and their images
          </div>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          style={{
            padding: '14px 28px',
            backgroundColor: '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '10px',
            cursor: 'pointer',
            fontWeight: 'bold',
            fontSize: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'all 0.3s ease'
          }}
        >
          <span>+</span>
          Add New Activity
        </button>
      </div>

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '20px',
        marginBottom: '32px'
      }}>
        <div style={{
          backgroundColor: '#2a2a2a',
          padding: '20px',
          borderRadius: '12px',
          border: '1px solid #333333',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#4CAF50', marginBottom: '8px' }}>
            {activities.filter(a => a.status === 'Active' || checkActivityStatus(a) === 'Active').length}
          </div>
          <div style={{ color: '#b0b0b0', fontSize: '14px' }}>Active Activities</div>
        </div>
        <div style={{
          backgroundColor: '#2a2a2a',
          padding: '20px',
          borderRadius: '12px',
          border: '1px solid #333333',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#2196F3', marginBottom: '8px' }}>
            {activities.filter(a => checkActivityStatus(a) === 'Upcoming').length}
          </div>
          <div style={{ color: '#b0b0b0', fontSize: '14px' }}>Upcoming Activities</div>
        </div>
        <div style={{
          backgroundColor: '#2a2a2a',
          padding: '20px',
          borderRadius: '12px',
          border: '1px solid #333333',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#f44336', marginBottom: '8px' }}>
            {activities.filter(a => checkActivityStatus(a) === 'Expired').length}
          </div>
          <div style={{ color: '#b0b0b0', fontSize: '14px' }}>Expired Activities</div>
        </div>
        <div style={{
          backgroundColor: '#2a2a2a',
          padding: '20px',
          borderRadius: '12px',
          border: '1px solid #333333',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#FF9800', marginBottom: '8px' }}>
            {activities.filter(a => a.status === 'Pending').length}
          </div>
          <div style={{ color: '#b0b0b0', fontSize: '14px' }}>Pending Approval</div>
        </div>
      </div>

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', 
        gap: '28px' 
      }}>
        {activities.map((activity) => {
  
          const activityStatus = activity.status || checkActivityStatus(activity);
          const isBookable = isActivityBookable(activity);
          
          return (
            <div key={activity.id} style={{
              backgroundColor: '#2a2a2a',
              borderRadius: '16px',
              padding: '20px',
              border: `1px solid ${
                activityStatus === 'Active' ? '#4CAF5040' : 
                activityStatus === 'Upcoming' ? '#2196F340' :
                activityStatus === 'Expired' ? '#f4433640' : '#FF980040'
              }`,
              transition: 'all 0.3s ease',
              boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
              opacity: activityStatus === 'Expired' ? 0.8 : 1
            }}>
              <ImageCarousel activity={activity} />
              
              <div style={{ marginBottom: '16px' }}>
                <h3 style={{ 
                  color: '#ffffff', 
                  fontSize: '20px', 
                  fontWeight: 'bold', 
                  marginBottom: '8px',
                  lineHeight: '1.3'
                }}>
                  {activity.name}
                </h3>
                
                <p style={{ 
                  color: '#b0b0b0', 
                  fontSize: '14px', 
                  marginBottom: '12px',
                  lineHeight: '1.5',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden'
                }}>
                  {activity.description}
                </p>
              </div>

              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: '1fr 1fr', 
                gap: '12px',
                marginBottom: '16px',
                padding: '12px',
                backgroundColor: '#333333',
                borderRadius: '8px'
              }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ color: '#b0b0b0', fontSize: '12px', marginBottom: '4px' }}>Start Date</div>
                  <div style={{ 
                    color: '#ffffff', 
                    fontSize: '14px', 
                    fontWeight: 'bold',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px'
                  }}>
                    <span>📅</span>
                    {new Date(activity.startDate).toLocaleDateString()}
                  </div>
                  <div style={{ color: '#b0b0b0', fontSize: '11px' }}>
                    {new Date(activity.startDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ color: '#b0b0b0', fontSize: '14px' }}>👤</span>
                  <span style={{ color: '#ffffff', fontSize: '14px' }}>
                    {activity.providerName || activity.providerName || "Unknown Provider"}
                  </span>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ color: '#b0b0b0', fontSize: '12px', marginBottom: '4px' }}>End Date</div>
                  <div style={{ 
                    color: activityStatus === 'Expired' ? '#f44336' : '#ffffff', 
                    fontSize: '14px', 
                    fontWeight: 'bold',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px'
                  }}>
                    <span>📅</span>
                    {new Date(activity.endDate).toLocaleDateString()}
                  </div>
                  <div style={{ color: '#b0b0b0', fontSize: '11px' }}>
                    {new Date(activity.endDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>

              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                marginBottom: '16px' 
              }}>
                <span style={{ 
                  color: '#2196F3', 
                  fontSize: '24px', 
                  fontWeight: 'bold' 
                }}>
                  ${activity.price}
                </span>
                <span style={{
                  padding: '6px 12px',
                  borderRadius: '20px',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  backgroundColor: 
                    activityStatus === 'Active' ? '#4CAF5030' : 
                    activityStatus === 'Upcoming' ? '#2196F330' :
                    activityStatus === 'Expired' ? '#f4433630' : '#FF980030',
                  color: 
                    activityStatus === 'Active' ? '#4CAF50' : 
                    activityStatus === 'Upcoming' ? '#2196F3' :
                    activityStatus === 'Expired' ? '#f44336' : '#FF9800',
                  border: `1px solid ${
                    activityStatus === 'Active' ? '#4CAF50' : 
                    activityStatus === 'Upcoming' ? '#2196F3' :
                    activityStatus === 'Expired' ? '#f44336' : '#FF9800'
                  }30`
                }}>
                  {activityStatus}
                </span>
              </div>

              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: '1fr 1fr', 
                gap: '12px',
                marginBottom: '20px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ color: '#b0b0b0', fontSize: '14px' }}>📍</span>
                  <span style={{ color: '#ffffff', fontSize: '14px' }}>{activity.location}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ color: '#b0b0b0', fontSize: '14px' }}>⏰</span>
                  <span style={{ color: '#ffffff', fontSize: '14px' }}>{activity.duration}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ color: '#b0b0b0', fontSize: '14px' }}>🏷️</span>
                  <span style={{ color: '#ffffff', fontSize: '14px' }}>{activity.category}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ color: '#b0b0b0', fontSize: '14px' }}>👤</span>
                  <span style={{ color: '#ffffff', fontSize: '14px' }}>{activity.providerName}</span>
                </div>
              </div>

              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between',
                marginBottom: '20px',
                padding: '12px',
                backgroundColor: '#333333',
                borderRadius: '8px'
              }}>
                <span style={{ color: '#b0b0b0', fontSize: '14px' }}>Available Slots:</span>
                <span style={{ 
                  fontSize: '16px', 
                  fontWeight: 'bold',
                  color: activity.availableSlots > 5 ? '#4CAF50' : activity.availableSlots > 0 ? '#FF9800' : '#f44336'
                }}>
                  {activity.availableSlots} {activity.availableSlots === 1 ? 'slot' : 'slots'} left
                </span>
              </div>

              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: '1fr 1fr 1fr', 
                gap: '10px' 
              }}>
              
                <select
                  value={activity.status || checkActivityStatus(activity)}
                  onChange={(e) => handleUpdateActivityStatus(activity.id, e.target.value)}
                  style={{
                    padding: '10px 12px',
                    borderRadius: '8px',
                    backgroundColor: '#2a2a2a',
                    color: '#ffffff',
                    border: '1px solid #444444',
                    cursor: 'pointer',
                    fontSize: '13px',
                    fontWeight: '500'
                  }}
                >
                  <option value="Pending">Pending</option>
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                  <option value="Rejected">Rejected</option>
                  <option value="Completed">Completed</option>
                  <option value="Expired">Expired</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
                
                <button
                  onClick={() => startEditActivity(activity)}
                  style={{
                    padding: '10px 12px',
                    backgroundColor: '#FF9800',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '13px',
                    fontWeight: '500',
                    transition: 'all 0.3s ease',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px'
                  }}
                >
                  <span>✏️</span>
                  Edit
                </button>
                
                <button
                  onClick={() => handleDeleteActivity(activity.id)}
                  style={{
                    padding: '10px 12px',
                    backgroundColor: '#f44336',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '13px',
                    fontWeight: '500',
                    transition: 'all 0.3s ease',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px'
                  }}
                >
                  <span>🗑️</span>
                  Delete
                </button>
              </div>

              <button
                onClick={() => {
                  if (isBookable) {
                  }
                }}
                disabled={!isBookable}
                style={{
                  width: '100%',
                  marginTop: '16px',
                  padding: '12px',
                  backgroundColor: isBookable ? '#4CAF50' : '#666666',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: isBookable ? 'pointer' : 'not-allowed',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  transition: 'all 0.3s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
              >
                {isBookable ? 'Book Now' : 'Not Available'}
                {!isBookable && <span>⛔</span>}
              </button>
            </div>
          );
        })}
      </div>

      {activities.length === 0 && (
        <div style={{ 
          textAlign: 'center', 
          padding: '80px 40px', 
          color: '#b0b0b0',
          backgroundColor: '#2a2a2a',
          borderRadius: '16px',
          border: '2px dashed #333333',
          marginTop: '20px'
        }}>
          <div style={{ fontSize: '80px', marginBottom: '24px' }}>🏔️</div>
          <h3 style={{ fontSize: '24px', marginBottom: '12px', color: '#ffffff' }}>
            No Activities Found
          </h3>
          <p style={{ fontSize: '16px', marginBottom: '32px', maxWidth: '400px', margin: '0 auto 32px' }}>
            Get started by creating your first activity to showcase amazing experiences!
          </p>
          <button
            onClick={() => setShowAddModal(true)}
            style={{
              padding: '14px 32px',
              backgroundColor: '#4CAF50',
              color: 'white',
              border: 'none',
              borderRadius: '10px',
              cursor: 'pointer',
              fontWeight: 'bold',
              fontSize: '16px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <span>+</span>
            Create Your First Activity
          </button>
        </div>
      )}

      {showAddModal && (
        <ActivityModal
          onClose={() => setShowAddModal(false)}
          onSave={handleAddActivity}
          categories={categories}
        />
      )}

      {showEditModal && editingActivity && (
        <ActivityEditModal
          activity={editingActivity}
          onClose={() => {
            setShowEditModal(false);
            setEditingActivity(null);
          }}
          onSave={handleEditActivity}
          categories={categories}
        />
      )}
    </div>
  );
};

const BookingsManagement: React.FC<{ 
  bookings: Booking[];
  filteredBookings: Booking[];
  providers: Provider[];
  selectedProvider: string;
  onProviderChange: (providerId: string) => void;
}> = ({ bookings, filteredBookings, providers, selectedProvider, onProviderChange }) => {
  const handleUpdateBookingStatus = async (bookingId: string, status: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/bookings/${bookingId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });

      if (response.ok) {
        alert('Booking status updated successfully!');
        window.location.reload();
      } else {
        throw new Error('Failed to update booking status');
      }
    } catch (error) {
      console.error('Error updating booking status:', error);
      alert('Failed to update booking status. Please try again.');
    }
  };

  return (
    <div style={{ padding: '24px', backgroundColor: '#1e1e1e', borderRadius: '12px' }}>
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ color: '#ffffff', fontSize: '24px', fontWeight: 'bold', marginBottom: '16px' }}>
          Bookings Management
        </h2>
        
        <div style={{ marginBottom: '24px' }}>
          <label style={{ color: '#b0b0b0', display: 'block', marginBottom: '8px' }}>
            Filter by Provider:
          </label>
          <select
            value={selectedProvider}
            onChange={(e) => onProviderChange(e.target.value)}
            style={{
              padding: '8px 12px',
              backgroundColor: '#2a2a2a',
              border: '1px solid #444444',
              borderRadius: '6px',
              color: '#ffffff',
              minWidth: '200px'
            }}
          >
            <option value="all">All Providers</option>
            {providers.map((provider) => (
              <option key={provider.id} value={provider.id}>
                {provider.name}
              </option>
            ))}
          </select>
        </div>

        <div style={{ 
          backgroundColor: '#2a2a2a', 
          borderRadius: '8px', 
          overflow: 'hidden',
          border: '1px solid #333333'
        }}>
          <div style={{ padding: '16px' }}>
            <h3 style={{ color: '#ffffff', fontSize: '18px', fontWeight: 'bold', marginBottom: '16px' }}>
              Bookings {selectedProvider !== 'all' ? `for Selected Provider` : ''}
            </h3>
            {filteredBookings.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px', color: '#b0b0b0' }}>
                No bookings found
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead style={{ backgroundColor: '#333333' }}>
                    <tr>
                      <th style={{ color: 'white', fontWeight: 'bold', padding: '12px', textAlign: 'left' }}>Activity</th>
                      <th style={{ color: 'white', fontWeight: 'bold', padding: '12px', textAlign: 'left' }}>User</th>
                      <th style={{ color: 'white', fontWeight: 'bold', padding: '12px', textAlign: 'left' }}>Date</th>
                      <th style={{ color: 'white', fontWeight: 'bold', padding: '12px', textAlign: 'left' }}>People</th>
                      <th style={{ color: 'white', fontWeight: 'bold', padding: '12px', textAlign: 'left' }}>Amount</th>
                      <th style={{ color: 'white', fontWeight: 'bold', padding: '12px', textAlign: 'left' }}>Status</th>
                      <th style={{ color: 'white', fontWeight: 'bold', padding: '12px', textAlign: 'left' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredBookings.map((booking) => (
                      <tr key={booking.id} style={{ borderBottom: '1px solid #333333' }}>
                        <td style={{ padding: '12px', color: '#ffffff' }}>
                          {booking.activityName}
                        </td>
                        <td style={{ padding: '12px', color: '#ffffff' }}>
                          {booking.userName}
                        </td>
                        <td style={{ padding: '12px', color: '#ffffff' }}>
                          {new Date(booking.bookingDate).toLocaleDateString()}
                        </td>
                        <td style={{ padding: '12px', color: '#ffffff' }}>
                          {booking.numberOfPeople}
                        </td>
                        <td style={{ padding: '12px', color: '#ffffff' }}>
                          ${booking.totalAmount}
                        </td>
                        <td style={{ padding: '12px' }}>
                          <span style={{
                            padding: '4px 8px',
                            borderRadius: '12px',
                            fontSize: '12px',
                            fontWeight: 'bold',
                            backgroundColor: 
                              booking.status === 'Confirmed' ? '#4CAF5030' :
                              booking.status === 'Pending' ? '#FF980030' : '#f4433630',
                            color: 
                              booking.status === 'Confirmed' ? '#4CAF50' :
                              booking.status === 'Pending' ? '#FF9800' : '#f44336'
                          }}>
                            {booking.status}
                          </span>
                        </td>
                        <td style={{ padding: '12px' }}>
                          <select
                            value={booking.status}
                            onChange={(e) => handleUpdateBookingStatus(booking.id, e.target.value)}
                            style={{
                              padding: '6px 12px',
                              borderRadius: '4px',
                              backgroundColor: '#2a2a2a',
                              color: '#ffffff',
                              border: '1px solid #444444',
                              cursor: 'pointer',
                              fontSize: '12px'
                            }}
                          >
                            <option value="Pending">Pending</option>
                            <option value="Confirmed">Confirmed</option>
                            <option value="Cancelled">Cancelled</option>
                            <option value="Completed">Completed</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const AdminDashboard: React.FC = () => {
  const [activeSection, setActiveSection] = useState('dashboard');
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([]);
  const [selectedProvider, setSelectedProvider] = useState<string>('all');
  const [providers, setProviders] = useState<Provider[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalActivities: 0,
    totalBookings: 0,
    totalRevenue: 0,
    pendingApprovals: 0
  });
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);
  const [pendingActivities, setPendingActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  
  const menuItems = [
    { text: 'Dashboard', icon: '📊', section: 'dashboard' },
    { text: 'Users', icon: '👥', section: 'users' },
    { text: 'Categories', icon: '📂', section: 'categories' },
    { text: 'Activities', icon: '🏔️', section: 'activities' },
    { text: 'Bookings', icon: '📅', section: 'bookings' },
    { text: 'Analytics', icon: '📈', section: 'analytics' },
  ];

  const quickActions: QuickActionProps[] = [
    {
      title: 'Manage Users',
      description: 'View and manage user accounts',
      icon: <span>👥</span>,
      color: '#2196F3',
      action: () => setActiveSection('users')
    },
    {
      title: 'Manage Categories',
      description: 'Create and edit activity categories',
      icon: <span>📂</span>,
      color: '#4CAF50',
      action: () => setActiveSection('categories')
    },
    {
      title: 'Manage Activities',
      description: 'Create and manage activities',
      icon: <span>🏔️</span>,
      color: '#FF9800',
      action: () => setActiveSection('activities')
    },
    {
      title: 'View Bookings',
      description: 'Oversee all bookings',
      icon: <span>📅</span>,
      color: '#9C27B0',
      action: () => setActiveSection('bookings')
    }
  ];

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
    
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
       
        const usersResponse = await fetch(`${API_BASE_URL}/users`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (usersResponse.ok) {
          const usersData = await usersResponse.json();
          setUsers(usersData);
        }

        const activitiesResponse = await fetch(`${API_BASE_URL}/activities`);
        if (activitiesResponse.ok) {
          const activitiesData = await activitiesResponse.json();
          setActivities(activitiesData);
        }

        const categoriesResponse = await fetch(`${API_BASE_URL}/categories`);
        if (categoriesResponse.ok) {
          const categoriesData = await categoriesResponse.json();
          setCategories(categoriesData);
        }

        const bookingsResponse = await fetch(`${API_BASE_URL}/bookings`);
        if (bookingsResponse.ok) {
          const bookingsData = await bookingsResponse.json();
          setBookings(bookingsData);
          setFilteredBookings(bookingsData);
        }

        const providersResponse = await fetch(`${API_BASE_URL}/users?role=Provider`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (providersResponse.ok) {
          const providersData = await providersResponse.json();
          setProviders(providersData);
        }

        const totalUsers = users.length;
        const totalActivities = activities.length;
        const totalBookings = bookings.length;
        const totalRevenue = bookings.reduce((sum, booking) => sum + booking.totalAmount, 0);
        const pendingApprovals = activities.filter(activity => activity.status === 'Pending').length;

        setStats({
          totalUsers,
          totalActivities,
          totalBookings,
          totalRevenue,
          pendingApprovals
        });

        setPendingActivities(activities.filter(activity => activity.status === 'Pending'));
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (selectedProvider === 'all') {
      setFilteredBookings(bookings);
    } else {
      const filtered = bookings.filter(booking => {
        const activity = activities.find(a => a.id === booking.activityId);
        return activity?.providerId === selectedProvider;
      });
      setFilteredBookings(filtered);
    }
  }, [selectedProvider, bookings, activities]);

  const revenueData = [
    { month: 'Jan', revenue: 4000 },
    { month: 'Feb', revenue: 3000 },
    { month: 'Mar', revenue: 5000 },
    { month: 'Apr', revenue: 4500 },
    { month: 'May', revenue: 6000 },
    { month: 'Jun', revenue: 7000 }
  ];

  const maxRevenue = Math.max(...revenueData.map((d) => d.revenue));

  const renderMainContent = () => {
    switch (activeSection) {
      case 'categories':
        return <CategoriesManagement />;
      case 'users':
        return <UsersManagement />;
      case 'activities':
        return <ActivitiesManagement />;
      case 'bookings':
        return (
          <BookingsManagement
            bookings={bookings}
            filteredBookings={filteredBookings}
            providers={providers}
            selectedProvider={selectedProvider}
            onProviderChange={setSelectedProvider}
          />
        );
    case 'analytics':
  return <AnalyticsReports />;
      case 'dashboard':
      default:
        return (
          <>
            <div style={{ marginBottom: '32px' }}>
              <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#ffffff', marginBottom: '8px' }}>
                Welcome back, Admin! 👋
              </div>
              <div style={{ color: '#b0b0b0', fontSize: '16px' }}>
                Here's what's happening with your platform today.
              </div>
            </div>

            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '24px',
              marginBottom: '32px'
            }}>
              <StatCard
                title="Total Users"
                value={stats.totalUsers}
                subtitle="Registered users"
                icon={<span>👥</span>}
                color="#2196F3"
                progress={75}
              />
              <StatCard
                title="Activities"
                value={stats.totalActivities}
                subtitle="Available activities"
                icon={<span>🏔️</span>}
                color="#4CAF50"
                progress={60}
              />
              <StatCard
                title="Bookings"
                value={stats.totalBookings}
                subtitle="Total bookings"
                icon={<span>📅</span>}
                color="#FF9800"
                progress={85}
              />
              <StatCard
                title="Revenue"
                value={`$${stats.totalRevenue}`}
                subtitle="Total revenue"
                icon={<span>💰</span>}
                color="#9C27B0"
                progress={90}
              />
            </div>

            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#ffffff', marginBottom: '16px' }}>
              Quick Actions ⚡
            </div>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '24px',
              marginBottom: '32px'
            }}>
              {quickActions.map((action, index) => (
                <QuickActionCard key={index} {...action} />
              ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
              <div>
                <div style={{ 
                  padding: '24px', 
                  borderRadius: '12px', 
                  backgroundColor: '#1e1e1e',
                  boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
                  marginBottom: '24px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
                    <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#ffffff' }}>
                      Pending Activity Approvals 🕐
                    </div>
                    <div style={{
                      display: 'inline-flex',
                      padding: '4px 12px',
                      borderRadius: '16px',
                      backgroundColor: '#FF980030',
                      color: '#FF9800',
                      fontSize: '14px',
                      fontWeight: 'bold'
                    }}>
                      {pendingActivities.length} pending
                    </div>
                  </div>
                  {pendingActivities.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '40px', color: '#b0b0b0' }}>
                      <div style={{ fontSize: '48px', marginBottom: '16px' }}>✅</div>
                      <p>No pending approvals</p>
                    </div>
                  ) : (
                    pendingActivities.map((activity) => (
                      <ActivityApprovalItem key={activity.id} activity={activity} />
                    ))
                  )}
                </div>

                <div style={{ 
                  padding: '24px', 
                  borderRadius: '12px', 
                  backgroundColor: '#1e1e1e',
                  boxShadow: '0 2px 10px rgba(0,0,0,0.2)'
                }}>
                  <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#ffffff', marginBottom: '24px' }}>
                    Recent Users 👥
                  </div>
                  <RecentUsersTable users={users.slice(0, 5)} />
                </div>
              </div>

              <div>
                <div style={{ 
                  padding: '24px', 
                  borderRadius: '12px', 
                  backgroundColor: '#1e1e1e',
                  boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
                  marginBottom: '24px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
                    <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#ffffff' }}>
                      Revenue Overview 💰
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', color: '#4CAF50' }}>
                      <span style={{ marginRight: '4px' }}>📈</span>
                      <div style={{ fontSize: '14px', fontWeight: 'bold' }}>
                        +18%
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'flex-end', height: '200px', gap: '8px' }}>
                    {revenueData.map((data, index) => (
                      <div key={data.month} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <div style={{ color: '#b0b0b0', fontSize: '14px', marginBottom: '8px' }}>
                          {data.month}
                        </div>
                        <div
                          style={{
                            width: '80%',
                            height: `${(data.revenue / maxRevenue) * 150}px`,
                            backgroundColor: index === revenueData.length - 1 ? '#4CAF50' : '#2196F3',
                            borderRadius: '4px',
                            transition: 'all 0.3s ease'
                          }}
                        />
                        <div style={{ marginTop: '8px', fontSize: '12px', fontWeight: 'bold', color: '#ffffff' }}>
                          ${(data.revenue / 1000).toFixed(0)}k
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{ 
                  padding: '24px', 
                  borderRadius: '12px', 
                  backgroundColor: '#1e1e1e',
                  boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
                  marginBottom: '24px'
                }}>
                  <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#ffffff', marginBottom: '24px' }}>
                    Platform Performance 📊
                  </div>
                  <div style={{ marginTop: '24px' }}>
                    <div style={{ marginBottom: '24px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <div style={{ fontSize: '14px', color: '#ffffff' }}>User Satisfaction</div>
                        <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#4CAF50' }}>92%</div>
                      </div>
                      <div style={{ 
                        height: '8px', 
                        borderRadius: '4px',
                        backgroundColor: '#4CAF5030',
                        overflow: 'hidden'
                      }}>
                        <div style={{
                          height: '100%',
                          backgroundColor: '#4CAF50',
                          width: '92%'
                        }} />
                      </div>
                    </div>
                    <div style={{ marginBottom: '24px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <div style={{ fontSize: '14px', color: '#ffffff' }}>Booking Completion</div>
                        <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#2196F3' }}>87%</div>
                      </div>
                      <div style={{ 
                        height: '8px', 
                        borderRadius: '4px',
                        backgroundColor: '#2196F330',
                        overflow: 'hidden'
                      }}>
                        <div style={{
                          height: '100%',
                          backgroundColor: '#2196F3',
                          width: '87%'
                        }} />
                      </div>
                    </div>
                    <div style={{ marginBottom: '24px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <div style={{ fontSize: '14px', color: '#ffffff' }}>Payment Success</div>
                        <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#4CAF50' }}>95%</div>
                      </div>
                      <div style={{ 
                        height: '8px', 
                        borderRadius: '4px',
                        backgroundColor: '#4CAF5030',
                        overflow: 'hidden'
                      }}>
                        <div style={{
                          height: '100%',
                          backgroundColor: '#4CAF50',
                          width: '95%'
                        }} />
                      </div>
                    </div>
                  </div>
                </div>

                <div style={{ 
                  padding: '24px', 
                  borderRadius: '12px', 
                  backgroundColor: '#1e1e1e',
                  boxShadow: '0 2px 10px rgba(0,0,0,0.2)'
                }}>
                  <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#ffffff', marginBottom: '24px' }}>
                    Recent Activity 📝
                  </div>
                  <div>
                    {recentActivities.map((activity) => (
                      <div key={activity.id} style={{ 
                        borderBottom: '1px solid #333333', 
                        padding: '16px 0',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}>
                        <div>
                          <div style={{ fontSize: '16px', color: '#ffffff' }}>
                            <strong>{activity.user}</strong> {activity.action} {activity.target}
                          </div>
                          <div style={{ color: '#b0b0b0', fontSize: '14px' }}>
                            {activity.time}
                          </div>
                        </div>
                        <div style={{
                          display: 'inline-flex',
                          padding: '4px 8px',
                          borderRadius: '16px',
                          fontSize: '12px',
                          backgroundColor: 
                            activity.action === 'booked' ? '#4CAF5030' :
                            activity.action === 'created' ? '#2196F330' :
                            activity.action === 'reviewed' ? '#FF980030' : '#f4433630',
                          color: 
                            activity.action === 'booked' ? '#4CAF50' :
                            activity.action === 'created' ? '#2196F3' :
                            activity.action === 'reviewed' ? '#FF9800' : '#f44336',
                          fontWeight: 'bold'
                        }}>
                          {activity.action}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </>
        );
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#121212' }}>
      <div style={{ 
        position: 'fixed', 
        left: 0, 
        top: 0, 
        bottom: 0, 
        width: '250px', 
        backgroundColor: '#1e1e1e', 
        borderRight: '1px solid #333333', 
        padding: '24px' 
      }}>
        <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#ffffff', marginBottom: '32px' }}>
          TourismHub Admin
        </div>
        {menuItems.map((item) => (
          <div 
            key={item.text} 
            style={{ 
              borderLeft: activeSection === item.section ? '4px solid #4CAF50' : 'none',
              margin: '4px 8px',
              borderRadius: '8px',
              padding: '12px 16px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              color: '#ffffff',
              backgroundColor: activeSection === item.section ? '#2a2a2a' : 'transparent',
              transition: 'all 0.3s ease'
            }}
            onClick={() => setActiveSection(item.section)}
          >
            <span>{item.icon}</span>
            <span style={{ fontWeight: activeSection === item.section ? 'bold' : 'normal' }}>
              {item.text}
            </span>
          </div>
        ))}
      </div>

      <div style={{ 
        position: 'fixed', 
        top: 0, 
        left: '250px', 
        right: 0, 
        height: '64px', 
        backgroundColor: '#1e1e1e', 
        borderBottom: '1px solid #333333', 
        padding: '0 24px', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between' 
      }}>
        <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#ffffff' }}>
          {menuItems.find(item => item.section === activeSection)?.text || 'Dashboard'}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ position: 'relative' }}>
            <span style={{ cursor: 'pointer', fontSize: '24px' }}>🔔</span>
            <div style={{ 
              position: 'absolute', 
              top: '-4px', 
              right: '-4px', 
              backgroundColor: '#f44336', 
              color: 'white', 
              borderRadius: '50%', 
              width: '16px', 
              height: '16px', 
              fontSize: '10px', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center' 
            }}>
              {pendingActivities.length}
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ 
              width: '32px', 
              height: '32px', 
              backgroundColor: '#4CAF50', 
              borderRadius: '50%', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              color: 'white' 
            }}>
              A
            </div>
            <span style={{ color: '#ffffff' }}>Admin</span>
          </div>
        </div>
      </div>

      <div style={{ flexGrow: 1, padding: '24px', marginTop: '64px', marginLeft: '250px' }}>
        {renderMainContent()}
      </div>
    </div>
  );
};

export default AdminDashboard;