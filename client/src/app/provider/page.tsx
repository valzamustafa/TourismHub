// app/provider/dashboard/page.tsx
'use client';

import { useState, useEffect } from "react";
import { useRouter } from 'next/navigation';
import StatsCards from "@/components/provider/StatsCards";
import TabsNavigation from "@/components/provider/TabsNavigation";
import ActivitiesTable from "@/components/provider/ActivitiesTable";
import BookingsTable from "@/components/provider/BookingsTable";
import AddActivityModal from "@/components/provider/AddActivityModal";
import Header from "@/components/provider/Header";

interface Activity {
  id: string;
  name: string;
  description: string;
  price: number;
  availableSlots: number;
  location: string;
  category: string;
  status: string;
  createdAt: string;
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
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [showAddActivity, setShowAddActivity] = useState(false);
  const [user, setUser] = useState<any>(null);
  const router = useRouter();
  
  const [stats, setStats] = useState({
    totalActivities: 0,
    totalBookings: 0,
    totalRevenue: 0,
    pendingBookings: 0
  });

  const [newActivity, setNewActivity] = useState({
    name: '',
    description: '',
    price: 0,
    availableSlots: 0,
    location: '',
    category: ''
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
  }, [router]);

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
        setStats(prev => ({ ...prev, totalActivities: activitiesData.length }));
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
        
        setStats(prev => ({
          ...prev,
          totalBookings,
          totalRevenue,
          pendingBookings
        }));
      }
    } catch (error) {
      console.error('Error fetching provider data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddActivity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch('http://localhost:5224/api/activities', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: newActivity.name,
          description: newActivity.description,
          price: Number(newActivity.price),
          availableSlots: Number(newActivity.availableSlots),
          location: newActivity.location,
          category: newActivity.category,
          providerId: user.id
        })
      });

      if (response.ok) {
        setShowAddActivity(false);
        setNewActivity({
          name: '',
          description: '',
          price: 0,
          availableSlots: 0,
          location: '',
          category: ''
        });
        fetchProviderData(user);
      } else {
        const errorData = await response.json();
        console.error('Failed to create activity:', errorData);
      }
    } catch (error) {
      console.error('Error adding activity:', error);
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
      }
    } catch (error) {
      console.error('Error deleting activity:', error);
    }
  };

  const handleDataChange = (field: string, value: string | number) => {
    setNewActivity(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header 
        onAddActivity={() => setShowAddActivity(true)} 
        userName={user.name}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome back, {user.name}!
          </h1>
          <p className="text-gray-600">Manage your activities and bookings</p>
        </div>

        <StatsCards stats={stats} />

        <div className="bg-white rounded-lg shadow-sm border mb-6">
          <TabsNavigation activeTab={activeTab} setActiveTab={setActiveTab} />

          <div className="p-6">
            {activeTab === 'overview' && (
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-6">Your Activities</h2>
                {activities.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No activities found. Create your first activity!</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {activities.slice(0, 6).map((activity) => (
                      <div key={activity.id} className="bg-gray-50 rounded-lg p-4 border">
                        <h3 className="font-semibold text-gray-900 mb-2">{activity.name}</h3>
                        <p className="text-sm text-gray-600 mb-2">{activity.location}</p>
                        <p className="text-lg font-bold text-green-600">${activity.price}</p>
                        <div className="flex justify-between items-center mt-3">
                          <span className="text-sm text-gray-500">{activity.availableSlots} slots</span>
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            activity.status === 'Active' 
                              ? 'bg-green-100 text-green-800'
                              : 'bg-yellow-100 text-yellow-800'
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
                    <p className="text-gray-500">No activities found. Create your first activity!</p>
                  </div>
                ) : (
                  <ActivitiesTable 
                    activities={activities} 
                    onDeleteActivity={handleDeleteActivity} 
                  />
                )}
              </div>
            )}

            {activeTab === 'bookings' && (
              <div>
                {bookings.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No bookings yet</p>
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
      />
    </div>
  );
};

export default ProviderDashboard;