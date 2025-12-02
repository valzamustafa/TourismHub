'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { CheckCircle } from 'lucide-react';

export default function BookingSuccessPage() {
  const [bookingDetails, setBookingDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const paymentIntentId = searchParams.get('payment_intent');
    
    if (paymentIntentId) {
      fetchBookingDetails(paymentIntentId);
    } else {
      setLoading(false);
    }
  }, [searchParams]);

  const fetchBookingDetails = async (paymentIntentId: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `http://localhost:5224/api/payments/by-intent/${paymentIntentId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        setBookingDetails(data);
      }
    } catch (error) {
      console.error('Error fetching booking details:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-700">Loading booking details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-12 h-12 text-green-600" />
        </div>
        
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Payment Successful! 🎉
        </h1>
        
        <p className="text-gray-600 mb-6">
          Thank you for your booking. Your payment has been processed successfully.
        </p>

        {bookingDetails && (
          <div className="bg-gray-50 rounded-xl p-6 mb-6 text-left">
            <h3 className="font-semibold text-gray-900 mb-4">Booking Details</h3>
            <div className="space-y-3">
              <p className="flex justify-between">
                <span className="text-gray-600">Activity:</span>
                <span className="font-semibold">{bookingDetails.activityName}</span>
              </p>
              <p className="flex justify-between">
                <span className="text-gray-600">Date:</span>
                <span className="font-semibold">
                  {new Date(bookingDetails.bookingDate).toLocaleDateString()}
                </span>
              </p>
              <p className="flex justify-between">
                <span className="text-gray-600">Amount:</span>
                <span className="font-semibold text-green-600">
                  ${bookingDetails.totalAmount?.toFixed(2) || '0.00'}
                </span>
              </p>
              <p className="flex justify-between">
                <span className="text-gray-600">Status:</span>
                <span className={`font-semibold ${
                  bookingDetails.paymentStatus === 'Paid' ? 'text-green-600' : 'text-yellow-600'
                }`}>
                  {bookingDetails.paymentStatus}
                </span>
              </p>
            </div>
          </div>
        )}

        <div className="space-y-3">
          <button
            onClick={() => router.push('/tourist/profile')}
            className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
          >
            View My Bookings
          </button>
          <button
            onClick={() => router.push('/tourist/activities')}
            className="w-full py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold"
          >
            Book Another Activity
          </button>
          <button
            onClick={() => router.push('/')}
            className="w-full py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Back to Home
          </button>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-sm text-gray-500">
            A confirmation email has been sent to your registered email address.
          </p>
          <p className="text-xs text-gray-400 mt-2">
            Having trouble? Contact support@tourismhub.com
          </p>
        </div>
      </div>
    </div>
  );
}