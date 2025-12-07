// components/Home.tsx
'use client';
import React, { useState, useEffect, useRef } from 'react';
import { Search, TrendingUp, Shield, Award, ChevronRight, ChevronLeft, Compass, MapPin, Clock, Users, Star, User } from 'lucide-react';

interface Activity {
  id: string;
  name: string;
  description: string;
  price: number;
  availableSlots: number;
  location: string;
  category: string;
  providerName: string;
  duration: string;
  images: string[];
  status: string;
}

interface Category {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  featured: boolean;
}

interface HomeProps {
  onNavigate: (page: string, data?: any) => void;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5224/api';

interface ActivityHotspot {
  id: string;
  name: string;
  icon: string;
  position: { x: number; y: number };
  angle: number;
}

interface Viewer360Props {
  onActivitySelect: (activityId: string) => void;
}

function Viewer360({ onActivitySelect }: Viewer360Props) {
  const [rotation, setRotation] = useState(0);
  const [isAutoRotating, setIsAutoRotating] = useState(true);
  const [hoveredHotspot, setHoveredHotspot] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);

  const hotspots: ActivityHotspot[] = [
    { id: '1', name: 'Coastal Helicopter Tour', icon: '🚁', position: { x: 50, y: 30 }, angle: 0 },
    { id: '2', name: 'Island Hopping', icon: '🏝️', position: { x: 50, y: 40 }, angle: 60 },
    { id: '3', name: 'Mountain Hiking', icon: '⛰️', position: { x: 50, y: 50 }, angle: 120 },
    { id: '4', name: 'Scuba Diving', icon: '🤿', position: { x: 50, y: 60 }, angle: 180 },
    { id: '5', name: 'Safari Tour', icon: '🦁', position: { x: 50, y: 70 }, angle: 240 },
    { id: '6', name: 'Sunset Sailing', icon: '⛵', position: { x: 50, y: 80 }, angle: 300 },
  ];

