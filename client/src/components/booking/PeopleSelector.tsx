// components/booking/PeopleSelector.tsx
'use client';

import React from 'react';

interface PeopleSelectorProps {
  value: number;
  onChange: (value: number) => void;
  maxPeople?: number;
}

export const PeopleSelector: React.FC<PeopleSelectorProps> = ({ 
  value, 
  onChange,
  maxPeople = 10
}) => {
  const handleIncrement = () => {
    if (value < maxPeople) {
      onChange(value + 1);
    }
  };

  const handleDecrement = () => {
    if (value > 1) {
      onChange(value - 1);
    }
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Number of People *
      </label>
      <div className="flex items-center space-x-4">
        <button
          type="button"
          onClick={handleDecrement}
          disabled={value <= 1}
          className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <span className="text-lg font-bold">-</span>
        </button>
        
        <div className="text-center min-w-[100px]">
          <div className="text-2xl font-bold text-blue-600">{value}</div>
          <div className="text-sm text-gray-500">Person{value !== 1 ? 's' : ''}</div>
        </div>
        
        <button
          type="button"
          onClick={handleIncrement}
          disabled={value >= maxPeople}
          className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <span className="text-lg font-bold">+</span>
        </button>
      </div>
      
      <p className="text-sm text-gray-500">
        Maximum {maxPeople} people per booking
      </p>
      

      <div className="mt-4 p-3 bg-blue-50 rounded-lg">
        <div className="flex justify-between">
          <span className="text-sm text-gray-600">Price per person:</span>
          <span className="font-medium">$</span>
        </div>
        <div className="flex justify-between mt-1">
          <span className="text-sm text-gray-600">Total:</span>
          <span className="font-bold text-green-600">$</span>
        </div>
      </div>
    </div>
  );
};