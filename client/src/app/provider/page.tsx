// app/provider/dashboard/page.tsx
'use client';

import { useState, useEffect } from "react";
import { useRouter } from 'next/navigation';
import StatsCards from "@/components/provider/StatsCards";
import TabsNavigation from "@/components/provider/TabsNavigation";
import ActivitiesTable from "@/components/provider/ActivitiesTable";
import BookingsTable from "@/components/provider/BookingsTable";
import AddActivityModal from "@/components/provider/AddActivityModal";
import EditActivityModal from "@/components/provider/EditActivityModal";
import Header from "@/components/provider/Header";

interface Category {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  featured: boolean;
  activityCount: number;
}

interface Activity {
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

const ProviderDashboard = () => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [showAddActivity, setShowAddActivity] = useState(false);
  const [showEditActivity, setShowEditActivity] = useState(false);
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);
  const [user, setUser] = useState<any>(null);
  const router = useRouter();
  
  const [stats, setStats] = useState({
    totalActivities: 0,
    totalBookings: 0,
    totalRevenue: 0,
    pendingBookings: 0,
    activeAdventurers: 0,
    popularLocation: ""
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
    quickFacts: ''
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
    quickFacts: ''
  });

  useEffect(() => {
    const userData = localStorage.getItem('user');
    const token = localStorage.getItem('token');

    if (!userData || !token) {
      router.push('/');
      return;
    }

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
    fetchProviderData(parsedUser);
    fetchCategories();
  }, [router]);

  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5224/api/categories', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const categoriesData = await response.json();
        setCategories(categoriesData);
      } else {
        console.error('Failed to fetch categories');
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchProviderData = async (userData: any) => {
    try {
      const token = localStorage.getItem('token');
      
      const activitiesResponse = await fetch(`http://localhost:5224/api/activities/provider/${userData.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (activitiesResponse.ok) {
        const activitiesData = await activitiesResponse.json();
        setActivities(activitiesData);
        
    
        const locationCounts: { [key: string]: number } = {};
        activitiesData.forEach((activity: Activity) => {
          locationCounts[activity.location] = (locationCounts[activity.location] || 0) + 1;
        });
        
        const popularLocation = Object.keys(locationCounts).reduce((a, b) => 
          locationCounts[a] > locationCounts[b] ? a : b, "No locations"
        );

        setStats(prev => ({ 
          ...prev, 
          totalActivities: activitiesData.length,
          popularLocation 
        }));
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

  const handleAddActivity = async (e: React.FormEvent, images: File[]) => {
    e.preventDefault();
    if (!user) return;

    try {
      const token = localStorage.getItem('token');
      
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
          quickFacts: ''
        });
        fetchProviderData(user);
      } else {
        const errorData = await activityResponse.json();
        console.error('Failed to create activity:', errorData);
        alert('Failed to create activity: ' + (errorData.message || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error adding activity:', error);
      alert('Error creating activity. Please try again.');
    }
  };

  const handleEditActivity = (activity: Activity) => {
    setEditingActivity(activity);
    setEditActivityData({
      name: activity.name,
      description: activity.description,
      price: activity.price,
      availableSlots: activity.availableSlots,
      location: activity.location,
      categoryId: activity.categoryId,
      duration: activity.duration || '',
      included: Array.isArray(activity.included) ? activity.included.join(', ') : activity.included,
      requirements: Array.isArray(activity.requirements) ? activity.requirements.join(', ') : activity.requirements,
      quickFacts: Array.isArray(activity.quickFacts) ? activity.quickFacts.join(', ') : activity.quickFacts
    });
    setShowEditActivity(true);
  };

  const handleUpdateActivity = async (e: React.FormEvent, images: File[] = []) => {
    e.preventDefault();
    if (!editingActivity || !user) return;

    try {
      const token = localStorage.getItem('token');
      
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
          quickFacts: editActivityData.quickFacts
        })
      });

      if (response.ok) {
        if (images.length > 0) {
          const formData = new FormData();
          images.forEach(image => {
            formData.append('images', image);
          });

          await fetch(`http://localhost:5224/api/activityimages/upload-multiple/${editingActivity.id}`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`
            },
            body: formData
          });
        }

        setShowEditActivity(false);
        setEditingActivity(null);
        fetchProviderData(user);
      } else {
        const errorData = await response.json();
        console.error('Failed to update activity:', errorData);
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
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5224/api/activities/${activityId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        fetchProviderData(user);
      } else {
        console.error('Failed to delete activity');
        alert('Failed to delete activity');
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

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <Header 
        onAddActivity={() => setShowAddActivity(true)} 
        userName={user.name}
        userLocation={stats.popularLocation}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white">
            Welcome back, {user.name}!
          </h1>
          <p className="text-gray-400">Manage your activities and bookings</p>
        </div>

        <StatsCards stats={stats} />

        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700 mb-6">
          <TabsNavigation activeTab={activeTab} setActiveTab={setActiveTab} />

          <div className="p-6">
            {activeTab === 'overview' && (
              <div>
                <h2 className="text-lg font-semibold text-white mb-6">Your Activities</h2>
                {activities.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-400">No activities found. Create your first activity!</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {activities.slice(0, 6).map((activity) => (
                      <div key={activity.id} className="bg-gray-700/50 rounded-xl p-4 border border-gray-600 hover:border-amber-500/30 transition-all duration-300">
                        <h3 className="font-semibold text-white mb-2">{activity.name}</h3>
                        <p className="text-sm text-gray-400 mb-2">{activity.location}</p>
                        <p className="text-lg font-bold text-amber-400">${activity.price}</p>
                        <div className="flex justify-between items-center mt-3">
                          <span className="text-sm text-gray-500">{activity.availableSlots} slots</span>
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            activity.status === 'Active' 
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                              : activity.status === 'Pending'
                              ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                              : 'bg-red-500/20 text-red-400 border border-red-500/30'
                          }`}>
                            {activity.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'activities' && (
              <div>
                {activities.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-400">No activities found. Create your first activity!</p>
                  </div>
                ) : (
                  <ActivitiesTable 
                    activities={activities} 
                    onDeleteActivity={handleDeleteActivity}
                    onEditActivity={handleEditActivity}
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
          </div>
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
    </div>
  );
};

export default ProviderDashboard;