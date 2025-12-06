// app/tourist/profile/page.tsx 
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ContactButton from '@/components/ContactButton';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5224/api';

interface User {
  id: string;
  fullName: string;
  email: string;
  profileImage: string | null;
  role: string;
  phone?: string;
  address?: string;
  bio?: string;
  createdAt: string;
  lastLogin?: string;
}

interface Booking {
  id: string;
  activityId: string;
  activityName: string;
  activityImage?: string;
  bookingDate: string;
  selectedDate: string;
  numberOfPeople: number;
  totalAmount: number;
  status: 'Pending' | 'Confirmed' | 'Cancelled' | 'Completed';
  paymentStatus: 'Pending' | 'Paid' | 'Failed' | 'Refunded';
  providerId?: string; 
  providerName?: string; 
}

interface SavedItem {
  id: string;
  activityId: string;
  activityName: string;
  activityImage?: string;
  price: number;
  location: string;
  category: string;
  savedAt: string;
  providerId?: string; 
  providerName?: string; 
}

interface ActivityStats {
  totalBookings: number;
  pendingBookings: number;
  completedBookings: number;
  totalSpent: number;
  favoriteCategories: string[];
}

interface Chat {
  id: string;
  otherUser: {
    id: string;
    fullName: string;
    profileImage: string | null;
    role: string;
  };
  lastMessage: string;
  lastMessageAt: string;
  unreadCount: number;
}

