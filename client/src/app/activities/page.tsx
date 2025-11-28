'use client';

import React, { useEffect, useState, useRef } from 'react';

interface Category {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  featured: boolean;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5224/api';

export default function ActivitiesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [currentBackground, setCurrentBackground] = useState<string>('/images/landscape-hero.jpg');
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const sliderRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/categories`);
      if (!response.ok) throw new Error('Failed to fetch categories');
      const data = await response.json();
      setCategories(data);
      if (data.length > 0) {
        setSelectedCategory(data[0]);
 
        setCurrentBackground(data[0].imageUrl || '/images/landscape-hero.jpg');
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoading(false);
    }
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

  const handleCategoryClick = (category: Category) => {
    setSelectedCategory(category);
    
    setCurrentBackground(category.imageUrl || '/images/default-category.jpg');
  };

 
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
      <section className="relative w-full h-screen overflow-hidden">
       
        <img
          src={currentBackground}
          className="absolute inset-0 w-full h-full object-cover transition-all duration-1000 ease-in-out"
          alt="Category background"
        />
        <div className="absolute inset-0 bg-black/40 transition-all duration-700"></div>

        <div className="relative z-20 h-full max-w-7xl mx-auto px-6 flex items-center gap-12">
          {/* Left Content */}
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

            {/* Slider Container */}
            <div className="relative h-full flex items-center">
            
              <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-black/50 to-transparent z-10 pointer-events-none" />
              <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-black/50 to-transparent z-10 pointer-events-none" />

              {/* Slider */}
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

            {/* Arrow Right */}
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

            {/* Scroll Indicators */}
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

        {/* Background Pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-pink-500/10 mix-blend-overlay" />
      </section>

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