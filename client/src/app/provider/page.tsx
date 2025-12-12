'use client';

import { useState, useEffect } from "react";
import { useRouter } from 'next/navigation';
import StatsCards from "@/components/provider/StatsCards";
import ActivitiesTable from "@/components/provider/ActivitiesTable";
import ReviewsSection from "@/components/provider/ReviewsSection";
import BookingsTable from "@/components/provider/BookingsTable";
import AddActivityModal from "@/components/provider/AddActivityModal";
import EditActivityModal from "@/components/provider/EditActivityModal";
import ChangePasswordModal from "@/components/provider/ChangePasswordModal";
import ChatList from "@/components/provider/ChatList";
import NotificationBell from "@/components/NotificationBell";
import { 
  MessageSquare, Activity, Calendar, TrendingUp, Star, LogOut, 
  Users, Mountain, Settings, Compass, Home 
} from "lucide-react";

interface Category {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  featured: boolean;
  activityCount: number;
}

interface ActivityType {
  id: string;
  name: string;
  description: string;
  price: number;
  availableSlots: number;
  location: string;
  category: string;
  categoryId: string;
  duration: string;
  included: string[];
  requirements: string[];
  quickFacts: string[];
  status: string;
  createdAt: string;
  images: string[];
  startDate: string;
  endDate: string;
  isActive?: boolean;
  isExpired?: boolean;
  isUpcoming?: boolean;
  delayedDate?: string;
  rescheduledStartDate?: string;
  rescheduledEndDate?: string;
}

interface Booking {
  id: string;
  activityName: string;
  userName: string;
  bookingDate: string;
  numberOfPeople: number;
  totalAmount: number;
  status: string;
}

interface Review {
  id: string;
  activityId: string;
  activityName: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

const ProviderDashboard = () => {
  const [activities, setActivities] = useState<ActivityType[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState('dashboard');
  const [showAddActivity, setShowAddActivity] = useState(false);
  const [showEditActivity, setShowEditActivity] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [editingActivity, setEditingActivity] = useState<ActivityType | null>(null);
  const [user, setUser] = useState<any>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const router = useRouter();
  
  const [stats, setStats] = useState({
    totalActivities: 0,
    totalBookings: 0,
    totalRevenue: 0,
    pendingBookings: 0,
    activeAdventurers: 0,
    popularLocation: "",
    unreadMessages: 0,
    activeActivities: 0,
    upcomingActivities: 0,
    expiredActivities: 0,
    delayedActivities: 0,
    totalReviews: 0,
    averageRating: 0
  });

  const [newActivity, setNewActivity] = useState({
    name: '',
    description: '',
    price: 0,
    availableSlots: 0,
    location: '',
    categoryId: '',
    duration: '',
    included: '',
    requirements: '',
    quickFacts: '',
    startDate: '',
    endDate: ''
  });

  const [editActivityData, setEditActivityData] = useState({
    name: '',
    description: '',
    price: 0,
    availableSlots: 0,
    location: '',
    categoryId: '',
    duration: '',
    included: '',
    requirements: '',
    quickFacts: '',
    startDate: '',
    endDate: ''
  });

  const menuItems = [
    { text: 'Dashboard', icon: '📊', section: 'dashboard' },
    { text: 'My Activities', icon: '🏔️', section: 'activities' },
    { text: 'Bookings', icon: '📅', section: 'bookings' },
    { text: 'Reviews', icon: '⭐', section: 'reviews' },
    { text: 'Chats', icon: '💬', section: 'chats' },
    { text: 'Analytics', icon: '📈', section: 'analytics' },
  ];

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5224/api';

  const getToken = (): string => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/');
      throw new Error('No token found');
    }
    return token;
  };

  useEffect(() => {
    const userData = localStorage.getItem('user');
    const token = localStorage.getItem('token');

    if (!userData || !token) {
      router.push('/');
      return;
    }

    try {
      const parsedUser = JSON.parse(userData);
      
      if (parsedUser.role !== 'Provider') {
        if (parsedUser.role === 'Admin') {
          router.push('/admin');
        } else {
          router.push('/tourist/dashboard');
        }
        return;
      }

      setUser(parsedUser);
      fetchProviderData(parsedUser, token);
      fetchCategories(token);
      fetchUnreadCount(token);
    } catch (error) {
      console.error('Error parsing user data:', error);
      router.push('/');
    }
  }, [router]);