export default function TouristProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [savedItems, setSavedItems] = useState<SavedItem[]>([]);
  const [chats, setChats] = useState<Chat[]>([]);
  const [stats, setStats] = useState<ActivityStats>({
    totalBookings: 0,
    pendingBookings: 0,
    completedBookings: 0,
    totalSpent: 0,
    favoriteCategories: []
  });
  const [activeTab, setActiveTab] = useState<'profile' | 'bookings' | 'saved' | 'settings' | 'chats'>('profile');
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    bio: ''
  });
  const [uploadingImage, setUploadingImage] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetchProfileData();
  }, []);

  const getFullImageUrl = (imagePath: string): string => {
    if (!imagePath || imagePath === 'string' || imagePath === 'null') {
      return 'https://images.unsplash.com/photo-1501555088652-021faa106b9b?w=500';
    }

    if (imagePath.startsWith('http')) {
      return imagePath;
    }
    
    const BACKEND_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL?.replace('/api', '') || 'http://localhost:5224';
    
    if (imagePath.startsWith('/uploads/')) {
      const fullUrl = `${BACKEND_BASE_URL}${imagePath}`;
      return fullUrl;
    }
    
    if (imagePath.includes('.')) {
      const fullUrl = `${BACKEND_BASE_URL}/uploads/activity-images/${imagePath}`;
      return fullUrl;
    }
    
    return 'https://images.unsplash.com/photo-1501555088652-021faa106b9b?w=500';
  };

  const fetchProfileData = async () => {
    try {
      const token = localStorage.getItem('token');
      const userData = localStorage.getItem('user');
      
      if (!token || !userData) {
        router.push('/');
        return;
      }

      const parsedUser = JSON.parse(userData);

      const userResponse = await fetch(`${API_BASE_URL}/users/${parsedUser.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (userResponse.ok) {
        const userDataFromApi = await userResponse.json();
        setUser(userDataFromApi);
        setFormData({
          fullName: userDataFromApi.fullName || userDataFromApi.name || '',
          email: userDataFromApi.email || '',
          phone: userDataFromApi.phone || '',
          address: userDataFromApi.address || '',
          bio: userDataFromApi.bio || ''
        });

        localStorage.setItem('user', JSON.stringify(userDataFromApi));
      }

      const bookingsResponse = await fetch(`${API_BASE_URL}/bookings/user/${parsedUser.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (bookingsResponse.ok) {
        const bookingsData = await bookingsResponse.json();
        setBookings(bookingsData);
        calculateStats(bookingsData);
      }

      const savedResponse = await fetch(`${API_BASE_URL}/savedactivities/user/${parsedUser.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (savedResponse.ok) {
        const savedData = await savedResponse.json();
        const savedItems: SavedItem[] = savedData.map((item: any) => ({
          id: item.id,
          activityId: item.activityId,
          activityName: item.activityName,
          activityImage: item.activityImage,
          price: item.activityPrice,
          location: item.activityLocation,
          category: item.activityCategory,
          savedAt: item.savedAt,
          providerId: item.providerId, 
          providerName: item.providerName 
        }));
        setSavedItems(savedItems);
      }


      await fetchChats();

    } catch (error) {
      console.error('Error fetching profile data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchChats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/chats/my-chats`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setChats(data.chats);
        }
      }
    } catch (error) {
      console.error('Error fetching chats:', error);
    }
  };

  const calculateStats = (bookingsData: Booking[]) => {
    const totalBookings = bookingsData.length;
    const pendingBookings = bookingsData.filter(b => b.status === 'Pending').length;
    const completedBookings = bookingsData.filter(b => b.status === 'Completed').length;
    const totalSpent = bookingsData
      .filter(b => b.status === 'Confirmed' || b.status === 'Completed')
      .reduce((sum, booking) => sum + booking.totalAmount, 0);

    setStats({
      totalBookings,
      pendingBookings,
      completedBookings,
      totalSpent,
      favoriteCategories: []
    });
  };

  const handleSaveProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        alert('Session expired. Please login again.');
        router.push('/');
        return;
      }

      if (!user?.id) {
        alert('User ID not found. Please try again.');
        return;
      }

      const updateData = {
        fullName: formData.fullName,
        email: user.email,
        phone: formData.phone,
        address: formData.address,
        bio: formData.bio,
        profileImage: user.profileImage
      };

      const response = await fetch(`${API_BASE_URL}/users/${user.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updateData)
      });
      
      if (response.ok) {
        const result = await response.json();
        
        if (result.user) {
          setUser(result.user);
          localStorage.setItem('user', JSON.stringify(result.user));
          
          setFormData({
            fullName: result.user.fullName,
            email: result.user.email,
            phone: result.user.phone || '',
            address: result.user.address || '',
            bio: result.user.bio || ''
          });
        }
        
        setEditing(false);
        alert('Profile updated successfully!');
        setTimeout(() => fetchProfileData(), 500);
      } else {
        const errorText = await response.text();
        console.error('Gabim nga serveri:', errorText);
        
        let errorMessage = 'Failed to update profile';
        try {
          const errorJson = JSON.parse(errorText);
          errorMessage = errorJson.message || errorMessage;
          
          if (errorJson.errors) {
            const errorDetails = Object.entries(errorJson.errors)
              .map(([key, value]) => `${key}: ${value}`)
              .join('\n');
            errorMessage += `\n\nDetaje:\n${errorDetails}`;
          }
        } catch (e) {
          errorMessage = `Server error: ${response.status} ${response.statusText}`;
        }
        
        alert(errorMessage);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile. Please try again.');
    }
  };

  const handleEditProfile = () => {
    if (user) {
      setFormData({
        fullName: user.fullName || '',
        email: user.email || '',
        phone: user.phone || '',
        address: user.address || '',
        bio: user.bio || ''
      });
    }
    setEditing(true);
  };

  const handleCancelEdit = () => {
    if (user) {
      setFormData({
        fullName: user.fullName || '',
        email: user.email || '',
        phone: user.phone || '',
        address: user.address || '',
        bio: user.bio || ''
      });
    }
    setEditing(false);
  };

  const handleImageUpload = async (file: File) => {
    if (!user) return;

    setUploadingImage(true);
    
    try {
      const token = localStorage.getItem('token');
      
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        alert('Invalid file type. Only JPEG, PNG, JPG and WebP are allowed.');
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        alert('File size too large. Maximum 5MB allowed.');
        return;
      }

      const formData = new FormData();
      formData.append('file', file);
      formData.append('userId', user.id);

      const response = await fetch(`${API_BASE_URL}/users/upload-profile`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Upload error response:', errorText);
        
        let errorMessage = 'Failed to upload image';
        try {
          const errorJson = JSON.parse(errorText);
          errorMessage = errorJson.message || errorMessage;
        } catch {
          errorMessage = `Server error: ${response.status}`;
        }
        
        alert(errorMessage);
        return;
      }

      const result = await response.json();
      
      if (result.success) {
        const updatedUser = { ...user, profileImage: result.imageUrl };
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
        
        alert('Profile image updated successfully!');
        
        setTimeout(() => fetchProfileData(), 500);
      } else {
        throw new Error(result.message || 'Upload failed');
      }

    } catch (error) {
      console.error('Error uploading image:', error);
      alert(error instanceof Error ? error.message : 'Failed to upload image');
    } finally {
      setUploadingImage(false);
    }
  };

  const getProfileImageUrl = (imageUrl: string | null): string => {
    if (!imageUrl || imageUrl === 'null' || imageUrl === 'string') {
      return '';
    }

    if (imageUrl.startsWith('data:image')) {
      return imageUrl;
    }

    if (imageUrl.startsWith('http')) {
      return imageUrl;
    }
    
    const BACKEND_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL?.replace('/api', '') || 'http://localhost:5224';

    if (imageUrl.startsWith('/uploads/') || imageUrl.startsWith('uploads/')) {
      const cleanUrl = imageUrl.startsWith('/') ? imageUrl : `/${imageUrl}`;
      return `${BACKEND_BASE_URL}${cleanUrl}`;
    }
    
    if (imageUrl.includes('.')) {
      return `${BACKEND_BASE_URL}/uploads/${imageUrl}`;
    }
    
    return '';
  };

  const handleCancelBooking = async (bookingId: string) => {
    if (!confirm('Are you sure you want to cancel this booking?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/bookings/${bookingId}/cancel`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        alert('Booking cancelled successfully!');
        fetchProfileData();
      } else {
        const errorText = await response.text();
        console.error('Cancel booking error:', errorText);
        alert('Failed to cancel booking. Please try again.');
      }
    } catch (error) {
      console.error('Error cancelling booking:', error);
      alert('Failed to cancel booking. Please try again.');
    }
  };

  const removeSavedItem = async (itemId: string) => {
    try {
      const token = localStorage.getItem('token');
      const userData = localStorage.getItem('user');
      
      if (!token || !userData) return;
      
      const parsedUser = JSON.parse(userData);
      const itemToRemove = savedItems.find(item => item.id === itemId);
      if (!itemToRemove) return;
      
      const response = await fetch(
        `${API_BASE_URL}/savedactivities/unsave/${parsedUser.id}/${itemToRemove.activityId}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.ok) {
        setSavedItems(savedItems.filter(item => item.id !== itemId));
        alert('Item removed from saved list');
      }
    } catch (error) {
      console.error('Error removing saved item:', error);
      alert('Failed to remove item');
    }
  };

  const handleDeleteAccount = () => {
    if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      console.log('Account deletion requested');
    }
  };

  const handleOpenChat = (chatId: string) => {
    router.push(`/chats/${chatId}`);
  };

  const handleContactProvider = (providerId: string, providerName: string, activityId?: string, activityName?: string) => {
    if (!user) return;
    

    if (user.id === providerId) {
      alert('You cannot chat with yourself');
      return;
    }

   
    router.push(`/chats?providerId=${providerId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">User not found</h2>
          <button
            onClick={() => router.push('/')}
            className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Go to Home
          </button>
        </div>
      </div>
    );
  }

  const totalUnreadMessages = chats.reduce((sum, chat) => sum + chat.unreadCount, 0);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
              <p className="text-gray-600">Manage your account and bookings</p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/tourist/activities')}
                className="px-4 py-2 text-blue-600 hover:text-blue-800"
              >
                ← Back to Activities
              </button>
              <button
                onClick={() => router.push('/tourist/profile')}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                Dashboard
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <div className="text-center mb-6">
                <div className="relative inline-block">
                  {getProfileImageUrl(user.profileImage) ? (
                    <img
                      src={getProfileImageUrl(user.profileImage)}
                      alt={user.fullName}
                      className="w-24 h-24 rounded-full mx-auto border-4 border-white shadow-lg object-cover"
                    />
                  ) : (
                    <div className="w-24 h-24 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white text-3xl font-bold mx-auto border-4 border-white shadow-lg">
                      {user.fullName.charAt(0)}
                    </div>
                  )}
                  <label className="absolute bottom-0 right-0 bg-blue-500 text-white p-2 rounded-full cursor-pointer hover:bg-blue-600 transition-colors">
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          handleImageUpload(e.target.files[0]);
                        }
                      }}
                      disabled={uploadingImage}
                    />
                    {uploadingImage ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    )}
                  </label>
                </div>
                <h2 className="text-xl font-bold text-gray-900 mt-4">{user.fullName}</h2>
                <p className="text-gray-600 text-sm">{user.email}</p>
                <p className="text-gray-500 text-sm mt-1">
                  Member since {new Date(user.createdAt).toLocaleDateString()}
                </p>
              </div>

              <div className="pt-6 border-t">
                <div className="px-4 py-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg">
                  <p className="text-sm font-semibold text-gray-900">Activity Stats</p>
                  <div className="mt-2 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Total Bookings:</span>
                      <span className="font-semibold">{stats.totalBookings}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Completed:</span>
                      <span className="font-semibold text-green-600">{stats.completedBookings}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Total Spent:</span>
                      <span className="font-semibold text-blue-600">${stats.totalSpent.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Saved Items:</span>
                      <span className="font-semibold text-purple-600">{savedItems.length}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Active Chats:</span>
                      <span className="font-semibold text-amber-600">{chats.length}</span>
                    </div>
                    {totalUnreadMessages > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Unread Messages:</span>
                        <span className="font-semibold text-red-600">{totalUnreadMessages}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 bg-white rounded-xl shadow-sm border p-6">
              <nav className="space-y-2">
                <button
                  onClick={() => setActiveTab('profile')}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                    activeTab === 'profile'
                      ? 'bg-blue-50 text-blue-600 border-l-4 border-blue-500'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center">
                    <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    Profile Information
                  </div>
                </button>

                <button
                  onClick={() => setActiveTab('bookings')}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                    activeTab === 'bookings'
                      ? 'bg-blue-50 text-blue-600 border-l-4 border-blue-500'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center">
                    <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    My Bookings
                    {stats.pendingBookings > 0 && (
                      <span className="ml-auto text-xs font-semibold px-2 py-1 rounded-full bg-yellow-100 text-yellow-800">
                        {stats.pendingBookings}
                      </span>
                    )}
                  </div>
                </button>

                <button
                  onClick={() => setActiveTab('saved')}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                    activeTab === 'saved'
                      ? 'bg-blue-50 text-blue-600 border-l-4 border-blue-500'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center">
                    <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                    </svg>
                    Saved Items
                    {savedItems.length > 0 && (
                      <span className="ml-auto text-xs font-semibold px-2 py-1 rounded-full bg-blue-100 text-blue-800">
                        {savedItems.length}
                      </span>
                    )}
                  </div>
                </button>

                <button
                  onClick={() => setActiveTab('chats')}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                    activeTab === 'chats'
                      ? 'bg-blue-50 text-blue-600 border-l-4 border-blue-500'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center">
                    <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    My Chats
                    {totalUnreadMessages > 0 && (
                      <span className="ml-auto text-xs font-semibold px-2 py-1 rounded-full bg-red-100 text-red-800">
                        {totalUnreadMessages}
                      </span>
                    )}
                  </div>
                </button>

                <button
                  onClick={() => setActiveTab('settings')}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                    activeTab === 'settings'
                      ? 'bg-blue-50 text-blue-600 border-l-4 border-blue-500'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center">
                    <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Account Settings
                  </div>
                </button>
              </nav>
            </div>
          </div>

          <div className="lg:col-span-3">
            <div className="bg-white rounded-xl shadow-sm border p-6">
              {activeTab === 'profile' && (
                <>
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">Profile Information</h2>
                    {!editing && (
                      <button
                        onClick={handleEditProfile}
                        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center"
                      >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        Edit Profile
                      </button>
                    )}
                  </div>
                  
                  {editing ? (
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                          <input
                            type="text"
                            value={formData.fullName}
                            onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                          <input
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({...formData, email: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            disabled
                          />
                          <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                          <input
                            type="tel"
                            value={formData.phone}
                            onChange={(e) => setFormData({...formData, phone: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter your phone number"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                          <input
                            type="text"
                            value={formData.address}
                            onChange={(e) => setFormData({...formData, address: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter your address"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                        <textarea
                          value={formData.bio}
                          onChange={(e) => setFormData({...formData, bio: e.target.value})}
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Tell us about yourself..."
                        />
                      </div>

                      <div className="flex space-x-2 pt-4">
                        <button
                          onClick={handleSaveProfile}
                          className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                        >
                          Save Changes
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <label className="block text-sm font-medium text-gray-500 mb-1">Full Name</label>
                          <p className="text-gray-900 font-semibold">{user.fullName}</p>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <label className="block text-sm font-medium text-gray-500 mb-1">Email</label>
                          <p className="text-gray-900 font-semibold">{user.email}</p>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <label className="block text-sm font-medium text-gray-500 mb-1">Phone</label>
                          <p className="text-gray-900 font-semibold">{user.phone || 'Not provided'}</p>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <label className="block text-sm font-medium text-gray-500 mb-1">Address</label>
                          <p className="text-gray-900 font-semibold">{user.address || 'Not provided'}</p>
                        </div>
                      </div>

                      {user.bio && (
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <label className="block text-sm font-medium text-gray-500 mb-1">Bio</label>
                          <p className="text-gray-900 whitespace-pre-line">{user.bio}</p>
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}

              {activeTab === 'bookings' && (
                <>
                  <div className="flex justify-between items-center mb-6">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">My Bookings</h2>
                      <p className="text-gray-600 mt-1">Manage and view all your bookings</p>
                    </div>
                    <div className="flex items-center space-x-4">
                      <span className="px-4 py-2 bg-blue-100 text-blue-800 rounded-full font-semibold">
                        {bookings.length} booking{bookings.length !== 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>

                  {bookings.length === 0 ? (
                    <div className="text-center py-16 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
                      <div className="text-6xl mb-6">📅</div>
                      <h3 className="text-2xl font-bold text-gray-700 mb-3">No Bookings Yet</h3>
                      <p className="text-gray-600 max-w-md mx-auto mb-8">
                        You haven't made any bookings yet. Explore activities and book your next adventure!
                      </p>
                      <button
                        onClick={() => router.push('/tourist/activities')}
                        className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-semibold"
                      >
                        Browse Activities
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {bookings.map((booking) => (
                        <div 
                          key={booking.id}
                          className="bg-white border border-gray-200 rounded-lg p-4 hover:border-blue-500 hover:shadow-md transition-all"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex items-start space-x-4">
                              <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                                <img
                                  src={getFullImageUrl(booking.activityImage || '')}
                                  alt={booking.activityName}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    e.currentTarget.src = 'https://images.unsplash.com/photo-1501555088652-021faa106b9b?w=500&fit=crop';
                                  }}
                                />
                              </div>
                              
                              <div className="flex-1 min-w-0">
                                <h3 className="font-semibold text-gray-900 text-lg mb-1">
                                  {booking.activityName}
                                </h3>
                                
                                <div className="flex flex-wrap gap-3 mb-3">
                                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                                    booking.status === 'Confirmed' 
                                      ? 'bg-green-100 text-green-800'
                                      : booking.status === 'Pending'
                                      ? 'bg-yellow-100 text-yellow-800'
                                      : booking.status === 'Cancelled'
                                      ? 'bg-red-100 text-red-800'
                                      : 'bg-blue-100 text-blue-800'
                                  }`}>
                                    {booking.status}
                                  </span>
                                  
                                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                                    booking.paymentStatus === 'Paid'
                                      ? 'bg-green-100 text-green-800'
                                      : booking.paymentStatus === 'Pending'
                                      ? 'bg-yellow-100 text-yellow-800'
                                      : 'bg-red-100 text-red-800'
                                  }`}>
                                    {booking.paymentStatus}
                                  </span>
                                </div>
                                
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                  <div>
                                    <p className="text-gray-600">Date</p>
                                    <p className="font-semibold text-gray-900">
                                      {new Date(booking.selectedDate).toLocaleDateString()}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-gray-600">People</p>
                                    <p className="font-semibold text-gray-900">
                                      {booking.numberOfPeople}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-gray-600">Amount</p>
                                    <p className="font-semibold text-gray-900">
                                      ${booking.totalAmount.toFixed(2)}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-gray-600">Booked On</p>
                                    <p className="font-semibold text-gray-900">
                                      {new Date(booking.bookingDate).toLocaleDateString()}
                                    </p>
                                  </div>
                                </div>

                                {booking.providerName && (
                                  <div className="mt-4 flex items-center justify-between">
                                    <div className="flex items-center">
                                      <span className="text-gray-600 mr-2">Provider:</span>
                                      <span className="font-medium text-gray-900">{booking.providerName}</span>
                                    </div>
                                    {booking.providerId && user && (
                                      <div className="ml-4">
                                        <ContactButton
                                          currentUserId={user.id}
                                          otherUserId={booking.providerId}
                                          currentUserName={user.fullName}
                                          otherUserName={booking.providerName || 'Provider'}
                                          activityId={booking.activityId}
                                          activityName={booking.activityName}
                                          variant="icon"
                                          size="sm"
                                        />
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                            
                            <div className="flex flex-col space-y-2">
                              <button
                                onClick={() => router.push(`/tourist/activities/${booking.activityId}`)}
                                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-sm font-semibold"
                              >
                                View Activity
                              </button>
                              
                              {booking.status === 'Pending' && (
                                <button
                                  onClick={() => handleCancelBooking(booking.id)}
                                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 text-sm font-semibold"
                                >
                                  Cancel Booking
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {bookings.length > 0 && (
                    <div className="mt-8 pt-6 border-t">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Booking Statistics</h3>
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <p className="text-sm text-gray-600">Total Bookings</p>
                          <p className="text-xl font-bold text-gray-900 mt-1">{stats.totalBookings}</p>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <p className="text-sm text-gray-600">Completed</p>
                          <p className="text-xl font-bold text-green-600 mt-1">{stats.completedBookings}</p>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <p className="text-sm text-gray-600">Pending</p>
                          <p className="text-xl font-bold text-yellow-600 mt-1">{stats.pendingBookings}</p>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <p className="text-sm text-gray-600">Total Spent</p>
                          <p className="text-xl font-bold text-blue-600 mt-1">${stats.totalSpent.toFixed(2)}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}

              {activeTab === 'saved' && (
                <>
                  <div className="flex justify-between items-center mb-6">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">Saved Items</h2>
                      <p className="text-gray-600 mt-1">Activities you've saved for later</p>
                    </div>
                    <div className="flex items-center space-x-4">
                      <span className="px-4 py-2 bg-blue-100 text-blue-800 rounded-full font-semibold">
                        {savedItems.length} items
                      </span>
                    </div>
                  </div>

                  {savedItems.length === 0 ? (
                    <div className="text-center py-16 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
                      <div className="text-6xl mb-6">❤️</div>
                      <h3 className="text-2xl font-bold text-gray-700 mb-3">No Saved Items Yet</h3>
                      <p className="text-gray-600 max-w-md mx-auto mb-8">
                        Save activities you're interested in by clicking the heart icon on any activity.
                      </p>
                      <button
                        onClick={() => router.push('/tourist/activities')}
                        className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-semibold"
                      >
                        Browse Activities
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {savedItems.map((item) => (
                        <div 
                          key={item.id} 
                          className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-all duration-300 hover:-translate-y-1"
                        >
                          <div className="relative h-48">
                            <img
                              src={getFullImageUrl(item.activityImage || '')}
                              alt={item.activityName}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.currentTarget.src = 'https://images.unsplash.com/photo-1501555088652-021faa106b9b?w=500&fit=crop';
                              }}
                            />
                            <div className="absolute top-3 right-3 flex space-x-1">
                              <button
                                onClick={() => removeSavedItem(item.id)}
                                className="bg-white p-2 rounded-full shadow-lg hover:bg-red-50 hover:text-red-500 transition-colors"
                                title="Remove from saved"
                              >
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                              </button>
                              {user && item.providerId && (
                                <ContactButton
                                  currentUserId={user.id}
                                  otherUserId={item.providerId}
                                  currentUserName={user.fullName}
                                  otherUserName={item.providerName || 'Provider'}
                                  activityId={item.activityId}
                                  activityName={item.activityName}
                                  variant="icon"
                                  size="sm"
                                />
                              )}
                            </div>
                            <div className="absolute bottom-3 left-3 bg-black/70 text-white px-3 py-1 rounded-full text-sm font-semibold">
                              ${item.price}
                            </div>
                            <div className="absolute top-3 left-3">
                              <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded-full">
                                {item.category}
                              </span>
                            </div>
                          </div>
                          
                          <div className="p-5">
                            <h3 className="font-bold text-gray-900 text-lg mb-2 line-clamp-2 h-14">
                              {item.activityName}
                            </h3>
                            
                            {item.providerName && (
                              <div className="flex items-center text-gray-600 text-sm mb-2">
                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                                <span className="truncate">{item.providerName}</span>
                              </div>
                            )}
                            
                            <div className="flex items-center text-gray-600 text-sm mb-4">
                              <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                              </svg>
                              <span className="truncate">{item.location}</span>
                            </div>
                            
                            <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                              <span className="text-xs text-gray-500">
                                Saved {new Date(item.savedAt).toLocaleDateString('en-US', { 
                                  month: 'short', 
                                  day: 'numeric',
                                  year: 'numeric'
                                })}
                              </span>
                              <button
                                onClick={() => router.push(`/tourist/activities/${item.activityId}`)}
                                className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-sm rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all font-semibold"
                              >
                                View Details
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}

              {activeTab === 'chats' && (
                <>
                  <div className="flex justify-between items-center mb-6">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">My Chats</h2>
                      <p className="text-gray-600 mt-1">Connect with activity providers</p>
                    </div>
                    <div className="flex items-center space-x-4">
                      <span className="px-4 py-2 bg-blue-100 text-blue-800 rounded-full font-semibold">
                        {chats.length} chat{chats.length !== 1 ? 's' : ''}
                      </span>
                      {totalUnreadMessages > 0 && (
                        <span className="px-4 py-2 bg-red-100 text-red-800 rounded-full font-semibold">
                          {totalUnreadMessages} unread
                        </span>
                      )}
                    </div>
                  </div>

                  {chats.length === 0 ? (
                    <div className="text-center py-16 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
                      <div className="text-6xl mb-6">💬</div>
                      <h3 className="text-2xl font-bold text-gray-700 mb-3">No Chats Yet</h3>
                      <p className="text-gray-600 max-w-md mx-auto mb-8">
                        Start a conversation with an activity provider by clicking the contact button on their activity page.
                      </p>
                      <button
                        onClick={() => router.push('/tourist/activities')}
                        className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-semibold"
                      >
                        Browse Activities
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {chats.map((chat) => (
                        <div 
                          key={chat.id}
                          className="bg-white border border-gray-200 rounded-lg p-4 hover:border-blue-500 hover:shadow-md transition-all cursor-pointer"
                        >
                          <div className="flex items-center space-x-4">
                            <div className="relative">
                              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                                {chat.otherUser.fullName?.charAt(0) || 'U'}
                              </div>
                              {chat.unreadCount > 0 && (
                                <div className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                                  {chat.unreadCount}
                                </div>
                              )}
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <div className="flex justify-between items-start">
                                <div>
                                  <h3 className="font-semibold text-gray-900 truncate">
                                    {chat.otherUser.fullName}
                                  </h3>
                                  <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full">
                                    {chat.otherUser.role}
                                  </span>
                                </div>
                                <span className="text-sm text-gray-500 whitespace-nowrap">
                                  {new Date(chat.lastMessageAt).toLocaleDateString()}
                                </span>
                              </div>
                              
                              <div className="flex justify-between items-center mt-2">
                                <p className="text-gray-600 text-sm truncate">
                                  {chat.lastMessage}
                                </p>
                                {chat.unreadCount > 0 && (
                                  <span className="flex-shrink-0 ml-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded-full">
                                    {chat.unreadCount} new
                                  </span>
                                )}
                              </div>
                            </div>
                            
                            <div className="flex space-x-2">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  router.push(`/chats/${chat.id}`);
                                }}
                                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-sm font-semibold"
                              >
                                Open Chat
                              </button>
                              {user && (
                                <ContactButton
                                  currentUserId={user.id}
                                  otherUserId={chat.otherUser.id}
                                  currentUserName={user.fullName}
                                  otherUserName={chat.otherUser.fullName}
                                  variant="icon"
                                  size="sm"
                                />
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="mt-8 pt-6 border-t">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Chat Statistics</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-sm text-gray-600">Active Conversations</p>
                        <p className="text-xl font-bold text-gray-900 mt-1">{chats.length}</p>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-sm text-gray-600">Providers Contacted</p>
                        <p className="text-xl font-bold text-blue-600 mt-1">
                          {new Set(chats.map(chat => chat.otherUser.id)).size}
                        </p>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-sm text-gray-600">Unread Messages</p>
                        <p className="text-xl font-bold text-red-600 mt-1">{totalUnreadMessages}</p>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {activeTab === 'settings' && (
                <>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Account Settings</h2>
                  <div className="space-y-6">
                    <div className="border border-gray-200 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Change Password</h3>
                      <form className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Current Password
                          </label>
                          <input
                            type="password"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            New Password
                          </label>
                          <input
                            type="password"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Confirm New Password
                          </label>
                          <input
                            type="password"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <button
                          type="button"
                          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                        >
                          Update Password
                        </button>
                      </form>
                    </div>

                    <div className="border border-gray-200 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Notification Preferences</h3>
                      <div className="space-y-3">
                        <label className="flex items-center">
                          <input type="checkbox" className="mr-3" defaultChecked />
                          <span className="text-gray-700">Email notifications for new activities</span>
                        </label>
                        <label className="flex items-center">
                          <input type="checkbox" className="mr-3" defaultChecked />
                          <span className="text-gray-700">Booking confirmations and updates</span>
                        </label>
                        <label className="flex items-center">
                          <input type="checkbox" className="mr-3" />
                          <span className="text-gray-700">Marketing emails and promotions</span>
                        </label>
                        <label className="flex items-center">
                          <input type="checkbox" className="mr-3" defaultChecked />
                          <span className="text-gray-700">Activity reminders</span>
                        </label>
                      </div>
                    </div>

                    <div className="border border-red-200 rounded-lg p-6 bg-red-50">
                      <h3 className="text-lg font-semibold text-red-900 mb-4">Danger Zone</h3>
                      <p className="text-red-700 mb-4">
                        Once you delete your account, there is no going back. Please be certain.
                      </p>
                      <button
                        onClick={handleDeleteAccount}
                        className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                      >
                        Delete Account
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}