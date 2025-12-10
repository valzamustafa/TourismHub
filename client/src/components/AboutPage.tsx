// components/AboutPage.tsx
'use client';
import React, { useState, useEffect } from 'react';
import { MapPin, Phone, Mail, Award, Globe } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface TeamMember {
  id: string;
  name: string;
  role: string;
  bio: string;
  imageUrl: string;
  email: string;
  activityCount?: number;
}

interface AboutData {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  mission: string;
  vision: string;
  values: string[];
  teamMembers: TeamMember[];
  contactEmail: string;
  contactPhone: string;
  address: string;
  lastUpdated: string;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5224/api';

const AboutPage: React.FC = () => {
  const [aboutData, setAboutData] = useState<AboutData | null>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalActivities: 0,
    totalProviders: 0,
    happyCustomers: 0,
    countries: 0
  });
  const router = useRouter();

  useEffect(() => {
    fetchAboutData();
    fetchStats();
    
    const savedDarkMode = localStorage.getItem('darkMode');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    let shouldBeDark = false;
    
    if (savedDarkMode !== null) {
      shouldBeDark = savedDarkMode === 'true';
    } else {
      shouldBeDark = prefersDark;
    }
    
    if (shouldBeDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const fetchAboutData = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/about`);
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          const teamMembers = Array.isArray(result.data.teamMembers) 
            ? result.data.teamMembers.map((member: any) => ({
                id: member.id,
                name: member.name || 'Unknown',
                role: 'Local Expert',
                bio: member.bio || `Specialized in providing amazing travel experiences`,
                imageUrl: member.imageUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name || 'Provider')}&background=2196F3&color=fff`,
                email: member.email || '',
                activityCount: member.activityCount || 0
              }))
            : [];
          
          const aboutWithTeamMembers = {
            ...result.data,
            teamMembers
          };
          
          setAboutData(aboutWithTeamMembers);
        }
      } else {
        setAboutData({
          id: '1',
          title: 'About TourismHub',
          subtitle: 'Your Gateway to Unforgettable Adventures',
          description: 'TourismHub connects adventure seekers with authentic travel experiences worldwide. We work with local experts to provide unique, safe, and memorable activities that create lasting memories.',
          mission: 'To make extraordinary travel experiences accessible to everyone by connecting travelers with local experts and authentic adventures.',
          vision: 'To be the world\'s most trusted platform for discovering and booking unique travel experiences.',
          values: ['Authenticity', 'Safety First', 'Customer Satisfaction', 'Sustainable Tourism', 'Innovation'],
          teamMembers: [],
          contactEmail: 'contact@tourismhub.com',
          contactPhone: '+1 (555) 123-4567',
          address: '123 Adventure Street, Tourism City, TC 10101',
          lastUpdated: new Date().toISOString()
        });
      }
    } catch (error) {
      console.error('Error fetching about data:', error);
   
      setAboutData({
        id: '1',
        title: 'About TourismHub',
        subtitle: 'Your Gateway to Unforgettable Adventures',
        description: 'TourismHub connects adventure seekers with authentic travel experiences worldwide.',
        mission: 'To make extraordinary travel experiences accessible to everyone.',
        vision: 'To be the world\'s most trusted platform for unique travel experiences.',
        values: ['Authenticity', 'Safety First', 'Customer Satisfaction', 'Sustainable Tourism', 'Innovation'],
        teamMembers: [],
        contactEmail: 'contact@tourismhub.com',
        contactPhone: '+1 (555) 123-4567',
        address: '123 Adventure Street, Tourism City',
        lastUpdated: new Date().toISOString()
      });
    } finally {
      setLoading(false);
    }
  };
