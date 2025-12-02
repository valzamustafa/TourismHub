// components/TouristDashboard.tsx
import React, { useState, useEffect } from 'react';

interface Activity {
  id: string;
  name: string;
  description: string;
  price: number;
  availableSlots: number;
  location: string;
  category: string;
  providerName: string;
}

interface Booking {
  id: string;
  activityName: string;
  bookingDate: string;
  numberOfPeople: number;
  totalAmount: number;
  status: string;
}

const TouristDashboard = () => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [user, setUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('activities');

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      fetchTouristData(parsedUser.id);
    }
  }, []);

const fetchTouristData = async (userId: string) => {
  try {
    const token = localStorage.getItem('token');
    
    if (!token) {
      console.error('No token found');
      return;
    }

    const activitiesResponse = await fetch('http://localhost:5224/api/activities', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (activitiesResponse.ok) {
      const activitiesData = await activitiesResponse.json();
      setActivities(activitiesData);
    } else {
      console.error('Failed to fetch activities:', await activitiesResponse.text());
    }

  const bookingsResponse = await fetch('http://localhost:5224/api/bookings/my-bookings', {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});

    console.log('Bookings response status:', bookingsResponse.status);
    
    if (bookingsResponse.ok) {
      const bookingsData = await bookingsResponse.json();
      console.log('Bookings data received:', bookingsData);
      
      const transformedBookings = bookingsData.map((b: any) => ({
        id: b.id,
        activityName: b.activityName,
        bookingDate: b.bookingDate,
        numberOfPeople: b.numberOfPeople,
        totalAmount: b.totalAmount,
        status: b.status,
        paymentStatus: b.paymentStatus
      }));
      
      setBookings(transformedBookings);
    } else {
      const errorText = await bookingsResponse.text();
      console.error('Failed to fetch bookings:', errorText);
    
      console.log('Trying alternative endpoint...');
      await fetchAlternativeBookings(token, userId);
    }
  } catch (error) {
    console.error('Error fetching tourist data:', error);
  }
};

const fetchAlternativeBookings = async (token: string, userId: string) => {
  try {
 
    const response = await fetch(`http://localhost:5224/api/bookings`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (response.ok) {
      const allBookings = await response.json();
      console.log('All bookings:', allBookings);
    
      const userBookings = allBookings.filter((b: any) => b.userId === userId);
      console.log('Filtered user bookings:', userBookings);
      
      const transformedBookings = userBookings.map((b: any) => ({
        id: b.id,
        activityName: b.activityName || b.activity?.name || 'Unknown',
        bookingDate: b.bookingDate,
        numberOfPeople: b.numberOfPeople,
        totalAmount: b.totalAmount || b.totalPrice,
        status: b.status
      }));
      
      setBookings(transformedBookings);
    }
  } catch (error) {
    console.error('Error fetching alternative bookings:', error);
  }
};

  const handleBookActivity = async (activityId: string) => {
    if (!user) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5224/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          activityId: activityId,
          userId: user.id,
          numberOfPeople: 1, 
          bookingDate: new Date().toISOString()
        })
      });

      if (response.ok) {
        alert('Activity booked successfully!');
        fetchTouristData(user.id);
      } else {
        const errorData = await response.json();
        alert(`Failed to book activity: ${errorData.message}`);
      }
    } catch (error) {
      console.error('Error booking activity:', error);
      alert('Error booking activity. Please try again.');
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Tourist Dashboard</h1>
              <p className="text-gray-600">Welcome, {user.name}!</p>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">{user.email}</span>
              <button
                onClick={() => {
                  localStorage.removeItem('token');
                  localStorage.removeItem('user');
                  window.location.href = '/';
                }}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-lg shadow-sm border mb-6">
          <div className="border-b">
            <nav className="flex -mb-px">
              <button
                onClick={() => setActiveTab('activities')}
                className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                  activeTab === 'activities'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Available Activities
              </button>
              <button
                onClick={() => setActiveTab('bookings')}
                className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                  activeTab === 'bookings'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                My Bookings
              </button>
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'activities' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {activities.map((activity) => (
                  <div key={activity.id} className="bg-white border rounded-lg shadow-sm hover:shadow-md transition-shadow">
                    <div className="p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">{activity.name}</h3>
                      <p className="text-gray-600 text-sm mb-4">{activity.description}</p>
                      
                      <div className="space-y-2 mb-4">
                        <div className="flex justify-between">
                          <span className="text-gray-500">Location:</span>
                          <span className="text-gray-900">{activity.location}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Category:</span>
                          <span className="text-gray-900">{activity.category}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Slots Available:</span>
                          <span className="text-gray-900">{activity.availableSlots}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Provider:</span>
                          <span className="text-gray-900">{activity.providerName}</span>
                        </div>
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="text-2xl font-bold text-green-600">${activity.price}</span>
                        <button
                          onClick={() => handleBookActivity(activity.id)}
                          disabled={activity.availableSlots === 0}
                          className={`px-4 py-2 rounded-lg font-semibold ${
                            activity.availableSlots === 0
                              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                              : 'bg-blue-500 text-white hover:bg-blue-600'
                          }`}
                        >
                          {activity.availableSlots === 0 ? 'Sold Out' : 'Book Now'}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'bookings' && (
              <div className="bg-white rounded-lg border">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Activity
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        People
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {bookings.map((booking) => (
                      <tr key={booking.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {booking.activityName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {new Date(booking.bookingDate).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {booking.numberOfPeople}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          ${booking.totalAmount}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                            booking.status === 'Confirmed' 
                              ? 'bg-green-100 text-green-800'
                              : booking.status === 'Pending'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {booking.status}
                          </span>
                        </td>
                      </tr>
                    ))}
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

export default TouristDashboard;