  const fetchCategories = async (token: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/categories`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const categoriesData = await response.json();
        setCategories(categoriesData);
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  const fetchProviderData = async (userData: any, token: string) => {
    try {
      const activitiesResponse = await fetch(`${API_BASE_URL}/activities/provider/${userData.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (activitiesResponse.ok) {
        const activitiesData = await activitiesResponse.json();
        
        console.log('=== FETCHED ACTIVITIES FOR PROVIDER ===');
        
        const now = new Date();
        const processedActivities = activitiesData.map((activity: any) => {
          const startDate = new Date(activity.startDate || activity.createdAt);
          const endDate = new Date(activity.endDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000));
          
          const isExpired = endDate < now;
          const isUpcoming = startDate > now;
          const isActive = !isExpired && !isUpcoming;
          
          const delayedDate = activity.delayedDate || activity.DelayedDate || null;
          const rescheduledStartDate = activity.rescheduledStartDate || activity.RescheduledStartDate || null;
          const rescheduledEndDate = activity.rescheduledEndDate || activity.RescheduledEndDate || null;
          
          return {
            ...activity,
            startDate: activity.startDate || activity.createdAt,
            endDate: activity.endDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
            status: activity.status || 'Pending',
            delayedDate: delayedDate,
            rescheduledStartDate: rescheduledStartDate,
            rescheduledEndDate: rescheduledEndDate,
            included: Array.isArray(activity.included) ? activity.included : [],
            requirements: Array.isArray(activity.requirements) ? activity.requirements : [],
            quickFacts: Array.isArray(activity.quickFacts) ? activity.quickFacts : [],
            isExpired,
            isUpcoming,
            isActive
          };
        });

        const delayedActivities = processedActivities.filter((a: ActivityType) => a.status === 'Delayed');
        console.log(`Found ${delayedActivities.length} delayed activities for provider`);
        delayedActivities.forEach((activity: ActivityType) => {
          console.log(`Delayed Activity: ${activity.name}`, {
            delayedDate: activity.delayedDate,
            rescheduledStartDate: activity.rescheduledStartDate,
            rescheduledEndDate: activity.rescheduledEndDate
          });
        });
        
        setActivities(processedActivities);
        
        const locationCounts: { [key: string]: number } = {};
        processedActivities.forEach((activity: ActivityType) => {
          locationCounts[activity.location] = (locationCounts[activity.location] || 0) + 1;
        });
        
        const popularLocation = Object.keys(locationCounts).reduce((a, b) => 
          locationCounts[a] > locationCounts[b] ? a : "No locations", "No locations"
        );
        
        const activeActivities = processedActivities.filter((a: ActivityType) => a.isActive).length;
        const upcomingActivities = processedActivities.filter((a: ActivityType) => a.isUpcoming).length;
        const expiredActivities = processedActivities.filter((a: ActivityType) => a.isExpired).length;
        const delayedActivitiesCount = processedActivities.filter((a: ActivityType) => a.status === 'Delayed').length;

        setStats(prev => ({ 
          ...prev, 
          totalActivities: processedActivities.length,
          popularLocation,
          activeActivities,
          upcomingActivities,
          expiredActivities,
          delayedActivities: delayedActivitiesCount
        }));
        
        await fetchReviewsForActivities(processedActivities, token);
      }

      const bookingsResponse = await fetch(`${API_BASE_URL}/bookings/provider/${userData.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (bookingsResponse.ok) {
        const bookingsData = await bookingsResponse.json();
        setBookings(bookingsData);
        
        const totalBookings = bookingsData.length;
        const totalRevenue = bookingsData.reduce((sum: number, booking: Booking) => sum + booking.totalAmount, 0);
        const pendingBookings = bookingsData.filter((b: Booking) => b.status === 'Pending').length;
        
        const today = new Date().toISOString().split('T')[0];
        const activeAdventurers = bookingsData.filter((b: Booking) => 
          b.bookingDate.startsWith(today)
        ).length;
        
        setStats(prev => ({
          ...prev,
          totalBookings,
          totalRevenue,
          pendingBookings,
          activeAdventurers
        }));
      }
    } catch (error) {
      console.error('Error fetching provider data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchReviewsForActivities = async (activities: ActivityType[], token: string) => {
    try {
      const allReviews: Review[] = [];
      
      const reviewsPromises = activities.map(async (activity) => {
        try {
          const response = await fetch(`${API_BASE_URL}/reviews/activity/${activity.id}`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });
          
          if (response.ok) {
            const reviewsData = await response.json();
            if (reviewsData.success && reviewsData.data && reviewsData.data.length > 0) {
              return reviewsData.data.map((review: any) => ({
                id: review.id,
                activityId: review.activityId,
                activityName: activity.name,
                userName: review.userName,
                rating: review.rating,
                comment: review.comment,
                createdAt: review.createdAt
              }));
            }
          }
        } catch (error) {
          console.error(`Error fetching reviews for activity ${activity.id}:`, error);
        }
        return [];
      });

      const reviewsResults = await Promise.all(reviewsPromises);
      const flattenedReviews = reviewsResults.flat();
      
      setReviews(flattenedReviews);
      
      if (flattenedReviews.length > 0) {
        const totalReviews = flattenedReviews.length;
        const averageRating = flattenedReviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews;
        
        setStats(prev => ({
          ...prev,
          totalReviews,
          averageRating: Number(averageRating.toFixed(1))
        }));
      } else {
        setStats(prev => ({
          ...prev,
          totalReviews: 0,
          averageRating: 0
        }));
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
      setReviews([]);
      setStats(prev => ({
        ...prev,
        totalReviews: 0,
        averageRating: 0
      }));
    }
  };

  const fetchUnreadCount = async (token: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/chats/unread-count`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setUnreadCount(data.unreadCount || 0);
        setStats(prev => ({ ...prev, unreadMessages: data.unreadCount || 0 }));
      }
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  };

