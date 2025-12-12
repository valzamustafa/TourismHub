// components/admin/UsersManagement.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { User } from './utils/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5224/api';

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
      const response = await fetch(`${API_BASE_URL}/users`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const usersData = await response.json();
        const activeUsers = usersData.filter((user: User) => 
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

      const response = await fetch(`${API_BASE_URL}/users`, {
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
    if (!confirm('Are you sure you want to permanently delete this user? This action cannot be undone.')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        fetchUsers();
        alert('User permanently deleted!');
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
      
      const response = await fetch(`${API_BASE_URL}/users/${userId}/role`, {
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
  const handleDeactivateUser = async (userId: string, userName: string) => {
    const confirmMessage = `Are you sure you want to deactivate ${userName}? 
    The user will not be able to login and their email will be marked as deleted.`;
    
    if (!confirm(confirmMessage)) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/users/${userId}/soft-delete`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        fetchUsers();
        alert('User deactivated successfully! User cannot login anymore.');
      } else {
        const errorData = await response.json();
        alert(`Failed to deactivate user: ${errorData.message}`);
      }
    } catch (error) {
      console.error('Error deactivating user:', error);
      alert('Error deactivating user. Please try again.');
    }
  };

  const handleActivateUser = async (userId: string, userName: string) => {
    const confirmMessage = `Are you sure you want to activate ${userName}? 
    The user will be able to login again.`;
    
    if (!confirm(confirmMessage)) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/users/${userId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          isActive: true 
        })
      });

      if (response.ok) {
        fetchUsers();
        alert('User activated successfully! User can login again.');
      } else {
        const errorData = await response.json();
        alert(`Failed to activate user: ${errorData.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error activating user:', error);
      alert('Error activating user. Please try again.');
    }
  };

  const handleToggleUserStatus = async (userId: string, userName: string, currentStatus: boolean) => {
    if (currentStatus) {
      await handleDeactivateUser(userId, userName);
    } else {
      await handleActivateUser(userId, userName);
    }
  };
  const isUserDeleted = (user: User) => {
    return user.email.includes('_deleted_') || user.status === 'Inactive';
  };
  const getUserStatus = (user: User) => {
    if (isUserDeleted(user)) {
      return 'Deleted';
    }
    return user.status || (user.isActive ? 'Active' : 'Inactive');
  };

  const getCleanUserName = (user: User) => {
    if (isUserDeleted(user)) {
     
      const emailParts = user.email.split('_deleted_');
      if (emailParts.length > 0) {
      
        return user.name || 'Deleted User';
      }
    }
    return user.name;
  };

  const getCleanUserEmail = (user: User) => {
    if (isUserDeleted(user)) {
      const emailParts = user.email.split('_deleted_');
      return emailParts[0] || 'deleted@example.com';
    }
    return user.email;
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
            {users.map((user) => {
              const isDeleted = isUserDeleted(user);
              const userStatus = getUserStatus(user);
              const isActive = userStatus === 'Active';
              const cleanName = getCleanUserName(user);
              const cleanEmail = getCleanUserEmail(user);
              
              return (
                <tr key={user.id} style={{ 
                  borderBottom: '1px solid #333333',
                  backgroundColor: isDeleted ? '#2a1e1e' : 'transparent'
                }}>
                  <td style={{ padding: '12px', color: isDeleted ? '#888888' : '#ffffff' }}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <div style={{ 
                        width: '32px', 
                        height: '32px', 
                        backgroundColor: isDeleted ? '#888888' : '#2196F3', 
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontWeight: 'bold',
                        marginRight: '8px'
                      }}>
                        {cleanName?.charAt(0) || 'U'}
                      </div>
                      <div>
                        <div>{cleanName}</div>
                        {isDeleted && (
                          <div style={{ fontSize: '12px', color: '#ff6b6b' }}>DELETED</div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '12px', color: isDeleted ? '#888888' : '#ffffff' }}>
                    {cleanEmail}
                  </td>
                  <td style={{ padding: '12px' }}>
                    <select
                      value={user.role}
                      onChange={(e) => handleUpdateRole(user.id, e.target.value)}
                      disabled={isDeleted}
                      style={{
                        padding: '6px 12px',
                        borderRadius: '4px',
                        backgroundColor: isDeleted ? '#444444' : '#2a2a2a',
                        color: isDeleted ? '#888888' : '#ffffff',
                        border: `1px solid ${isDeleted ? '#666666' : '#444444'}`,
                        cursor: isDeleted ? 'not-allowed' : 'pointer',
                        opacity: isDeleted ? 0.6 : 1
                      }}
                    >
                      <option value="Tourist">Tourist</option>
                      <option value="Provider">Provider</option>
                      <option value="Admin">Admin</option>
                    </select>
                  </td>
                  <td style={{ padding: '12px', color: isDeleted ? '#888888' : '#ffffff' }}>
                    {user.joinDate}
                  </td>
                  <td style={{ padding: '12px' }}>
                    <button
                      onClick={() => handleToggleUserStatus(user.id, cleanName, isActive)}
                      disabled={isDeleted && userStatus === 'Deleted'}
                      style={{
                        padding: '6px 12px',
                        borderRadius: '16px',
                        fontSize: '12px',
                        backgroundColor: isActive ? '#4CAF5030' : 
                                       isDeleted ? '#88888830' : '#f4433630',
                        color: isActive ? '#4CAF50' : 
                              isDeleted ? '#888888' : '#f44336',
                        border: 'none',
                        cursor: (isDeleted && userStatus === 'Deleted') ? 'not-allowed' : 'pointer',
                        fontWeight: 'bold',
                        opacity: (isDeleted && userStatus === 'Deleted') ? 0.6 : 1,
                        minWidth: '80px'
                      }}
                    >
                      {userStatus}
                    </button>
                  </td>
                  <td style={{ padding: '12px', display: 'flex', gap: '8px' }}>
                    {!isDeleted ? (
                      <>
                        <button
                          onClick={() => handleDeactivateUser(user.id, cleanName)}
                          style={{
                            padding: '6px 12px',
                            backgroundColor: '#FF9800',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '12px'
                          }}
                        >
                          Deactivate
                        </button>
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
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => handleActivateUser(user.id, cleanName)}
                          style={{
                            padding: '6px 12px',
                            backgroundColor: '#4CAF50',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '12px'
                          }}
                        >
                          Activate
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user.id)}
                          style={{
                            padding: '6px 12px',
                            backgroundColor: '#d32f2f',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '12px'
                          }}
                        >
                          Delete
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              );
            })}
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

export default UsersManagement;