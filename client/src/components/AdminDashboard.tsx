// components/AdminDashboard.tsx
import React, { useState, useEffect } from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle: string;
  icon: React.ReactElement;
  color: string;
  progress?: number;
}

interface QuickActionProps {
  title: string;
  description: string;
  icon: React.ReactElement;
  action: () => void;
  color: string;
  count?: number;
}

interface Activity {
  id: number;
  title: string;
  provider: string;
  location: string;
  category: string;
  price: number;
  submitted: string;
}

interface RecentActivity {
  id: number;
  user: string;
  action: string;
  target: string;
  time: string;
}

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  joinDate: string;
  status: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, subtitle, icon, color, progress }) => (
  <div style={{ 
    height: '100%', 
    background: `linear-gradient(135deg, ${color}20 0%, #1e1e1e 100%)`,
    border: `1px solid ${color}40`,
    transition: 'all 0.3s ease',
    borderRadius: '12px',
    padding: '16px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.2)'
  }}>
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <div>
        <div style={{ color: '#b0b0b0', fontSize: '12px', fontWeight: 'bold', marginBottom: '8px' }}>
          {title}
        </div>
        <div style={{ fontSize: '32px', fontWeight: 'bold', color: color }}>
          {value}
        </div>
        <div style={{ color: '#b0b0b0', fontSize: '14px' }}>
          {subtitle}
        </div>
      </div>
      <div
        style={{
          backgroundColor: color,
          borderRadius: '50%',
          padding: '12px',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        {icon}
      </div>
    </div>
    {progress !== undefined && (
      <div style={{ marginTop: '16px' }}>
        <div style={{ 
          borderRadius: '5px',
          height: '8px',
          backgroundColor: `${color}30`,
          overflow: 'hidden'
        }}>
          <div 
            style={{
              height: '100%',
              backgroundColor: color,
              width: `${progress}%`,
              transition: 'width 0.3s ease'
            }}
          />
        </div>
      </div>
    )}
  </div>
);

const QuickActionCard: React.FC<QuickActionProps> = ({ title, description, icon, action, color, count }) => (
  <div 
    style={{ 
      cursor: 'pointer', 
      transition: 'all 0.3s ease',
      background: `linear-gradient(135deg, ${color}20 0%, #1e1e1e 100%)`,
      border: `1px solid ${color}40`,
      borderRadius: '12px',
      padding: '24px',
      textAlign: 'center',
      boxShadow: '0 2px 10px rgba(0,0,0,0.2)'
    }}
    onClick={action}
  >
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <div
        style={{
          backgroundColor: color,
          borderRadius: '50%',
          padding: '16px',
          display: 'inline-flex',
          marginBottom: '16px',
          color: 'white'
        }}
      >
        {icon}
      </div>
      {count && (
        <div style={{
          position: 'absolute',
          top: '-8px',
          right: '-8px',
          backgroundColor: '#f44336',
          color: 'white',
          borderRadius: '50%',
          width: '20px',
          height: '20px',
          fontSize: '12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 'bold'
        }}>
          {count}
        </div>
      )}
    </div>
    <div style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '8px', color: '#ffffff' }}>
      {title}
    </div>
    <div style={{ color: '#b0b0b0', fontSize: '14px' }}>
      {description}
    </div>
  </div>
);