 const handleUpdateStatusWithDates = async (
  activityId: string, 
  status: string, 
  rescheduledDates?: {startDate?: string, endDate?: string}
) => {
  try {
    console.log('=== Starting status update with dates ===');
    console.log('Activity ID:', activityId);
    console.log('New Status:', status);
    console.log('Rescheduled Dates:', rescheduledDates);
    
    const token = getToken();
    
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
    
    console.log('Sending to API:', requestBody);
    
    const response = await fetch(`${API_BASE_URL}/activities/${activityId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(requestBody)
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Error:', errorText);
      throw new Error(`Failed to update activity status: ${response.status}`);
    }
    
    const result = await response.json();
    console.log('📊 API Response:', result);
    
    console.log('🔍 Checking API response status:');
    console.log('Requested status:', status);
    console.log('API returned status:', result.status);
    console.log('API returned Status (capital):', result.Status);
    
    if (status === 'Delayed' && result.status !== 'Delayed') {
      console.error('❌ API returned wrong status! Expected: Delayed, Got:', result.status);
      alert('Warning: API returned wrong status. Check server logs.');
    }
    
    setActivities(prev => prev.map(activity => {
      if (activity.id === activityId) {
        const now = new Date();
        const startDate = new Date(activity.startDate);
        const endDate = new Date(activity.endDate);
        
        const isExpired = endDate < now;
        const isUpcoming = startDate > now;
        const isActive = !isExpired && !isUpcoming && status === 'Active';
        
       
        const finalStatus = result.status || result.Status || status;
        
        const updatedActivity: ActivityType = { 
          ...activity, 
          status: finalStatus,
          isActive,
          isExpired,
          isUpcoming,
          delayedDate: result.delayedDate || result.DelayedDate || new Date().toISOString(),
          rescheduledStartDate: result.rescheduledStartDate || result.RescheduledStartDate || rescheduledDates?.startDate || '',
          rescheduledEndDate: result.rescheduledEndDate || result.RescheduledEndDate || rescheduledDates?.endDate || ''
        };
        
        console.log('✅ Updated activity in state:', updatedActivity);
        return updatedActivity;
      }
      return activity;
    }));
    
   
    setTimeout(() => {
      if (user) {
        console.log('🔄 Refreshing provider data...');
        fetchProviderData(user, token);
      }
    }, 1000);
    
    alert(`Activity status updated to ${status} with new dates!`);
    
  } catch (error) {
    console.error('Error updating status:', error);
    alert(`Error updating status: ${error instanceof Error ? error.message : 'Please check console'}`);
  }
};

  const handleUpdateStatus = async (activityId: string, status: string, rescheduledDates?: {startDate?: string, endDate?: string}) => {
    return handleUpdateStatusWithDates(activityId, status, rescheduledDates);
  };

  const handleAddActivity = async (e: React.FormEvent, images: File[]) => {
    e.preventDefault();
    if (!user) return;

    try {
      const token = getToken();
      
      const formData = new FormData();
      formData.append('providerId', user.id);
      formData.append('name', newActivity.name);
      formData.append('description', newActivity.description);
      formData.append('price', newActivity.price.toString());
      formData.append('availableSlots', newActivity.availableSlots.toString());
      formData.append('location', newActivity.location);
      formData.append('categoryId', newActivity.categoryId);
      formData.append('duration', newActivity.duration);
      formData.append('included', newActivity.included);
      formData.append('requirements', newActivity.requirements);
      formData.append('quickFacts', newActivity.quickFacts);
      formData.append('startDate', new Date(newActivity.startDate).toISOString());
      formData.append('endDate', new Date(newActivity.endDate).toISOString());
      
      images.forEach(image => {
        formData.append('images', image);
      });

      const activityResponse = await fetch(`${API_BASE_URL}/activities`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (activityResponse.ok) {
        setShowAddActivity(false);
        setNewActivity({
          name: '',
          description: '',
          price: 0,
          availableSlots: 0,
          location: '',
          categoryId: '',
          duration: '',
          included: '',
          requirements: '',
          quickFacts: '',
          startDate: '',
          endDate: ''
        });
        fetchProviderData(user, token); 
        alert('Activity created successfully!');
      } else {
        const errorText = await activityResponse.text();
        alert('Failed to create activity: ' + errorText);
      }
    } catch (error) {
      console.error('Error adding activity:', error);
      alert('Error creating activity. Please try again.');
    }
  };

  const handleEditActivity = (activity: ActivityType) => {
    setEditingActivity(activity);
    setEditActivityData({
      name: activity.name,
      description: activity.description,
      price: activity.price,
      availableSlots: activity.availableSlots,
      location: activity.location,
      categoryId: activity.categoryId,
      duration: activity.duration || '',
      included: Array.isArray(activity.included) ? activity.included.join(', ') : '',
      requirements: Array.isArray(activity.requirements) ? activity.requirements.join(', ') : '',
      quickFacts: Array.isArray(activity.quickFacts) ? activity.quickFacts.join(', ') : '',
      startDate: activity.startDate ? new Date(activity.startDate).toISOString().slice(0, 16) : '',
      endDate: activity.endDate ? new Date(activity.endDate).toISOString().slice(0, 16) : ''
    });
    setShowEditActivity(true);
  };

  const handleUpdateActivity = async (e: React.FormEvent, images: File[] = []) => {
    e.preventDefault();
    if (!editingActivity || !user) return;

    try {
      const token = getToken(); 
      
      const response = await fetch(`${API_BASE_URL}/activities/${editingActivity.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: editActivityData.name,
          description: editActivityData.description,
          price: Number(editActivityData.price),
          availableSlots: Number(editActivityData.availableSlots),
          location: editActivityData.location,
          categoryId: editActivityData.categoryId,
          duration: editActivityData.duration,
          included: editActivityData.included,
          requirements: editActivityData.requirements,
          quickFacts: editActivityData.quickFacts,
          startDate: new Date(editActivityData.startDate),
          endDate: new Date(editActivityData.endDate)
        })
      });