const fetchStats = async () => {
  try {
    console.log('Fetching REAL statistics from database...');
    const [activitiesRes, providersRes, bookingsRes, usersRes] = await Promise.all([
      fetch(`${API_BASE_URL}/activities`),
      fetch(`${API_BASE_URL}/users?role=Provider`),
      fetch(`${API_BASE_URL}/bookings`),
      fetch(`${API_BASE_URL}/users`) 
    ]);

    let totalActivities = 0;
    let totalProviders = 0;
    let happyCustomers = 0;
    let countries = 0;
    if (activitiesRes.ok) {
      const activities = await activitiesRes.json();
      totalActivities = activities.length || 0;
      console.log(`REAL Activities in DB: ${totalActivities}`);
      const locations = activities
        .filter((a: any) => a.location && a.location.trim() !== '')
        .map((a: any) => a.location.trim());
      
      const uniqueLocations = [...new Set(locations)];
      console.log(`Unique locations in DB: ${uniqueLocations.length}`, uniqueLocations);
      countries = uniqueLocations.length;
    }
    if (providersRes.ok) {
      const providers = await providersRes.json();
      totalProviders = providers.filter((p: any) => 
        p.isActive !== false && 
        !p.email?.includes('_deleted_') &&
        p.email 
      ).length || 0;
      console.log(`REAL Active Providers in DB: ${totalProviders}`);
    }
    if (bookingsRes.ok) {
      const bookings = await bookingsRes.json();
      console.log(`REAL Bookings in DB: ${bookings.length}`);
      const bookingUserIds = bookings
        .map((b: any) => b.userId)
        .filter((id: any) => id && id !== '');
      
      const uniqueBookingUsers = [...new Set(bookingUserIds)];
      happyCustomers = uniqueBookingUsers.length;
      console.log(`REAL Users with bookings: ${happyCustomers}`);
    }
    if (usersRes.ok) {
      const allUsers = await usersRes.json();
      console.log(`TOTAL Users in DB: ${allUsers.length}`);
      if (happyCustomers === 0) {
        happyCustomers = allUsers.filter((u: any) => 
          u.role !== 'Admin' &&
          u.isActive !== false
        ).length || 0;
      }
    }
    const realStats = {
      totalActivities: totalActivities,
      totalProviders: totalProviders,
      happyCustomers: happyCustomers,
      countries: countries 
    };
    
    console.log('REAL Statistics from database:', realStats);
    
    setStats(realStats);
    
  } catch (error) {
    console.error('Error fetching REAL statistics:', error);
    setStats({
      totalActivities: 0,
      totalProviders: 0,
      happyCustomers: 0,
      countries: 0
    });
  }
};

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-b from-white to-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!aboutData) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-6xl mx-auto px-4 py-16 text-center">
          <h1 className="text-4xl font-bold mb-4">About TourismHub</h1>
          <p className="text-gray-600">Content coming soon...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2 cursor-pointer" onClick={() => router.push('/')}>
            <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-gradient-to-r from-blue-600 to-cyan-500">
              <span className="text-white font-bold">TH</span>
            </div>
            <span className="text-xl font-bold text-gray-900">TourismHub</span>
          </div>
          
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors px-4 py-2 rounded-lg border border-gray-300 hover:border-blue-500"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Home
          </button>
        </div>
      </div>

      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-blue-600 to-cyan-500 text-white">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-6xl mx-auto px-4 py-20">
          <h1 className="text-5xl md:text-6xl font-bold mb-4">{aboutData.title}</h1>
          <p className="text-xl md:text-2xl text-blue-100 mb-8">{aboutData.subtitle}</p>
          <p className="text-lg max-w-3xl text-white/90">{aboutData.description}</p>
        </div>
      </div>

      {/* Stats Section */}
      <div className="max-w-6xl mx-auto px-4 -mt-8 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { label: 'Activities', value: stats.totalActivities, icon: '🏔️', color: 'from-blue-500 to-cyan-400' },
            { label: 'Providers', value: stats.totalProviders, icon: '👥', color: 'from-green-500 to-emerald-400' },
            { label: 'Happy Travelers', value: stats.happyCustomers, icon: '😊', color: 'from-purple-500 to-pink-400' },
            { label: 'Countries', value: stats.countries, icon: '🌍', color: 'from-orange-500 to-yellow-400' }
          ].map((stat, index) => (
            <div key={index} className="bg-white rounded-2xl p-6 shadow-xl text-center">
              <div className={`w-16 h-16 rounded-full bg-gradient-to-r ${stat.color} flex items-center justify-center mx-auto mb-4`}>
                <span className="text-2xl">{stat.icon}</span>
              </div>
              <div className="text-3xl font-bold mb-2">{stat.value.toLocaleString()}+</div>
              <div className="text-gray-600">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Mission & Vision */}
      <div className="max-w-6xl mx-auto px-4 py-16">
        <div className="grid md:grid-cols-2 gap-12">
          <div className="bg-gradient-to-br from-blue-50 to-white p-8 rounded-3xl shadow-lg border border-blue-100">
            <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-cyan-400 rounded-2xl flex items-center justify-center mb-6">
              <Award className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-2xl font-bold mb-4">Our Mission</h2>
            <p className="text-gray-700 text-lg leading-relaxed">{aboutData.mission}</p>
          </div>
          
          <div className="bg-gradient-to-br from-green-50 to-white p-8 rounded-3xl shadow-lg border border-green-100">
            <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-400 rounded-2xl flex items-center justify-center mb-6">
              <Globe className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-2xl font-bold mb-4">Our Vision</h2>
            <p className="text-gray-700 text-lg leading-relaxed">{aboutData.vision}</p>
          </div>
        </div>
      </div>

      {/* Values */}
      {aboutData.values && aboutData.values.length > 0 && (
        <div className="bg-gradient-to-r from-gray-50 to-white py-16">
          <div className="max-w-6xl mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">Our Core Values</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-6">
              {aboutData.values.map((value, index) => {
                const icons = ['⭐', '🛡️', '❤️', '🌱', '💡'];
                const colors = [
                  'from-yellow-400 to-orange-400',
                  'from-blue-400 to-cyan-400',
                  'from-red-400 to-pink-400',
                  'from-green-400 to-emerald-400',
                  'from-purple-400 to-indigo-400'
                ];
                
                return (
                  <div key={index} className="bg-white rounded-2xl p-6 shadow-lg text-center hover:shadow-xl transition-shadow">
                    <div className={`w-16 h-16 rounded-full bg-gradient-to-r ${colors[index % colors.length]} flex items-center justify-center mx-auto mb-4`}>
                      <span className="text-2xl">{icons[index % icons.length]}</span>
                    </div>
                    <h3 className="font-bold text-lg mb-2">{value}</h3>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Our Providers */}
      {aboutData.teamMembers && aboutData.teamMembers.length > 0 && (
        <div className="max-w-6xl mx-auto px-4 py-16">
          <h2 className="text-3xl font-bold text-center mb-4">Meet Our Expert Providers</h2>
          <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
            Our network of local experts ensures authentic and memorable experiences
          </p>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {aboutData.teamMembers.map((member) => (
              <div key={member.id} className="group">
                <div className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
                  <div className="h-64 relative overflow-hidden">
                    <img 
                      src={member.imageUrl} 
                      alt={member.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      onError={(e) => {
                        e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name)}&background=2196F3&color=fff`;
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                    <div className="absolute bottom-4 left-4">
                      <h3 className="text-xl font-bold text-white">{member.name}</h3>
                      <p className="text-blue-300">Local Expert</p>
                      {member.activityCount && member.activityCount > 0 && (
                        <div className="flex items-center gap-1 mt-1">
                          <span className="text-xs bg-white/20 px-2 py-1 rounded-full">
                            {member.activityCount} activities
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="p-6">
                    <p className="text-gray-600 mb-4">{member.bio}</p>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Mail className="w-4 h-4" />
                      <span>{member.email}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Contact Section */}
      <div className="bg-gradient-to-r from-blue-600 to-cyan-500 text-white py-16">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Get In Touch With Us</h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Mail className="w-10 h-10" />
              </div>
              <h3 className="text-xl font-bold mb-3">Email Us</h3>
              <a 
                href={`mailto:${aboutData.contactEmail}`}
                className="text-blue-100 hover:text-white transition-colors"
              >
                {aboutData.contactEmail}
              </a>
            </div>
            
            <div className="text-center">
              <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Phone className="w-10 h-10" />
              </div>
              <h3 className="text-xl font-bold mb-3">Call Us</h3>
              <a 
                href={`tel:${aboutData.contactPhone.replace(/\D/g, '')}`}
                className="text-blue-100 hover:text-white transition-colors"
              >
                {aboutData.contactPhone}
              </a>
            </div>
            
            <div className="text-center">
              <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <MapPin className="w-10 h-10" />
              </div>
              <h3 className="text-xl font-bold mb-3">Visit Us</h3>
              <p className="text-blue-100">{aboutData.address}</p>
            </div>
          </div>
          
          <div className="text-center mt-12 pt-8 border-t border-white/20">
            <p className="text-blue-100">
              Last updated: {new Date(aboutData.lastUpdated).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;