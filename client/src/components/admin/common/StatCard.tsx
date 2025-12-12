// src/components/admin/common/StatCard.tsx
'use client';

import React from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle: string;
  icon: React.ReactElement;
  color: string;
  progress?: number;
}

const StatCard: React.FC<StatCardProps> = ({ 
  title, 
  value, 
  subtitle, 
  icon, 
  color,
  progress 
}) => {
  return (
    <div style={{ 
      padding: '24px', 
      borderRadius: '12px', 
      backgroundColor: '#1e1e1e',
      boxShadow: '0 2px 10px rgba(0,0,0,0.2)'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
        <div>
          <div style={{ fontSize: '14px', color: '#b0b0b0', marginBottom: '4px' }}>
            {title}
          </div>
          <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#ffffff' }}>
            {value}
          </div>
        </div>
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
      </div>
      <div style={{ fontSize: '14px', color: '#b0b0b0', marginBottom: '8px' }}>
        {subtitle}
      </div>
      {progress !== undefined && (
        <div style={{ 
          height: '4px', 
          borderRadius: '2px', 
          backgroundColor: '#333333',
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
      )}
    </div>
  );
};

export default StatCard;