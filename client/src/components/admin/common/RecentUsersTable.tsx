// src/components/admin/common/RecentUsersTable.tsx
'use client';

import React from 'react';
import { User } from '../utils/types';

interface RecentUsersTableProps {
  users: User[];
}

const RecentUsersTable: React.FC<RecentUsersTableProps> = ({ users }) => {
  if (users.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '40px', color: '#b0b0b0' }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>👤</div>
        <p>No users found</p>
      </div>
    );
  }

  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th style={{ textAlign: 'left', padding: '12px', color: '#b0b0b0', fontWeight: 'normal', fontSize: '14px' }}>
              Name
            </th>
            <th style={{ textAlign: 'left', padding: '12px', color: '#b0b0b0', fontWeight: 'normal', fontSize: '14px' }}>
              Email
            </th>
            <th style={{ textAlign: 'left', padding: '12px', color: '#b0b0b0', fontWeight: 'normal', fontSize: '14px' }}>
              Role
            </th>
           
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id} style={{ borderBottom: '1px solid #333333' }}>
              <td style={{ padding: '12px', color: '#ffffff' }}>
                {user.name}
              </td>
              <td style={{ padding: '12px', color: '#b0b0b0' }}>
                {user.email}
              </td>
              <td style={{ padding: '12px' }}>
                <span style={{
                  padding: '4px 8px',
                  borderRadius: '12px',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  backgroundColor: 
                    user.role === 'Admin' ? '#4CAF5030' :
                    user.role === 'Provider' ? '#2196F330' : '#9C27B030',
                  color: 
                    user.role === 'Admin' ? '#4CAF50' :
                    user.role === 'Provider' ? '#2196F3' : '#9C27B0'
                }}>
                  {user.role}
                </span>
              </td>
             
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default RecentUsersTable;