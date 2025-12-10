// src/components/provider/PerformanceAnalytics.tsx
import React from 'react';
import { TrendingUp, Users, DollarSign, Calendar, Activity } from 'lucide-react';

interface ActivityType {
  id: string;
  name: string;
  price: number;
  location: string;
  status: string;
  availableSlots: number;
  isActive?: boolean;
}

interface Booking {
  id: string;
  totalAmount: number;
  status: string;
  bookingDate: string;
}

interface Review {
  id: string;
  rating: number;
}

interface PerformanceAnalyticsProps {
  activities: ActivityType[];
  bookings: Booking[];
  reviews: Review[];
  user: any;
}

const PerformanceAnalytics: React.FC<PerformanceAnalyticsProps> = ({
  activities,
  bookings,
  reviews,
  user
}) => {
  const activeActivities = activities.filter(a => a.isActive).length;
  const totalRevenue = bookings.reduce((sum, booking) => sum + booking.totalAmount, 0);
  const completedBookings = bookings.filter(b => b.status === 'Completed').length;
  const averageRating = reviews.length > 0 
    ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length 
    : 0;
  const monthlyRevenue = bookings.reduce((sum, booking) => {
    const bookingDate = new Date(booking.bookingDate);
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    if (bookingDate.getMonth() === currentMonth && bookingDate.getFullYear() === currentYear) {
      return sum + booking.totalAmount;
    }
    return sum;
  }, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Performance Analytics</h2>
        <div className="flex items-center space-x-2">
          <TrendingUp className="w-5 h-5 text-emerald-400" />
          <span className="text-gray-400">Real-time insights</span>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Active Activities</p>
              <h3 className="text-2xl font-bold text-white mt-1">{activeActivities}</h3>
            </div>
            <div className="p-3 bg-emerald-500/20 rounded-lg">
              <Activity className="w-6 h-6 text-emerald-400" />
            </div>
          </div>
        </div>

        <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Total Revenue</p>
              <h3 className="text-2xl font-bold text-white mt-1">${totalRevenue.toFixed(2)}</h3>
            </div>
            <div className="p-3 bg-blue-500/20 rounded-lg">
              <DollarSign className="w-6 h-6 text-blue-400" />
            </div>
          </div>
        </div>

        <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Completed Bookings</p>
              <h3 className="text-2xl font-bold text-white mt-1">{completedBookings}</h3>
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
              <h3 className="text-2xl font-bold text-white mt-1">{averageRating.toFixed(1)}</h3>
            </div>
            <div className="p-3 bg-purple-500/20 rounded-lg">
              <Users className="w-6 h-6 text-purple-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Additional Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-4">Monthly Performance</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm text-gray-300">This Month's Revenue</span>
                <span className="text-sm font-semibold text-emerald-400">${monthlyRevenue.toFixed(2)}</span>
              </div>
              <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-emerald-500 to-green-500 rounded-full"
                  style={{ width: `${Math.min((monthlyRevenue / (totalRevenue || 1)) * 100, 100)}%` }}
                />
              </div>
            </div>
            
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm text-gray-300">Activity Occupancy</span>
                <span className="text-sm font-semibold text-blue-400">
                  {activities.length > 0 
                    ? `${Math.round((activeActivities / activities.length) * 100)}%` 
                    : '0%'
                  }
                </span>
              </div>
              <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full"
                  style={{ width: `${(activeActivities / (activities.length || 1)) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-4">Quick Stats</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-300">Total Activities</span>
              <span className="font-semibold text-white">{activities.length}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-300">Total Bookings</span>
              <span className="font-semibold text-white">{bookings.length}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-300">Avg. Booking Value</span>
              <span className="font-semibold text-white">
                ${bookings.length > 0 ? (totalRevenue / bookings.length).toFixed(2) : '0.00'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-300">Customer Satisfaction</span>
              <span className="font-semibold text-white">
                {reviews.length > 0 ? `${averageRating.toFixed(1)}/5` : 'No ratings'}
              </span>
            </div>
          </div>
        </div>
      </div>

   
    </div>
  );
};

export default PerformanceAnalytics;