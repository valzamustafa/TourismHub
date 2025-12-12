// components/admin/common/ActivityApprovalItem.tsx
'use client';

import React from 'react';
import { Activity } from '../utils/types';

interface ActivityApprovalItemProps {
  activity: Activity;
}


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


export default ActivityApprovalItem;