      if (response.ok) {
        if (images.length > 0) {
          const formData = new FormData();
          images.forEach(image => {
            formData.append('images', image);
          });

          await fetch(`${API_BASE_URL}/activityimages/upload/${editingActivity.id}`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`
            },
            body: formData
          });
        }

        setShowEditActivity(false);
        setEditingActivity(null);
        fetchProviderData(user, token); 
        alert('Activity updated successfully!');
      } else {
        const errorData = await response.json();
        alert('Failed to update activity: ' + (errorData.message || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error updating activity:', error);
      alert('Error updating activity. Please try again.');
    }
  };

  const handleDeleteActivity = async (activityId: string) => {
    if (!confirm('Are you sure you want to delete this activity?')) return;
    
    try {
      const token = getToken(); 
      const response = await fetch(`${API_BASE_URL}/activities/${activityId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        fetchProviderData(user, token); 
        alert('Activity deleted successfully!');
      } else {
        const errorText = await response.text();
        alert('Failed to delete activity: ' + errorText);
      }
    } catch (error) {
      console.error('Error deleting activity:', error);
      alert('Error deleting activity. Please try again.');
    }
  };

  const handleDataChange = (field: string, value: string | number) => {
    setNewActivity(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleEditDataChange = (field: string, value: string | number) => {
    setEditActivityData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const reviewStats = {
    totalReviews: reviews.length,
    averageRating: reviews.length > 0 
      ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length 
      : 0,
    ratingDistribution: reviews.reduce((acc, review) => {
      const roundedRating = Math.round(review.rating);
      acc[roundedRating] = (acc[roundedRating] || 0) + 1;
      return acc;
    }, {} as { [key: number]: number }),
    recentReviews: reviews.slice(0, 10)
  };

  const handleRespond = (reviewId: string, response: string) => {
    alert(`Response functionality coming soon for review: ${reviewId}`);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('notificationCount');
    localStorage.removeItem('selectedSection');
    router.push('/');
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500"></div>
      </div>
    );
  }

  const renderMainContent = () => {
    switch (activeSection) {
      case 'activities':
        return (
          <div>
            {activities.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-400">No activities found. Create your first activity!</p>
                <button
                  onClick={() => setShowAddActivity(true)}
                  className="mt-4 px-6 py-3 bg-gradient-to-r from-amber-600 to-orange-700 text-white rounded-xl hover:from-amber-700 hover:to-orange-800 transition-all duration-300 font-semibold"
                >
                  Create Your First Activity
                </button>
              </div>
            ) : (
              <ActivitiesTable 
                activities={activities} 
                onDeleteActivity={handleDeleteActivity}
                onEditActivity={handleEditActivity}
                onStatusChange={handleUpdateStatusWithDates} 
              />
            )}
          </div>
        );
      case 'bookings':
        return (
          <div>
            {bookings.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-400">No bookings yet</p>
              </div>
            ) : (
              <BookingsTable bookings={bookings} />
            )}
          </div>
        );
      case 'reviews':
        return (
          <ReviewsSection 
            reviews={reviews}
            reviewStats={reviewStats}
            onRespond={handleRespond}
          />
        );
      case 'chats':
        return (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">Chats</h2>
              <div className="text-gray-400">
                {unreadCount} unread message{unreadCount !== 1 ? 's' : ''}
              </div>
            </div>
            <ChatList providerId={user.id} compact={false} />
          </div>
        );
      case 'analytics':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white">Performance Analytics</h2>
              <div className="text-gray-400">
                Showing data for {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400">Total Revenue</p>
                    <h3 className="text-2xl font-bold text-white mt-1">${stats.totalRevenue}</h3>
                  </div>
                  <div className="p-3 bg-emerald-500/20 rounded-lg">
                    <TrendingUp className="w-6 h-6 text-emerald-400" />
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400">Active Activities</p>
                    <h3 className="text-2xl font-bold text-white mt-1">{stats.activeActivities}</h3>
                  </div>
                  <div className="p-3 bg-blue-500/20 rounded-lg">
                    <Activity className="w-6 h-6 text-blue-400" />
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400">Pending Bookings</p>
                    <h3 className="text-2xl font-bold text-white mt-1">{stats.pendingBookings}</h3>
                  </div>
                  <div className="p-3 bg-amber-500/20 rounded-lg">
                    <Calendar className="w-6 h-6 text-amber-400" />
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400">Delayed Activities</p>
                    <h3 className="text-2xl font-bold text-white mt-1">{stats.delayedActivities}</h3>
                  </div>
                  <div className="p-3 bg-purple-500/20 rounded-lg">
                    <Compass className="w-6 h-6 text-purple-400" />
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700">
              <h3 className="text-lg font-semibold text-white mb-4">Activity Status Distribution</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-gray-300">Active Activities</span>
                    <span className="text-emerald-400 font-semibold">{stats.activeActivities}</span>
                  </div>
                  <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-emerald-500 rounded-full"
                      style={{ width: `${(stats.activeActivities / (stats.totalActivities || 1)) * 100}%` }}
                    />
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-gray-300">Upcoming Activities</span>
                    <span className="text-blue-400 font-semibold">{stats.upcomingActivities}</span>
                  </div>
                  <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-blue-500 rounded-full"
                      style={{ width: `${(stats.upcomingActivities / (stats.totalActivities || 1)) * 100}%` }}
                    />
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-gray-300">Expired Activities</span>
                    <span className="text-red-400 font-semibold">{stats.expiredActivities}</span>
                  </div>
                  <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-red-500 rounded-full"
                      style={{ width: `${(stats.expiredActivities / (stats.totalActivities || 1)) * 100}%` }}
                    />
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-gray-300">Delayed Activities</span>
                    <span className="text-purple-400 font-semibold">{stats.delayedActivities}</span>
                  </div>
                  <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-purple-500 rounded-full"
                      style={{ width: `${(stats.delayedActivities / (stats.totalActivities || 1)) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      case 'dashboard':
      default:
        return (
          <>
            <div className="mb-8">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-white">
                    Welcome back, <span className="text-amber-400">{user.fullName || user.name}!</span>
                  </h1>
                  <p className="text-gray-400 mt-2">Manage your activities, bookings, and chats</p>
                </div>
                <div className="flex items-center space-x-3">
                  {unreadCount > 0 && (
                    <div className="relative">
                      <button
                        onClick={() => setActiveSection('chats')}
                        className="px-4 py-2 bg-gradient-to-r from-red-500 to-pink-600 text-white rounded-xl hover:from-red-600 hover:to-pink-700 transition-all duration-300 font-semibold flex items-center"
                      >
                        <MessageSquare className="w-4 h-4 mr-2" />
                        {unreadCount} Unread Messages
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <StatsCards stats={stats} />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-white flex items-center">
                      <Activity className="w-5 h-5 mr-2 text-emerald-400" />
                      Recent Activities
                    </h2>
                    <button
                      onClick={() => setActiveSection('activities')}
                      className="text-amber-400 hover:text-amber-300 text-sm font-medium"
                    >
                      View All →
                    </button>
                  </div>
                  {activities.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-gray-400">No activities found. Create your first activity!</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {activities.slice(0, 3).map((activity) => {
                        let statusColor = 'bg-gray-500';
                        let statusText = activity.status;
                        
                        if (activity.isExpired) {
                          statusColor = 'bg-red-500';
                          statusText = 'Expired';
                        } else if (activity.isActive) {
                          statusColor = 'bg-emerald-500';
                          statusText = 'Active';
                        } else if (activity.isUpcoming) {
                          statusColor = 'bg-amber-500';
                          statusText = 'Upcoming';
                        } else if (activity.status === 'Delayed') {
                          statusColor = 'bg-purple-500';
                          statusText = 'Delayed';
                        }
                        
                        return (
                          <div key={activity.id} className="flex items-center justify-between p-4 bg-gray-900/50 rounded-lg border border-gray-700 hover:border-amber-500/30 transition-colors">
                            <div>
                              <h3 className="font-semibold text-white">{activity.name}</h3>
                              <p className="text-sm text-gray-400">{activity.location}</p>
                              {activity.status === 'Delayed' && activity.delayedDate && (
                                <p className="text-xs text-purple-400 mt-1">
                                  Delayed on: {new Date(activity.delayedDate).toLocaleDateString()}
                                </p>
                              )}
                            </div>
                            <div className="flex items-center space-x-4">
                              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColor} text-white`}>
                                {statusText}
                              </span>
                              <span className="text-lg font-bold text-amber-400">${activity.price}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-white flex items-center">
                      <Calendar className="w-5 h-5 mr-2 text-blue-400" />
                      Recent Bookings
                    </h2>
                    <button
                      onClick={() => setActiveSection('bookings')}
                      className="text-amber-400 hover:text-amber-300 text-sm font-medium"
                    >
                      View All →
                    </button>
                  </div>
                  {bookings.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-gray-400">No bookings yet</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {bookings.slice(0, 3).map((booking) => (
                        <div key={booking.id} className="flex items-center justify-between p-4 bg-gray-900/50 rounded-lg border border-gray-700 hover:border-amber-500/30 transition-colors">
                          <div>
                            <h3 className="font-semibold text-white">{booking.activityName}</h3>
                            <p className="text-sm text-gray-400">by {booking.userName}</p>
                          </div>
                          <div className="flex items-center space-x-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              booking.status === 'Confirmed' ? 'bg-emerald-500' :
                              booking.status === 'Pending' ? 'bg-amber-500' : 'bg-red-500'
                            } text-white`}>
                              {booking.status}
                            </span>
                            <span className="text-lg font-bold text-emerald-400">${booking.totalAmount}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-6">
                <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
                  <h2 className="text-xl font-bold text-white mb-4 flex items-center">
                    <TrendingUp className="w-5 h-5 mr-2 text-amber-400" />
                    Quick Stats
                  </h2>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">Popular Location</span>
                      <span className="font-semibold text-white">{stats.popularLocation}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">Avg. Rating</span>
                      <span className="font-semibold text-yellow-400">{stats.averageRating.toFixed(1)}/5</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">Total Reviews</span>
                      <span className="font-semibold text-white">{stats.totalReviews}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">Delayed Activities</span>
                      <span className="font-semibold text-purple-400">{stats.delayedActivities}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-800/50 rounded-xl border border-gray-700">
                  <div className="p-4 border-b border-gray-700">
                    <h2 className="text-xl font-bold text-white flex items-center">
                      <MessageSquare className="w-5 h-5 mr-2 text-amber-400" />
                      Recent Chats
                    </h2>
                  </div>
                  <div className="p-4">
                    <ChatList providerId={user.id} compact={true} />
                  </div>
                  <div className="p-4 border-t border-gray-700">
                    <button
                      onClick={() => setActiveSection('chats')}
                      className="w-full py-3 bg-gradient-to-r from-amber-600 to-orange-700 text-white rounded-xl hover:from-amber-700 hover:to-orange-800 transition-all duration-300 font-semibold"
                    >
                      View All Chats
                    </button>
                  </div>
                </div>

                <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
                  <h2 className="text-xl font-bold text-white mb-4 flex items-center">
                    <Settings className="w-5 h-5 mr-2 text-amber-400" />
                    Quick Actions
                  </h2>
                  <div className="space-y-3">
                    <button
                      onClick={() => setShowAddActivity(true)}
                      className="w-full py-3 bg-gradient-to-r from-emerald-600 to-green-700 text-white rounded-xl hover:from-emerald-700 hover:to-green-800 transition-all duration-300 font-semibold"
                    >
                      Add New Activity
                    </button>
                    <button
                      onClick={() => setShowChangePassword(true)}
                      className="w-full py-3 bg-gradient-to-r from-blue-600 to-cyan-700 text-white rounded-xl hover:from-blue-700 hover:to-cyan-800 transition-all duration-300 font-semibold"
                    >
                      Change Password
                    </button>
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
        padding: '24px',
        overflowY: 'auto'
      }}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '12px', 
          marginBottom: '32px',
          paddingBottom: '16px',
          borderBottom: '1px solid #333333'
        }}>
          <div style={{ 
            width: '40px', 
            height: '40px', 
            background: 'linear-gradient(135deg, #f59e0b 0%, #ea580c 100%)', 
            borderRadius: '12px', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            color: 'white',
            fontWeight: 'bold'
          }}>
            <Mountain size={20} />
          </div>
          <div>
            <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#ffffff' }}>
              TrailGuide Pro
            </div>
            <div style={{ color: '#b0b0b0', fontSize: '12px' }}>
              Provider Dashboard
            </div>
          </div>
        </div>
        
        {menuItems.map((item) => (
          <div 
            key={item.text} 
            style={{ 
              borderLeft: activeSection === item.section ? '4px solid #f59e0b' : 'none',
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
            <span style={{ fontSize: '18px' }}>{item.icon}</span>
            <span style={{ 
              fontWeight: activeSection === item.section ? 'bold' : 'normal',
              fontSize: '14px'
            }}>
              {item.text}
            </span>
          </div>
        ))}

        <div style={{ 
          marginTop: 'auto', 
          paddingTop: '24px',
          borderTop: '1px solid #333333'
        }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '12px',
            padding: '12px',
            backgroundColor: '#2a2a2a',
            borderRadius: '8px'
          }}>
            <div style={{ 
              width: '40px', 
              height: '40px', 
              background: 'linear-gradient(135deg, #f59e0b 0%, #ea580c 100%)', 
              borderRadius: '50%', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              color: 'white',
              fontWeight: 'bold'
            }}>
              {user?.fullName?.charAt(0) || user?.name?.charAt(0) || 'P'}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ color: '#ffffff', fontSize: '14px', fontWeight: 'bold' }}>
                {user?.fullName || user?.name || 'Provider'}
              </div>
              <div style={{ color: '#b0b0b0', fontSize: '12px' }}>
                Trail Expert
              </div>
            </div>
          </div>
        </div>
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
        justifyContent: 'space-between',
        zIndex: 10
      }}>
        <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#ffffff' }}>
          {menuItems.find(item => item.section === activeSection)?.text || 'Dashboard'}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button
            onClick={() => setShowAddActivity(true)}
            style={{
              padding: '10px 20px',
              background: 'linear-gradient(135deg, #f59e0b 0%, #ea580c 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 'bold',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <Mountain size={16} />
            Add Activity
          </button>

          <NotificationBell />

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ 
              width: '36px', 
              height: '36px', 
              background: 'linear-gradient(135deg, #f59e0b 0%, #ea580c 100%)', 
              borderRadius: '50%', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              color: 'white',
              fontWeight: 'bold'
            }}>
              {user?.fullName?.charAt(0) || user?.name?.charAt(0) || 'P'}
            </div>
            <button
              onClick={handleLogout}
              style={{
                padding: '8px 16px',
                backgroundColor: '#dc2626',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '14px'
              }}
            >
              <LogOut size={14} />
              Logout
            </button>
          </div>
        </div>
      </div>

      <div style={{ 
        flexGrow: 1, 
        padding: '24px', 
        marginTop: '64px', 
        marginLeft: '250px',
        overflowY: 'auto',
        maxHeight: 'calc(100vh - 64px)',
        backgroundColor: '#121212'
      }}>
        <div className="max-w-7xl mx-auto">
          {renderMainContent()}
        </div>
      </div>

      <AddActivityModal
        isOpen={showAddActivity}
        onClose={() => setShowAddActivity(false)}
        onSubmit={handleAddActivity}
        activityData={newActivity}
        onDataChange={handleDataChange}
        categories={categories}
      />

      <EditActivityModal
        isOpen={showEditActivity}
        onClose={() => {
          setShowEditActivity(false);
          setEditingActivity(null);
        }}
        onSubmit={handleUpdateActivity}
        activityData={editActivityData}
        onDataChange={handleEditDataChange}
        existingImages={editingActivity?.images || []}
        categories={categories}
      />

      <ChangePasswordModal
        isOpen={showChangePassword}
        onClose={() => setShowChangePassword(false)}
        providerId={user.id}
      />
    </div>
  );
};

export default ProviderDashboard;