// app/tourist/activities/page.tsx
'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { SaveButton } from '@/components/SaveButton';
import ContactButton from '@/components/ContactButton';

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

  const fetchActivitiesWithImages = async () => {
    try {
      setError(null);
      setLoading(true);
      
      console.log('Fetching activities from:', `${API_BASE_URL}/activities`);
      
      const response = await fetch(`${API_BASE_URL}/activities`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch activities: ${response.status}`);
      }
      
      const activitiesData = await response.json();
      
      console.log('Raw activities data from API:', activitiesData);

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
            
            // Sigurohu që të kesh providerId - kontrollo mënyra të ndryshme
            let providerId = activity.providerId;

            // Kontrollo nëse provider ekziston dhe ka ID
            if (!providerId && activity.provider) {
              // Provoni çelësa të ndryshëm
              providerId = activity.provider.id || 
                           activity.provider.userId || 
                           activity.provider.userID ||
                           activity.provider.Id;
            }

            // Për providerName
            let providerName = activity.providerName;
            if (!providerName && activity.provider) {
              providerName = activity.provider.fullName || 
                             activity.provider.name || 
                             activity.provider.FullName ||
                             activity.provider.UserName ||
                             activity.provider.username ||
                             'Unknown Provider';
            }

            // Nëse ende nuk ka providerId, provo me inspect të thellë
            if (!providerId && activity.provider) {
              // Provoni të gjeni ID në çdo vend të mundshëm
              const possibleKeys = ['id', 'userId', 'userID', 'Id', 'ID', 'providerId'];
              for (const key of possibleKeys) {
                if (activity.provider[key]) {
                  providerId = activity.provider[key];
                  break;
                }
              }
            }

            // Nëse ende nuk ka providerId, vendos një vlerë të kushtëzuar për debug
            if (!providerId) {
              console.warn(`No providerId found for activity: ${activity.name}`);
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
              included: [],
              requirements: [],
              quickFacts: [],
              rating: 4.8,
              reviews: 124
            };
          }
        })
      );

      console.log('Final activities with images:', activitiesWithImages.map(a => ({
        id: a.id,
        name: a.name,
        providerId: a.providerId,
        providerName: a.providerName,
        hasProviderId: !!a.providerId
      })));

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

    console.log('User data from localStorage:', userData);
    console.log('Token from localStorage:', token ? 'Exists' : 'Missing');

    if (!userData || !token) {
      router.push('/');
      return;
    }

    const parsedUser = JSON.parse(userData);
    console.log('Parsed user object:', parsedUser);
    
    setUserId(parsedUser.id);
    setUser(parsedUser);
    
    if (parsedUser.role !== 'Tourist') {
      if (parsedUser.role === 'Admin') {
        router.push('/admin');
      } else if (parsedUser.role === 'Provider') {
        router.push('/provider/dashboard');
      }
      return;
    }

    fetchActivitiesWithImages();
    fetchCategories();
  }, [router]);

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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {error && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded shadow-lg">
          <div className="flex items-center">
            <span className="mr-2">⚠️</span>
            <span>{error}</span>
            <button 
              onClick={() => setError(null)}
              className="ml-auto text-red-500 hover:text-red-700"
            >
              ×
            </button>
          </div>
        </div>
      )}

      <header className="fixed top-0 left-0 right-0 bg-white shadow-sm border-b z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Explore Activities</h1>
              <p className="text-gray-600">Welcome to TourismHub!</p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/tourist/profile')}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                Go to Dashboard
              </button>
              <button
                onClick={() => {
                  localStorage.removeItem('token');
                  localStorage.removeItem('user');
                  window.location.href = '/';
                }}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <section className="relative w-full h-screen overflow-hidden pt-20">
        <img
          src={currentBackground}
          className="absolute inset-0 w-full h-full object-cover transition-all duration-1000 ease-in-out"
          alt="Category background"
        />
        <div className="absolute inset-0 bg-black/40 transition-all duration-700"></div>

        <div className="relative z-20 h-full max-w-7xl mx-auto px-6 flex items-center gap-12">
          <div className="w-full md:w-1/2 text-white animate-fadeIn">
            <h2 className="text-6xl font-bold leading-tight mb-6">
              EXPLORE <br /> CATEGORIES
            </h2>
            
            {selectedCategory && (
              <div className="mb-8">
                <h3 className="text-6xl font-black mb-6 text-transparent bg-clip-text bg-gradient-to-r from-white via-yellow-200 to-white drop-shadow-2xl [text-shadow:_0_4px_8px_rgba(0,0,0,0.8)] animate-pulse-slow">
                  {selectedCategory.name}
                </h3>
                {selectedCategory.featured && (
                  <span className="inline-flex items-center bg-gradient-to-r from-yellow-400 to-orange-500 text-black px-8 py-4 rounded-full text-xl font-bold shadow-2xl mt-6 border-2 border-yellow-300">
                    ⭐ Featured Category
                  </span>
                )}
              </div>
            )}

            <div className="flex items-center gap-4 text-white/80 mt-16">
              <span className="text-2xl font-semibold [text-shadow:_0_2px_4px_rgba(0,0,0,0.7)] bg-gradient-to-r from-white to-yellow-200 bg-clip-text text-transparent">
                ✨ {categories.length} amazing categories available
              </span>
            </div>

            {selectedCategory && (
              <button
                onClick={() => filterActivitiesByCategory(selectedCategory)}
                className="mt-8 px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-2xl font-bold text-lg hover:from-green-600 hover:to-emerald-700 transition-all duration-300 shadow-2xl hover:shadow-green-500/25 hover:scale-105"
              >
                🏔️ View Activities in {selectedCategory.name}
              </button>
            )}

            {selectedCategory && (
              <div className="mt-4 text-white/70">
                <span className="text-sm">
                  {filteredActivities.length} activities available in this category
                </span>
              </div>
            )}
          </div>

          <div className="w-full md:w-1/2 h-[500px] relative">
            <button
              onClick={scrollLeft}
              disabled={!canScrollLeft}
              className={`absolute left-4 top-1/2 -translate-y-1/2 z-20 p-4 rounded-full shadow-2xl transition-all duration-300 ${
                canScrollLeft 
                  ? 'bg-white/90 hover:bg-white text-gray-800 hover:scale-110 cursor-pointer' 
                  : 'bg-white/50 text-gray-400 cursor-not-allowed'
              }`}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            <div className="relative h-full flex items-center">
              <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-black/50 to-transparent z-10 pointer-events-none" />
              <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-black/50 to-transparent z-10 pointer-events-none" />

              <div
                ref={sliderRef}
                className="flex gap-8 overflow-x-auto scrollbar-hide py-8 px-12 snap-x snap-mandatory"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              >
                {categories.map((category, index) => (
                  <div
                    key={category.id}
                    onClick={() => handleCategoryClick(category)}
                    className={`flex-shrink-0 w-80 cursor-pointer rounded-3xl overflow-hidden transition-all duration-500 transform snap-center ${
                      selectedCategory?.id === category.id
                        ? 'scale-105 shadow-2xl ring-4 ring-yellow-400'
                        : 'scale-95 shadow-xl hover:scale-100'
                    }`}
                  >
                    <div className="relative h-48 group">
                      <img
                        src={category.imageUrl || '/images/default-category.jpg'}
                        alt={category.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                      
                      <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-all duration-300" />
                      
                      {category.featured && (
                        <span className="absolute top-4 right-4 bg-gradient-to-r from-yellow-400 to-orange-500 text-black px-3 py-1 rounded-full text-xs font-bold shadow-lg backdrop-blur-sm">
                          ⭐ Featured
                        </span>
                      )}
                      
                      <div className="absolute top-4 left-4 bg-black/70 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold backdrop-blur-sm">
                        {index + 1}
                      </div>
                    </div>
                    
                    <div className="p-6 bg-white">
                      <h3 className={`text-xl font-bold mb-2 ${
                        selectedCategory?.id === category.id ? 'text-yellow-600' : 'text-gray-800'
                      }`}>
                        {category.name}
                      </h3>
                      <p className="text-sm text-gray-600 leading-relaxed line-clamp-2">
                        {category.description}
                      </p>
                      
                      <div className="mt-2 text-xs text-gray-500">
                        {activities.filter(a => 
                          a.categoryId === category.id || 
                          a.category?.toLowerCase() === category.name.toLowerCase()
                        ).length} activities
                      </div>
                      
                      {selectedCategory?.id === category.id && (
                        <div className="mt-3 flex items-center justify-center">
                          <div className="w-3 h-3 bg-yellow-400 rounded-full animate-pulse" />
                          <span className="ml-2 text-xs text-yellow-600 font-semibold">Selected</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={scrollRight}
              disabled={!canScrollRight}
              className={`absolute right-4 top-1/2 -translate-y-1/2 z-20 p-4 rounded-full shadow-2xl transition-all duration-300 ${
                canScrollRight 
                  ? 'bg-white/90 hover:bg-white text-gray-800 hover:scale-110 cursor-pointer' 
                  : 'bg-white/50 text-gray-400 cursor-not-allowed'
              }`}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>

            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
              {categories.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    selectedCategory?.id === categories[index]?.id 
                      ? 'bg-yellow-400 w-6' 
                      : 'bg-white/50'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-pink-500/10 mix-blend-overlay" />
      </section>

      {showActivities && (
        <section className="py-16 bg-gradient-to-br from-gray-50 to-blue-50">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Activities in <span className="text-blue-600">{selectedCategory?.name}</span>
              </h2>
              <p className="text-lg text-gray-600">
                Discover amazing {selectedCategory?.name.toLowerCase()} experiences
              </p>
              <div className="mt-2 text-sm text-gray-500">
                {filteredActivities.length} activities found
              </div>
            </div>

            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredActivities.map((activity) => {
                const mainImage = getFullImageUrl(activity.images?.[0]) || DEFAULT_IMAGES[0];
                
                const now = new Date();
                const startDate = new Date(activity.startDate);
                const endDate = new Date(activity.endDate);
                const isActive = startDate <= now && endDate >= now;
                const isUpcoming = startDate > now;
                const isExpired = endDate < now;
                
                return (
                  <div key={activity.id} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 hover:scale-105">
                    <div className="relative h-48">
                      <img
                        src={mainImage}
                        alt={activity.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const randomImage = DEFAULT_IMAGES[Math.floor(Math.random() * DEFAULT_IMAGES.length)];
                          e.currentTarget.src = randomImage;
                        }}
                      />
                      
                      {/* Save Button */}
                      {userId && (
                        <div className="absolute top-2 right-2">
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
                      
                      <div className="absolute top-4 right-4 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                        ${activity.price}
                      </div>
                      <div className="absolute bottom-4 left-4 bg-black/70 text-white px-3 py-1 rounded-full text-sm">
                        {activity.availableSlots} slots left
                      </div>
                      
                      {/* Status Badge */}
                      <div className="absolute top-4 left-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                          isExpired ? 'bg-red-500 text-white' :
                          isActive ? 'bg-green-500 text-white' :
                          isUpcoming ? 'bg-yellow-500 text-black' :
                          'bg-gray-500 text-white'
                        }`}>
                          {isExpired ? 'Expired' : isActive ? 'Active' : isUpcoming ? 'Upcoming' : activity.status}
                        </span>
                      </div>
                      
                      {/* Date Badge */}
                      <div className="absolute bottom-4 right-4 bg-black/70 text-white px-2 py-1 rounded-full text-xs">
                        {new Date(activity.startDate).toLocaleDateString()}
                      </div>
                    </div>
                    
                    <div className="p-6">
                      <h3 className="text-xl font-bold text-gray-900 mb-2">{activity.name}</h3>
                      
                      {/* Date Info */}
                      <div className="mb-3 text-sm text-gray-600 space-y-1">
                        <div className="flex items-center">
                          <svg className="w-4 h-4 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <span>Start: {new Date(activity.startDate).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center">
                          <svg className="w-4 h-4 mr-2 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <span>End: {new Date(activity.endDate).toLocaleDateString()}</span>
                        </div>
                      </div>
                      
                      {/* Location */}
                      <div className="flex items-center text-gray-600 mb-4">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span className="text-sm">{activity.location}</span>
                      </div>
                      
                      {/* Price and Buttons */}
                      <div className="flex justify-between items-center mt-4">
                        <div className="text-lg font-bold text-green-600">
                          ${activity.price}
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (!activity.id) {
                                alert('Activity ID is missing');
                                return;
                              }
                              router.push(`/tourist/activities/${activity.id}`);
                            }}
                            className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full font-semibold hover:from-blue-600 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-blue-500/25"
                          >
                            See More
                          </button>
                          
                          {/* BUTONI I KONTRAKTIMIT - TASHMË I NJËJTË SI NË [id]/page.tsx */}
                         {/* BUTONI I KONTRAKTIMIT - TASHMË I NJËJTË SI NË [id]/page.tsx */}
{user && activity.providerId && activity.providerId !== 'DEBUG_NO_PROVIDER_ID' && activity.providerName !== 'Unknown Provider' && (
  <ContactButton
    currentUserId={user.id}
    otherUserId={activity.providerId}
    currentUserName={user.fullName || user.username || 'User'}
    otherUserName={activity.providerName}
    activityId={activity.id}
    activityName={activity.name}
    variant="icon" // Përputhet me ikonën e vogël
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
            
            <div className="text-center mt-12">
              <button
                onClick={() => setShowActivities(false)}
                className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                ← Back to Categories
              </button>
            </div>
          </div>
        </section>
      )}

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
          0%, 100% { opacity: 1; }
          50% { opacity: 0.9; }
        }
        .animate-fadeIn {
          animation: fadeIn 1s ease-out;
        }
        .animate-pulse-slow {
          animation: pulse-slow 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}