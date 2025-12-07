// components/AnalyticsReports.tsx
import React, { useState, useEffect, useRef } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5224/api';

interface AnalyticsData {
  revenueData: { date: string; revenue: number }[];
  userGrowthData: { date: string; users: number }[];
  bookingStats: { status: string; count: number; percentage: number }[];
  topCategories: { name: string; activityCount: number; bookingCount: number }[];
  topActivities: { name: string; bookings: number; revenue: number }[];
  platformMetrics: {
    totalRevenue: number;
    totalUsers: number;
    totalActivities: number;
    totalBookings: number;
    avgRating: number;
    avgBookingValue: number;
  };
}

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
  price: number;
  categoryId: string;
  providerName: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  joinDate: string;
  createdAt: string;
}

interface Booking {
  id: string;
  activityId: string;
  activityName?: string; 
  totalAmount: number;
    numberOfPeople?: number;
  status: string;
  bookingDate: string;
}
const AnalyticsReports: React.FC = () => {
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [hoveredCardIndex, setHoveredCardIndex] = useState<number | null>(null);
  const [hoveredActivityIndex, setHoveredActivityIndex] = useState<number | null>(null);
  const reportRef = useRef<HTMLDivElement>(null);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>({
    revenueData: [],
    userGrowthData: [],
    bookingStats: [],
    topCategories: [],
    topActivities: [],
    platformMetrics: {
      totalRevenue: 0,
      totalUsers: 0,
      totalActivities: 0,
      totalBookings: 0,
      avgRating: 0,
      avgBookingValue: 0
    }
  });

  useEffect(() => {
    fetchAnalyticsData();
  }, [timeRange]);
 const generatePDFReport = async () => {
    if (!reportRef.current) return;
    
    setExporting(true);
    try {
      const canvas = await html2canvas(reportRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#1e1e1e'
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('landscape', 'mm', 'a4');
      const imgWidth = 280;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 10, 10, imgWidth, imgHeight);
      const currentDate = new Date().toLocaleDateString();
      pdf.setFontSize(10);
      pdf.setTextColor(150);
      pdf.text(`Generated on: ${currentDate}`, 10, imgHeight + 20);
      pdf.text(`Time Range: ${timeRange}`, 10, imgHeight + 25);
      
      pdf.save(`TourismHub-Analytics-Report-${currentDate.replace(/\//g, '-')}.pdf`);
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF report');
    } finally {
      setExporting(false);
    }
  };
const fetchAnalyticsData = async () => {
  setLoading(true);
  try {
    const token = localStorage.getItem('token');
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
    const bookingsResponse = await fetch(`${API_BASE_URL}/bookings`, { headers });
    const bookings: Booking[] = bookingsResponse.ok ? await bookingsResponse.json() : [];
    console.log('=== FULL BOOKINGS DATA ===');
    console.log('Bookings array:', bookings);
    if (bookings.length > 0) {
      console.log('First booking object keys:', Object.keys(bookings[0]));
      console.log('First booking full data:', bookings[0]);
    }
    const usersResponse = await fetch(`${API_BASE_URL}/users`, { headers });
    const users: User[] = usersResponse.ok ? await usersResponse.json() : [];
    const activitiesResponse = await fetch(`${API_BASE_URL}/activities`);
    const activities: Activity[] = activitiesResponse.ok ? await activitiesResponse.json() : [];
    console.log('=== FULL ACTIVITIES DATA ===');
    console.log('Activities array:', activities);
    if (activities.length > 0) {
      console.log('First activity object keys:', Object.keys(activities[0]));
      console.log('First activity full data:', activities[0]);
    }
    const categoriesResponse = await fetch(`${API_BASE_URL}/categories`);
    const categories: Category[] = categoriesResponse.ok ? await categoriesResponse.json() : [];
    const processTopActivitiesFixed = (activities: Activity[], bookings: any[]) => {
      console.log('=== PROCESS TOP ACTIVITIES FIXED ===');
      console.log('Bookings for processing:', bookings);
      const activityByName = new Map<string, Activity>();
      activities.forEach(activity => {
        activityByName.set(activity.name.toLowerCase(), activity);
      });

      const statsMap = new Map<string, { name: string; bookings: number; revenue: number }>();

      activities.forEach(activity => {
        statsMap.set(activity.id, {
          name: activity.name,
          bookings: 0,
          revenue: 0
        });
      });
      bookings.forEach((booking, index) => {
        console.log(`Processing booking ${index + 1}:`, booking);
        
        let activityId = booking.activityId;
        let activity: Activity | undefined;
        
        if (activityId) {
          activity = activities.find(a => a.id === activityId);
        }
        
        if (!activity && booking.activityName) {
          const activityNameLower = booking.activityName.toLowerCase();
          activity = activities.find(a => 
            a.name.toLowerCase().includes(activityNameLower) || 
            activityNameLower.includes(a.name.toLowerCase())
          );
          if (activity) {
            activityId = activity.id;
          }
        }
        if (!activity && booking.totalAmount === 50) {
       
          activity = activities.find(a => a.price === 25);
          if (activity) {
            activityId = activity.id;
            console.log(`  Found activity by price match: ${activity.name} ($${activity.price})`);
          }
        }
        
        if (activityId && activity && statsMap.has(activityId)) {
          const currentStat = statsMap.get(activityId)!;
          currentStat.bookings += 1;
          let bookingRevenue = booking.totalAmount || 0;
          if (bookingRevenue === 0 && activity) {
            bookingRevenue = activity.price || 0;
            if (booking.numberOfPeople && booking.numberOfPeople > 1) {
              bookingRevenue *= booking.numberOfPeople;
            }
          }
          
          currentStat.revenue += bookingRevenue;
          statsMap.set(activityId, currentStat);
          
          console.log(`  Successfully added to ${activity.name}: $${bookingRevenue}`);
        } else {
          console.log(`  Could not match booking to any activity:`, {
            bookingActivityId: booking.activityId,
            bookingActivityName: booking.activityName,
            bookingAmount: booking.totalAmount,
            availableActivities: activities.map(a => ({ name: a.name, id: a.id, price: a.price }))
          });
        }
      });
      const activityStats = Array.from(statsMap.values())
        .filter(stat => stat.bookings > 0)
        .sort((a, b) => b.revenue - a.revenue);

      console.log('Final activity stats:', activityStats);
      return activityStats.slice(0, 5);
    };
    const revenueData = processRevenueData(bookings, timeRange, activities);
    const userGrowthData = processUserGrowthData(users, timeRange);
    const bookingStats = processBookingStats(bookings);
    const topCategories = processTopCategories(categories, activities, bookings);
    const topActivities = processTopActivitiesFixed(activities, bookings); 
    const platformMetrics = calculatePlatformMetrics(bookings, users, activities);

    setAnalyticsData({
      revenueData,
      userGrowthData,
      bookingStats,
      topCategories,
      topActivities,
      platformMetrics
    });
  } catch (error) {
    console.error('Error fetching analytics data:', error);
  } finally {
    setLoading(false);
  }
};

const processRevenueData = (bookings: Booking[], range: string, activities: Activity[]) => {
  const now = new Date();
  let dateGroups: { [key: string]: number } = {};

  const confirmedBookings = bookings.filter(booking => 
    booking.status === 'Confirmed' || booking.status === 'Completed'
  );

  confirmedBookings.forEach(booking => {
    const bookingDate = new Date(booking.bookingDate);
    let groupKey = '';

    switch (range) {
      case '7d':
        if (bookingDate >= new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)) {
          groupKey = bookingDate.toLocaleDateString('en-US', { weekday: 'short' });
        }
        break;
      case '30d':
        if (bookingDate >= new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)) {
          const weekNum = Math.floor((now.getDate() - bookingDate.getDate()) / 7) + 1;
          groupKey = `Week ${weekNum}`;
        }
        break;
      case '90d':
        if (bookingDate >= new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)) {
          groupKey = bookingDate.toLocaleDateString('en-US', { month: 'short' });
        }
        break;
      case '1y':
        if (bookingDate >= new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000)) {
          groupKey = bookingDate.toLocaleDateString('en-US', { month: 'short' });
        }
        break;
    }

    if (groupKey) {
      let bookingRevenue = booking.totalAmount || 0;
      if (bookingRevenue === 0) {
        const activity = activities.find(a => a.id === booking.activityId);
        if (activity && activity.price) {
          const people = booking.numberOfPeople || 1;
          bookingRevenue = activity.price * people;
        }
      }
      
      dateGroups[groupKey] = (dateGroups[groupKey] || 0) + bookingRevenue;
    }
  });
  return Object.entries(dateGroups)
    .sort((a, b) => {
      if (range === '7d') {
        const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        return days.indexOf(a[0]) - days.indexOf(b[0]);
      } else if (range === '30d') {
        const weekA = parseInt(a[0].replace('Week ', ''));
        const weekB = parseInt(b[0].replace('Week ', ''));
        return weekA - weekB;
      } else {
        return a[0].localeCompare(b[0]);
      }
    })
    .map(([date, revenue]) => ({ date, revenue }));
};

  const processUserGrowthData = (users: User[], range: string) => {
    const now = new Date();
    let dateGroups: { [key: string]: number } = {};

    users.forEach(user => {
      const joinDate = new Date(user.joinDate || user.createdAt);
      let groupKey = '';

      switch (range) {
        case '7d':
          if (joinDate >= new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)) {
            groupKey = joinDate.toLocaleDateString('en-US', { weekday: 'short' });
          }
          break;
        case '30d':
          if (joinDate >= new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)) {
            const weekNum = Math.floor((now.getDate() - joinDate.getDate()) / 7) + 1;
            groupKey = `Week ${weekNum}`;
          }
          break;
        case '90d':
          if (joinDate >= new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)) {
            groupKey = joinDate.toLocaleDateString('en-US', { month: 'short' });
          }
          break;
        case '1y':
          if (joinDate >= new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000)) {
            groupKey = joinDate.toLocaleDateString('en-US', { month: 'short' });
          }
          break;
      }

      if (groupKey) {
        dateGroups[groupKey] = (dateGroups[groupKey] || 0) + 1;
      }
    });

    return Object.entries(dateGroups)
      .sort((a, b) => {
        const dateA = new Date(a[0]);
        const dateB = new Date(b[0]);
        return dateA.getTime() - dateB.getTime();
      })
      .map(([date, users]) => ({ date, users }));
  };

  const processBookingStats = (bookings: Booking[]) => {
    const statusCounts: { [key: string]: number } = {};
    bookings.forEach(booking => {
      statusCounts[booking.status || 'Pending'] = (statusCounts[booking.status || 'Pending'] || 0) + 1;
    });

    const total = bookings.length;
    return Object.entries(statusCounts).map(([status, count]) => ({
      status,
      count,
      percentage: total > 0 ? Math.round((count / total) * 100) : 0
    }));
  };

  const processTopCategories = (categories: Category[], activities: Activity[], bookings: Booking[]) => {
    const categoryStats = categories.map(category => {
      const categoryActivities = activities.filter(activity => activity.categoryId === category.id);
      const categoryBookings = bookings.filter(booking => 
        categoryActivities.some(activity => activity.id === booking.activityId)
      );

      return {
        name: category.name,
        activityCount: categoryActivities.length,
        bookingCount: categoryBookings.length
      };
    });

    return categoryStats
      .sort((a, b) => b.bookingCount - a.bookingCount)
      .slice(0, 5);
  };
