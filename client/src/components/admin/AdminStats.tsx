// components/admin/AdminStats.tsx
'use client';

import React, { useState, useEffect } from 'react';
import StatCard from './common/StatCard';

interface StatsData {
  totalUsers: number;
  totalActivities: number;
  totalBookings: number;
  totalRevenue: number;
  pendingApprovals: number;
}

const AdminStats: React.FC = () => {
  const [stats, setStats] = useState<StatsData>({
    totalUsers: 0,
    totalActivities: 0,
    totalBookings: 0,
    totalRevenue: 0,
    pendingApprovals: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      
      const [usersRes, activitiesRes, bookingsRes] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/users`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/activities`),
        fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/bookings`)
      ]);

      const users = usersRes.ok ? await usersRes.json() : [];
      const activities = activitiesRes.ok ? await activitiesRes.json() : [];
      const bookings = bookingsRes.ok ? await bookingsRes.json() : [];

      const totalUsers = users.length;
      const totalActivities = activities.length;
      const totalBookings = bookings.length;
      const totalRevenue = bookings.reduce((sum: number, booking: any) => 
        sum + (booking.totalAmount || 0), 0);
      const pendingApprovals = activities.filter((activity: any) => 
        activity.status === 'Pending').length;

      setStats({
        totalUsers,
        totalActivities,
        totalBookings,
        totalRevenue,
        pendingApprovals
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-gray-800 rounded-lg p-4 animate-pulse">
            <div className="h-8 bg-gray-700 rounded w-3/4 mb-2"></div>
            <div className="h-6 bg-gray-700 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        title="Total Users"
        value={stats.totalUsers}
        subtitle="Registered users"
        icon={<span>👥</span>}
        color="#2196F3"
        progress={75}
      />
      <StatCard
        title="Activities"
        value={stats.totalActivities}
        subtitle="Available activities"
        icon={<span>🏔️</span>}
        color="#4CAF50"
        progress={60}
      />
      <StatCard
        title="Bookings"
        value={stats.totalBookings}
        subtitle="Total bookings"
        icon={<span>📅</span>}
        color="#FF9800"
        progress={85}
      />
      <StatCard
        title="Revenue"
        value={`$${stats.totalRevenue}`}
        subtitle="Total revenue"
        icon={<span>💰</span>}
        color="#9C27B0"
        progress={90}
      />
    </div>
  );
};

export default AdminStats;