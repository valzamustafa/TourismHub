// components/profile/SavedItemsList.tsx
'use client';

import React from 'react';

interface SavedItem {
  id: string;
  activityId: string;
  activityName: string;
  activityImage?: string;
  price: number;
  location: string;
  category: string;
  savedAt: string;
}

interface SavedItemsListProps {
  items: SavedItem[];
  onRemoveItem: (itemId: string) => void;
  onViewActivity: (activityId: string) => void;
  etImageUrl?: (imagePath: string) => string;
}

export const SavedItemsList: React.FC<SavedItemsListProps> = ({
  items,
  onRemoveItem,
  onViewActivity
}) => {
  if (items.length === 0) {
    return (
      <EmptyState
        title="No Saved Items"
        description="Save activities you're interested in for later!"
      />
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {items.map((item) => (
        <SavedItemCard
          key={item.id}
          item={item}
          onRemove={() => onRemoveItem(item.id)}
          onViewActivity={() => onViewActivity(item.activityId)}
        />
      ))}
    </div>
  );
};

const SavedItemCard: React.FC<{
  item: SavedItem;
  onRemove: () => void;
  onViewActivity: () => void;
}> = ({ item, onRemove, onViewActivity }) => (
  <div className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
    <div className="relative h-40">
      {item.activityImage ? (
        <img
          src={item.activityImage}
          alt={item.activityName}
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="w-full h-full bg-gradient-to-r from-blue-400 to-purple-500 flex items-center justify-center">
          <span className="text-white font-bold">No Image</span>
        </div>
      )}
      <button
        onClick={onRemove}
        className="absolute top-2 right-2 bg-white p-2 rounded-full shadow-lg hover:bg-red-50 hover:text-red-500 transition-colors"
        title="Remove from saved"
      >
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
        </svg>
      </button>
    </div>
    <div className="p-4">
      <h3 className="font-semibold text-gray-900 mb-2">{item.activityName}</h3>
      <div className="flex justify-between items-center mb-3">
        <span className="text-lg font-bold text-green-600">${item.price}</span>
        <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
          {item.category}
        </span>
      </div>
      <div className="flex items-center text-gray-600 text-sm mb-3">
        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        <span>{item.location}</span>
      </div>
      <div className="flex justify-between items-center">
        <span className="text-xs text-gray-500">
          Saved {new Date(item.savedAt).toLocaleDateString()}
        </span>
        <button
          onClick={onViewActivity}
          className="px-4 py-2 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600"
        >
          View Details
        </button>
      </div>
    </div>
  </div>
);

const EmptyState: React.FC<{ title: string; description: string }> = ({ title, description }) => (
  <div className="text-center py-12">
    <div className="text-6xl mb-4">❤️</div>
    <h3 className="text-xl font-bold text-gray-700 mb-2">{title}</h3>
    <p className="text-gray-500">{description}</p>
  </div>
);