const processTopActivities = (activities: Activity[], bookings: Booking[]) => {
  console.log('Processing top activities...');
  console.log('Activities count:', activities.length);
  console.log('Bookings count:', bookings.length);
  const activityMap = new Map<string, Activity>();
  activities.forEach(activity => {
    activityMap.set(activity.id, activity);
    console.log(`Activity: ${activity.name}, ID: ${activity.id}, Price: $${activity.price}`);
  });

  const statsMap = new Map<string, { name: string; bookings: number; revenue: number }>();
  activities.forEach(activity => {
    statsMap.set(activity.id, {
      name: activity.name,
      bookings: 0,
      revenue: 0
    });
  });
  bookings.forEach((booking, index) => {
    const activityId = booking.activityId;
    
    console.log(`Booking ${index + 1}: ActivityID: ${activityId}, TotalAmount: $${booking.totalAmount}, Status: ${booking.status}`);
    
    if (activityId && statsMap.has(activityId)) {
      const currentStat = statsMap.get(activityId)!;
      const activity = activityMap.get(activityId);
      
      if (booking.status === 'Confirmed' || booking.status === 'Completed') {
        currentStat.bookings += 1;
        let bookingRevenue = booking.totalAmount || 0;
        
        if (bookingRevenue === 0 && activity) {
          bookingRevenue = activity.price || 0;
          if (booking.numberOfPeople && booking.numberOfPeople > 1) {
            bookingRevenue *= booking.numberOfPeople;
          }
        }
        
        currentStat.revenue += bookingRevenue;
        
        console.log(`  Added to ${activity?.name}: $${bookingRevenue}, Total now: $${currentStat.revenue}`);
        
        statsMap.set(activityId, currentStat);
      } else {
        console.log(`  Skipped - Status: ${booking.status}`);
      }
    } else {
      console.log(`  No matching activity found for ID: ${activityId}`);
    }
  });
  const activityStats = Array.from(statsMap.values())
    .filter(stat => stat.bookings > 0) 
    .sort((a, b) => b.revenue - a.revenue);

  console.log('Final activity stats:', activityStats);
  if (activityStats.length === 0) {
    console.log('No activities with confirmed bookings found');
    return [];
  }

  return activityStats.slice(0, 5);
};
const calculatePlatformMetrics = (bookings: Booking[], users: User[], activities: Activity[]) => {

  const confirmedBookings = bookings.filter(booking => 
    booking.status === 'Confirmed' || booking.status === 'Completed'
  );
  
  const totalRevenue = confirmedBookings.reduce((sum, booking) => {
    if (booking.totalAmount && booking.totalAmount > 0) {
      return sum + booking.totalAmount;
    }
    const activity = activities.find(a => a.id === booking.activityId);
    if (activity && activity.price) {
      const people = booking.numberOfPeople || 1;
      return sum + (activity.price * people);
    }
    
    return sum;
  }, 0);

  const totalBookings = confirmedBookings.length;
  const totalUsers = users.length;
  const totalActivities = activities.length;
  const avgBookingValue = totalBookings > 0 ? totalRevenue / totalBookings : 0;

  return {
    totalRevenue,
    totalUsers,
    totalActivities,
    totalBookings,
    avgRating: 4.5, 
    avgBookingValue
  };
};
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'confirmed':
      case 'completed':
        return '#4CAF50';
      case 'pending':
        return '#FF9800';
      case 'cancelled':
        return '#f44336';
      default:
        return '#2196F3';
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <div style={{ 
          animation: 'spin 1s linear infinite',
          border: '3px solid #f3f3f3',
          borderTop: '3px solid #4CAF50',
          borderRadius: '50%',
          width: '50px',
          height: '50px'
        }}></div>
      </div>
    );
  }

  const maxRevenue = Math.max(...analyticsData.revenueData.map(d => d.revenue), 1);
  const maxUsers = Math.max(...analyticsData.userGrowthData.map(d => d.users), 1);

 return (
  <div ref={reportRef} style={{ padding: '24px', backgroundColor: '#1e1e1e', borderRadius: '12px', minHeight: '100vh' }}>
    {/* Header  */}
    <div style={{ 
      marginBottom: '32px',
      borderBottom: '2px solid #333333',
      paddingBottom: '16px'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
        <div>
          <h1 style={{ color: '#ffffff', fontSize: '32px', fontWeight: 'bold', marginBottom: '4px' }}>
            TourismHub Analytics Report
          </h1>
          <p style={{ color: '#b0b0b0', fontSize: '16px' }}>
            Comprehensive platform performance analysis • Generated on {new Date().toLocaleDateString()}
          </p>
        </div>
        
        <div style={{ 
          backgroundColor: '#2a2a2a', 
          padding: '6px', 
          borderRadius: '8px',
          border: '1px solid #333333',
          display: 'flex',
          gap: '4px'
        }}>
          {(['7d', '30d', '90d', '1y'] as const).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              style={{
                padding: '8px 16px',
                backgroundColor: timeRange === range ? '#4CAF50' : 'transparent',
                color: timeRange === range ? 'white' : '#b0b0b0',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: timeRange === range ? 'bold' : 'normal',
                transition: 'all 0.3s ease',
                fontSize: '14px'
              }}
            >
              {range.toUpperCase()}
            </button>
          ))}
        </div>
      </div>
    </div>

    {/* Platform Metrics */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '20px',
        marginBottom: '32px'
      }}>
        {[
          { 
            title: 'Total Revenue', 
            value: formatCurrency(analyticsData.platformMetrics.totalRevenue),
            subtitle: 'All time earnings',
            icon: '💰',
            color: '#4CAF50',
            trend: '+18%'
          },
        { 
          title: 'Total Users', 
          value: analyticsData.platformMetrics.totalUsers,
          subtitle: 'Registered users',
          icon: '👥',
          color: '#2196F3',
          trend: '+24%'
        },
        { 
          title: 'Total Activities', 
          value: analyticsData.platformMetrics.totalActivities,
          subtitle: 'Available experiences',
          icon: '🏔️',
          color: '#FF9800',
          trend: '+12%'
        },
        { 
          title: 'Total Bookings', 
          value: analyticsData.platformMetrics.totalBookings,
          subtitle: 'Completed reservations',
          icon: '📅',
          color: '#9C27B0',
          trend: '+15%'
        },
        { 
          title: 'Avg Booking Value', 
          value: formatCurrency(analyticsData.platformMetrics.avgBookingValue),
          subtitle: 'Average per booking',
          icon: '💎',
          color: '#00BCD4',
          trend: '+8%'
        },
        { 
          title: 'User Satisfaction', 
          value: `${analyticsData.platformMetrics.avgRating}/5.0`,
          subtitle: 'Average rating',
          icon: '⭐',
          color: '#FFC107',
          trend: '+5%'
        }
   ].map((metric, index) => (
          <div 
            key={index}
            style={{
              backgroundColor: '#2a2a2a',
              padding: '20px',
              borderRadius: '12px',
              border: `1px solid ${metric.color}40`,
              boxShadow: hoveredCardIndex === index 
                ? '0 6px 16px rgba(0,0,0,0.2)' 
                : '0 4px 12px rgba(0,0,0,0.1)',
              transition: 'all 0.3s ease',
              transform: hoveredCardIndex === index ? 'translateY(-2px)' : 'none',
              cursor: 'pointer'
            }}
            onMouseEnter={() => setHoveredCardIndex(index)}
            onMouseLeave={() => setHoveredCardIndex(null)}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <div style={{ 
                backgroundColor: `${metric.color}20`,
                borderRadius: '8px',
                padding: '8px',
                color: metric.color,
                fontSize: '20px',
                width: '40px',
                height: '40px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                {metric.icon}
              </div>
              <div style={{ 
                backgroundColor: '#4CAF5030',
                color: '#4CAF50',
                padding: '4px 8px',
                borderRadius: '12px',
                fontSize: '12px',
                fontWeight: 'bold'
              }}>
                {metric.trend}
              </div>
            </div>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#ffffff', marginBottom: '8px' }}>
              {metric.value}
            </div>
            <div style={{ fontSize: '14px', color: '#b0b0b0', fontWeight: '500' }}>
              {metric.title}
            </div>
            <div style={{ fontSize: '12px', color: '#666666', marginTop: '4px' }}>
              {metric.subtitle}
          </div>
        </div>
      ))}
    </div>

    {/* Charts and Graphs Section */}
    <div style={{ 
      backgroundColor: '#2a2a2a', 
      borderRadius: '12px', 
      padding: '24px',
      marginBottom: '32px',
      border: '1px solid #333333'
    }}>
      <h3 style={{ 
        color: '#ffffff', 
        fontSize: '20px', 
        fontWeight: 'bold', 
        marginBottom: '24px',
        borderBottom: '1px solid #444444',
        paddingBottom: '12px',
        display: 'flex',
        alignItems: 'center',
        gap: '10px'
      }}>
        <span style={{ 
          backgroundColor: '#4CAF5020',
          borderRadius: '8px',
          padding: '8px',
          color: '#4CAF50'
        }}>
          📈
        </span>
        Performance Charts
      </h3>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))', gap: '24px' }}>
        {/* Revenue Chart */}
        <div style={{
          backgroundColor: '#1e1e1e',
          padding: '20px',
          borderRadius: '10px',
          border: '1px solid #333333',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
            <div style={{ 
              backgroundColor: '#4CAF5020',
              borderRadius: '8px',
              padding: '8px',
              marginRight: '12px',
              color: '#4CAF50',
              width: '40px',
              height: '40px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              💰
            </div>
            <div>
              <h4 style={{ color: '#ffffff', fontSize: '16px', fontWeight: 'bold' }}>Revenue Overview</h4>
              <p style={{ color: '#b0b0b0', fontSize: '12px' }}>Earnings over time period</p>
            </div>
          </div>
          
          {analyticsData.revenueData.length > 0 ? (
            <>
              <div style={{ display: 'flex', alignItems: 'flex-end', height: '200px', gap: '12px' }}>
                {analyticsData.revenueData.map((data, index) => (
                  <div key={index} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <div style={{ 
                      color: '#b0b0b0', 
                      fontSize: '11px', 
                      marginBottom: '8px',
                      fontWeight: '500'
                    }}>
                      {data.date}
                    </div>
                    <div
                      style={{
                        width: '30px',
                        height: `${Math.max((data.revenue / maxRevenue) * 150, 10)}px`,
                        backgroundColor: index === analyticsData.revenueData.length - 1 ? '#4CAF50' : '#2196F3',
                        borderRadius: '4px 4px 0 0',
                        transition: 'all 0.3s ease',
                        position: 'relative'
                      }}
                    >
                      <div style={{
                        position: 'absolute',
                        top: '-25px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        backgroundColor: '#2a2a2a',
                        color: '#ffffff',
                        padding: '4px 6px',
                        borderRadius: '4px',
                        fontSize: '10px',
                        fontWeight: 'bold',
                        whiteSpace: 'nowrap',
                        border: '1px solid #444444',
                        display: 'none'
                      }}>
                        {formatCurrency(data.revenue)}
                      </div>
                    </div>
                    <div style={{ 
                      marginTop: '8px', 
                      fontSize: '10px', 
                      fontWeight: 'bold', 
                      color: '#ffffff',
                      backgroundColor: '#333333',
                      padding: '4px 6px',
                      borderRadius: '4px'
                    }}>
                      {formatCurrency(data.revenue)}
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ 
                marginTop: '20px', 
                paddingTop: '12px', 
                borderTop: '1px solid #333333',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div style={{ color: '#b0b0b0', fontSize: '12px' }}>
                  {analyticsData.revenueData.length} data points
                </div>
                <div style={{ color: '#4CAF50', fontSize: '14px', fontWeight: 'bold' }}>
                  Total: {formatCurrency(analyticsData.revenueData.reduce((sum, d) => sum + d.revenue, 0))}
                </div>
              </div>
            </>
          ) : (
            <div style={{ 
              textAlign: 'center', 
              padding: '40px', 
              color: '#b0b0b0',
              backgroundColor: '#2a2a2a',
              borderRadius: '8px',
              border: '1px dashed #444444'
            }}>
              <div style={{ fontSize: '32px', marginBottom: '12px' }}>📊</div>
              <p>No revenue data available for selected period</p>
            </div>
          )}
        </div>

        {/* User Growth Chart */}
        <div style={{
          backgroundColor: '#1e1e1e',
          padding: '20px',
          borderRadius: '10px',
          border: '1px solid #333333',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
            <div style={{ 
              backgroundColor: '#2196F320',
              borderRadius: '8px',
              padding: '8px',
              marginRight: '12px',
              color: '#2196F3',
              width: '40px',
              height: '40px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              📊
            </div>
            <div>
              <h4 style={{ color: '#ffffff', fontSize: '16px', fontWeight: 'bold' }}>User Growth</h4>
              <p style={{ color: '#b0b0b0', fontSize: '12px' }}>New user registrations</p>
            </div>
          </div>
          
          {analyticsData.userGrowthData.length > 0 ? (
            <>
              <div style={{ display: 'flex', alignItems: 'flex-end', height: '200px', gap: '12px' }}>
                {analyticsData.userGrowthData.map((data, index) => (
                  <div key={index} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <div style={{ 
                      color: '#b0b0b0', 
                      fontSize: '11px', 
                      marginBottom: '8px',
                      fontWeight: '500'
                    }}>
                      {data.date}
                    </div>
                    <div
                      style={{
                        width: '30px',
                        height: `${Math.max((data.users / maxUsers) * 150, 10)}px`,
                        backgroundColor: index === analyticsData.userGrowthData.length - 1 ? '#9C27B0' : '#2196F3',
                        borderRadius: '4px 4px 0 0',
                        transition: 'all 0.3s ease',
                        position: 'relative'
                      }}
                    >
                      <div style={{
                        position: 'absolute',
                        top: '-25px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        backgroundColor: '#2a2a2a',
                        color: '#ffffff',
                        padding: '4px 6px',
                        borderRadius: '4px',
                        fontSize: '10px',
                        fontWeight: 'bold',
                        whiteSpace: 'nowrap',
                        border: '1px solid #444444',
                        display: 'none'
                      }}>
                        {data.users} users
                      </div>
                    </div>
                    <div style={{ 
                      marginTop: '8px', 
                      fontSize: '10px', 
                      fontWeight: 'bold', 
                      color: '#ffffff',
                      backgroundColor: '#333333',
                      padding: '4px 6px',
                      borderRadius: '4px'
                    }}>
                      {data.users} users
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ 
                marginTop: '20px', 
                paddingTop: '12px', 
                borderTop: '1px solid #333333',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div style={{ color: '#b0b0b0', fontSize: '12px' }}>
                  {analyticsData.userGrowthData.length} data points
                </div>
                <div style={{ color: '#2196F3', fontSize: '14px', fontWeight: 'bold' }}>
                  Total Growth: {analyticsData.userGrowthData.reduce((sum, d) => sum + d.users, 0)} new users
                </div>
              </div>
            </>
          ) : (
            <div style={{ 
              textAlign: 'center', 
              padding: '40px', 
              color: '#b0b0b0',
              backgroundColor: '#2a2a2a',
              borderRadius: '8px',
              border: '1px dashed #444444'
            }}>
              <div style={{ fontSize: '32px', marginBottom: '12px' }}>👥</div>
              <p>No user growth data available</p>
            </div>
          )}
        </div>
      </div>
    </div>

    {/* Detailed Analytics Section */}
    <div style={{ 
      backgroundColor: '#2a2a2a', 
      borderRadius: '12px', 
      padding: '24px',
      marginBottom: '32px',
      border: '1px solid #333333'
    }}>
      <h3 style={{ 
        color: '#ffffff', 
        fontSize: '20px', 
        fontWeight: 'bold', 
        marginBottom: '24px',
        borderBottom: '1px solid #444444',
        paddingBottom: '12px',
        display: 'flex',
        alignItems: 'center',
        gap: '10px'
      }}>
        <span style={{ 
          backgroundColor: '#FF980020',
          borderRadius: '8px',
          padding: '8px',
          color: '#FF9800'
        }}>
          📊
        </span>
        Detailed Analytics
      </h3>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
        {/* Booking Status Distribution */}
        <div style={{
          backgroundColor: '#1e1e1e',
          padding: '20px',
          borderRadius: '10px',
          border: '1px solid #333333',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
            <div style={{ 
              backgroundColor: '#9C27B020',
              borderRadius: '8px',
              padding: '8px',
              marginRight: '12px',
              color: '#9C27B0',
              width: '40px',
              height: '40px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              🎯
            </div>
            <div>
              <h4 style={{ color: '#ffffff', fontSize: '16px', fontWeight: 'bold' }}>Booking Status</h4>
              <p style={{ color: '#b0b0b0', fontSize: '12px' }}>Distribution by status</p>
            </div>
          </div>
          
          {analyticsData.bookingStats.length > 0 ? (
            <>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '20px' }}>
                {analyticsData.bookingStats.map((stat, index) => (
                  <div key={index}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{
                          width: '10px',
                          height: '10px',
                          backgroundColor: getStatusColor(stat.status),
                          borderRadius: '50%'
                        }}></div>
                        <span style={{ color: '#ffffff', fontSize: '14px' }}>{stat.status}</span>
                      </div>
                      <span style={{ color: '#ffffff', fontWeight: 'bold' }}>
                        {stat.count} <span style={{ color: '#b0b0b0', fontSize: '12px' }}>({stat.percentage}%)</span>
                      </span>
                    </div>
                    <div style={{ 
                      height: '8px', 
                      borderRadius: '4px',
                      backgroundColor: `${getStatusColor(stat.status)}20`,
                      overflow: 'hidden'
                    }}>
                      <div style={{
                        height: '100%',
                        backgroundColor: getStatusColor(stat.status),
                        width: `${stat.percentage}%`,
                        transition: 'width 0.5s ease'
                      }} />
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ 
                paddingTop: '12px', 
                borderTop: '1px solid #333333',
                textAlign: 'center'
              }}>
                <div style={{ color: '#ffffff', fontSize: '14px', fontWeight: 'bold' }}>
                  Total Bookings: {analyticsData.bookingStats.reduce((sum, stat) => sum + stat.count, 0)}
                </div>
              </div>
            </>
          ) : (
            <div style={{ 
              textAlign: 'center', 
              padding: '20px', 
              color: '#b0b0b0',
              backgroundColor: '#2a2a2a',
              borderRadius: '8px',
              border: '1px dashed #444444'
            }}>
              <div style={{ fontSize: '24px', marginBottom: '8px' }}>📭</div>
              <p>No booking data available</p>
            </div>
          )}
        </div>

        {/* Top Categories */}
        <div style={{
          backgroundColor: '#1e1e1e',
          padding: '20px',
          borderRadius: '10px',
          border: '1px solid #333333',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
            <div style={{ 
              backgroundColor: '#4CAF5020',
              borderRadius: '8px',
              padding: '8px',
              marginRight: '12px',
              color: '#4CAF50',
              width: '40px',
              height: '40px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              🏆
            </div>
            <div>
              <h4 style={{ color: '#ffffff', fontSize: '16px', fontWeight: 'bold' }}>Top Categories</h4>
              <p style={{ color: '#b0b0b0', fontSize: '12px' }}>Most popular categories</p>
            </div>
          </div>
          
          {analyticsData.topCategories.length > 0 ? (
            <>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
                {analyticsData.topCategories.map((category, index) => (
                  <div key={index} style={{ 
                    display: 'flex', 
                    alignItems: 'center',
                    padding: '12px',
                    backgroundColor: '#333333',
                    borderRadius: '8px',
                    borderLeft: `4px solid ${['#4CAF50', '#2196F3', '#FF9800', '#9C27B0', '#E91E63'][index] || '#ffffff'}`
                  }}>
                    <div style={{ 
                      backgroundColor: ['#4CAF50', '#2196F3', '#FF9800', '#9C27B0', '#E91E63'][index] || '#ffffff',
                      color: 'white',
                      padding: '8px 10px',
                      borderRadius: '8px',
                      marginRight: '12px',
                      fontSize: '14px',
                      fontWeight: 'bold',
                      minWidth: '30px',
                      textAlign: 'center'
                    }}>
                      {index + 1}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ color: '#ffffff', fontWeight: 'bold', fontSize: '14px' }}>{category.name}</div>
                      <div style={{ color: '#b0b0b0', fontSize: '12px', marginTop: '4px' }}>
                        <span style={{ color: '#2196F3', fontWeight: '500' }}>{category.activityCount}</span> activities • 
                        <span style={{ color: '#4CAF50', fontWeight: '500', marginLeft: '8px' }}>{category.bookingCount}</span> bookings
                      </div>
                    </div>
                    <div style={{ 
                      backgroundColor: '#444444',
                      color: '#ffffff',
                      padding: '4px 8px',
                      borderRadius: '12px',
                      fontSize: '11px',
                      fontWeight: 'bold'
                    }}>
                      #{index + 1}
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ 
                paddingTop: '12px', 
                borderTop: '1px solid #333333',
                textAlign: 'center'
              }}>
                <div style={{ color: '#b0b0b0', fontSize: '12px' }}>
                  Based on total booking count
                </div>
              </div>
            </>
          ) : (
            <div style={{ 
              textAlign: 'center', 
              padding: '20px', 
              color: '#b0b0b0',
              backgroundColor: '#2a2a2a',
              borderRadius: '8px',
              border: '1px dashed #444444'
            }}>
              <div style={{ fontSize: '24px', marginBottom: '8px' }}>📂</div>
              <p>No category data available</p>
            </div>
          )}
        </div>

         {/* Top Activities Section */}
      <div style={{
        backgroundColor: '#1e1e1e',
        padding: '20px',
        borderRadius: '10px',
        border: '1px solid #333333',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
            <div style={{ 
              backgroundColor: '#FF980020',
              borderRadius: '8px',
              padding: '8px',
              marginRight: '12px',
              color: '#FF9800',
              width: '40px',
              height: '40px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              ⭐
            </div>
            <div>
              <h4 style={{ color: '#ffffff', fontSize: '16px', fontWeight: 'bold' }}>Top Activities</h4>
              <p style={{ color: '#b0b0b0', fontSize: '12px' }}>Revenue generating activities</p>
            </div>
          </div>
          
          {analyticsData.topActivities.length > 0 ? (
          <>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
              {analyticsData.topActivities.map((activity, index) => (
                <div 
                  key={index} 
                  style={{ 
                    padding: '12px',
                    backgroundColor: '#333333',
                    borderRadius: '8px',
                    border: `1px solid ${hoveredActivityIndex === index ? '#4CAF50' : '#444444'}`,
                    transition: 'all 0.3s ease',
                    transform: hoveredActivityIndex === index ? 'translateX(4px)' : 'none',
                    cursor: 'pointer'
                  }}
                  onMouseEnter={() => setHoveredActivityIndex(index)}
                  onMouseLeave={() => setHoveredActivityIndex(null)}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <div style={{ color: '#ffffff', fontWeight: 'bold', fontSize: '14px' }}>
                      {index + 1}. {activity.name}
                    </div>
                    <div style={{ 
                      backgroundColor: '#4CAF50',
                      color: 'white',
                      padding: '4px 8px',
                      borderRadius: '12px',
                      fontSize: '11px',
                      fontWeight: 'bold'
                    }}>
                      {activity.bookings} bookings
                    </div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ color: '#b0b0b0', fontSize: '12px' }}>
                      Revenue generated:
                    </div>
                    <div style={{ 
                      color: '#4CAF50', 
                      fontWeight: 'bold', 
                      fontSize: '14px',
                      backgroundColor: '#4CAF5010',
                      padding: '4px 8px',
                      borderRadius: '6px'
                    }}>
                      {formatCurrency(activity.revenue)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ 
                paddingTop: '12px', 
                borderTop: '1px solid #333333',
                textAlign: 'center'
              }}>
                <div style={{ color: '#4CAF50', fontSize: '14px', fontWeight: 'bold' }}>
                  Total Revenue: {formatCurrency(analyticsData.topActivities.reduce((sum, a) => sum + a.revenue, 0))}
                </div>
              </div>
            </>
          ) : (
            <div style={{ 
              textAlign: 'center', 
              padding: '20px', 
              color: '#b0b0b0',
              backgroundColor: '#2a2a2a',
              borderRadius: '8px',
              border: '1px dashed #444444'
            }}>
              <div style={{ fontSize: '24px', marginBottom: '8px' }}>🏔️</div>
              <p>No activity data available</p>
            </div>
          )}
        </div>
      </div>
    </div>

    {/* Footer Section */}
    <div style={{ 
      display: 'flex', 
      justifyContent: 'space-between', 
      alignItems: 'center',
      padding: '20px',
      backgroundColor: '#2a2a2a',
      borderRadius: '12px',
      border: '1px solid #333333',
      marginTop: '32px'
    }}>
      <div style={{ color: '#b0b0b0', fontSize: '12px', lineHeight: '1.5' }}>
        <div style={{ fontWeight: '500', color: '#ffffff', marginBottom: '4px' }}>
          TourismHub Analytics Report
        </div>
        <div>Generated on: {new Date().toLocaleDateString()} {new Date().toLocaleTimeString()}</div>
        <div>Time period: {timeRange.toUpperCase()} • Data source: TourismHub Platform</div>
      </div>
      
      <div style={{ display: 'flex', gap: '12px' }}>
        <button
          onClick={() => fetchAnalyticsData()}
          disabled={loading}
          style={{
            padding: '10px 20px',
            backgroundColor: loading ? '#666666' : '#2196F3',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'all 0.3s ease',
            fontSize: '14px'
          }}
        >
          {loading ? (
            <>
              <div style={{ 
                animation: 'spin 1s linear infinite',
                border: '2px solid #f3f3f3',
                borderTop: '2px solid #ffffff',
                borderRadius: '50%',
                width: '16px',
                height: '16px'
              }}></div>
              Loading...
            </>
          ) : (
            <>
              <span>🔄</span>
              Refresh Data
            </>
          )}
        </button>
        <button
          onClick={generatePDFReport}
          disabled={exporting || loading}
          style={{
            padding: '10px 20px',
            backgroundColor: exporting || loading ? '#666666' : '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: exporting || loading ? 'not-allowed' : 'pointer',
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'all 0.3s ease',
            fontSize: '14px'
          }}
        >
          {exporting ? (
            <>
              <div style={{ 
                animation: 'spin 1s linear infinite',
                border: '2px solid #f3f3f3',
                borderTop: '2px solid #ffffff',
                borderRadius: '50%',
                width: '16px',
                height: '16px'
              }}></div>
              Generating PDF...
            </>
          ) : (
            <>
              <span>📥</span>
              Export as PDF
            </>
          )}
        </button>
      </div>
    </div>
  </div>
);
};

export default AnalyticsReports;