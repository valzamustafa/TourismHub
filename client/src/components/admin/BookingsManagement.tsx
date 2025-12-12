// src/components/admin/BookingsManagement.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { Booking, Provider, Activity } from './utils/types';

interface BookingsManagementProps {
  bookings: Booking[];
  filteredBookings: Booking[];
  providers: Provider[];
  selectedProvider: string;
  onProviderChange: (providerId: string) => void;
  activities: Activity[];
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5224/api';

const BookingsManagement: React.FC<BookingsManagementProps> = ({ 
  bookings, 
  filteredBookings, 
  providers, 
  selectedProvider, 
  onProviderChange,
  activities
}) => {
  const [providerBookings, setProviderBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);

  const getProviderName = (providerId: string) => {
    const provider = providers.find(p => p.id === providerId);
    return provider ? provider.name : 'Unknown Provider';
  };

  const fetchProviderBookings = async (providerId: string) => {
    if (providerId === 'all') {
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/bookings/provider/${providerId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setProviderBookings(data);
      } else {
        console.error('Failed to fetch provider bookings');
        setProviderBookings([]);
      }
    } catch (error) {
      console.error('Error fetching provider bookings:', error);
      setProviderBookings([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedProvider !== 'all') {
      fetchProviderBookings(selectedProvider);
    } else {
      setProviderBookings([]);
    }
  }, [selectedProvider]);

  const displayBookings = selectedProvider === 'all' ? filteredBookings : providerBookings;

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
       
        if (selectedProvider !== 'all') {
          fetchProviderBookings(selectedProvider);
        } else {
          window.location.reload();
        }
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
          
          {selectedProvider !== 'all' && (
            <div style={{ 
              marginTop: '12px', 
              padding: '12px', 
              backgroundColor: '#2a2a2a', 
              borderRadius: '8px',
              border: '1px solid #444444'
            }}>
              <span style={{ color: '#b0b0b0' }}>Showing bookings for: </span>
              <span style={{ color: '#4CAF50', fontWeight: 'bold' }}>
                {getProviderName(selectedProvider)}
              </span>
              <span style={{ color: '#b0b0b0', marginLeft: '12px' }}>
                ({displayBookings.length} bookings)
              </span>
              {loading && (
                <span style={{ color: '#FF9800', marginLeft: '12px' }}>
                  Loading...
                </span>
              )}
            </div>
          )}
        </div>

        <div style={{ 
          backgroundColor: '#2a2a2a', 
          borderRadius: '8px', 
          overflow: 'hidden',
          border: '1px solid #333333'
        }}>
          <div style={{ padding: '16px' }}>
            <h3 style={{ color: '#ffffff', fontSize: '18px', fontWeight: 'bold', marginBottom: '16px' }}>
              {selectedProvider === 'all' ? 'All Bookings' : `Bookings for ${getProviderName(selectedProvider)}`}
            </h3>
            
            {loading ? (
              <div style={{ textAlign: 'center', padding: '40px', color: '#b0b0b0' }}>
                <div style={{ fontSize: '24px', marginBottom: '16px' }}>⏳</div>
                <p>Loading bookings...</p>
              </div>
            ) : displayBookings.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px', color: '#b0b0b0' }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>📋</div>
                <p>No bookings found</p>
                {selectedProvider !== 'all' && (
                  <p style={{ fontSize: '14px', marginTop: '8px' }}>
                    This provider doesn't have any bookings yet
                  </p>
                )}
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
                      <th style={{ color: 'white', fontWeight: 'bold', padding: '12px', textAlign: 'left' }}>Provider</th>
                      <th style={{ color: 'white', fontWeight: 'bold', padding: '12px', textAlign: 'left' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {displayBookings.map((booking) => {
                      // Gjej provider-in për këtë booking
                      const activity = activities.find(a => a.id === booking.activityId);
                      const activityProvider = activity ? 
                        providers.find(p => p.id === activity.providerId) : 
                        null;
                      
                      return (
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
                          <td style={{ padding: '12px', color: '#ffffff' }}>
                            {activityProvider ? activityProvider.name : 'Unknown Provider'}
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
                      );
                    })}
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

export default BookingsManagement;