// src/components/admin/common/QuickActionCard.tsx
'use client';

import React from 'react';
import { QuickActionProps } from '../utils/types';

const QuickActionCard: React.FC<QuickActionProps> = ({ 
  title, 
  description, 
  icon, 
  action, 
  color,
  count 
}) => {
  return (
    <div 
      onClick={action}
      style={{ 
        padding: '24px', 
        borderRadius: '12px', 
        backgroundColor: '#1e1e1e',
        boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        border: `1px solid ${color}30`,
        position: 'relative'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-4px)';
        e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,0,0,0.3)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 2px 10px rgba(0,0,0,0.2)';
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <div style={{ 
          width: '48px', 
          height: '48px', 
          borderRadius: '12px', 
          backgroundColor: `${color}20`, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          fontSize: '24px'
        }}>
          {icon}
        </div>
        {count !== undefined && (
          <div style={{
            width: '24px',
            height: '24px',
            borderRadius: '50%',
            backgroundColor: color,
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '12px',
            fontWeight: 'bold'
          }}>
            {count}
          </div>
        )}
      </div>
      <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#ffffff', marginBottom: '8px' }}>
        {title}
      </div>
      <div style={{ fontSize: '14px', color: '#b0b0b0' }}>
        {description}
      </div>
    </div>
  );
};

export default QuickActionCard;