// app/tourist/activities/[id]/page.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

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
  duration: string;
  images: string[];
  status: string;
  rating?: number;
  reviews?: number;
  included?: string[]; 
  requirements?: string[]; 
  quickFacts?: string[];
  startDate?: string;
  endDate?: string;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5224/api';

export default function ActivityDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [activity, setActivity] = useState<Activity | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');

  const DEFAULT_IMAGES = [
    'https://images.unsplash.com/photo-1501555088652-021faa106b9b?w=800&h=500&fit=crop',
    'https://images.unsplash.com/photo-1502602898536-47ad22581b52?w=800&h=500&fit=crop',
    'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&h=500&fit=crop'
  ];

  const getFullImageUrl = (imagePath: string): string => {
    if (!imagePath) return DEFAULT_IMAGES[0];
    if (imagePath.startsWith('http')) return imagePath;
    if (imagePath.startsWith('/uploads/')) {
      return `http://localhost:5224${imagePath}`;
    }
    return `http://localhost:5224${imagePath.startsWith('/') ? imagePath : '/' + imagePath}`;
  };

  useEffect(() => {
    const userData = localStorage.getItem('user');
    const token = localStorage.getItem('token');

    if (!userData || !token) {
      router.push('/');
      return;
    }

    const parsedUser = JSON.parse(userData);
    
    if (parsedUser.role !== 'Tourist') {
      if (parsedUser.role === 'Admin') {
        router.push('/admin');
      } else if (parsedUser.role === 'Provider') {
        router.push('/provider/dashboard');
      }
      return;
    }

    fetchActivityDetails();
  }, [params.id, router]);

  const fetchActivityDetails = async () => {
    try {
      setError(null);
      setLoading(true);

      const activityResponse = await fetch(`${API_BASE_URL}/activities/${params.id}`);
      
      if (!activityResponse.ok) {
        throw new Error(`Failed to fetch activity: ${activityResponse.status}`);
      }
      
      const activityData = await activityResponse.json();
      const imagesResponse = await fetch(
        `${API_BASE_URL}/activityimages/activity/${params.id}`
      );
      
      let images = [];
      if (imagesResponse.ok) {
        const imagesData = await imagesResponse.json();
        images = imagesData.data?.map((img: any) => getFullImageUrl(img.imageUrl)) || [];
      }

      const enhancedActivity: Activity = {
        ...activityData,
        images: images.length > 0 ? images : DEFAULT_IMAGES,
        rating: activityData.rating || 4.8,
        reviews: activityData.reviews || 124,
        included: Array.isArray(activityData.included) ? activityData.included : [],
        requirements: Array.isArray(activityData.requirements) ? activityData.requirements : [],
        quickFacts: Array.isArray(activityData.quickFacts) ? activityData.quickFacts : [],
        startDate: activityData.startDate || new Date().toISOString(),
        endDate: activityData.endDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
      };

      setActivity(enhancedActivity);
      
    } catch (error) {
      console.error('Error fetching activity details:', error);
      setError('Failed to load activity details. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleBookNow = () => {
    if (activity) {
      localStorage.setItem('selectedActivity', JSON.stringify(activity));
      router.push('/booking');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-green-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-700 mx-auto mb-4"></div>
          <p className="text-green-800 text-lg">Loading activity details...</p>
        </div>
      </div>
    );
  }

  if (error || !activity) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-green-100">
        <div className="text-center max-w-md mx-auto">
          <div className="text-6xl mb-4 text-green-700">😔</div>
          <h3 className="text-2xl font-bold text-green-800 mb-2">Activity Not Found</h3>
          <p className="text-green-700 mb-6">{error || 'The activity you are looking for does not exist.'}</p>
          <button
            onClick={() => router.push('/tourist/activities')}
            className="px-6 py-3 bg-green-700 text-white rounded-lg hover:bg-green-800 transition-colors font-semibold"
          >
            ← Back to Activities
          </button>
        </div>
      </div>
    );
  }

  const isSoldOut = activity.availableSlots === 0;
  const isLowAvailability = activity.availableSlots < 5;
  
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Not specified';
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return 'Invalid date';
    }
  };

  const formatTime = (dateString?: string) => {
    if (!dateString) return '';
    try {
      return new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100">
      <header className="bg-white/90 backdrop-blur-sm border-b border-green-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/tourist/activities')}
                className="flex items-center text-green-700 hover:text-green-800 font-semibold transition-colors"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to Activities
              </button>
              <div className="h-6 w-px bg-green-300"></div>
              <span className="text-green-700">{activity.category}</span>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/tourist/dashboard')}
                className="px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors font-semibold"
              >
                Dashboard
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-green-200">
              <div className="relative h-96">
                <img
                  src={getFullImageUrl(activity.images[selectedImage])}
                  alt={activity.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-4 left-4 flex space-x-2">
                  {activity.status && (
                    <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                      activity.status === 'Active' 
                        ? 'bg-green-700 text-white' 
                        : 'bg-yellow-600 text-white'
                    }`}>
                      {activity.status}
                    </span>
                  )}
                  {isSoldOut && (
                    <span className="px-3 py-1 bg-red-700 text-white rounded-full text-sm font-bold">
                      Sold Out
                    </span>
                  )}
                </div>
              </div>

              {activity.images.length > 1 && (
                <div className="p-4 bg-green-50">
                  <div className="flex space-x-2 overflow-x-auto">
                    {activity.images.map((image, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedImage(index)}
                        className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                          selectedImage === index 
                            ? 'border-green-700 scale-105' 
                            : 'border-transparent hover:border-green-500'
                        }`}
                      >
                        <img
                          src={getFullImageUrl(image)}
                          alt={`${activity.name} ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="bg-white rounded-2xl shadow-lg border border-green-200">
              <div className="border-b border-green-200">
                <nav className="flex space-x-8 px-6">
                  {['overview', 'included', 'requirements', 'quickfacts', 'reviews'].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`py-4 px-1 font-medium text-sm border-b-2 transition-colors ${
                        activeTab === tab
                          ? 'border-green-700 text-green-800'
                          : 'border-transparent text-gray-500 hover:text-green-700'
                      }`}
                    >
                      {tab.charAt(0).toUpperCase() + tab.slice(1)}
                    </button>
                  ))}
                </nav>
              </div>

              <div className="p-6">
                {activeTab === 'overview' && (
                  <div className="space-y-6">
                    <h2 className="text-2xl font-bold text-green-800">About this Activity</h2>
                    <p className="text-gray-700 leading-relaxed text-lg">
                      {activity.description}
                    </p>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-6 border-t border-green-200">
                      <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
                        <div className="text-2xl text-green-700 mb-2">⏱️</div>
                        <div className="font-semibold text-green-800">Duration</div>
                        <div className="text-green-700">{activity.duration || '4 hours'}</div>
                      </div>
                      <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
                        <div className="text-2xl text-green-700 mb-2">👥</div>
                        <div className="font-semibold text-green-800">Group Size</div>
                        <div className="text-green-700">Up to {activity.availableSlots} people</div>
                      </div>
                      <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
                        <div className="text-2xl text-green-700 mb-2">🎯</div>
                        <div className="font-semibold text-green-800">Category</div>
                        <div className="text-green-700">{activity.category}</div>
                      </div>
                      <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
                        <div className="text-2xl text-green-700 mb-2">⭐</div>
                        <div className="font-semibold text-green-800">Rating</div>
                        <div className="text-green-700">{activity.rating}/5 ({activity.reviews} reviews)</div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'included' && (
                  <div className="space-y-4">
                    <h2 className="text-2xl font-bold text-green-800">What's Included</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {activity.included && activity.included.length > 0 ? (
                        activity.included.map((item, index) => (
                          <div key={index} className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg border border-green-200">
                            <div className="w-6 h-6 bg-green-700 rounded-full flex items-center justify-center">
                              <span className="text-white text-sm">✓</span>
                            </div>
                            <span className="text-green-800">{item}</span>
                          </div>
                        ))
                      ) : (
                        <div className="col-span-2 text-center py-8 text-gray-500">
                          No included items specified
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {activeTab === 'requirements' && (
                  <div className="space-y-4">
                    <h2 className="text-2xl font-bold text-green-800">Requirements</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {activity.requirements && activity.requirements.length > 0 ? (
                        activity.requirements.map((item, index) => (
                          <div key={index} className="flex items-center space-x-3 p-3 bg-green-100 rounded-lg border border-green-300">
                            <div className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center">
                              <span className="text-white text-sm">!</span>
                            </div>
                            <span className="text-green-800">{item}</span>
                          </div>
                        ))
                      ) : (
                        <div className="col-span-2 text-center py-8 text-gray-500">
                          No requirements specified
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {activeTab === 'quickfacts' && (
                  <div className="space-y-4">
                    <h2 className="text-2xl font-bold text-green-800">Quick Facts</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {activity.quickFacts && activity.quickFacts.length > 0 ? (
                        activity.quickFacts.map((fact, index) => (
                          <div key={index} className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                            <div className="w-6 h-6 bg-blue-700 rounded-full flex items-center justify-center">
                              <span className="text-white text-sm">⚡</span>
                            </div>
                            <span className="text-blue-800">{fact}</span>
                          </div>
                        ))
                      ) : (
                        <div className="col-span-2 text-center py-8 text-gray-500">
                          No quick facts available
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {activeTab === 'reviews' && (
                  <div className="space-y-6">
                    <h2 className="text-2xl font-bold text-green-800">Customer Reviews</h2>
                    <div className="flex items-center space-x-4 p-6 bg-yellow-50 rounded-lg border border-yellow-200">
                      <div className="text-4xl font-bold text-yellow-700">{activity.rating}</div>
                      <div>
                        <div className="flex text-yellow-600 text-lg">
                          {'★'.repeat(5)}
                        </div>
                        <div className="text-yellow-700">Based on {activity.reviews} reviews</div>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="p-4 bg-white border border-green-200 rounded-lg">
                        <div className="flex items-center space-x-2 mb-2">
                          <div className="text-yellow-600">★★★★★</div>
                          <span className="font-semibold text-green-800">Amazing Experience!</span>
                        </div>
                        <p className="text-green-700">"This was one of the best activities I've ever done. The guides were professional and the views were breathtaking!"</p>
                        <div className="text-sm text-green-600 mt-2">- Sarah M.</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-6 border border-green-200">
              <h2 className="text-2xl font-bold text-green-800 mb-4">About the Provider</h2>
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-green-700 rounded-full flex items-center justify-center text-white font-bold text-xl">
                  {activity.providerName?.charAt(0) || 'P'}
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-green-800">{activity.providerName}</h3>
                  <p className="text-green-700">Professional Activity Provider</p>
                  <div className="flex items-center mt-1">
                    <span className="text-yellow-600">★★★★★</span>
                    <span className="text-sm text-green-700 ml-2">4.8 (124 reviews)</span>
                  </div>
                </div>
                <button className="px-4 py-2 bg-green-700 text-white rounded-lg hover:bg-green-800 transition-colors">
                  Contact
                </button>
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-24 border border-green-200">
              <div className="text-center mb-6">
                <div className="text-3xl font-bold text-green-700">${activity.price}</div>
                <div className="text-green-600">per person</div>
              </div>

              <div className="space-y-4 mb-6">
                <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg border border-green-200">
                  <span className="text-green-700">Available Slots:</span>
                  <span className={`font-semibold ${
                    isSoldOut ? 'text-red-700' : isLowAvailability ? 'text-yellow-700' : 'text-green-700'
                  }`}>
                    {isSoldOut ? 'Sold Out' : `${activity.availableSlots} available`}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg border border-green-200">
                  <span className="text-green-700">Location:</span>
                  <span className="font-semibold text-green-800 text-right">{activity.location}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg border border-green-200">
                  <span className="text-green-700">Duration:</span>
                  <span className="font-semibold text-green-800">{activity.duration || '4 hours'}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg border border-green-200">
                  <span className="text-green-700">Start Date:</span>
                  <span className="font-semibold text-green-800">
                    {formatDate(activity.startDate)}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg border border-green-200">
                  <span className="text-green-700">End Date:</span>
                  <span className="font-semibold text-green-800">
                    {formatDate(activity.endDate)}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg border border-green-200">
                  <span className="text-green-700">Confirmation:</span>
                  <span className="font-semibold text-green-700">Instant</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="p-4 bg-green-50 rounded-xl border border-green-200">
                  <div className="flex items-center mb-2">
                    <svg className="w-5 h-5 text-green-700 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="font-semibold text-green-800">Start Date</span>
                  </div>
                  <div className="text-lg font-bold text-green-900">
                    {formatDate(activity.startDate)}
                  </div>
                  <div className="text-sm text-green-700">
                    {formatTime(activity.startDate)}
                  </div>
                </div>
                <div className="p-4 bg-red-50 rounded-xl border border-red-200">
                  <div className="flex items-center mb-2">
                    <svg className="w-5 h-5 text-red-700 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="font-semibold text-red-800">End Date</span>
                  </div>
                  <div className="text-lg font-bold text-red-900">
                    {formatDate(activity.endDate)}
                  </div>
                  <div className="text-sm text-red-700">
                    {formatTime(activity.endDate)}
                  </div>
                </div>
              </div>

              <button
                onClick={handleBookNow}
                disabled={isSoldOut}
                className={`w-full py-4 rounded-2xl font-bold text-lg transition-all duration-300 ${
                  isSoldOut
                    ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                    : 'bg-green-700 text-white hover:bg-green-800 hover:shadow-lg'
                }`}
              >
                {isSoldOut ? 'Sold Out' : 'Book Now'}
              </button>

              <div className="mt-4 text-center text-sm text-green-600">
                Free cancellation up to 24 hours before
              </div>

              <div className="mt-6 pt-6 border-t border-green-200">
                <h3 className="font-semibold text-green-800 mb-3">Quick Facts:</h3>
                <ul className="space-y-2 text-sm text-green-700">
                  {activity.quickFacts && activity.quickFacts.length > 0 ? (
                    activity.quickFacts.slice(0, 4).map((fact, index) => (
                      <li key={index} className="flex items-center">
                        <span className="text-green-600 mr-2">✓</span>
                        {fact}
                      </li>
                    ))
                  ) : (
                    <>
                      <li className="flex items-center">
                        <span className="text-green-600 mr-2">✓</span>
                        Best price guarantee
                      </li>
                      <li className="flex items-center">
                        <span className="text-green-600 mr-2">✓</span>
                        Mobile ticket
                      </li>
                      <li className="flex items-center">
                        <span className="text-green-600 mr-2">✓</span>
                        English speaking guide
                      </li>
                      <li className="flex items-center">
                        <span className="text-green-600 mr-2">✓</span>
                        Family friendly
                      </li>
                    </>
                  )}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}