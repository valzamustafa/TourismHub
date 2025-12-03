// components/profile/BookingList.tsx
'use client';

import React from 'react';

interface Booking {
  id: string;
  activityId: string;
  activityName: string;
  activityImage?: string;
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

      {displayedBookings.map((booking) => (
        <BookingCard
          key={booking.id}
          booking={booking}
          onCancelBooking={onCancelBooking}
          onViewActivity={onViewActivity}
        />
      ))}
    </div>
  );
};

const BookingCard: React.FC<{
  booking: Booking;
  onCancelBooking: (bookingId: string) => void;
  onViewActivity: (activityId: string) => void;
}> = ({ booking, onCancelBooking, onViewActivity }) => (
  <div className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors">
    <div className="flex items-start justify-between">
      <div className="flex items-start space-x-4">
        {booking.activityImage && (
          <img
            src={booking.activityImage}
            alt={booking.activityName}
            className="w-20 h-20 object-cover rounded-lg"
            onError={(e) => {
              e.currentTarget.src = 'https://images.unsplash.com/photo-1501555088652-021faa106b9b?w=200&fit=crop';
            }}
          />
        )}
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900">{booking.activityName}</h3>
          <div className="mt-2 space-y-1 text-sm">
            <InfoRow icon="📅" text={`Booking Date: ${new Date(booking.bookingDate).toLocaleDateString()}`} />
            <InfoRow icon="📅" text={`Activity Date: ${new Date(booking.selectedDate).toLocaleDateString()}`} />
            <InfoRow icon="👥" text={`People: ${booking.numberOfPeople}`} />
          </div>
        </div>
      </div>

      <div className="text-right min-w-[180px]">
        <div className="text-xl font-bold text-green-600">${booking.totalAmount.toFixed(2)}</div>
        <StatusBadge status={booking.status} type="status" />
        <StatusBadge status={booking.paymentStatus} type="payment" />
        
        <div className="mt-3 space-x-2">
          {booking.status === 'Pending' && (
            <button
              onClick={() => onCancelBooking(booking.id)}
              className="px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600 transition-colors"
            >
              Cancel Booking
            </button>
          )}
          {(booking.status === 'Confirmed' || booking.status === 'Completed') && (
            <button
              onClick={() => onViewActivity(booking.activityId)}
              className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 transition-colors"
            >
              View Activity
            </button>
          )}
        </div>
      </div>
    </div>
  </div>
);

const InfoRow: React.FC<{ icon: string; text: string }> = ({ icon, text }) => (
  <div className="flex items-center text-gray-600">
    <span className="mr-2 w-5">{icon}</span>
    <span>{text}</span>
  </div>
);

const StatusBadge: React.FC<{ status: string; type: 'status' | 'payment' }> = ({ status, type }) => {
  const getColors = (status: string) => {
    if (type === 'status') {
      switch (status) {
        case 'Confirmed': return 'bg-green-100 text-green-800';
        case 'Pending': return 'bg-yellow-100 text-yellow-800';
        case 'Completed': return 'bg-blue-100 text-blue-800';
        default: return 'bg-red-100 text-red-800';
      }
    } else {
      switch (status) {
        case 'Paid': return 'bg-green-100 text-green-800';
        case 'Pending': return 'bg-yellow-100 text-yellow-800';
        default: return 'bg-red-100 text-red-800';
      }
    }
  };

  return (
    <div className="mt-2">
      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getColors(status)}`}>
        {status}
      </span>
    </div>
  );
};