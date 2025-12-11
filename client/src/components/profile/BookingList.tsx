// components/profile/BookingList.tsx
'use client';

import React from 'react';

interface Booking {
  id: string;
  activityId: string;
  activityName: string;
  activityImage?: string;
  activityImages?: string[];
  bookingDate: string;
  selectedDate: string;
  numberOfPeople: number;
  totalAmount: number;
  status: 'Pending' | 'Confirmed' | 'Cancelled' | 'Completed';
  paymentStatus: 'Pending' | 'Paid' | 'Failed' | 'Refunded';
}

interface BookingListProps {
  bookings: Booking[];
  onCancelBooking: (bookingId: string) => void;
  onViewActivity: (activityId: string) => void;
}

export const BookingList: React.FC<BookingListProps> = ({
  bookings,
  onCancelBooking,
  onViewActivity
}) => {

  const displayedBookings = bookings;

  if (displayedBookings.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">📅</div>
        <h3 className="text-xl font-bold text-gray-700 mb-2">No Bookings Found</h3>
        <p className="text-gray-500">
          You haven't made any bookings yet.
        </p>
      </div>
    );
  }


  const getFullImageUrl = (imagePath: string | undefined): string => {
    if (!imagePath || imagePath === 'string' || imagePath === 'null') {
      return 'https://images.unsplash.com/photo-1501555088652-021faa106b9b?w=200&fit=crop';
    }
    
    if (imagePath.startsWith('http')) {
      return imagePath;
    }
    
    if (imagePath.startsWith('/uploads/')) {
      return `http://localhost:5224${imagePath}`;
    }
    
    return `http://localhost:5224${imagePath.startsWith('/') ? imagePath : '/' + imagePath}`;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600">Showing:</span>
          <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold">
            All Bookings
          </span>
        </div>
        <span className="text-sm text-gray-600">
          {displayedBookings.length} booking{displayedBookings.length !== 1 ? 's' : ''}
        </span>
      </div>

      {displayedBookings.map((booking) => {
        const mainImage = booking.activityImages && booking.activityImages.length > 0 
          ? getFullImageUrl(booking.activityImages[0])
          : getFullImageUrl(booking.activityImage);

        return (
          <div key={booking.id} className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors">
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-4 flex-1">
          
                <div className="relative flex-shrink-0">
                  <img
                    src={mainImage}
                    alt={booking.activityName}
                    className="w-20 h-20 object-cover rounded-lg"
                    onError={(e) => {
                      e.currentTarget.src = 'https://images.unsplash.com/photo-1501555088652-021faa106b9b?w=200&fit=crop';
                    }}
                  />
                  <div className="absolute -top-2 -right-2 bg-blue-600 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
                    {booking.numberOfPeople}
                  </div>
                </div>
                
                <div className="flex-1">
                  <h3 
                    className="font-semibold text-gray-900 hover:text-blue-600 cursor-pointer mb-2"
                    onClick={() => onViewActivity(booking.activityId)}
                  >
                    {booking.activityName}
                  </h3>
                  <div className="space-y-1 text-sm text-gray-600">
                    <div className="flex items-center">
                      <span className="mr-2 w-5">📅</span>
                      <span>Booking Date: {new Date(booking.bookingDate).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center">
                      <span className="mr-2 w-5">📅</span>
                      <span>Activity Date: {new Date(booking.selectedDate).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center">
                      <span className="mr-2 w-5">👥</span>
                      <span>People: {booking.numberOfPeople}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="text-right min-w-[180px] ml-4">
                <div className="text-xl font-bold text-green-600 mb-2">
                  ${booking.totalAmount.toFixed(2)}
                </div>
                
    
                <div className="space-y-2 mb-3">
                  <div className="inline-block">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      booking.status === 'Confirmed' ? 'bg-green-100 text-green-800' :
                      booking.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                      booking.status === 'Completed' ? 'bg-blue-100 text-blue-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {booking.status}
                    </span>
                  </div>
                  <div className="inline-block">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      booking.paymentStatus === 'Paid' ? 'bg-green-100 text-green-800' :
                      booking.paymentStatus === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {booking.paymentStatus}
                    </span>
                  </div>
                </div>
                
                <div className="space-x-2">
                  {booking.status === 'Pending' && (
                    <button
                      onClick={() => onCancelBooking(booking.id)}
                      className="px-3 py-1.5 bg-red-500 text-white text-sm rounded hover:bg-red-600 transition-colors"
                    >
                      Cancel Booking
                    </button>
                  )}
                  <button
                    onClick={() => onViewActivity(booking.activityId)}
                    className="px-3 py-1.5 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 transition-colors"
                  >
                    View Details
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};