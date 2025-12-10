'use client';

import { useState, useEffect } from "react";
import { useRouter } from 'next/navigation';
import StatsCards from "@/components/provider/StatsCards";
import TabsNavigation from "@/components/provider/TabsNavigation";
import ActivitiesTable from "@/components/provider/ActivitiesTable";
import ReviewsSection from "@/components/provider/ReviewsSection";
import BookingsTable from "@/components/provider/BookingsTable";
import AddActivityModal from "@/components/provider/AddActivityModal";
import EditActivityModal from "@/components/provider/EditActivityModal";
import ChangePasswordModal from "@/components/provider/ChangePasswordModal";
import ChatList from "@/components/provider/ChatList";
import Header from "@/components/provider/Header";
import { MessageSquare, Activity, Calendar, TrendingUp, Compass, Star } from "lucide-react";

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
  const [activeTab, setActiveTab] = useState('overview');
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
      const response = await fetch('http://localhost:5224/api/categories', {
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
   
      const activitiesResponse = await fetch(`http://localhost:5224/api/activities/provider/${userData.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (activitiesResponse.ok) {
        const activitiesData = await activitiesResponse.json();
        
        const now = new Date();
        const processedActivities = activitiesData.map((activity: any) => {
          const startDate = new Date(activity.startDate || activity.createdAt);
          const endDate = new Date(activity.endDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000));
          
          const isExpired = endDate < now;
          const isUpcoming = startDate > now;
          const isActive = !isExpired && !isUpcoming;
          
          return {
            ...activity,
            startDate: activity.startDate || activity.createdAt,
            endDate: activity.endDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
            status: activity.status || 'Pending',
            included: Array.isArray(activity.included) ? activity.included : [],
            requirements: Array.isArray(activity.requirements) ? activity.requirements : [],
            quickFacts: Array.isArray(activity.quickFacts) ? activity.quickFacts : [],
            isExpired,
            isUpcoming,
            isActive
          };
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

        setStats(prev => ({ 
          ...prev, 
          totalActivities: processedActivities.length,
          popularLocation,
          activeActivities,
          upcomingActivities,
          expiredActivities
        }));
        await fetchReviewsForActivities(processedActivities, token);
      }

      const bookingsResponse = await fetch(`http://localhost:5224/api/bookings/provider/${userData.id}`, {
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
          const response = await fetch(`http://localhost:5224/api/reviews/activity/${activity.id}`, {
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
      const response = await fetch('http://localhost:5224/api/chats/unread-count', {
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

  const handleUpdateStatus = async (activityId: string, status: string) => {
    try {
      const token = getToken();
      
      const statusMap: Record<string, number> = {
        'Pending': 0,
        'Active': 1, 
        'Inactive': 2,
        'Completed': 4,
        'Cancelled': 6
      };
      
      const statusValue = statusMap[status];
      
      if (statusValue === undefined) {
        alert(`Invalid status: ${status}`);
        return;
      }
      
      const payload = {
        Status: statusValue
      };
      
      const response = await fetch(`http://localhost:5224/api/activities/${activityId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      
      if (response.ok) {
        setActivities(prevActivities => 
          prevActivities.map(activity => {
            if (activity.id === activityId) {
              const now = new Date();
              const startDate = new Date(activity.startDate);
              const endDate = new Date(activity.endDate);
              
              const isExpired = endDate < now;
              const isUpcoming = startDate > now;
              const isActive = !isExpired && !isUpcoming && status === 'Active';
              
              return { 
                ...activity, 
                status: status,
                isActive,
                isExpired,
                isUpcoming 
              };
            }
            return activity;
          })
        );
        
        const updatedActivities = activities.map(activity => {
          if (activity.id === activityId) {
            const now = new Date();
            const startDate = new Date(activity.startDate);
            const endDate = new Date(activity.endDate);
            
            const isExpired = endDate < now;
            const isUpcoming = startDate > now;
            const isActive = !isExpired && !isUpcoming && status === 'Active';
            
            return { 
              ...activity, 
              status: status,
              isActive,
              isExpired,
              isUpcoming 
            };
          }
          return activity;
        });
        
        const activeActivities = updatedActivities.filter(a => a.isActive).length;
        const upcomingActivities = updatedActivities.filter(a => a.isUpcoming).length;
        const expiredActivities = updatedActivities.filter(a => a.isExpired).length;
        
        setStats(prev => ({
          ...prev,
          activeActivities,
          upcomingActivities,
          expiredActivities
        }));
        
        alert('Status updated successfully!');
      } else {
        const errorText = await response.text();
        alert(`Failed: ${errorText}`);
      }
      
    } catch (error) {
      console.error('Error:', error);
      alert('Error updating status');
    }
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

    const activityResponse = await fetch('http://localhost:5224/api/activities', {
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
    
    const response = await fetch(`http://localhost:5224/api/activities/${editingActivity.id}`, {
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

        await fetch(`http://localhost:5224/api/activityimages/upload/${editingActivity.id}`, {
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
    const response = await fetch(`http://localhost:5224/api/activities/${activityId}`, {
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

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <Header 
        onAddActivity={() => setShowAddActivity(true)} 
        onChangePassword={() => setShowChangePassword(true)}
        userName={user.fullName || user.name}
        userLocation={stats.popularLocation}
        showAddButton={true}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
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
                    onClick={() => setActiveTab('chats')}
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

        {/* Stats Cards */}
        <StatsCards stats={stats} />

        {/* Tabs Navigation */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700 mb-6 mt-8">
          <div className="px-6 pt-4">
            <TabsNavigation activeTab={activeTab} setActiveTab={setActiveTab} />
          </div>

          <div className="p-6">
            {activeTab === 'overview' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
                <div className="lg:col-span-2">
                  <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700 mb-6">
                    <h2 className="text-xl font-bold text-white mb-4 flex items-center">
                      <Compass className="w-5 h-5 mr-2 text-amber-400" />
                      Quick Overview
                    </h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-700">
                        <div className="text-2xl font-bold text-amber-400 mb-1">{stats.totalActivities}</div>
                        <div className="text-sm text-gray-400">Total Activities</div>
                      </div>
                      <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-700">
                        <div className="text-2xl font-bold text-emerald-400 mb-1">{stats.totalBookings}</div>
                        <div className="text-sm text-gray-400">Total Bookings</div>
                      </div>
                      <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-700">
                        <div className="text-2xl font-bold text-blue-400 mb-1">${stats.totalRevenue}</div>
                        <div className="text-sm text-gray-400">Total Revenue</div>
                      </div>
                      <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-700">
                        <div className="text-2xl font-bold text-red-400 mb-1">{stats.unreadMessages}</div>
                        <div className="text-sm text-gray-400">Unread Messages</div>
                      </div>
                    </div>
                  </div>

                  {/* Recent Activities */}
                  <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
                    <div className="flex justify-between items-center mb-4">
                      <h2 className="text-xl font-bold text-white flex items-center">
                        <Activity className="w-5 h-5 mr-2 text-emerald-400" />
                        Recent Activities
                      </h2>
                      <button
                        onClick={() => setActiveTab('activities')}
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
                          }
                          
                          return (
                            <div key={activity.id} className="flex items-center justify-between p-4 bg-gray-900/50 rounded-lg border border-gray-700 hover:border-amber-500/30 transition-colors">
                              <div>
                                <h3 className="font-semibold text-white">{activity.name}</h3>
                                <p className="text-sm text-gray-400">{activity.location}</p>
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
                </div>

                {/* Right Column - Chats */}
                <div className="lg:col-span-1">
                  <div className="bg-gray-800/50 rounded-xl border border-gray-700 overflow-hidden">
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
                        onClick={() => setActiveTab('chats')}
                        className="w-full py-3 bg-gradient-to-r from-amber-600 to-orange-700 text-white rounded-xl hover:from-amber-700 hover:to-orange-800 transition-all duration-300 font-semibold"
                      >
                        View All Chats
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'activities' && (
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
                    activities={activities.map(activity => ({
                      id: activity.id,
                      name: activity.name,
                      description: activity.description,
                      price: activity.price,
                      availableSlots: activity.availableSlots,
                      location: activity.location,
                      category: activity.category,
                      categoryId: activity.categoryId,
                      duration: activity.duration,
                      included: activity.included,
                      requirements: activity.requirements,
                      quickFacts: activity.quickFacts,
                      status: activity.status,
                      createdAt: activity.createdAt,
                      images: activity.images,
                      startDate: activity.startDate,
                      endDate: activity.endDate,
                      isActive: activity.isActive,
                      isExpired: activity.isExpired,
                      isUpcoming: activity.isUpcoming
                    }))} 
                    onDeleteActivity={handleDeleteActivity}
                    onEditActivity={handleEditActivity}
                    onStatusChange={handleUpdateStatus} 
                  />
                )}
              </div>
            )}

            {activeTab === 'bookings' && (
              <div>
                {bookings.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-400">No bookings yet</p>
                  </div>
                ) : (
                  <BookingsTable bookings={bookings} />
                )}
              </div>
            )}

            {activeTab === 'performance' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-white">Performance Analytics</h2>
                  <div className="text-gray-400">
                    Showing data for {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                  </div>
                </div>
                
                {/* Stats Overview */}
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
                        <p className="text-sm text-gray-400">Avg. Rating</p>
                        <h3 className="text-2xl font-bold text-white mt-1">{stats.averageRating || 0}</h3>
                      </div>
                      <div className="p-3 bg-purple-500/20 rounded-lg">
                        <Star className="w-6 h-6 text-purple-400" />
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Activity Status Distribution */}
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
                  </div>
                </div>
                
                {/* Booking Stats */}
                <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700">
                  <h3 className="text-lg font-semibold text-white mb-4">Booking Statistics</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">Total Bookings</span>
                      <span className="font-semibold text-white">{stats.totalBookings}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">Avg. Booking Value</span>
                      <span className="font-semibold text-white">
                        ${stats.totalBookings > 0 ? (stats.totalRevenue / stats.totalBookings).toFixed(2) : '0.00'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">Conversion Rate</span>
                      <span className="font-semibold text-white">
                        {stats.totalActivities > 0 
                          ? `${((stats.totalBookings / stats.totalActivities) * 100).toFixed(1)}%` 
                          : '0%'
                        }
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'chats' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-white">Chats</h2>
                  <div className="text-gray-400">
                    {unreadCount} unread message{unreadCount !== 1 ? 's' : ''}
                  </div>
                </div>
                <ChatList providerId={user.id} compact={false} />
              </div>
            )}

            {activeTab === 'reviews' && (
              <ReviewsSection 
                reviews={reviews}
                reviewStats={reviewStats}
                onRespond={handleRespond}
              />
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
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