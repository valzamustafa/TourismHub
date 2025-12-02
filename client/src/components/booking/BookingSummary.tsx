import React from 'react';

interface BookingSummaryProps {
  activity: any;
  bookingData: {
    numberOfPeople: number;
    selectedDate: string;
    totalPrice: number;
    personalInfo?: {
      fullName: string;
      email: string;
    }
  };
}

export const BookingSummary: React.FC<BookingSummaryProps> = ({ 
  activity, 
  bookingData 
}) => {
  const subtotal = activity.price * bookingData.numberOfPeople;
  const tax = subtotal * 0.1; // 10% tax
  const total = subtotal + tax;

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">Booking Summary</h3>
      
      <div className="border border-gray-200 rounded-lg p-4">
        <div className="flex items-start space-x-4">
          {activity.images[0] && (
            <img 
              src={activity.images[0]} 
              alt={activity.name}
              className="w-20 h-20 object-cover rounded-md"
            />
          )}
          <div className="flex-1">
            <h4 className="font-semibold text-gray-900">{activity.name}</h4>
            <p className="text-sm text-gray-600">{activity.location}</p>
            <p className="text-sm text-gray-600">{activity.category}</p>
          </div>
        </div>

        <div className="mt-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Date:</span>
            <span className="text-gray-900">
              {new Date(bookingData.selectedDate).toLocaleDateString()}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Number of People:</span>
            <span className="text-gray-900">{bookingData.numberOfPeople}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Price per person:</span>
            <span className="text-gray-900">${activity.price}</span>
          </div>
        </div>

        <div className="border-t border-gray-200 my-3" />

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Subtotal:</span>
            <span className="text-gray-900">${subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Tax (10%):</span>
            <span className="text-gray-900">${tax.toFixed(2)}</span>
          </div>
          <div className="flex justify-between font-semibold">
            <span className="text-gray-900">Total:</span>
            <span className="text-blue-600">${total.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};