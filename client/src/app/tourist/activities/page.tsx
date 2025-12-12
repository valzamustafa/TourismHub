'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { SaveButton } from '@/components/SaveButton';
import ContactButton from '@/components/ContactButton';
import { useTheme } from 'next-themes';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5224/api';
const BACKEND_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL?.replace('/api', '') || 'http://localhost:5224';

const DEFAULT_IMAGES = [
  'https://images.unsplash.com/photo-1501555088652-021faa106b9b?w=500',
  'https://images.unsplash.com/photo-1502602898536-47ad22581b52?w=500',
  'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=500'
];

interface Category {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  featured: boolean;
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
  providerName: string;
  providerId: string;
  duration: string;
  images: string[];
  status: string;
  rating?: number;
  reviews?: number;
  included?: string[];
  requirements?: string[];
  quickFacts?: string[];
  startDate: string;
  endDate: string;
  isActive?: boolean;
  isExpired?: boolean;
  isUpcoming?: boolean;
  delayedDate?: string;           
  rescheduledStartDate?: string;  
  rescheduledEndDate?: string;  
}

export default function ActivitiesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [filteredActivities, setFilteredActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [currentBackground, setCurrentBackground] = useState<string>('/images/landscape-hero.jpg');
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [showActivities, setShowActivities] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string>('');
  const [user, setUser] = useState<any>(null);
  const sliderRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const [timeSlots, setTimeSlots] = useState<any[]>([]);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<any>(null);
  const timeSliderRef = useRef<HTMLDivElement>(null);
  
  const [isDarkMode, setIsDarkMode] = useState(false);
  const { theme, setTheme } = useTheme();

  const getFullImageUrl = (imagePath: string): string => {
    if (!imagePath || imagePath === 'string' || imagePath === 'null') {
      return DEFAULT_IMAGES[0];
    }

    if (imagePath.startsWith('http')) {
      return imagePath;
    }
    
    if (imagePath.startsWith('/uploads/')) {
      const fullUrl = `${BACKEND_BASE_URL}${imagePath}`;
      return fullUrl;
    }
    
    if (imagePath.includes('.')) {
      const fullUrl = `${BACKEND_BASE_URL}/uploads/activity-images/${imagePath}`;
      return fullUrl;
    }
    
    return DEFAULT_IMAGES[0];
  };

  const toggleDarkMode = () => {
    const newTheme = isDarkMode ? 'light' : 'dark';
    setIsDarkMode(!isDarkMode);
    setTheme(newTheme);
    
    localStorage.setItem('theme', newTheme);
  };

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'light';
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
      setIsDarkMode(true);
      setTheme('dark');
    } else {
      setIsDarkMode(false);
      setTheme('light');
    }
  }, [setTheme]);

  const generateTimeSlots = () => {
    const slots = [
      { id: 'morning', time: '6:00', label: 'Morning', icon: '🌅', activities: 0 },
      { id: 'midday', time: '12:00', label: 'Midday', icon: '☀️', activities: 0 },
      { id: 'afternoon', time: '15:00', label: 'Afternoon', icon: '⛅', activities: 0 },
      { id: 'evening', time: '18:00', label: 'Evening', icon: '🌆', activities: 0 },
      { id: 'night', time: '21:00', label: 'Night', icon: '🌙', activities: 0 },
      { id: 'late_night', time: '00:00', label: 'Late Night', icon: '🌃', activities: 0 },
      { id: 'sunrise', time: '5:30', label: 'Sunrise', icon: '🌄', activities: 0 },
      { id: 'sunset', time: '19:30', label: 'Sunset', icon: '🌇', activities: 0 },
    ];
    return slots.map(slot => ({
      ...slot,
      activities: activities.filter(activity => {
        const activityTime = new Date(activity.startDate).getHours();
        
        if (slot.id === 'morning') return activityTime >= 6 && activityTime < 12;
        if (slot.id === 'midday') return activityTime >= 12 && activityTime < 15;
        if (slot.id === 'afternoon') return activityTime >= 15 && activityTime < 18;
        if (slot.id === 'evening') return activityTime >= 18 && activityTime < 21;
        if (slot.id === 'night') return activityTime >= 21 && activityTime < 24;
        if (slot.id === 'late_night') return activityTime >= 0 && activityTime < 6;
        if (slot.id === 'sunrise') return activityTime >= 5 && activityTime < 7;
        if (slot.id === 'sunset') return activityTime >= 18 && activityTime < 20;
        return false;
      }).length
    }));
  };

  const handleTimeSlotClick = (slot: any) => {
    setSelectedTimeSlot(slot);
    
    const filtered = activities.filter(activity => {
      const activityTime = new Date(activity.startDate).getHours();
      
      if (slot.id === 'morning') return activityTime >= 6 && activityTime < 12;
      if (slot.id === 'midday') return activityTime >= 12 && activityTime < 15;
      if (slot.id === 'afternoon') return activityTime >= 15 && activityTime < 18;
      if (slot.id === 'evening') return activityTime >= 18 && activityTime < 21;
      if (slot.id === 'night') return activityTime >= 21 && activityTime < 24;
      if (slot.id === 'late_night') return activityTime >= 0 && activityTime < 6;
      if (slot.id === 'sunrise') return activityTime >= 5 && activityTime < 7;
      if (slot.id === 'sunset') return activityTime >= 18 && activityTime < 20;
      return false;
    });
    
    setFilteredActivities(filtered);
    setShowActivities(true);
    
    setTimeout(() => {
      const activitiesSection = document.getElementById('activities-section');
      if (activitiesSection) {
        window.scrollTo({
          top: activitiesSection.offsetTop - 80,
          behavior: 'smooth'
        });
      }
    }, 300);
  };

  const scrollTimeLeft = () => {
    if (timeSliderRef.current) {
      timeSliderRef.current.scrollBy({ left: -200, behavior: 'smooth' });
    }
  };

  const scrollTimeRight = () => {
    if (timeSliderRef.current) {
      timeSliderRef.current.scrollBy({ left: 200, behavior: 'smooth' });
    }
  };

 const fetchActivitiesWithImages = async () => {
  try {
    setError(null);
    setLoading(true);
    
    const response = await fetch(`${API_BASE_URL}/activities`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch activities: ${response.status}`);
    }
    
    const activitiesData = await response.json();
    
    console.log('=== TOURIST - FETCHED ACTIVITIES ===');
    activitiesData.forEach((activity: any) => {
      if (activity.status === 'Delayed') {
        console.log('Delayed Activity for tourist:', {
          name: activity.name,
          rescheduledStartDate: activity.rescheduledStartDate,
          rescheduledEndDate: activity.rescheduledEndDate,
          hasRescheduledDates: !!(activity.rescheduledStartDate || activity.rescheduledEndDate)
        });
      }
    });

      const activitiesWithImages = await Promise.all(
        activitiesData.map(async (activity: any) => {
          try {
            const imagesUrl = `${API_BASE_URL}/activityimages/activity/${activity.id}`;
            const imagesResponse = await fetch(imagesUrl);
            
            let imageUrls: string[] = [];
            
            if (imagesResponse.ok) {
              const imagesData = await imagesResponse.json();
              
              if (imagesData.data && imagesData.data.length > 0) {
                imageUrls = imagesData.data.map((img: any) => {
                  return getFullImageUrl(img.imageUrl);
                });
              }
            }
            
            if (imageUrls.length === 0) {
              imageUrls = DEFAULT_IMAGES;
            }
            
            let providerId = activity.providerId;
            if (!providerId && activity.provider) {
              providerId = activity.provider.id || 
                           activity.provider.userId || 
                           activity.provider.userID ||
                           activity.provider.Id;
            }

            let providerName = activity.providerName;
            if (!providerName && activity.provider) {
              providerName = activity.provider.fullName || 
                             activity.provider.name || 
                             activity.provider.FullName ||
                             activity.provider.UserName ||
                             activity.provider.username ||
                             'Unknown Provider';
            }

            if (!providerId && activity.provider) {
              const possibleKeys = ['id', 'userId', 'userID', 'Id', 'ID', 'providerId'];
              for (const key of possibleKeys) {
                if (activity.provider[key]) {
                  providerId = activity.provider[key];
                  break;
                }
              }
            }

            if (!providerId) {
              providerId = 'DEBUG_NO_PROVIDER_ID';
            }
            
           
            
          return {
            ...activity,
            providerId: providerId || '',
            providerName: providerName || 'Unknown Provider',
            images: imageUrls,
            startDate: activity.startDate || activity.createdAt || new Date().toISOString(),
            endDate: activity.endDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
            status: activity.status || 'Pending',
            delayedDate: activity.delayedDate || null,
            rescheduledStartDate: activity.rescheduledStartDate || null, 
            rescheduledEndDate: activity.rescheduledEndDate || null,    
            included: Array.isArray(activity.included) ? activity.included : [],
            requirements: Array.isArray(activity.requirements) ? activity.requirements : [],
            quickFacts: Array.isArray(activity.quickFacts) ? activity.quickFacts : [],
            rating: activity.rating || 4.8,
            reviews: activity.reviews || 124
          };
        } catch (error) {
          console.error(`Error processing ${activity.name}:`, error);
          return {
            ...activity,
              providerId: activity.providerId || '',
              providerName: activity.providerName || 'Unknown Provider',
              images: DEFAULT_IMAGES,
              startDate: new Date().toISOString(),
              endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
              status: 'Pending',
              delayedDate: null,
              rescheduledStartDate: null, 
              rescheduledEndDate: null, 
              included: [],
              requirements: [],
              quickFacts: [],
              rating: 4.8,
              reviews: 124
            };
          }
        })
      );

      setActivities(activitiesWithImages);
      
    } catch (error) {
      console.error('Main error:', error);
      setError('Failed to load activities.');
      setActivities([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      setError(null);
      const response = await fetch(`${API_BASE_URL}/categories`);
      if (!response.ok) {
        throw new Error(`Failed to fetch categories: ${response.status} ${response.statusText}`);
      }
      const data = await response.json();
      
      setCategories(data);
      if (data.length > 0) {
        setSelectedCategory(data[0]);
        setCurrentBackground(data[0].imageUrl || '/images/landscape-hero.jpg');
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      setError('Failed to load categories. Please try again later.');
    }
  };

  const filterActivitiesByCategory = (category: Category) => {
    const filtered = activities.filter(activity => {
      if (activity.categoryId === category.id) {
        return true;
      }
      if (activity.category && category.name && 
          activity.category.toLowerCase() === category.name.toLowerCase()) {
        return true;
      }
      return false;
    });
    
    setFilteredActivities(filtered);
    setShowActivities(true);
    
    setTimeout(() => {
      const activitiesSection = document.getElementById('activities-section');
      if (activitiesSection) {
        window.scrollTo({
          top: activitiesSection.offsetTop - 80,
          behavior: 'smooth'
        });
      }
    }, 300);
  };

  const handleCategoryClick = (category: Category) => {
    setSelectedCategory(category);
    setCurrentBackground(category.imageUrl || '/images/landscape-hero.jpg');
    filterActivitiesByCategory(category);
  };

  const checkScrollButtons = () => {
    if (sliderRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = sliderRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  const scrollLeft = () => {
    if (sliderRef.current) {
      sliderRef.current.scrollBy({ left: -400, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (sliderRef.current) {
      sliderRef.current.scrollBy({ left: 400, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    const userData = localStorage.getItem('user');
    const token = localStorage.getItem('token');

    if (!userData || !token) {
      router.push('/');
      return;
    }

    const parsedUser = JSON.parse(userData);
    console.log('Parsed user object:', parsedUser);
    
    setUserId(parsedUser.id);
    setUser(parsedUser);
    
    fetchActivitiesWithImages();
    fetchCategories();
  }, [router]);

  useEffect(() => {
    if (activities.length > 0) {
      setTimeSlots(generateTimeSlots());
    }
  }, [activities]);

  useEffect(() => {
    const slider = sliderRef.current;
    if (slider) {
      slider.addEventListener('scroll', checkScrollButtons);
      checkScrollButtons();
    }
    return () => {
      if (slider) {
        slider.removeEventListener('scroll', checkScrollButtons);
      }
    };
  }, [categories]);

  useEffect(() => {
    const handleScroll = () => {
      const activitiesSection = document.getElementById('activities-section');
      if (activitiesSection) {
        const sectionTop = activitiesSection.offsetTop;
        const scrollPosition = window.scrollY;
        
        if (scrollPosition >= sectionTop - 100) {
          setShowActivities(true);
        } else {
          setShowActivities(false);
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 dark:border-blue-400 mx-auto mb-4"></div>
          <p className="text-blue-800 dark:text-blue-200 text-lg font-medium">Loading amazing adventures...</p>
        </div>
      </div>
    );
  }

  const formatTime = (dateString?: string) => {
    if (!dateString) return '';
    try {
      return new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  const handleBackToCategories = () => {
    setShowActivities(false);
    
    const categoriesSection = document.getElementById('categories-section');
    if (categoriesSection) {
      window.scrollTo({
        top: categoriesSection.offsetTop - 80,
        behavior: 'smooth'
      });
    }
    
    setSelectedTimeSlot(null);
  };

  const getActivityStatus = (activity: Activity) => {
    if (activity.status === 'Delayed') {
      return {
        text: 'Delayed',
        color: 'purple',
        bgColor: isDarkMode 
          ? 'bg-gradient-to-r from-purple-600 to-purple-800' 
          : 'bg-gradient-to-r from-purple-500 to-purple-700',
        icon: '⏰'
      };
    }
    
    const now = new Date();
    const startDate = new Date(activity.startDate);
    const endDate = new Date(activity.endDate);
    
    if (endDate < now) {
      return {
        text: 'Expired',
        color: 'red',
        bgColor: isDarkMode 
          ? 'bg-gradient-to-r from-red-600 to-pink-600' 
          : 'bg-gradient-to-r from-red-500 to-pink-500',
        icon: '📅'
      };
    }
    
    if (startDate > now) {
      return {
        text: 'Upcoming',
        color: 'yellow',
        bgColor: isDarkMode 
          ? 'bg-gradient-to-r from-yellow-600 to-orange-600' 
          : 'bg-gradient-to-r from-yellow-500 to-orange-500',
        icon: '🚀'
      };
    }
    
    if (startDate <= now && endDate >= now) {
      return {
        text: 'Active',
        color: 'green',
        bgColor: isDarkMode 
          ? 'bg-gradient-to-r from-green-600 to-teal-600' 
          : 'bg-gradient-to-r from-green-500 to-teal-500',
        icon: '✅'
      };
    }
    
    return {
      text: activity.status || 'Pending',
      color: 'gray',
      bgColor: isDarkMode 
        ? 'bg-gradient-to-r from-gray-600 to-gray-700' 
        : 'bg-gradient-to-r from-gray-500 to-gray-600',
      icon: '⏳'
    };
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDarkMode ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white' : 'bg-gradient-to-br from-blue-50 via-white to-indigo-50 text-gray-900'}`}>
      {error && (
        <div className={`fixed top-20 left-1/2 transform -translate-x-1/2 z-50 ${isDarkMode ? 'bg-gradient-to-r from-red-900/90 to-pink-900/90 border-red-700 text-red-200' : 'bg-gradient-to-r from-red-100 to-pink-100 border-red-300 text-red-800'} border px-6 py-4 rounded-xl shadow-lg backdrop-blur-sm`}>
          <div className="flex items-center">
            <span className="mr-3 text-2xl">⚠️</span>
            <span className="font-medium">{error}</span>
            <button 
              onClick={() => setError(null)}
              className={`ml-6 ${isDarkMode ? 'text-red-400 hover:text-red-200' : 'text-red-600 hover:text-red-800'} text-lg font-bold`}
            >
              ×
            </button>
          </div>
        </div>
      )}

      <header className={`fixed top-0 left-0 right-0 ${isDarkMode ? 'bg-gradient-to-r from-gray-900/95 via-gray-800/90 to-gray-900/95 border-gray-700' : 'bg-gradient-to-r from-white/95 via-white/90 to-white/95 border-blue-100'} backdrop-blur-xl shadow-lg border-b z-50 transition-colors duration-300`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3 cursor-pointer" onClick={() => router.push('/')}>
                <div className={`w-10 h-10 ${isDarkMode ? 'bg-gradient-to-r from-blue-700 to-cyan-600' : 'bg-gradient-to-r from-blue-600 to-cyan-500'} rounded-xl flex items-center justify-center shadow-lg`}>
                  <span className="text-white font-bold text-lg">TH</span>
                </div>
                <div>
                  <h1 className={`text-2xl font-bold ${isDarkMode ? 'bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent' : 'bg-gradient-to-r from-blue-700 to-cyan-600 bg-clip-text text-transparent'}`}>
                    TourismHub
                  </h1>
                  <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Adventure Awaits</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={toggleDarkMode}
                className={`group p-2.5 rounded-xl ${isDarkMode ? 'bg-gradient-to-r from-gray-800 to-gray-700 text-yellow-300 hover:from-gray-700 hover:to-gray-600' : 'bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-700 hover:from-blue-200 hover:to-cyan-200'} transition-all duration-300 shadow-lg hover:scale-105`}
                aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                {isDarkMode ? (
                  <svg className="w-5 h-5 group-hover:rotate-45 transition-transform" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5 group-hover:rotate-45 transition-transform" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                  </svg>
                )}
              </button>
              
              <button
                onClick={() => router.push('/')}
                className={`group flex items-center space-x-2 px-5 py-2.5 ${isDarkMode ? 'bg-gradient-to-r from-blue-700 to-cyan-600 hover:from-blue-600 hover:to-cyan-500' : 'bg-gradient-to-r from-blue-500 to-cyan-400 hover:from-blue-600 hover:to-cyan-500'} text-white rounded-xl transition-all duration-300 shadow-lg hover:shadow-blue-500/30 hover:scale-105`}
              >
                <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                <span className="font-semibold">Home</span>
              </button>
              
              <button
                onClick={() => router.push('/tourist/profile')}
                className={`group flex items-center space-x-2 px-5 py-2.5 ${isDarkMode ? 'bg-gradient-to-r from-indigo-700 to-purple-700 hover:from-indigo-600 hover:to-purple-600' : 'bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600'} text-white rounded-xl transition-all duration-300 shadow-lg hover:shadow-purple-500/30 hover:scale-105`}
              >
                <svg className="w-5 h-5 group-hover:rotate-12 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span className="font-semibold">Dashboard</span>
              </button>
              
              <button
                onClick={() => {
                  localStorage.removeItem('token');
                  localStorage.removeItem('user');
                  window.location.href = '/';
                }}
                className={`group flex items-center space-x-2 px-5 py-2.5 ${isDarkMode ? 'bg-gradient-to-r from-red-700 to-pink-700 hover:from-red-600 hover:to-pink-600' : 'bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600'} text-white rounded-xl transition-all duration-300 shadow-lg hover:shadow-red-500/30 hover:scale-105`}
              >
                <svg className="w-5 h-5 group-hover:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span className="font-semibold">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <section 
        id="categories-section"
        className="relative w-full min-h-screen overflow-hidden pt-16"
      >
        <div 
          className="absolute inset-0 bg-gradient-to-br from-blue-900/40 via-purple-900/30 to-pink-900/20 backdrop-blur-sm"
          style={{
            backgroundImage: `url(${currentBackground})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundAttachment: 'fixed'
          }}
        >
          <div className={`absolute inset-0 ${isDarkMode ? 'bg-gradient-to-t from-black/80 via-black/50 to-black/30' : 'bg-gradient-to-t from-black/60 via-black/30 to-transparent'}`}></div>
        </div>

        <div className="relative z-20 h-full max-w-7xl mx-auto px-6 flex items-center gap-8 lg:gap-12">
          <div className="w-full md:w-1/2 text-white animate-fadeIn">
            <div className={`inline-block px-4 py-2 ${isDarkMode ? 'bg-gradient-to-r from-blue-700/30 to-cyan-600/30 border-white/30' : 'bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border-white/20'} backdrop-blur-sm rounded-full border mb-6`}>
              <span className="text-sm font-medium">🎯 SELECTED CATEGORY</span>
            </div>
            
            <h2 className="text-5xl md:text-7xl lg:text-8xl font-bold leading-tight mb-6 tracking-tight">
              EXPLORE <br /> 
              <span className="bg-gradient-to-r from-white via-yellow-200 to-cyan-200 bg-clip-text text-transparent">
                CATEGORIES
              </span>
            </h2>
            
            {selectedCategory && (
              <div className="mb-8">
                <h3 className="text-5xl md:text-6xl lg:text-7xl font-black mb-6 bg-gradient-to-r from-white via-yellow-100 to-cyan-100 bg-clip-text text-transparent drop-shadow-2xl animate-pulse-slow">
                  {selectedCategory.name}
                </h3>
                {selectedCategory.featured && (
                  <span className={`inline-flex items-center ${isDarkMode ? 'bg-gradient-to-r from-yellow-600 via-orange-600 to-yellow-500 border-yellow-400/50' : 'bg-gradient-to-r from-yellow-400 via-orange-400 to-yellow-500 border-yellow-300/50'} text-white px-8 py-3 rounded-full text-lg font-bold shadow-2xl border-2 animate-bounce-slow`}>
                    <span className="mr-2 text-xl">⭐</span>
                    Featured Category
                  </span>
                )}
              </div>
            )}

            <div className="flex items-center gap-6 mt-12 mb-8">
              <div className={`flex items-center gap-3 ${isDarkMode ? 'bg-white/15 border-white/30' : 'bg-white/10 border-white/20'} backdrop-blur-sm px-4 py-2 rounded-full border`}>
                <span className="text-2xl">✨</span>
                <span className="font-semibold">
                  {categories.length} Amazing Categories
                </span>
              </div>
              <div className={`flex items-center gap-3 ${isDarkMode ? 'bg-white/15 border-white/30' : 'bg-white/10 border-white/20'} backdrop-blur-sm px-4 py-2 rounded-full border`}>
                <span className="text-2xl">🏔️</span>
                <span className="font-semibold">
                  {activities.length} Activities
                </span>
              </div>
            </div>

            <div className="mt-8">
              <h3 className="text-white text-xl mb-4 font-semibold">Browse Activities by Time</h3>
              <div className={`relative ${isDarkMode ? 'bg-white/15 border-white/30' : 'bg-white/10 border-white/20'} backdrop-blur-sm rounded-2xl p-4 border`}>
                <div className="absolute left-2 top-1/2 -translate-y-1/2 z-10">
                  <button
                    onClick={scrollTimeLeft}
                    className={`${isDarkMode ? 'bg-gray-800/90 hover:bg-gray-700 text-blue-400' : 'bg-white/90 hover:bg-white text-blue-700'} backdrop-blur-sm p-2 rounded-full shadow-lg transition-all hover:scale-110`}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                </div>
                
                <div className="absolute right-2 top-1/2 -translate-y-1/2 z-10">
                  <button
                    onClick={scrollTimeRight}
                    className={`${isDarkMode ? 'bg-gray-800/90 hover:bg-gray-700 text-blue-400' : 'bg-white/90 hover:bg-white text-blue-700'} backdrop-blur-sm p-2 rounded-full shadow-lg transition-all hover:scale-110`}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
                <div 
                  ref={timeSliderRef}
                  className="overflow-x-auto scrollbar-hide px-10"
                  style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                  <div className="flex space-x-6 py-2">
                    {timeSlots.map((slot, index) => (
                      <button
                        key={slot.id}
                        className={`flex-shrink-0 w-28 p-3 rounded-xl cursor-pointer transition-all duration-300 ${selectedTimeSlot?.id === slot.id ? `${isDarkMode ? 'bg-gradient-to-r from-blue-600 to-cyan-500 ring-white/30' : 'bg-gradient-to-r from-blue-500 to-cyan-400 ring-white/50'} text-white shadow-lg scale-105 ring-2` : `${isDarkMode ? 'bg-white/20 hover:bg-white/30 text-white/90' : 'bg-white/20 hover:bg-white/30 text-white/80'} backdrop-blur-sm hover:scale-105`}`}
                        onClick={() => handleTimeSlotClick(slot)}
                      >
                        <div className="text-center">
                          <div className="text-2xl mb-1">{slot.icon}</div>
                          <div className="text-lg font-bold">{slot.time}</div>
                          <div className="text-xs opacity-90 mt-1">{slot.label}</div>
                          {slot.activities > 0 && (
                            <div className={`text-xs mt-2 px-2 py-0.5 rounded-full ${selectedTimeSlot?.id === slot.id ? 'bg-white/30' : 'bg-white/20'}`}>
                              {slot.activities} activities
                            </div>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex justify-center gap-1 mt-4">
                  {[0, 1, 2, 3].map((dot, index) => (
                    <div
                      key={dot}
                      className={`rounded-full transition-all ${index === 0 ? 'bg-white w-4' : 'bg-white/40'}`}
                    />
                  ))}
                </div>
              </div>
            </div>

            {selectedCategory && (
              <button
                onClick={() => filterActivitiesByCategory(selectedCategory)}
                className={`group relative mt-6 px-10 py-4 ${isDarkMode ? 'bg-gradient-to-r from-green-600 via-emerald-600 to-teal-700 hover:from-green-700 hover:via-emerald-700 hover:to-teal-800' : 'bg-gradient-to-r from-green-500 via-emerald-500 to-teal-600 hover:from-green-600 hover:via-emerald-600 hover:to-teal-700'} text-white rounded-2xl font-bold text-lg transition-all duration-300 shadow-2xl hover:shadow-emerald-500/40 hover:scale-105 overflow-hidden`}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                <span className="relative flex items-center gap-3">
                  <span className="text-2xl">🚀</span>
                  View Activities in {selectedCategory.name}
                  <svg className="w-5 h-5 group-hover:translate-x-2 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </span>
              </button>
            )}
            <div className="mt-10">
              <button
                onClick={() => router.push('/')}
                className={`group flex items-center space-x-3 px-6 py-3 ${isDarkMode ? 'bg-gradient-to-r from-white/20 to-white/10 border-white/30 hover:from-white/30 hover:to-white/20 hover:border-white/50' : 'bg-gradient-to-r from-white/20 to-white/10 border-white/30 hover:from-white/30 hover:to-white/20 hover:border-white/50'} backdrop-blur-sm text-white rounded-xl transition-all duration-300 border`}
              >
                <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                <span className="font-medium">Return to Home Page</span>
              </button>
            </div>
          </div>

          <div className="w-full md:w-1/2 h-[520px] relative">
            <button
              onClick={scrollLeft}
              disabled={!canScrollLeft}
              className={`absolute left-4 top-1/2 -translate-y-1/2 z-30 p-4 rounded-full shadow-2xl transition-all duration-300 ${canScrollLeft ? `${isDarkMode ? 'bg-gradient-to-r from-gray-800 to-gray-700 text-blue-400 hover:from-gray-700 hover:to-gray-600 hover:text-blue-300' : 'bg-gradient-to-r from-white to-blue-50 text-blue-700 hover:from-blue-50 hover:to-white hover:text-blue-800'} shadow-lg hover:scale-110 cursor-pointer` : `${isDarkMode ? 'bg-gray-900/50 text-white/30' : 'bg-white/30 text-white/50'} cursor-not-allowed`}`}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            <div className="relative h-full flex items-center">
              <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-black/60 via-transparent to-transparent z-20 pointer-events-none" />
              <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-black/60 via-transparent to-transparent z-20 pointer-events-none" />

              <div
                ref={sliderRef}
                className="flex gap-8 overflow-x-auto scrollbar-hide py-8 px-12 snap-x snap-mandatory"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              >
                {categories.map((category, index) => (
                  <div
                    key={category.id}
                    onClick={() => handleCategoryClick(category)}
                    className={`group flex-shrink-0 w-[320px] cursor-pointer rounded-3xl overflow-hidden transition-all duration-500 transform snap-center ${selectedCategory?.id === category.id ? 'scale-105 shadow-2xl ring-4 ring-yellow-400/50' : 'scale-95 shadow-xl hover:scale-100 hover:shadow-2xl'}`}
                  >
                    <div className="relative h-56">
                      <img
                        src={category.imageUrl || '/images/default-category.jpg'}
                        alt={category.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                      
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                      <div className="absolute top-4 right-4 flex gap-2">
                        {category.featured && (
                          <span className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black px-3 py-1.5 rounded-full text-xs font-bold shadow-lg">
                            ⭐ Featured
                          </span>
                        )}
                        <span className="bg-black/70 text-white w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold backdrop-blur-sm">
                          {index + 1}
                        </span>
                      </div>
                      
                      <div className="absolute bottom-4 left-4 right-4">
                        <h3 className="text-2xl font-bold text-white mb-1">{category.name}</h3>
                        <div className="h-1 w-12 bg-gradient-to-r from-yellow-400 to-cyan-400 rounded-full mb-2"></div>
                      </div>
                    </div>
                    
                    <div className={`p-6 ${isDarkMode ? 'bg-gradient-to-b from-gray-800 to-gray-900' : 'bg-gradient-to-b from-white to-blue-50'}`}>
                      <p className={`text-sm leading-relaxed mb-4 line-clamp-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                        {category.description}
                      </p>
                      
                      <div className="flex justify-between items-center">
                        <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          {activities.filter(a => 
                            a.categoryId === category.id || 
                            a.category?.toLowerCase() === category.name.toLowerCase()
                          ).length} activities
                        </span>
                        
                        {selectedCategory?.id === category.id && (
                          <span className={`flex items-center gap-2 font-semibold ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                            <div className={`w-2 h-2 rounded-full animate-ping ${isDarkMode ? 'bg-blue-500' : 'bg-blue-500'}`}></div>
                            Selected
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={scrollRight}
              disabled={!canScrollRight}
              className={`absolute right-4 top-1/2 -translate-y-1/2 z-30 p-4 rounded-full shadow-2xl transition-all duration-300 ${canScrollRight ? `${isDarkMode ? 'bg-gradient-to-r from-gray-800 to-gray-700 text-blue-400 hover:from-gray-700 hover:to-gray-600 hover:text-blue-300' : 'bg-gradient-to-r from-white to-blue-50 text-blue-700 hover:from-blue-50 hover:to-white hover:text-blue-800'} shadow-lg hover:scale-110 cursor-pointer` : `${isDarkMode ? 'bg-gray-900/50 text-white/30' : 'bg-white/30 text-white/50'} cursor-not-allowed`}`}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>

            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2 z-30">
              {categories.map((_, index) => (
                <div
                  key={index}
                  className={`rounded-full transition-all duration-300 ${selectedCategory?.id === categories[index]?.id ? 'bg-gradient-to-r from-yellow-400 to-orange-400 w-10 h-2' : 'bg-white/50 w-2 h-2 hover:bg-white/80'}`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {showActivities && (
        <section id="activities-section" className={`py-20 ${isDarkMode ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' : 'bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50'}`}>
          <div className="max-w-7xl mx-auto px-6">
            <div className="mb-8 flex justify-start">
              <button
                onClick={handleBackToCategories}
                className={`flex items-center gap-2 px-4 py-2 ${isDarkMode ? 'bg-gray-800 hover:bg-gray-700 text-gray-300' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'} rounded-lg transition-colors`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to Categories
              </button>
            </div>
            
            <div className="text-center mb-16">
              <div className={`inline-block px-6 py-2 ${isDarkMode ? 'bg-gradient-to-r from-blue-900/30 to-cyan-900/30 text-blue-300' : 'bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-700'} rounded-full mb-6`}>
                <span className="font-semibold">🎯 ACTIVITIES</span>
              </div>
              <h2 className={`text-4xl md:text-5xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Discover <span className={`bg-gradient-to-r ${isDarkMode ? 'from-blue-400 to-cyan-300' : 'from-blue-600 to-cyan-500'} bg-clip-text text-transparent`}>
                  {selectedCategory?.name}
                </span> Experiences
              </h2>
              <p className={`text-lg max-w-2xl mx-auto ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Handpicked adventures for unforgettable moments in {selectedCategory?.name.toLowerCase()}
              </p>
              <div className={`mt-4 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                <span className={`px-4 py-2 ${isDarkMode ? 'bg-gray-800 text-gray-300' : 'bg-white text-gray-700'} rounded-full shadow-sm`}>
                  {filteredActivities.length} amazing activities found
                </span>
              </div>
            </div>

            <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredActivities.map((activity) => {
                const mainImage = getFullImageUrl(activity.images?.[0]) || DEFAULT_IMAGES[0];
                
                const now = new Date();
                const startDate = new Date(activity.startDate);
                const endDate = new Date(activity.endDate);
                const isActive = startDate <= now && endDate >= now;
                const isUpcoming = startDate > now;
                const isExpired = endDate < now;
                
              
                const statusInfo = getActivityStatus(activity);
                
                return (
                  <div key={activity.id} className={`group rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-500 hover:scale-[1.02] ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'} border`}>
                    <div className="relative h-56 overflow-hidden">
                      <img
                        src={mainImage}
                        alt={activity.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        onError={(e) => {
                          const randomImage = DEFAULT_IMAGES[Math.floor(Math.random() * DEFAULT_IMAGES.length)];
                          e.currentTarget.src = randomImage;
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                      {userId && (
                        <div className="absolute top-4 right-4 z-10">
                          <SaveButton
                            activityId={activity.id}
                            userId={userId}
                            size="small"
                            onSaveChange={(saved) => {
                              console.log(`Activity ${activity.name} ${saved ? 'saved' : 'unsaved'}`);
                            }}
                          />
                        </div>
                      )}
                      <div className={`absolute top-4 left-4 ${isDarkMode ? 'bg-gradient-to-r from-green-600 to-emerald-700' : 'bg-gradient-to-r from-green-500 to-emerald-600'} text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg`}>
                        ${activity.price}
                      </div>
                      
                      <div className="absolute bottom-4 left-4">
                        <span className={`px-3 py-1.5 rounded-full text-xs font-bold shadow-lg ${statusInfo.bgColor} text-white flex items-center gap-1`}>
                          <span>{statusInfo.icon}</span>
                          {statusInfo.text}
                        </span>
                      </div>
                      
                    
                      {activity.status === 'Delayed' && (
                        <div className="absolute top-4 left-1/2 transform -translate-x-1/2">
                          <div className={`px-3 py-1.5 rounded-full backdrop-blur-sm ${isDarkMode ? 'bg-purple-900/80 text-purple-200' : 'bg-purple-800/90 text-white'} text-xs font-bold shadow-lg flex items-center gap-1`}>
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                            </svg>
                            RESCHEDULED
                          </div>
                        </div>
                      )}
                      
                      {/* Date badge */}
                      <div className={`absolute bottom-4 right-4 ${isDarkMode ? 'bg-gray-900/80' : 'bg-black/70'} backdrop-blur-sm text-white px-3 py-1.5 rounded-full text-xs`}>
                        {new Date(activity.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </div>
                    </div>
                    <div className="p-6">
                      <h3 className={`text-xl font-bold mb-3 group-hover:text-blue-600 transition-colors line-clamp-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {activity.name}
                      </h3>
                      
                    
                      {activity.status === 'Delayed' && (
                        <div className={`mb-4 p-3 rounded-lg ${isDarkMode ? 'bg-purple-900/30 border border-purple-700/50' : 'bg-purple-50 border border-purple-200'}`}>
                          <div className="flex items-start gap-2">
                            <span className={`text-purple-500 ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`}>⏰</span>
                            <div className="flex-1">
                              <p className={`text-sm font-medium ${isDarkMode ? 'text-purple-200' : 'text-purple-700'}`}>
                                This activity has been rescheduled
                              </p>
                              {activity.delayedDate && (
                                <p className={`text-xs mt-1 ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`}>
                                  Delayed on: {new Date(activity.delayedDate).toLocaleDateString()}
                                </p>
                              )}
                              {(activity.rescheduledStartDate || activity.rescheduledEndDate) && (
                                <div className="mt-2 text-xs">
                                  {activity.rescheduledStartDate && (
                                    <p className={`${isDarkMode ? 'text-amber-300' : 'text-amber-600'}`}>
                                      • New start: {new Date(activity.rescheduledStartDate).toLocaleDateString()}
                                    </p>
                                  )}
                                  {activity.rescheduledEndDate && (
                                    <p className={`${isDarkMode ? 'text-emerald-300' : 'text-emerald-600'}`}>
                                      • New end: {new Date(activity.rescheduledEndDate).toLocaleDateString()}
                                    </p>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {/* Dates */}
                      <div className={`mb-4 text-sm space-y-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                        <div className="flex items-center gap-2">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isDarkMode ? 'bg-blue-900/50' : 'bg-blue-100'}`}>
                            <svg className={`w-4 h-4 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                          <div>
                            <div className={`font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                              {activity.status === 'Delayed' && activity.rescheduledStartDate ? (
                                <>
                                  <span className="line-through text-gray-500 mr-2">
                                    {new Date(activity.startDate).toLocaleDateString()}
                                  </span>
                                  <span className="text-amber-600">→ {new Date(activity.rescheduledStartDate).toLocaleDateString()}</span>
                                </>
                              ) : (
                                `Start: ${new Date(activity.startDate).toLocaleDateString()}`
                              )}
                            </div>
                            <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                              {formatTime(activity.status === 'Delayed' && activity.rescheduledStartDate ? activity.rescheduledStartDate : activity.startDate)}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isDarkMode ? 'bg-red-900/50' : 'bg-red-100'}`}>
                            <svg className={`w-4 h-4 ${isDarkMode ? 'text-red-400' : 'text-red-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                          <div>
                            <div className={`font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                              {activity.status === 'Delayed' && activity.rescheduledEndDate ? (
                                <>
                                  <span className="line-through text-gray-500 mr-2">
                                    {new Date(activity.endDate).toLocaleDateString()}
                                  </span>
                                  <span className="text-emerald-600">→ {new Date(activity.rescheduledEndDate).toLocaleDateString()}</span>
                                </>
                              ) : (
                                `End: ${new Date(activity.endDate).toLocaleDateString()}`
                              )}
                            </div>
                            <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                              {formatTime(activity.status === 'Delayed' && activity.rescheduledEndDate ? activity.rescheduledEndDate : activity.endDate)}
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Location */}
                      <div className={`flex items-center mb-6 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                        <svg className={`w-5 h-5 mr-2 ${isDarkMode ? 'text-blue-400' : 'text-blue-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span className="text-sm truncate">{activity.location}</span>
                      </div>
                      
                      <div className={`flex justify-between items-center pt-4 ${isDarkMode ? 'border-gray-700' : 'border-gray-100'} border-t`}>
                        <div className={`text-2xl font-bold ${isDarkMode ? 'bg-gradient-to-r from-green-400 to-emerald-400' : 'bg-gradient-to-r from-green-600 to-emerald-600'} bg-clip-text text-transparent`}>
                          ${activity.price}
                          <span className={`text-sm font-normal ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>/person</span>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (!activity.id) {
                                alert('Activity ID is missing');
                                return;
                              }
                              router.push(`/tourist/activities/${activity.id}`);
                            }}
                            className={`px-4 py-2 ${isDarkMode ? 'bg-gradient-to-r from-blue-700 to-indigo-700 hover:from-blue-600 hover:to-indigo-600' : 'bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700'} text-white rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-blue-500/30 hover:scale-105 flex items-center gap-2`}
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                            View
                          </button>
                          
                          {user && activity.providerId && activity.providerId !== 'DEBUG_NO_PROVIDER_ID' && activity.providerName !== 'Unknown Provider' && (
                            <ContactButton
                              currentUserId={user.id}
                              otherUserId={activity.providerId}
                              currentUserName={user.fullName || user.username || 'User'}
                              otherUserName={activity.providerName}
                              activityId={activity.id}
                              activityName={activity.name}
                              variant="icon"
                              size="sm"
                            />
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="text-center mt-16 flex flex-col sm:flex-row justify-center gap-4">
              <button
                onClick={handleBackToCategories}
                className={`group px-8 py-3.5 ${isDarkMode ? 'bg-gradient-to-r from-gray-700 to-gray-800 hover:from-gray-600 hover:to-gray-700' : 'bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800'} text-white rounded-xl transition-all duration-300 shadow-lg hover:shadow-gray-500/30 hover:scale-105 flex items-center justify-center gap-3`}
              >
                <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to Categories
              </button>
              
              <button
                onClick={() => router.push('/')}
                className={`group px-8 py-3.5 ${isDarkMode ? 'bg-gradient-to-r from-blue-700 to-cyan-600 hover:from-blue-600 hover:to-cyan-500' : 'bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600'} text-white rounded-xl transition-all duration-300 shadow-lg hover:shadow-blue-500/30 hover:scale-105 flex items-center justify-center gap-3`}
              >
                <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                Return to Home
              </button>
            </div>
          </div>
        </section>
      )}
      <footer className={`${isDarkMode ? 'bg-gradient-to-r from-gray-900 to-gray-800 border-gray-700' : 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-100'} border-t py-8`}>
        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            © 2024 TourismHub. All rights reserved. • 
            <a href="#" className={`ml-2 ${isDarkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-800'}`}>Privacy Policy</a> • 
            <a href="#" className={`ml-2 ${isDarkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-800'}`}>Terms of Service</a>
          </div>
        </div>
      </footer>

      <style jsx>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse-slow {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.9; transform: scale(1.02); }
        }
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        .animate-fadeIn {
          animation: fadeIn 1s ease-out;
        }
        .animate-pulse-slow {
          animation: pulse-slow 3s ease-in-out infinite;
        }
        .animate-bounce-slow {
          animation: bounce-slow 2s ease-in-out infinite;
        }
        
        .categories-scroll {
          scroll-margin-top: 80px;
        }
        
        #categories-section {
          min-height: 100vh;
          position: relative;
        }
        
       
        @keyframes delayedPulse {
          0% { box-shadow: 0 0 0 0 rgba(168, 85, 247, 0.4); }
          70% { box-shadow: 0 0 0 10px rgba(168, 85, 247, 0); }
          100% { box-shadow: 0 0 0 0 rgba(168, 85, 247, 0); }
        }
        
        .delayed-pulse {
          animation: delayedPulse 2s infinite;
        }
        
        * {
          transition: background-color 0.3s ease, border-color 0.3s ease, color 0.3s ease;
        }
      `}</style>
    </div>
  );
}