const ActivityApprovalItem: React.FC<{ activity: Activity }> = ({ activity }) => (
  <div
    style={{
      padding: '16px',
      marginBottom: '16px',
      border: '1px solid #333333',
      borderRadius: '8px',
      backgroundColor: '#1e1e1e',
      transition: 'all 0.3s ease'
    }}
  >
    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
      <div style={{
        width: '60px',
        height: '60px',
        backgroundColor: '#2196F3',
        borderRadius: '8px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        fontWeight: 'bold',
        fontSize: '1.5rem'
      }}>
        🏔️
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#ffffff' }}>
          {activity.title}
        </div>
        <div style={{ color: '#b0b0b0', fontSize: '14px' }}>
          by {activity.provider}
        </div>
        <div style={{ marginTop: '8px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            padding: '4px 8px',
            border: '1px solid #2196F3',
            borderRadius: '16px',
            fontSize: '12px',
            color: '#2196F3'
          }}>
            📍 {activity.location}
          </div>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            padding: '4px 8px',
            border: '1px solid #9C27B0',
            borderRadius: '16px',
            fontSize: '12px',
            color: '#9C27B0'
          }}>
            {activity.category}
          </div>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            padding: '4px 8px',
            border: '1px solid #b0b0b0',
            borderRadius: '16px',
            fontSize: '12px',
            color: '#b0b0b0'
          }}>
            ⏰ {activity.submitted}
          </div>
        </div>
      </div>
      <div>
        <div style={{ fontSize: '18px', color: '#2196F3', fontWeight: 'bold' }}>
          ${activity.price}
        </div>
      </div>
    </div>
    
    <div style={{ marginTop: '16px', display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
      <button
        style={{
          padding: '8px 16px',
          border: '1px solid #f44336',
          borderRadius: '4px',
          backgroundColor: 'transparent',
          color: '#f44336',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '4px'
        }}
      >
        ❌ Reject
      </button>
      <button
        style={{
          padding: '8px 16px',
          border: 'none',
          borderRadius: '4px',
          backgroundColor: '#4CAF50',
          color: 'white',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          marginLeft: '8px'
        }}
      >
        ✅ Approve
      </button>
    </div>
  </div>
);

const RecentUsersTable: React.FC = () => {
  const recentUsers: User[] = [
    { id: 1, name: 'John Doe', email: 'john@example.com', role: 'Tourist', joinDate: '2024-01-15', status: 'Active' },
    { id: 2, name: 'Sarah Wilson', email: 'sarah@example.com', role: 'Provider', joinDate: '2024-01-14', status: 'Active' },
    { id: 3, name: 'Mike Johnson', email: 'mike@example.com', role: 'Tourist', joinDate: '2024-01-13', status: 'Pending' },
    { id: 4, name: 'Emma Davis', email: 'emma@example.com', role: 'Provider', joinDate: '2024-01-12', status: 'Active' }
  ];

  return (
    <div style={{ borderRadius: '12px', overflow: 'hidden', boxShadow: '0 2px 10px rgba(0,0,0,0.2)', backgroundColor: '#1e1e1e' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead style={{ backgroundColor: '#333333' }}>
          <tr>
            <th style={{ color: 'white', fontWeight: 'bold', padding: '12px', textAlign: 'left' }}>User</th>
            <th style={{ color: 'white', fontWeight: 'bold', padding: '12px', textAlign: 'left' }}>Email</th>
            <th style={{ color: 'white', fontWeight: 'bold', padding: '12px', textAlign: 'left' }}>Role</th>
            <th style={{ color: 'white', fontWeight: 'bold', padding: '12px', textAlign: 'left' }}>Join Date</th>
            <th style={{ color: 'white', fontWeight: 'bold', padding: '12px', textAlign: 'left' }}>Status</th>
          </tr>
        </thead>
        <tbody>
          {recentUsers.map((user) => (
            <tr key={user.id} style={{ borderBottom: '1px solid #333333' }}>
              <td style={{ padding: '12px', color: '#ffffff' }}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <div style={{ 
                    width: '32px', 
                    height: '32px', 
                    backgroundColor: '#2196F3', 
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontWeight: 'bold',
                    marginRight: '8px'
                  }}>
                    {user.name.charAt(0)}
                  </div>
                  {user.name}
                </div>
              </td>
              <td style={{ padding: '12px', color: '#ffffff' }}>{user.email}</td>
              <td style={{ padding: '12px' }}>
                <div style={{
                  display: 'inline-flex',
                  padding: '4px 8px',
                  border: '1px solid #2196F3',
                  borderRadius: '16px',
                  fontSize: '12px',
                  color: user.role === 'Provider' ? '#2196F3' : '#b0b0b0',
                  borderColor: user.role === 'Provider' ? '#2196F3' : '#b0b0b0'
                }}>
                  {user.role}
                </div>
              </td>
              <td style={{ padding: '12px', color: '#ffffff' }}>{user.joinDate}</td>
              <td style={{ padding: '12px' }}>
                <div style={{
                  display: 'inline-flex',
                  padding: '4px 8px',
                  borderRadius: '16px',
                  fontSize: '12px',
                  backgroundColor: user.status === 'Active' ? '#4CAF5030' : '#FF980030',
                  color: user.status === 'Active' ? '#4CAF50' : '#FF9800',
                  fontWeight: 'bold'
                }}>
                  {user.status}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const AdminDashboard: React.FC = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalActivities: 0,
    totalBookings: 0,
    totalRevenue: 0,
    pendingApprovals: 0
  });

  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);
  const [pendingActivities, setPendingActivities] = useState<Activity[]>([]);

  const menuItems = [
    { text: 'Dashboard', icon: '📊', active: true },
    { text: 'Users', icon: '👥' },
    { text: 'Activities', icon: '🏔️' },
    { text: 'Bookings', icon: '📅' },
    { text: 'Payments', icon: '💰' },
    { text: 'Analytics', icon: '📈' },
    { text: 'Settings', icon: '⚙️' }
  ];

  const quickActions: QuickActionProps[] = [
    {
      title: 'Approve Activities',
      description: 'Review and approve pending activities',
      icon: <span>🏔️</span>,
      color: '#4CAF50',
      count: 5,
      action: () => console.log('Approve activities clicked')
    },
    {
      title: 'Manage Users',
      description: 'View and manage user accounts',
      icon: <span>👥</span>,
      color: '#2196F3',
      action: () => console.log('Manage users clicked')
    },
    {
      title: 'View Reports',
      description: 'Generate platform reports',
      icon: <span>📊</span>,
      color: '#FF9800',
      action: () => console.log('View reports clicked')
    },
    {
      title: 'Manage Payments',
      description: 'Oversee transactions and payouts',
      icon: <span>💰</span>,
      color: '#9C27B0',
      action: () => console.log('Manage payments clicked')
    }
  ];

  useEffect(() => {

    setStats({
      totalUsers: 1247,
      totalActivities: 89,
      totalBookings: 456,
      totalRevenue: 28450,
      pendingApprovals: 12
    });

    setPendingActivities([
      { id: 1, title: 'Mountain Hiking Adventure', provider: 'Adventure Co', location: 'Alps, Switzerland', category: 'Adventure', price: 150, submitted: '2 hours ago' },
      { id: 2, title: 'City Cultural Tour', provider: 'Urban Explorers', location: 'Paris, France', category: 'Cultural', price: 80, submitted: '1 day ago' },
      { id: 3, title: 'Beach Relaxation Package', provider: 'Tropical Getaways', location: 'Maldives', category: 'Relaxation', price: 200, submitted: '3 hours ago' }
    ]);

    setRecentActivities([
      { id: 1, user: 'John Doe', action: 'booked', target: 'Mountain Hiking', time: '30 min ago' },
      { id: 2, user: 'Sarah Wilson', action: 'created', target: 'New City Tour', time: '1 hour ago' },
      { id: 3, user: 'Mike Johnson', action: 'reviewed', target: 'Beach Package', time: '2 hours ago' },
      { id: 4, user: 'Emma Davis', action: 'canceled', target: 'Cultural Tour', time: '4 hours ago' }
    ]);
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

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#121212' }}>
      {/* Sidebar */}
      <div style={{ 
        position: 'fixed', 
        left: 0, 
        top: 0, 
        bottom: 0, 
        width: '250px', 
        backgroundColor: '#1e1e1e', 
        borderRight: '1px solid #333333', 
        padding: '24px' 
      }}>
        <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#ffffff', marginBottom: '32px' }}>
          Tour Trove Admin
        </div>
        {menuItems.map((item) => (
          <div 
            key={item.text} 
            style={{ 
              borderLeft: item.active ? '4px solid #4CAF50' : 'none',
              margin: '4px 8px',
              borderRadius: '8px',
              padding: '12px 16px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              color: '#ffffff'
            }}
          >
            <span>{item.icon}</span>
            <span style={{ fontWeight: item.active ? 'bold' : 'normal' }}>
              {item.text}
            </span>
          </div>
        ))}
      </div>

      {/* Header */}
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
        justifyContent: 'space-between' 
      }}>
        <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#ffffff' }}>
          Dashboard
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ position: 'relative' }}>
            <span style={{ cursor: 'pointer', fontSize: '24px' }}>🔔</span>
            <div style={{ 
              position: 'absolute', 
              top: '-4px', 
              right: '-4px', 
              backgroundColor: '#f44336', 
              color: 'white', 
              borderRadius: '50%', 
              width: '16px', 
              height: '16px', 
              fontSize: '10px', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center' 
            }}>
              3
            </div>
          </div>
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
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ flexGrow: 1, padding: '24px', marginTop: '64px', marginLeft: '250px' }}>
        <div style={{ marginBottom: '32px' }}>
          <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#ffffff', marginBottom: '8px' }}>
            Welcome back, Admin! 👋
          </div>
          <div style={{ color: '#b0b0b0', fontSize: '16px' }}>
            Here's what's happening with your platform today.
          </div>
        </div>

        {/* Statistics Grid */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '24px',
          marginBottom: '32px'
        }}>
          <StatCard
            title="Total Users"
            value={stats.totalUsers}
            subtitle="+12% this month"
            icon={<span>👥</span>}
            color="#2196F3"
            progress={65}
          />
          <StatCard
            title="Activities"
            value={stats.totalActivities}
            subtitle="+5 new today"
            icon={<span>🏔️</span>}
            color="#4CAF50"
            progress={45}
          />
          <StatCard
            title="Bookings"
            value={stats.totalBookings}
            subtitle="+23% growth"
            icon={<span>📅</span>}
            color="#FF9800"
            progress={78}
          />
          <StatCard
            title="Revenue"
            value={`$${stats.totalRevenue}`}
            subtitle="+18% from last month"
            icon={<span>📈</span>}
            color="#9C27B0"
            progress={82}
          />
          <StatCard
            title="Pending"
            value={stats.pendingApprovals}
            subtitle="Awaiting approval"
            icon={<span>🔔</span>}
            color="#f44336"
            progress={30}
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

        {/* Main Content Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
     
          <div>
            {/* Activity Approvals */}
            <div style={{ 
              padding: '24px', 
              borderRadius: '12px', 
              backgroundColor: '#1e1e1e',
              boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
              marginBottom: '24px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
                <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#ffffff' }}>
                  Pending Activity Approvals 🕐
                </div>
                <div style={{
                  display: 'inline-flex',
                  padding: '4px 12px',
                  borderRadius: '16px',
                  backgroundColor: '#FF980030',
                  color: '#FF9800',
                  fontSize: '14px',
                  fontWeight: 'bold'
                }}>
                  {pendingActivities.length} pending
                </div>
              </div>
              {pendingActivities.map((activity) => (
                <ActivityApprovalItem key={activity.id} activity={activity} />
              ))}
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
              <RecentUsersTable />
            </div>
          </div>

          <div>
            {/* Revenue Chart */}
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
                    +18%
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

            {/* Performance Metrics */}
            <div style={{ 
              padding: '24px', 
              borderRadius: '12px', 
              backgroundColor: '#1e1e1e',
              boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
              marginBottom: '24px'
            }}>
              <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#ffffff', marginBottom: '24px' }}>
                Platform Performance 📊
              </div>
              <div style={{ marginTop: '24px' }}>
                <div style={{ marginBottom: '24px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <div style={{ fontSize: '14px', color: '#ffffff' }}>User Satisfaction</div>
                    <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#4CAF50' }}>92%</div>
                  </div>
                  <div style={{ 
                    height: '8px', 
                    borderRadius: '4px',
                    backgroundColor: '#4CAF5030',
                    overflow: 'hidden'
                  }}>
                    <div style={{
                      height: '100%',
                      backgroundColor: '#4CAF50',
                      width: '92%'
                    }} />
                  </div>
                </div>
                <div style={{ marginBottom: '24px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <div style={{ fontSize: '14px', color: '#ffffff' }}>Booking Completion</div>
                    <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#2196F3' }}>87%</div>
                  </div>
                  <div style={{ 
                    height: '8px', 
                    borderRadius: '4px',
                    backgroundColor: '#2196F330',
                    overflow: 'hidden'
                  }}>
                    <div style={{
                      height: '100%',
                      backgroundColor: '#2196F3',
                      width: '87%'
                    }} />
                  </div>
                </div>
                <div style={{ marginBottom: '24px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <div style={{ fontSize: '14px', color: '#ffffff' }}>Payment Success</div>
                    <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#4CAF50' }}>95%</div>
                  </div>
                  <div style={{ 
                    height: '8px', 
                    borderRadius: '4px',
                    backgroundColor: '#4CAF5030',
                    overflow: 'hidden'
                  }}>
                    <div style={{
                      height: '100%',
                      backgroundColor: '#4CAF50',
                      width: '95%'
                    }} />
                  </div>
                </div>
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
                {recentActivities.map((activity) => (
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
                        activity.action === 'created' ? '#2196F330' :
                        activity.action === 'reviewed' ? '#FF980030' : '#f4433630',
                      color: 
                        activity.action === 'booked' ? '#4CAF50' :
                        activity.action === 'created' ? '#2196F3' :
                        activity.action === 'reviewed' ? '#FF9800' : '#f44336',
                      fontWeight: 'bold'
                    }}>
                      {activity.action}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;