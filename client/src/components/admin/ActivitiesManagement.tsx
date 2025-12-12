// components/admin/ActivitiesManagement.tsx
'use client';

import React, { useState, useEffect, useRef } from 'react';
import ActivityModal from './modals/ActivityModal';
import ActivityEditModal from './modals/ActivityEditModal';
import ImageCarousel from './common/ImageCarousel';
import { Activity, Category, ActivityImage, NewActivity } from './utils/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5224/api';

const ActivitiesManagement: React.FC = () => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);
  const [reschedulingActivity, setReschedulingActivity] = useState<Activity | null>(null);
  const [newStartDate, setNewStartDate] = useState<string>('');
  const [newEndDate, setNewEndDate] = useState<string>('');
  const [loading, setLoading] = useState(true);

  const openRescheduleModal = (activity: Activity) => {
    setReschedulingActivity(activity);
    setNewStartDate('');
    setNewEndDate('');
    setShowRescheduleModal(true);
  };

  const handleUpdateActivityStatusWithDates = async (
    activityId: string, 
    status: string, 
    rescheduledDates?: {startDate?: string, endDate?: string}
  ) => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        alert('You need to login first!');
        return;
      }
      
      const requestBody: any = {
        Status: status  
      };
      
      if (status === 'Delayed' && rescheduledDates) {
        requestBody.DelayedDate = new Date().toISOString();
        
        if (rescheduledDates.startDate) {
          requestBody.RescheduledStartDate = rescheduledDates.startDate;
        }
        
        if (rescheduledDates.endDate) {
          requestBody.RescheduledEndDate = rescheduledDates.endDate;
        }
      }
      
      console.log('=== SENDING TO API ===');
      console.log('Request Body:', JSON.stringify(requestBody, null, 2));
      
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
      console.log('=== API RESPONSE ===');
      console.log('Full response:', JSON.stringify(result, null, 2));
      
      const delayedDate = result.DelayedDate || result.delayedDate || new Date().toISOString();
      const rescheduledStartDate = result.RescheduledStartDate || result.rescheduledStartDate || rescheduledDates?.startDate || '';
      const rescheduledEndDate = result.RescheduledEndDate || result.rescheduledEndDate || rescheduledDates?.endDate || '';
      
      console.log('Parsed dates:', {
        delayedDate,
        rescheduledStartDate,
        rescheduledEndDate
      });
      
      setActivities(prev => prev.map(activity => {
        if (activity.id === activityId) {
          const updatedActivity = { 
            ...activity, 
            status: status,
            delayedDate: delayedDate,
            rescheduledStartDate: rescheduledStartDate,
            rescheduledEndDate: rescheduledEndDate
          };
          
          console.log('✅ Updated activity in state:', updatedActivity);
          return updatedActivity;
        }
        return activity;
      }));
      
      setTimeout(() => {
        fetchActivities();
      }, 500);
      
      setShowRescheduleModal(false);
      setReschedulingActivity(null);
      setNewStartDate('');
      setNewEndDate('');
      
      alert(`✅ Activity status updated to ${status} with new dates!`);
      
    } catch (error) {
      console.error('Error updating activity status with dates:', error);
      alert(`❌ Failed to update activity status. ${error instanceof Error ? error.message : 'Please try again.'}`);
    }
  };

  const handleConfirmReschedule = () => {
    if (!reschedulingActivity) return;
    
    if (!newStartDate || !newEndDate) {
      alert('Please provide both new start and end dates');
      return;
    }
    
    const startDate = new Date(newStartDate);
    const endDate = new Date(newEndDate);
    
    if (endDate <= startDate) {
      alert('End date must be after start date');
      return;
    }
    
    handleUpdateActivityStatusWithDates(reschedulingActivity.id, 'Delayed', {
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString()
    });
  };

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
      console.log('🔄 Fetching activities...');
      const response = await fetch(`${API_BASE_URL}/activities?t=${Date.now()}`, {
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      });
      
      if (!response.ok) throw new Error('Failed to fetch activities');
      const data = await response.json();
      
      console.log('📊 Fetched activities data:', data);
      const delayedActivities = data.filter((a: any) => 
        a.status === 'Delayed' || a.Status === 'Delayed'
      );
      
      console.log('🔍 Delayed activities found:', delayedActivities.length);
      if (delayedActivities.length > 0) {
        delayedActivities.forEach((activity: any, index: number) => {
          console.log(`Delayed Activity ${index + 1}:`, {
            id: activity.id,
            name: activity.name,
            status: activity.status,
            Status: activity.Status,
            delayedDate: activity.delayedDate,
            DelayedDate: activity.DelayedDate,
            rescheduledStartDate: activity.rescheduledStartDate,
            RescheduledStartDate: activity.RescheduledStartDate,
            rescheduledEndDate: activity.rescheduledEndDate,
            RescheduledEndDate: activity.RescheduledEndDate
          });
        });
      }
      
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
            
            return {
              ...activity,
              images: images.length > 0 ? images : [{
                id: 'default',
                imageUrl: 'https://images.unsplash.com/photo-1501555088652-021faa106b9b?w=500'
              }],
              startDate: activity.startDate || activity.createdAt,
              endDate: activity.endDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
              status: activity.status || activity.Status || 'Pending',
              delayedDate: activity.delayedDate || activity.DelayedDate || null,
              rescheduledStartDate: activity.rescheduledStartDate || activity.RescheduledStartDate || null,
              rescheduledEndDate: activity.rescheduledEndDate || activity.RescheduledEndDate || null
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
              status: activity.status || activity.Status || 'Pending',
              delayedDate: activity.delayedDate || activity.DelayedDate || null,
              rescheduledStartDate: activity.rescheduledStartDate || activity.RescheduledStartDate || null,
              rescheduledEndDate: activity.rescheduledEndDate || activity.RescheduledEndDate || null
            };
          }
        })
      );

      console.log('✅ Final activities list:', activitiesWithImages.map(a => ({ 
        id: a.id, 
        name: a.name, 
        status: a.status,
        delayedDate: a.delayedDate,
        rescheduledStartDate: a.rescheduledStartDate,
        rescheduledEndDate: a.rescheduledEndDate
      })));
      
      setActivities(activitiesWithImages);
    } catch (error) {
      console.error('❌ Error fetching activities:', error);
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

  const handleAddActivity = async (activityData: NewActivity, images: File[]) => {
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
      
      images.forEach((image, index) => {
        formData.append(`Images[${index}]`, image);
      });
      
      const response = await fetch(`${API_BASE_URL}/activities`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });
      
      const responseText = await response.text();
      
      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}: Failed to create activity`;
        try {
          const errorData = JSON.parse(responseText);
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
      
      const requestBody: any = {
        Status: status  
      };
      
      if (status === 'Delayed') {
        requestBody.DelayedDate = new Date().toISOString();
      }
      
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
      
      setActivities(prev => prev.map(activity => {
        if (activity.id === activityId) {
          const updatedActivity = { ...activity, status: status };
          if (status === 'Delayed') {
            updatedActivity.delayedDate = new Date().toISOString();
          }
          return updatedActivity;
        }
        return activity;
      }));
      
      setTimeout(() => {
        fetchActivities();
      }, 500);
      
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
        <div style={{
          backgroundColor: '#2a2a2a',
          padding: '20px',
          borderRadius: '12px',
          border: '1px solid #333333',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#9C27B0', marginBottom: '8px' }}>
            {activities.filter(a => a.status === 'Delayed').length}
          </div>
          <div style={{ color: '#b0b0b0', fontSize: '14px' }}>Delayed Activities</div>
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
                activityStatus === 'Expired' ? '#f4433640' :
                activityStatus === 'Delayed' ? '#9C27B040' : '#FF980040'
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

              {/* ✅ Delayed Info Display */}
              {activityStatus === 'Delayed' && (
                <div style={{ 
                  marginBottom: '16px',
                  padding: '12px',
                  backgroundColor: '#9C27B020',
                  borderRadius: '8px',
                  border: '1px solid #9C27B040'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <span style={{ color: '#9C27B0', fontSize: '16px' }}>⏰</span>
                    <span style={{ color: '#9C27B0', fontSize: '14px', fontWeight: 'bold' }}>
                      Activity Delayed
                    </span>
                  </div>
                  
                  {activity.delayedDate && (
                    <div style={{ marginBottom: '8px', paddingLeft: '24px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <div style={{ width: '8px', height: '8px', backgroundColor: '#9C27B0', borderRadius: '50%' }}></div>
                        <span style={{ color: '#9C27B0', fontSize: '13px' }}>
                          Delayed on: {new Date(activity.delayedDate).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  )}
                  
                  {(activity.rescheduledStartDate || activity.rescheduledEndDate) && (
                    <div style={{ marginTop: '12px' }}>
                      <div style={{ color: '#ffffff', fontSize: '12px', marginBottom: '6px', fontWeight: 'bold' }}>
                        Rescheduled Dates:
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                        {activity.rescheduledStartDate && (
                          <div style={{ padding: '8px', backgroundColor: '#4CAF5020', borderRadius: '6px', border: '1px solid #4CAF5040' }}>
                            <div style={{ color: '#4CAF50', fontSize: '11px', marginBottom: '2px' }}>New Start</div>
                            <div style={{ color: '#4CAF50', fontSize: '12px', fontWeight: 'bold' }}>
                              {new Date(activity.rescheduledStartDate).toLocaleDateString()}
                            </div>
                            <div style={{ color: '#4CAF50', fontSize: '10px' }}>
                              {new Date(activity.rescheduledStartDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                          </div>
                        )}
                        {activity.rescheduledEndDate && (
                          <div style={{ padding: '8px', backgroundColor: '#2196F320', borderRadius: '6px', border: '1px solid #2196F340' }}>
                            <div style={{ color: '#2196F3', fontSize: '11px', marginBottom: '2px' }}>New End</div>
                            <div style={{ color: '#2196F3', fontSize: '12px', fontWeight: 'bold' }}>
                              {new Date(activity.rescheduledEndDate).toLocaleDateString()}
                            </div>
                            <div style={{ color: '#2196F3', fontSize: '10px' }}>
                              {new Date(activity.rescheduledEndDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: '1fr 1fr 1fr', 
                gap: '10px' 
              }}>
                <select
                  value={activity.status || checkActivityStatus(activity)}
                  onChange={(e) => {
                    const newStatus = e.target.value;
                    if (newStatus === 'Delayed') {
                      openRescheduleModal(activity);
                    } else {
                      handleUpdateActivityStatus(activity.id, newStatus);
                    }
                  }}
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
                  <option value="Delayed">Delayed</option>
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
                    // Handle booking
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

      {showRescheduleModal && reschedulingActivity && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div style={{
            backgroundColor: '#2a2a2a',
            borderRadius: '16px',
            padding: '30px',
            maxWidth: '500px',
            width: '100%',
            border: '1px solid #444444'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ color: '#ffffff', fontSize: '20px', fontWeight: 'bold' }}>
                Reschedule Activity
              </h3>
              <button
                onClick={() => {
                  setShowRescheduleModal(false);
                  setReschedulingActivity(null);
                  setNewStartDate('');
                  setNewEndDate('');
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#ffffff',
                  fontSize: '24px',
                  cursor: 'pointer',
                  padding: '5px'
                }}
              >
                ×
              </button>
            </div>
            
            <div style={{ marginBottom: '20px' }}>
              <p style={{ color: '#b0b0b0', marginBottom: '5px' }}>Activity:</p>
              <p style={{ color: '#ffffff', fontWeight: 'bold', fontSize: '18px' }}>
                {reschedulingActivity.name}
              </p>
            </div>
            
            <div style={{ marginBottom: '25px' }}>
              <p style={{ color: '#b0b0b0', marginBottom: '5px' }}>Current Schedule:</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <div>
                  <p style={{ color: '#ffffff', fontSize: '14px', marginBottom: '2px' }}>Start Date</p>
                  <p style={{ color: '#4CAF50', fontWeight: 'bold' }}>
                    {new Date(reschedulingActivity.startDate).toLocaleString()}
                  </p>
                </div>
                <div>
                  <p style={{ color: '#ffffff', fontSize: '14px', marginBottom: '2px' }}>End Date</p>
                  <p style={{ color: '#f44336', fontWeight: 'bold' }}>
                    {new Date(reschedulingActivity.endDate).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
            
            <div style={{ marginBottom: '25px' }}>
              <p style={{ color: '#ffffff', marginBottom: '15px', fontSize: '16px' }}>
                Please provide the new dates for this activity:
              </p>
              
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', color: '#b0b0b0', marginBottom: '8px', fontSize: '14px' }}>
                  New Start Date & Time *
                </label>
                <input
                  type="datetime-local"
                  value={newStartDate}
                  onChange={(e) => setNewStartDate(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px',
                    backgroundColor: '#1e1e1e',
                    border: '1px solid #444444',
                    borderRadius: '8px',
                    color: '#ffffff',
                    fontSize: '14px'
                  }}
                  min={new Date().toISOString().slice(0, 16)}
                  required
                />
              </div>
              
              <div style={{ marginBottom: '25px' }}>
                <label style={{ display: 'block', color: '#b0b0b0', marginBottom: '8px', fontSize: '14px' }}>
                  New End Date & Time *
                </label>
                <input
                  type="datetime-local"
                  value={newEndDate}
                  onChange={(e) => setNewEndDate(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px',
                    backgroundColor: '#1e1e1e',
                    border: '1px solid #444444',
                    borderRadius: '8px',
                    color: '#ffffff',
                    fontSize: '14px'
                  }}
                  min={newStartDate || new Date().toISOString().slice(0, 16)}
                  required
                />
              </div>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '15px' }}>
              <button
                onClick={() => {
                  setShowRescheduleModal(false);
                  setReschedulingActivity(null);
                  setNewStartDate('');
                  setNewEndDate('');
                }}
                style={{
                  padding: '12px 24px',
                  backgroundColor: '#444444',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500'
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmReschedule}
                disabled={!newStartDate || !newEndDate}
                style={{
                  padding: '12px 24px',
                  backgroundColor: !newStartDate || !newEndDate ? '#666666' : '#9C27B0',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: !newStartDate || !newEndDate ? 'not-allowed' : 'pointer',
                  fontSize: '14px',
                  fontWeight: '500',
                  opacity: !newStartDate || !newEndDate ? 0.6 : 1
                }}
              >
                Mark as Delayed
              </button>
            </div>
          </div>
        </div>
      )}

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

export default ActivitiesManagement;