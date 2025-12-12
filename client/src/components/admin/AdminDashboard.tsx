// src/components/admin/AdminDashboard.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { LogOut } from 'lucide-react';
import AdminStats from './AdminStats';
import QuickActions from './QuickActions';
import PendingActivities from './PendingActivities';
import RecentUsers from './RecentUsers';
import UsersManagement from './UsersManagement';
import CategoriesManagement from './CategoriesManagement';
import ActivitiesManagement from './ActivitiesManagement';
import BookingsManagement from './BookingsManagement';
import ReviewsManagement from './ReviewsManagement';
import AboutManagement from './AboutManagement';
import AnalyticsReports from './AnalyticsReports';
import StatCard from './common/StatCard';
import QuickActionCard from './common/QuickActionCard';
import RecentUsersTable from './common/RecentUsersTable';
import NotificationBell from '../NotificationBell';

import { 
  Booking, 
  Provider, 
  User, 
  Activity, 
  Category, 
  RecentActivity, 
  QuickActionProps,
  Review 
} from './utils/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5224/api';

const AdminDashboard: React.FC = () => {
  const router = useRouter();
  const [activeSection, setActiveSection] = useState('dashboard');
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([]);
  const [selectedProvider, setSelectedProvider] = useState<string>('all');
  const [providers, setProviders] = useState<Provider[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalActivities: 0,
    totalBookings: 0,
    totalRevenue: 0,
  });
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [notificationsCount, setNotificationsCount] = useState(0);
  
  const menuItems = [
    { text: 'Dashboard', icon: '📊', section: 'dashboard' },
    { text: 'Users', icon: '👥', section: 'users' },
    { text: 'Categories', icon: '📂', section: 'categories' },
    { text: 'Activities', icon: '🏔️', section: 'activities' },
    { text: 'Bookings', icon: '📅', section: 'bookings' },
    { text: 'Analytics', icon: '📈', section: 'analytics' },
    { text: 'Reviews', icon: '⭐', section: 'reviews' },
    { text: 'About', icon: '📝', section: 'about' },
  ];

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/');
  };
  
  const quickActions: QuickActionProps[] = [
    {
      title: 'Manage Users',
      description: 'View and manage user accounts',
      icon: <span>👥</span>,
      color: '#2196F3',
      action: () => setActiveSection('users')
    },
    {
      title: 'Manage Categories',
      description: 'Create and edit activity categories',
      icon: <span>📂</span>,
      color: '#4CAF50',
      action: () => setActiveSection('categories')
    },
    {
      title: 'Manage Activities',
      description: 'Create and manage activities',
      icon: <span>🏔️</span>,
      color: '#FF9800',
      action: () => setActiveSection('activities')
    },
    {
      title: 'View Bookings',
      description: 'Oversee all bookings',
      icon: <span>📅</span>,
      color: '#9C27B0',
      action: () => setActiveSection('bookings')
    }
  ];
  const formatTimeAgo = (date: Date): string => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) {
      return 'just now';
    } else if (diffMins < 60) {
      return `${diffMins} min ago`;
    } else if (diffHours < 24) {
      return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    } else {
      return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
    }
  };
  const generateRecentActivitiesFromData = (
    bookingsData: Booking[],
    usersData: User[],
    activitiesData: Activity[],
    reviewsData: Review[] = []
  ): RecentActivity[] => {
    const activitiesList: RecentActivity[] = [];
    let idCounter = 1;

    const recentBookings = bookingsData
      .sort((a, b) => new Date(b.bookingDate).getTime() - new Date(a.bookingDate).getTime())
      .slice(0, 5);
    
    recentBookings.forEach((booking) => {
      activitiesList.push({
        id: idCounter++,
        user: booking.userName,
        action: 'booked',
        target: booking.activityName,
        time: formatTimeAgo(new Date(booking.bookingDate))
      });
    });

    const recentUsers = usersData
      .sort((a, b) => new Date(b.joinDate).getTime() - new Date(a.joinDate).getTime())
      .slice(0, 3);
    
    recentUsers.forEach((user) => {
      activitiesList.push({
        id: idCounter++,
        user: user.name,
        action: 'registered',
        target: 'account',
        time: formatTimeAgo(new Date(user.joinDate))
      });
    });

    const recentActivitiesAdded = activitiesData
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 3);
    
    recentActivitiesAdded.forEach((activity) => {
      activitiesList.push({
        id: idCounter++,
        user: activity.providerName,
        action: 'created',
        target: activity.name,
        time: formatTimeAgo(new Date(activity.createdAt))
      });
    });

    if (reviewsData.length > 0) {
      const recentReviews = reviewsData
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 3);
      
      recentReviews.forEach((review) => {
        const activity = activitiesData.find(a => a.id === review.activityId);
        activitiesList.push({
          id: idCounter++,
          user: review.userName,
          action: 'reviewed',
          target: activity?.name || 'activity',
          time: formatTimeAgo(new Date(review.createdAt))
        });
      });
    }
    return activitiesList
      .sort((a, b) => {
        const getTimeValue = (timeStr: string): number => {
          const now = new Date().getTime();
          if (timeStr.includes('min')) {
            const mins = parseInt(timeStr) || 0;
            return now - mins * 60 * 1000;
          } else if (timeStr.includes('hour')) {
            const hours = parseInt(timeStr) || 0;
            return now - hours * 60 * 60 * 1000;
          } else if (timeStr.includes('day')) {
            const days = parseInt(timeStr) || 0;
            return now - days * 24 * 60 * 60 * 1000;
          }
          return now;
        };
        
        return getTimeValue(b.time) - getTimeValue(a.time);
      })
      .slice(0, 8); 
  };

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        setUser(JSON.parse(userData));
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }
    
    const savedCount = localStorage.getItem('notificationCount');
    if (savedCount) {
      setNotificationsCount(parseInt(savedCount));
    }
    
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const [usersResponse, activitiesResponse, categoriesResponse, bookingsResponse, providersResponse, reviewsResponse] = await Promise.all([
        fetch(`${API_BASE_URL}/users`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }),
        fetch(`${API_BASE_URL}/activities`),
        fetch(`${API_BASE_URL}/categories`),
        fetch(`${API_BASE_URL}/bookings`),
        fetch(`${API_BASE_URL}/users?role=Provider`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }),
        fetch(`${API_BASE_URL}/reviews`)
      ]);
      let usersData: User[] = [];
      let activitiesData: Activity[] = [];
      let categoriesData: Category[] = [];
      let bookingsData: Booking[] = [];
      let providersData: Provider[] = [];
      let reviewsData: Review[] = [];

      if (usersResponse.ok) {
        usersData = await usersResponse.json();
        setUsers(usersData);
      }

      if (activitiesResponse.ok) {
        activitiesData = await activitiesResponse.json();
        setActivities(activitiesData);
      }

      if (categoriesResponse.ok) {
        categoriesData = await categoriesResponse.json();
        setCategories(categoriesData);
      }

      if (bookingsResponse.ok) {
        bookingsData = await bookingsResponse.json();
        setBookings(bookingsData);
        setFilteredBookings(bookingsData);
      }

      if (providersResponse.ok) {
        providersData = await providersResponse.json();
        setProviders(providersData);
      }

      if (reviewsResponse.ok) {
        reviewsData = await reviewsResponse.json();
        setReviews(reviewsData);
      }
      const totalUsers = usersData.length;
      const totalActivities = activitiesData.length;
      const totalBookings = bookingsData.length;
      const totalRevenue = bookingsData.reduce((sum, booking) => sum + (booking.totalAmount || 0), 0);

      setStats({
        totalUsers,
        totalActivities,
        totalBookings,
        totalRevenue,
      });
      const generatedActivities = generateRecentActivitiesFromData(
        bookingsData,
        usersData,
        activitiesData,
        reviewsData
      );
      setRecentActivities(generatedActivities);

    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedProvider === 'all') {
      setFilteredBookings(bookings);
    } else {
      const filtered = bookings.filter(booking => {
        const activity = activities.find(a => a.id === booking.activityId);
        return activity?.providerId === selectedProvider;
      });
      setFilteredBookings(filtered);
    }
  }, [selectedProvider, bookings, activities]);

  useEffect(() => {
    const handleNotificationCountUpdated = (event: CustomEvent) => {
      setNotificationsCount(event.detail.count);
    };

    window.addEventListener('notification-count-updated', handleNotificationCountUpdated as EventListener);

    return () => {
      window.removeEventListener('notification-count-updated', handleNotificationCountUpdated as EventListener);
    };
  }, []);

  const revenueData = [
    { month: 'Jan', revenue: 4000 },
    { month: 'Feb', revenue: 3000 },
    { month: 'Mar', revenue: 5000 },
    { month: 'Apr', revenue: 4500 },
    { month: 'May', revenue: 6000 },
    { month: 'Jun', revenue: 7000 }
  ];

  const maxRevenue = Math.max(...revenueData.map((d) => d.revenue));

  const renderMainContent = () => {
    switch (activeSection) {
      case 'categories':
        return <CategoriesManagement />;
      case 'users':
        return <UsersManagement />;
      case 'activities':
        return <ActivitiesManagement />;
      case 'reviews':
        return <ReviewsManagement />;
      case 'about':
        return <AboutManagement darkMode={true} />;
      case 'bookings':
        return (
          <BookingsManagement
            bookings={bookings}
            filteredBookings={filteredBookings}
            providers={providers}
            selectedProvider={selectedProvider}
            onProviderChange={setSelectedProvider}
            activities={activities}
          />
        ); 
      case 'analytics':
        return <AnalyticsReports />;
      case 'dashboard':
      default:
        if (loading) {
          return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ 
                  animation: 'spin 1s linear infinite',
                  border: '4px solid #f3f3f3',
                  borderTop: '4px solid #3498db',
                  borderRadius: '50%',
                  width: '60px',
                  height: '60px',
                  margin: '0 auto 20px'
                }}></div>
                <div style={{ color: '#b0b0b0', fontSize: '18px' }}>
                  Loading dashboard data...
                </div>
              </div>
            </div>
          );
        }

        return (
          <>
            <div style={{ marginBottom: '32px' }}>
              <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#ffffff', marginBottom: '8px' }}>
                Welcome back, Admin! 👋
              </div>
              <div style={{ color: '#b0b0b0', fontSize: '16px' }}>
                Here's what's happening with your platform today.
              </div>
            </div>

            {/* Dashboard Statistics */}
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '24px',
              marginBottom: '32px'
            }}>
              <StatCard
                title="Total Users"
                value={stats.totalUsers}
                subtitle="Registered users"
                icon={<span>👥</span>}
                color="#2196F3"
                progress={Math.min(100, (stats.totalUsers / 1000) * 100)}
              />
              <StatCard
                title="Activities"
                value={stats.totalActivities}
                subtitle="Available activities"
                icon={<span>🏔️</span>}
                color="#4CAF50"
                progress={Math.min(100, (stats.totalActivities / 500) * 100)}
              />
              <StatCard
                title="Bookings"
                value={stats.totalBookings}
                subtitle="Total bookings"
                icon={<span>📅</span>}
                color="#FF9800"
                progress={Math.min(100, (stats.totalBookings / 1000) * 100)}
              />
              <StatCard
                title="Revenue"
                value={`$${stats.totalRevenue.toLocaleString()}`}
                subtitle="Total revenue"
                icon={<span>💰</span>}
                color="#9C27B0"
                progress={Math.min(100, (stats.totalRevenue / 50000) * 100)}
              />
            </div>

            {/* Quick Actions */}
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#ffffff', marginBottom: '16px' }}>
              Quick Actions ⚡
            </div>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '24px',
              marginBottom: '32px'
            }}>
              {quickActions.map((action, index) => (
                <QuickActionCard key={index} {...action} />
              ))}
            </div>

            {/* Dashboard Content Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
              <div>
                {/* Platform Overview */}
                <div style={{ 
                  padding: '24px', 
                  borderRadius: '12px', 
                  backgroundColor: '#1e1e1e',
                  boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
                  marginBottom: '24px'
                }}>
                  <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#ffffff', marginBottom: '24px' }}>
                    Platform Overview 📋
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div style={{ padding: '16px', backgroundColor: '#2a2a2a', borderRadius: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                        <span style={{ marginRight: '8px' }}>👥</span>
                        <div style={{ fontSize: '14px', color: '#b0b0b0' }}>Providers</div>
                      </div>
                      <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#ffffff' }}>
                        {providers.length}
                      </div>
                      <div style={{ fontSize: '12px', color: '#4CAF50', marginTop: '4px' }}>
                        Active providers
                      </div>
                    </div>
                    <div style={{ padding: '16px', backgroundColor: '#2a2a2a', borderRadius: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                        <span style={{ marginRight: '8px' }}>📂</span>
                        <div style={{ fontSize: '14px', color: '#b0b0b0' }}>Categories</div>
                      </div>
                      <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#ffffff' }}>
                        {categories.length}
                      </div>
                      <div style={{ fontSize: '12px', color: '#4CAF50', marginTop: '4px' }}>
                        Activity categories
                      </div>
                    </div>
                  </div>
                </div>

                {/* Recent Users */}
                <div style={{ 
                  padding: '24px', 
                  borderRadius: '12px', 
                  backgroundColor: '#1e1e1e',
                  boxShadow: '0 2px 10px rgba(0,0,0,0.2)'
                }}>
                  <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#ffffff', marginBottom: '24px' }}>
                    Recent Users 👥
                  </div>
                  <RecentUsersTable users={users.slice(0, 5)} />
                </div>
              </div>

              <div>
                {/* Revenue Overview */}
                <div style={{ 
                  padding: '24px', 
                  borderRadius: '12px', 
                  backgroundColor: '#1e1e1e',
                  boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
                  marginBottom: '24px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
                    <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#ffffff' }}>
                      Revenue Overview 💰
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', color: '#4CAF50' }}>
                      <span style={{ marginRight: '4px' }}>📈</span>
                      <div style={{ fontSize: '14px', fontWeight: 'bold' }}>
                        +{stats.totalBookings > 0 ? Math.floor((stats.totalBookings / 100) * 18) : 18}%
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'flex-end', height: '200px', gap: '8px' }}>
                    {revenueData.map((data, index) => (
                      <div key={data.month} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <div style={{ color: '#b0b0b0', fontSize: '14px', marginBottom: '8px' }}>
                          {data.month}
                        </div>
                        <div
                          style={{
                            width: '80%',
                            height: `${(data.revenue / maxRevenue) * 150}px`,
                            backgroundColor: index === revenueData.length - 1 ? '#4CAF50' : '#2196F3',
                            borderRadius: '4px',
                            transition: 'all 0.3s ease'
                          }}
                        />
                        <div style={{ marginTop: '8px', fontSize: '12px', fontWeight: 'bold', color: '#ffffff' }}>
                          ${(data.revenue / 1000).toFixed(0)}k
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recent Activity */}
                <div style={{ 
                  padding: '24px', 
                  borderRadius: '12px', 
                  backgroundColor: '#1e1e1e',
                  boxShadow: '0 2px 10px rgba(0,0,0,0.2)'
                }}>
                  <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#ffffff', marginBottom: '24px' }}>
                    Recent Activity 📝
                  </div>
                  <div>
                    {recentActivities.length === 0 ? (
                      <div style={{ textAlign: 'center', padding: '20px', color: '#b0b0b0' }}>
                        <div style={{ fontSize: '48px', marginBottom: '16px' }}>📋</div>
                        <p>No recent activity</p>
                      </div>
                    ) : (
                      recentActivities.map((activity) => (
                        <div key={activity.id} style={{ 
                          borderBottom: '1px solid #333333', 
                          padding: '16px 0',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center'
                        }}>
                          <div>
                            <div style={{ fontSize: '16px', color: '#ffffff' }}>
                              <strong>{activity.user}</strong> {activity.action} {activity.target}
                            </div>
                            <div style={{ color: '#b0b0b0', fontSize: '14px' }}>
                              {activity.time}
                            </div>
                          </div>
                          <div style={{
                            display: 'inline-flex',
                            padding: '4px 8px',
                            borderRadius: '16px',
                            fontSize: '12px',
                            backgroundColor: 
                              activity.action === 'booked' ? '#4CAF5030' :
                              activity.action === 'registered' ? '#2196F330' :
                              activity.action === 'created' ? '#FF980030' :
                              activity.action === 'reviewed' ? '#9C27B030' : '#f4433630',
                            color: 
                              activity.action === 'booked' ? '#4CAF50' :
                              activity.action === 'registered' ? '#2196F3' :
                              activity.action === 'created' ? '#FF9800' :
                              activity.action === 'reviewed' ? '#9C27B0' : '#f44336',
                            fontWeight: 'bold'
                          }}>
                            {activity.action}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          </>
        );
    }
  };

  return (
    <div style={{ 
      display: 'grid',
      gridTemplateColumns: '250px 1fr',
      gridTemplateRows: '64px 1fr',
      minHeight: '100vh',
      backgroundColor: '#121212'
    }}>
      {/* Sidebar  */}
      <div style={{ 
        gridColumn: '1 / 2',
        gridRow: '1 / 3',
        backgroundColor: '#1e1e1e', 
        borderRight: '1px solid #333333', 
        padding: '24px'
      }}>
        <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#ffffff', marginBottom: '32px' }}>
          TourismHub Admin
        </div>
        {menuItems.map((item) => (
          <div 
            key={item.text} 
            style={{ 
              borderLeft: activeSection === item.section ? '4px solid #4CAF50' : 'none',
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
            <span>{item.icon}</span>
            <span style={{ fontWeight: activeSection === item.section ? 'bold' : 'normal' }}>
              {item.text}
            </span>
          </div>
        ))}
      </div>

      {/* Header */}
      <div style={{ 
        gridColumn: '2 / 3',
        gridRow: '1 / 2',
        backgroundColor: '#1e1e1e', 
        borderBottom: '1px solid #333333', 
        padding: '0 24px', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between'
      }}>
        <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#ffffff' }}>
          {menuItems.find(item => item.section === activeSection)?.text || 'Dashboard'}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <NotificationBell />
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ 
              width: '32px', 
              height: '32px', 
              backgroundColor: '#4CAF50', 
              borderRadius: '50%', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              color: 'white' 
            }}>
              A
            </div>
            <span style={{ color: '#ffffff' }}>Admin</span>
            <button
              onClick={handleLogout}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 16px',
                backgroundColor: '#f44336',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
            >
              <LogOut style={{ width: '16px', height: '16px' }} />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ 
        gridColumn: '2 / 3',
        gridRow: '2 / 3',
        padding: '24px',
        overflowY: 'auto'
      }}>
        {renderMainContent()}
      </div>
    </div>
  );
};

export default AdminDashboard;