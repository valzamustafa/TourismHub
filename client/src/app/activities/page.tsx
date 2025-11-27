'use client';

import React, { useEffect, useMemo, useState } from 'react';

interface Activity {
  id: string;
  name: string;
  description: string;
  price: number;
  availableSlots: number;
  location: string;
  category: string;
  providerName: string;
  images: string[];
  duration: string;
  included: string[];
  rating: number;
  reviews: number;
  featured: boolean;
}

const mockActivities: Activity[] = [
  {
    id: '1',
    name: 'Switzerland Alps Adventure',
    description: 'Experience breathtaking lakes and snowy peaks with a real Swiss guide.',
    price: 299,
    availableSlots: 6,
    location: 'Saint Antonien, Switzerland',
    category: 'Mountain Adventure',
    providerName: 'Alpine Explorers',
    images: ['/images/swiss-alps.jpg'],
    duration: '2 days',
    included: ['Guide', 'Hotel', 'Food', 'Transport'],
    rating: 4.9,
    reviews: 234,
    featured: true
  },
  {
    id: '2',
    name: 'Sahara Desert Expedition',
    description: 'Camel trekking, Berber culture, and magical night skies.',
    price: 189,
    availableSlots: 8,
    location: 'Merzouga, Morocco',
    category: 'Desert Safari',
    providerName: 'Desert Dreams',
    images: ['/images/sahara-desert.jpg'],
    duration: '3 days',
    included: ['Camel trek', 'Camp', 'Meals', 'Guide'],
    rating: 4.8,
    reviews: 167,
    featured: true
  },
  {
    id: '3',
    name: 'National Park Hiking',
    description: 'Explore untouched nature with expert guides.',
    price: 89,
    availableSlots: 12,
    location: 'National Park',
    category: 'Nature Walk',
    providerName: 'Nature Guides',
    images: ['/images/italian-mountains.jpg'],
    duration: '6 hours',
    included: ['Guide', 'Lunch', 'Fees'],
    rating: 4.7,
    reviews: 89,
    featured: true
  }
];

export default function ActivitiesPage() {
  const [activities] = useState<Activity[]>(mockActivities);
  const featuredActivities = useMemo(
    () => activities.filter(a => a.featured),
    [activities]
  );

  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const id = setInterval(() => {
      setCurrent(prev => (prev + 1) % featuredActivities.length);
    }, 4500);
    return () => clearInterval(id);
  }, [featuredActivities.length, paused]);

  const prev = () =>
    setCurrent(prev => (prev - 1 + featuredActivities.length) % featuredActivities.length);

  const next = () =>
    setCurrent(prev => (prev + 1) % featuredActivities.length);

  return (
    <div className="min-h-screen bg-white">
    
      <section className="relative w-full h-screen overflow-hidden">
        <img
          src="/images/landscape-hero.jpg"
          className="absolute inset-0 w-full h-full object-cover"
        />

        <div className="absolute inset-0 bg-black/40"></div>

        <div className="relative z-20 h-full max-w-7xl mx-auto px-6 flex items-center gap-12">

   
          <div className="w-full md:w-1/2 text-white animate-fadeIn">
            <p className="uppercase tracking-widest text-sm text-white/70 mb-4">
              Landscape
            </p>
            <h2 className="text-6xl font-bold leading-tight mb-6">
              ITALIAN <br /> MOUNTAINS
            </h2>

            <p className="text-lg text-white/90 mb-8 max-w-xl">
              Explore breathtaking mountain landscapes with real professional guides.
            </p>

            <div className="flex items-center gap-4">
              <button className="bg-white text-black px-8 py-3 rounded-full font-medium hover:bg-gray-200 transition">
                Explore Full Gallery
              </button>

              <button
                className="border border-white/50 px-6 py-3 rounded-full hover:bg-white/10"
                onClick={() => setPaused(p => !p)}
              >
                {paused ? 'Play' : 'Pause'}
              </button>
            </div>

    
            <div className="mt-10 w-64 h-1 bg-white/20 rounded-full overflow-hidden">
              <div
                className="h-1 bg-white transition-all duration-500"
                style={{
                  width: `${((current + 1) / featuredActivities.length) * 100}%`
                }}
              />
            </div>
          </div>


          <div
            className="hidden md:flex md:w-1/2 h-[450px] relative items-center overflow-hidden rounded-3xl"
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
          >
     
            <div
              className="flex transition-transform duration-700 ease-in-out"
              style={{
                transform: `translateX(-${current * 100}%)`,
                width: `${featuredActivities.length * 100}%`
              }}
            >
              {featuredActivities.map(a => (
                <div
                  key={a.id}
                  className="w-full px-3 flex-shrink-0"
                >
                  <div className="bg-white rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-1">
                    <div className="relative group">
                      <img
                        src={a.images[0]}
                        className="w-full h-72 object-cover transition-transform duration-700 group-hover:scale-110"
                      />

                      <span className="absolute top-4 left-4 bg-black/70 text-white px-3 py-1 rounded-full text-xs">
                        ★ {a.rating} ({a.reviews})
                      </span>
                    </div>

                    <div className="p-6">
                      <h3 className="text-xl font-bold">{a.name}</h3>
                      <p className="text-gray-600 text-sm mt-1 line-clamp-2">
                        {a.description}
                      </p>

                
                      <div className="mt-4 flex items-center justify-between text-sm text-gray-700">
                        <span>📍 {a.location}</span>
                        <span>⏳ {a.duration}</span>
                      </div>

                      <div className="mt-4 flex flex-wrap gap-2">
                        {a.included.slice(0, 3).map((inc, i) => (
                          <span
                            key={i}
                            className="bg-gray-100 px-3 py-1 rounded-full text-xs"
                          >
                            {inc}
                          </span>
                        ))}
                      </div>

                      <button className="w-full mt-5 bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl font-semibold transition">
                        Book Now • ${a.price}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

         
            <button
              onClick={prev}
              className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/90 p-2 rounded-full shadow"
            >
              ◀
            </button>
            <button
              onClick={next}
              className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/90 p-2 rounded-full shadow"
            >
              ▶
            </button>

     
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
              {featuredActivities.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrent(i)}
                  className={`w-3 h-3 rounded-full transition ${
                    i === current ? 'bg-white' : 'bg-white/40'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
