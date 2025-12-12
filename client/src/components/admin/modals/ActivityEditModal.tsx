// src/components/admin/modals/ActivityEditModal.tsx
'use client';

import React, { useState } from 'react';
import { Activity, Category } from '../utils/types';

interface ActivityEditModalProps {
  activity: Activity;
  onClose: () => void;
  onSave: (data: any) => void;
  categories: Category[];
}

const ActivityEditModal: React.FC<ActivityEditModalProps> = ({ 
  activity, 
  onClose, 
  onSave, 
  categories 
}) => {
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

export default ActivityEditModal;