  useEffect(() => {
    if (!isAutoRotating || isDragging) return;

    const interval = setInterval(() => {
      setRotation(prev => (prev + 1) % 360);
    }, 50);

    return () => clearInterval(interval);
  }, [isAutoRotating, isDragging]);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setIsAutoRotating(false);
    setStartX(e.clientX);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    setIsAutoRotating(false);
    setStartX(e.touches[0].clientX);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    
    const deltaX = e.clientX - startX;
    const sensitivity = 1.5;
    setRotation(prev => (prev - deltaX * sensitivity + 360) % 360);
    setStartX(e.clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    
    const deltaX = e.touches[0].clientX - startX;
    const sensitivity = 1.5;
    setRotation(prev => (prev - deltaX * sensitivity + 360) % 360);
    setStartX(e.touches[0].clientX);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  const handleRotateLeft = () => {
    setIsAutoRotating(false);
    setRotation(prev => (prev - 45 + 360) % 360);
  };

  const handleRotateRight = () => {
    setIsAutoRotating(false);
    setRotation(prev => (prev + 45) % 360);
  };

  const handleHotspotClick = (activityId: string) => {
    onActivitySelect(activityId);
  };

  const calculateHotspotPosition = (hotspot: ActivityHotspot) => {
    const totalAngle = (hotspot.angle + rotation) % 360;
    const radians = (totalAngle * Math.PI) / 180;
    
    const orbitRadius = 35;
    const centerX = 50;
    const centerY = 50;
    
    const x = centerX + orbitRadius * Math.cos(radians);
    const y = centerY + orbitRadius * Math.sin(radians);
    
    return { x, y, angle: totalAngle };
  };

  return (
    <div 
      className="relative w-full h-screen bg-gradient-to-b from-cyan-100 to-blue-200 overflow-hidden cursor-grab active:cursor-grabbing"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2021&q=80')`,
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/40"></div>
      </div>

      <div className="relative h-full flex items-center justify-center">
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center z-10 pointer-events-none">
          <div className="mb-4">
            <Compass className="w-16 h-16 text-white mx-auto mb-4 animate-pulse" />
          </div>
          <h1 className="text-white text-8xl mb-4" style={{ textShadow: '0 4px 20px rgba(0,0,0,0.5)' }}>
            360°
          </h1>
          <h2 className="text-white text-4xl mb-2" style={{ textShadow: '0 4px 20px rgba(0,0,0,0.5)' }}>
            Explore Adventures
          </h2>
          <p className="text-white/90 text-xl" style={{ textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}>
            {isDragging ? 'Drag to rotate activities' : 'Activities orbit around you'}
          </p>
        </div>

        {hotspots.map((hotspot) => {
          const { x, y, angle } = calculateHotspotPosition(hotspot);
          const isVisible = angle > 45 && angle < 315;
          const scale = 1 - Math.abs(180 - angle) / 360;
          const opacity = Math.max(0.3, scale);

          return (
            <button
              key={hotspot.id}
              className="absolute z-20 transform -translate-x-1/2 -translate-y-1/2 transition-all duration-300 hover:scale-125 group"
              style={{
                left: `${x}%`,
                top: `${y}%`,
                opacity: isVisible ? opacity : 0,
                pointerEvents: isVisible ? 'auto' : 'none',
                transform: `translate(-50%, -50%) scale(${scale}) rotate(${-rotation}deg)`,
              }}
              onClick={() => handleHotspotClick(hotspot.id)}
              onMouseEnter={() => {
                setHoveredHotspot(hotspot.id);
                setIsAutoRotating(false);
              }}
              onMouseLeave={() => setHoveredHotspot(null)}
            >
              <div className="absolute inset-0 -m-4 rounded-full bg-blue-400/30 animate-ping"></div>
              
              <div className="relative bg-white/95 backdrop-blur-sm rounded-full w-16 h-16 flex items-center justify-center shadow-2xl border-4 border-white group-hover:border-blue-400 transition-all">
                <span className="text-2xl">{hotspot.icon}</span>
              </div>

              <div className={`absolute top-full mt-3 left-1/2 transform -translate-x-1/2 whitespace-nowrap transition-all duration-300 ${
                hoveredHotspot === hotspot.id ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
              }`}>
                <div className="bg-white/95 backdrop-blur-sm px-3 py-2 rounded-full shadow-xl border border-gray-200">
                  <p className="text-xs text-gray-900 font-semibold">{hotspot.name}</p>
                </div>
              </div>

              <div 
                className="absolute top-1/2 left-1/2 w-32 h-0.5 bg-white/30 transform -translate-x-1/2 -translate-y-1/2 origin-left pointer-events-none"
                style={{
                  transform: `translate(-50%, -50%) rotate(${angle}deg)`,
                  width: '100px'
                }}
              />
            </button>
          );
        })}

        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-32 rounded-full bg-white/20 backdrop-blur-sm border-4 border-white/40 flex items-center justify-center z-10">
          <div className="text-white text-center">
            <Compass className="w-8 h-8 mx-auto mb-1" />
            <span className="text-xs font-semibold">YOU</span>
          </div>
        </div>

        <button
          onClick={handleRotateLeft}
          className="absolute left-8 top-1/2 transform -translate-y-1/2 z-30 bg-white/90 backdrop-blur-sm hover:bg-white p-4 rounded-full shadow-xl transition-all hover:scale-110"
        >
          <ChevronLeft className="w-8 h-8 text-gray-800" />
        </button>

        <button
          onClick={handleRotateRight}
          className="absolute right-8 top-1/2 transform -translate-y-1/2 z-30 bg-white/90 backdrop-blur-sm hover:bg-white p-4 rounded-full shadow-xl transition-all hover:scale-110"
        >
          <ChevronRight className="w-8 h-8 text-gray-800" />
        </button>

        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-30 flex items-center gap-4">
          <button
            onClick={() => setIsAutoRotating(!isAutoRotating)}
            className="bg-white/90 backdrop-blur-sm hover:bg-white px-6 py-3 rounded-full shadow-xl transition-all hover:scale-105"
          >
            {isAutoRotating ? '⏸️ Pause Orbit' : '▶️ Start Orbit'}
          </button>
          
          <div className="bg-white/90 backdrop-blur-sm px-6 py-3 rounded-full shadow-xl flex items-center gap-2">
            <Compass className="w-5 h-5 text-blue-600" />
            <span className="text-sm font-semibold">{Math.round(rotation)}°</span>
          </div>
        </div>

        <div className="absolute top-8 right-8 z-30 bg-white/90 backdrop-blur-sm px-6 py-4 rounded-2xl shadow-xl">
          <div className="flex items-center gap-3">
            <MapPin className="w-6 h-6 text-blue-600" />
            <div>
              <p className="text-sm text-gray-600">Orbiting Activities</p>
              <p className="text-2xl text-gray-900 font-bold">{hotspots.length}</p>
            </div>
          </div>
        </div>

        <div className="absolute top-8 left-8 z-30 bg-white/90 backdrop-blur-sm px-6 py-4 rounded-2xl shadow-xl">
          <div className="text-sm text-gray-600 max-w-xs">
            <p className="font-semibold mb-2">🌍 Orbital Explorer:</p>
            <p>• <strong>Drag</strong> to rotate activities around you</p>
            <p>• <strong>Click arrows</strong> for 45° turns</p>
            <p>• <strong>Click activities</strong> to explore</p>
            <p>• Activities orbit at different distances</p>
          </div>
        </div>

        <div className="absolute bottom-24 left-1/2 transform -translate-x-1/2 z-20 animate-bounce">
          <div className="flex flex-col items-center gap-2 text-white">
            <p className="text-sm" style={{ textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}>
              Scroll to explore more
            </p>
            <ChevronRight className="w-6 h-6 rotate-90" />
          </div>
        </div>
      </div>

      {isDragging && (
        <div className="absolute inset-0 flex items-center justify-center z-40 pointer-events-none">
          <div className="bg-black/50 text-white px-4 py-2 rounded-full backdrop-blur-sm">
            Rotating Orbit... {Math.round(rotation)}°
          </div>
        </div>
      )}

      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none">
        <div 
          className="absolute border-2 border-white/20 rounded-full"
          style={{
            width: '70vh',
            height: '70vh',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)'
          }}
        />
        
        <div 
          className="absolute border-2 border-white/10 rounded-full"
          style={{
            width: '50vh',
            height: '50vh',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)'
          }}
        />
      </div>
    </div>
  );
}

interface ActivityExplorerProps {
  onCategorySelect: (category: string) => void;
}

function ActivityExplorer({ onCategorySelect }: ActivityExplorerProps) {
  const [currentSlide, setCurrentSlide] = useState(0);

  const categories = [
    {
      id: 'beach',
      title: 'Beach',
      image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=500',
    },
    {
      id: 'adventure',
      title: 'Adventure',
      image: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=500',
    },
    {
      id: 'mountain',
      title: 'Mountain',
      image: 'https://images.unsplash.com/photo-1501555088652-021faa106b9b?w=500',
    },
    {
      id: 'cultural',
      title: 'Cultural',
      image: 'https://images.unsplash.com/photo-1502602898536-47ad22581b52?w=500',
    },
  ];

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % categories.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + categories.length) % categories.length);
  };

  return (
    <div className="relative w-full h-screen bg-cover bg-center overflow-hidden">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm"></div>

      <div className="relative h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-center">
        <div className="w-full">
          <div className="mb-12 text-center md:text-left">
            <p className="text-white/90 text-xl mb-4 tracking-wider">DISCOVER</p>
            <h1 className="text-white text-6xl md:text-8xl mb-6" style={{ lineHeight: '1.1' }}>
              THE NEW
              <br />
              HORIZON
            </h1>
            <p className="text-white/80 text-lg max-w-md mb-8">
              Explore amazing adventures and create unforgettable memories with our curated experiences.
            </p>
            <button 
              className="bg-white text-gray-900 px-8 py-3 rounded-lg hover:bg-gray-100 transition-colors font-semibold"
              onClick={() => onCategorySelect('all')}
            >
              Explore All Activities
            </button>
          </div>

          <div className="relative">
            <div className="flex gap-6 overflow-hidden">
              {categories.map((category, index) => {
                const position = (index - currentSlide + categories.length) % categories.length;
                const isActive = position === 0;
                const isNext = position === 1;
                const isPrev = position === categories.length - 1;
                const isVisible = isActive || isNext || isPrev;

                return (
                  <div
                    key={category.id}
                    className={`flex-shrink-0 transition-all duration-500 cursor-pointer ${
                      isVisible ? 'opacity-100' : 'opacity-0'
                    } ${
                      isActive ? 'scale-100 z-20' : 'scale-90 z-10'
                    }`}
                    style={{
                      width: '280px',
                      transform: `translateX(${position === 0 ? '0%' : position === 1 ? '10%' : '-10%'})`,
                      display: isVisible ? 'block' : 'none',
                    }}
                    onClick={() => onCategorySelect(category.id)}
                  >
                    <div className="relative h-96 rounded-2xl overflow-hidden group shadow-2xl">
                      <img
                        src={category.image}
                        alt={category.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                      <div className="absolute bottom-0 left-0 right-0 p-6">
                        <h3 className="text-white text-3xl font-bold">{category.title}</h3>
                      </div>
                      
                      <div className="absolute inset-0 bg-blue-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </div>
                  </div>
                );
              })}
            </div>

            <button
              onClick={prevSlide}
              className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-4 bg-white/90 backdrop-blur-sm hover:bg-white p-3 rounded-full shadow-xl transition-all hover:scale-110 z-30"
            >
              <ChevronLeft className="w-6 h-6 text-gray-800" />
            </button>

            <button
              onClick={nextSlide}
              className="absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-4 bg-white/90 backdrop-blur-sm hover:bg-white p-3 rounded-full shadow-xl transition-all hover:scale-110 z-30"
            >
              <ChevronRight className="w-6 h-6 text-gray-800" />
            </button>

            <div className="flex justify-center gap-2 mt-8">
              {categories.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`w-3 h-3 rounded-full transition-all ${
                    index === currentSlide ? 'bg-white w-8' : 'bg-white/50'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function Home({ onNavigate }: HomeProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [activities, setActivities] = useState<Activity[]>([]);
  const [filteredActivities, setFilteredActivities] = useState<Activity[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showExplorer, setShowExplorer] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showCategoriesSection, setShowCategoriesSection] = useState(false);

  const DEFAULT_IMAGES = [
    'https://images.unsplash.com/photo-1501555088652-021faa106b9b?w=500',
    'https://images.unsplash.com/photo-1502602898536-47ad22581b52?w=500',
    'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=500'
  ];

  const getFullImageUrl = (imagePath: string): string => {
    if (!imagePath) {
      return DEFAULT_IMAGES[0];
    }
    
    if (imagePath.startsWith('http')) {
      return imagePath;
    }
    
    if (imagePath.startsWith('/uploads/')) {
      return `http://localhost:5224${imagePath}`;
    }
    
    if (imagePath.includes('.') && !imagePath.includes('/')) {
      return `http://localhost:5224/uploads/activity-images/${imagePath}`;
    }
    
    return DEFAULT_IMAGES[0];
  };

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  const fetchActivitiesWithImages = async () => {
    try {
      setLoading(true);
      
      const response = await fetch(`${API_BASE_URL}/activities`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch activities: ${response.status}`);
      }
      
      const activitiesData = await response.json();

      const activitiesWithImages = await Promise.all(
        activitiesData.map(async (activity: any) => {
          try {
            const imagesUrl = `${API_BASE_URL}/activityimages/activity/${activity.id}`;
            const imagesResponse = await fetch(imagesUrl);
            
            let imageUrls: string[] = [];
            
            if (imagesResponse.ok) {
              const imagesData = await imagesResponse.json();
              
              if (imagesData.data && imagesData.data.length > 0) {
                imageUrls = imagesData.data.map((img: any) => getFullImageUrl(img.imageUrl));
              }
            }
            
            if (imageUrls.length === 0) {
              imageUrls = DEFAULT_IMAGES;
            }
            
            return {
              ...activity,
              images: imageUrls
            };
          } catch (error) {
            return {
              ...activity,
              images: DEFAULT_IMAGES
            };
          }
        })
      );

      setActivities(activitiesWithImages);
      setFilteredActivities(activitiesWithImages.slice(0, 6));
      
    } catch (error) {
      console.error('Error fetching activities:', error);
      setActivities([]);
      setFilteredActivities([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/categories`);
      if (response.ok) {
        const data = await response.json();
        setCategories(data);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  useEffect(() => {
    fetchActivitiesWithImages();
    fetchCategories();
  }, []);

  useEffect(() => {
    let filtered = activities;

    if (searchQuery) {
      filtered = filtered.filter(activity =>
        activity.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        activity.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        activity.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (selectedCategory !== 'All') {
      filtered = filtered.filter(activity =>
        activity.category === selectedCategory
      );
    }

    setFilteredActivities(filtered.slice(0, 6));
  }, [searchQuery, selectedCategory, activities]);

  const allCategories = ['All', ...Array.from(new Set(activities.map(a => a.category).filter(Boolean)))];

  const handleActivitySelect = (activityId: string) => {
    setShowExplorer(true);
    setTimeout(() => {
      document.getElementById('explorer-section')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleCategorySelect = (category: string) => {
    if (category === 'all') {
      setSelectedCategory('All');
      document.getElementById('activities-section')?.scrollIntoView({ behavior: 'smooth' });
    } else {
      setSelectedCategory(category);
      document.getElementById('activities-section')?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const navigateToDashboard = () => {
    if (!user) return;
    
    if (user.role === 'Admin') {
      window.location.href = '/admin';
    } else if (user.role === 'Provider') {
      window.location.href = '/provider';
    } else if (user.role === 'Tourist') {
      window.location.href = '/tourist/profile';
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setShowProfileMenu(false);
  };

const handleNavigateToActivities = () => {
  if (!user) {
    onNavigate('login');
    return;
  }
  window.location.href = '/tourist/activities';
};

const handleShowCategories = () => {
  setShowCategoriesSection(true);
  setTimeout(() => {
    document.getElementById('categories-section')?.scrollIntoView({ behavior: 'smooth' });
  }, 100);
};

  const handleCategoryClick = (category: Category) => {
    setSelectedCategory(category.name);
    setTimeout(() => {
      document.getElementById('activities-section')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const ProfileDropdown = () => (
    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border z-50">
      <div className="p-4 border-b bg-gray-50">
        <p className="font-semibold text-gray-900">{user?.name || 'User'}</p>
        <p className="text-sm text-gray-600">{user?.email}</p>
        <p className="text-xs text-gray-500 mt-1">Role: {user?.role}</p>
      </div>
      <div className="py-2">
        <button
          onClick={navigateToDashboard}
          className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 transition-colors flex items-center gap-3"
        >
          <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          Dashboard
        </button>
        <button
          onClick={handleLogout}
          className="w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center gap-3"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Logout
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2 cursor-pointer" onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})}>
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">TH</span>
              </div>
              <span className="text-xl font-bold text-gray-900">TourismHub</span>
            </div>

            {/* Navigation Links */}
            <div className="hidden md:flex items-center space-x-8">
              <button 
                onClick={handleNavigateToActivities}
                className="text-gray-700 hover:text-blue-600 transition-colors font-medium"
              >
                Activities
              </button>
              <button 
                onClick={handleShowCategories}
                className="text-gray-700 hover:text-blue-600 transition-colors font-medium"
              >
                Categories
              </button>
              <a href="#about" className="text-gray-700 hover:text-blue-600 transition-colors font-medium">
                About
              </a>
              <a href="#contact" className="text-gray-700 hover:text-blue-600 transition-colors font-medium">
                Contact
              </a>
            </div>

            {/* Login/Profile Section */}
            <div className="flex items-center space-x-4">
              {user ? (
                <div className="relative">
                  <button
                    onClick={() => setShowProfileMenu(!showProfileMenu)}
                    className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-400 text-white rounded-full hover:from-blue-600 hover:to-cyan-500 transition-all duration-300 shadow-lg hover:shadow-blue-500/25"
                  >
                    <User className="w-5 h-5" />
                    <span>{user.name?.split(' ')[0] || 'Profile'}</span>
                  </button>
                  {showProfileMenu && <ProfileDropdown />}
                </div>
              ) : (
              
                <>
                  <button
                    onClick={() => onNavigate('login')}
                    className="px-6 py-2 text-blue-600 hover:text-blue-700 font-semibold transition-colors"
                  >
                    Login
                  </button>
                  <button
                    onClick={() => onNavigate('register')}
                    className="px-6 py-2 bg-gradient-to-r from-blue-600 to-cyan-500 text-white rounded-full hover:from-blue-700 hover:to-cyan-600 transition-all duration-300 shadow-lg hover:shadow-blue-500/25 font-semibold"
                  >
                    Get Started
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>
      <div className="pt-16">
        <Viewer360 onActivitySelect={handleActivitySelect} />

        {/* Activity Explorer Section */}
        {showExplorer && (
          <div id="explorer-section">
            <ActivityExplorer onCategorySelect={handleCategorySelect} />
          </div>
        )}

        {/* Categories Section */}
        {showCategoriesSection && (
          <div id="categories-section" className="bg-gradient-to-b from-white to-blue-50 py-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-12">
                <h2 className="text-4xl font-bold text-gray-900 mb-4">Explore Categories</h2>
                <p className="text-lg text-gray-600">Browse activities by category</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {categories.map((category) => (
                  <div 
                    key={category.id} 
                    className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer border border-gray-200"
                    onClick={() => handleCategoryClick(category)}
                  >
                    <div className="relative h-48">
                      <img
                        src={category.imageUrl || '/images/default-category.jpg'}
                        alt={category.name}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                      {category.featured && (
                        <div className="absolute top-3 right-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-black px-3 py-1 rounded-full text-xs font-bold">
                          ⭐ Featured
                        </div>
                      )}
                      <div className="absolute bottom-4 left-4 right-4">
                        <h3 className="text-xl font-bold text-white">{category.name}</h3>
                      </div>
                    </div>
                    <div className="p-4">
                      <p className="text-gray-600 text-sm mb-3 line-clamp-2">{category.description}</p>
                      <button className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-semibold">
                        View Activities
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Activities Section */}
        <div id="activities-section" className="bg-white">
          {/* Features Section */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Best Price Guarantee</h3>
                <p className="text-gray-600">
                  We ensure you get the best value for your adventure experiences
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Safe & Secure</h3>
                <p className="text-gray-600">
                  Your safety is our priority with verified providers and secure bookings
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Award className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Trusted by Thousands</h3>
                <p className="text-gray-600">
                  Join thousands of happy travelers who've booked with us
                </p>
              </div>
            </div>
          </div>

          {/* Search Section */}
          <div className="bg-gradient-to-r from-blue-600 to-cyan-500 py-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center text-white mb-8">
                <h2 className="text-4xl font-bold mb-4">Find Your Perfect Adventure</h2>
                <p className="text-xl text-blue-100">
                  Search from hundreds of amazing experiences worldwide
                </p>
              </div>
              
              {/* Search Bar */}
              <div className="bg-white rounded-full shadow-2xl p-2 flex items-center max-w-3xl mx-auto mb-8">
                <Search className="w-6 h-6 text-gray-400 ml-4" />
                <input
                  type="text"
                  placeholder="Search activities, destinations, categories..."
                  className="flex-1 px-4 py-4 outline-none text-gray-800 bg-transparent"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button className="bg-blue-600 text-white px-8 py-4 rounded-full hover:bg-blue-700 transition-colors font-semibold">
                  Search
                </button>
              </div>
            </div>
          </div>

          {/* Category Filter */}
          <div className="bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex flex-wrap gap-3 justify-center">
                {allCategories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-6 py-2 rounded-full transition-all ${
                      selectedCategory === category
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'bg-white text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Featured Activities */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h2 className="text-3xl font-bold mb-2">Featured Experiences</h2>
                <p className="text-gray-600">Handpicked adventures for unforgettable moments</p>
              </div>
              <button 
                className="hidden md:flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold"
                onClick={handleNavigateToActivities}
              >
                View All
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[1, 2, 3, 4, 5, 6].map((item) => (
                  <div key={item} className="bg-white rounded-2xl shadow-lg overflow-hidden animate-pulse">
                    <div className="h-48 bg-gray-300"></div>
                    <div className="p-6">
                      <div className="h-4 bg-gray-300 rounded mb-2"></div>
                      <div className="h-3 bg-gray-300 rounded mb-4"></div>
                      <div className="h-3 bg-gray-300 rounded w-2/3"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {filteredActivities.map((activity) => {
                    const mainImage = getFullImageUrl(activity.images?.[0]) || DEFAULT_IMAGES[0];
                    
                    return (
                      <div 
                        key={activity.id} 
                        className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer"
                        onClick={() => {
                          localStorage.setItem('selectedActivity', JSON.stringify(activity));
                          onNavigate('activity-detail', { activityId: activity.id });
                        }}
                      >
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
                          <div className="absolute top-4 right-4 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                            ${activity.price}
                          </div>
                          <div className="absolute bottom-4 left-4 bg-black/70 text-white px-3 py-1 rounded-full text-sm">
                            {activity.availableSlots} slots left
                          </div>
                          {activity.status && (
                            <div className={`absolute top-4 left-4 px-2 py-1 rounded-full text-xs font-bold ${
                              activity.status === 'Active' 
                                ? 'bg-green-500 text-white' 
                                : 'bg-yellow-500 text-black'
                            }`}>
                              {activity.status}
                            </div>
                          )}
                        </div>
                        
                        <div className="p-6">
                          <h3 className="text-xl font-bold text-gray-900 mb-2">{activity.name}</h3>
                          <p className="text-gray-600 text-sm mb-4 line-clamp-2">{activity.description}</p>
                          
                          <div className="flex items-center text-sm text-gray-500 mb-4">
                            <span className="mr-4 flex items-center gap-1">
                              <MapPin className="w-4 h-4" />
                              {activity.location}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              {activity.duration}
                            </span>
                          </div>
                          
                          <div className="flex justify-between items-center">
                            <div className="text-sm text-gray-500">
                              By: <span className="font-semibold">{activity.providerName}</span>
                            </div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                localStorage.setItem('selectedActivity', JSON.stringify(activity));
                                onNavigate('booking');
                              }}
                              disabled={activity.availableSlots === 0}
                              className={`px-6 py-2 rounded-full font-semibold transition-all duration-300 shadow-lg ${
                                activity.availableSlots === 0
                                  ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                                  : 'bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700 hover:shadow-blue-500/25'
                              }`}
                            >
                              {activity.availableSlots === 0 ? 'Sold Out' : 'Book Now'}
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {filteredActivities.length === 0 && (
                  <div className="text-center py-16">
                    <div className="text-6xl mb-4">🏔️</div>
                    <h3 className="text-2xl font-bold text-gray-700 mb-2">No Activities Found</h3>
                    <p className="text-gray-500 mb-4">
                      {searchQuery || selectedCategory !== 'All' 
                        ? 'No activities match your search criteria.' 
                        : 'There are no activities available yet.'}
                    </p>
                    <button
                      onClick={() => {
                        setSearchQuery('');
                        setSelectedCategory('All');
                      }}
                      className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
                    >
                      Clear Filters
                    </button>
                  </div>
                )}
              </>
            )}

            <div className="text-center mt-8 md:hidden">
              <button 
                className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
                onClick={handleNavigateToActivities}
              >
                View All Activities
              </button>
            </div>
          </div>

          {/* CTA Section for Providers */}
          <div 
            className="relative h-96 bg-cover bg-center"
            style={{
              backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url('https://images.unsplash.com/photo-1469474968028-56623f02e42e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2074&q=80')`
            }}
          >
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center text-white px-4 max-w-3xl">
                <h2 className="text-4xl md:text-5xl mb-6 font-bold">
                  Are You a Tour Provider?
                </h2>
                <p className="text-xl mb-8 text-gray-200">
                  Join our platform and reach thousands of adventure seekers worldwide
                </p>
                <button 
                  className="bg-white text-blue-600 px-8 py-4 rounded-lg hover:bg-gray-100 transition-colors font-semibold"
                  onClick={() => onNavigate('provider-registration')}
                >
                  Become a Provider
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}