'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import StripeProvider from '@/app/providers/StripeProvider';
import { CheckoutForm } from '@/app/booking/CheckoutForm';
import { BookingStepper } from '@/components/booking/BookingStepper';
import { PersonalInfoForm } from '@/components/booking/PersonalInfoForm';
import { BookingSummary } from '@/components/booking/BookingSummary';
import { PeopleSelector } from '@/components/booking/PeopleSelector';

const steps = ['Personal Information', 'Payment', 'Confirmation'];

export default function BookingPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [clientSecret, setClientSecret] = useState<string>('');
  const [activity, setActivity] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [bookingData, setBookingData] = useState({
    activityId: '',
    userId: '',
    numberOfPeople: 1, 
    selectedDate: new Date().toISOString().split('T')[0],
    totalPrice: 0,
    personalInfo: {
      fullName: '',
      email: '',
      phone: '',
      specialRequirements: ''
    }
  });
  const router = useRouter();

  useEffect(() => {
    const fetchActivity = async () => {
      try {
        const storedActivity = localStorage.getItem('selectedActivity');
        const userData = localStorage.getItem('user');
        
        if (!storedActivity || !userData) {
          router.push('/tourist/activities');
          return;
        }

        const activityData = JSON.parse(storedActivity);
        const user = JSON.parse(userData);

        setActivity(activityData);
        setBookingData(prev => ({
          ...prev,
          activityId: activityData.id,
          userId: user.id,
          totalPrice: activityData.price * prev.numberOfPeople
        }));

      } catch (error) {
        console.error('Error fetching activity:', error);
        router.push('/tourist/activities');
      } finally {
        setLoading(false);
      }
    };

    fetchActivity();
  }, [router]);


  const handleNumberOfPeopleChange = (value: number) => {
    if (value < 1) return;
    setBookingData(prev => ({
      ...prev,
      numberOfPeople: value,
      totalPrice: activity ? activity.price * value : 0
    }));
  };

  const createPaymentIntent = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5224/api/payments/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          amount: bookingData.totalPrice * 100, 
          currency: 'usd',
          activityId: bookingData.activityId,
          bookingDate: bookingData.selectedDate,
          numberOfPeople: bookingData.numberOfPeople,
          customerEmail: bookingData.personalInfo.email
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create payment intent');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error creating payment intent:', error);
      throw error;
    }
  };

  const handlePersonalInfoChange = (personalInfo: any) => {
    setBookingData(prev => ({ ...prev, personalInfo }));
  };

  const handleNext = async () => {
    if (currentStep === 0) {
    
      if (!bookingData.personalInfo.fullName || !bookingData.personalInfo.email) {
        alert('Please fill in all required fields');
        return;
      }
      
      try {
        const paymentIntentData = await createPaymentIntent();
        setClientSecret(paymentIntentData.clientSecret);
        setCurrentStep(1);
      } catch (error: any) {
        alert(`Failed to initialize payment: ${error.message || 'Unknown error'}`);
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

const handlePaymentSuccess = async (paymentIntentId: string) => {
  try {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    const user = userData ? JSON.parse(userData) : null;
    
    if (!user || !user.id) {
      throw new Error('User not found. Please login again.');
    }

    console.log('Creating booking with data:', {
      activityId: bookingData.activityId,
      userId: user.id,
      bookingDate: bookingData.selectedDate,
      numberOfPeople: bookingData.numberOfPeople,
      totalPrice: bookingData.totalPrice,
      status: 0, 
      paymentStatus: 0 
    });

    const bookingResponse = await fetch('http://localhost:5224/api/bookings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        activityId: bookingData.activityId,
        userId: user.id, 
        bookingDate: bookingData.selectedDate + 'T12:00:00Z', 
        numberOfPeople: bookingData.numberOfPeople,
        totalPrice: bookingData.totalPrice, 
        status: 0,
        paymentStatus: 0 
      })
    });

    if (!bookingResponse.ok) {
      const errorText = await bookingResponse.text();
      console.error('Booking error response:', errorText);
      throw new Error(`Failed to create booking: ${errorText}`);
    }

    const booking = await bookingResponse.json();
    console.log('Booking created:', booking);

    const paymentResponse = await fetch('http://localhost:5224/api/payments/confirm', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        bookingId: booking.id || booking.bookingId,
        paymentIntentId: paymentIntentId,
        amount: bookingData.totalPrice
      })
    });

    if (!paymentResponse.ok) {
      const errorText = await paymentResponse.text();
      console.error('Payment error response:', errorText);
      
      await fetch(`http://localhost:5224/api/bookings/${booking.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      throw new Error(`Failed to confirm payment: ${errorText}`);
    }

    const paymentResult = await paymentResponse.json();
    console.log('Payment confirmed:', paymentResult);

    setCurrentStep(2);

    localStorage.removeItem('selectedActivity');
    
  } catch (error: any) {
    console.error('Error completing booking:', error);
    alert(`Error: ${error.message || 'Please contact support.'}`);
  }
};

  if (loading) {
    return (
      <div className="min-h-screen bg-[#c8d5c0] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-700">Loading booking information...</p>
        </div>
      </div>
    );
  }

  if (!activity) {
    return (
      <div className="min-h-screen bg-[#c8d5c0] flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">No Activity Selected</h2>
          <p className="text-gray-700 mb-6">Please select an activity to book.</p>
          <button
            onClick={() => router.push('/tourist/activities')}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Browse Activities
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#c8d5c0] py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Complete Your Booking</h1>
          <p className="text-gray-600">Secure your spot for {activity.name}</p>
        </div>

        <BookingStepper currentStep={currentStep} steps={steps} />

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
              {currentStep === 0 && (
                <>
              
                  <div className="mb-8">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Select Number of People</h3>
                    <PeopleSelector
                      value={bookingData.numberOfPeople}
                      onChange={handleNumberOfPeopleChange}
                      maxPeople={10}
                    />
                  </div>


                  <PersonalInfoForm
                    data={bookingData.personalInfo}
                    onChange={handlePersonalInfoChange}
                  />
                </>
              )}

              {currentStep === 1 && clientSecret && (
                <StripeProvider clientSecret={clientSecret}>
                  <CheckoutForm
                    clientSecret={clientSecret}
                    amount={bookingData.totalPrice}
                    onSuccess={handlePaymentSuccess}
                    onError={(error: any) => {
                      alert(`Payment failed: ${error.message || 'Please try again'}`);
                    }}
                  />
                </StripeProvider>
              )}

              {currentStep === 2 && (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Booking Confirmed! 🎉</h3>
                  <p className="text-gray-600 mb-4">
                    Thank you for your booking. A confirmation email has been sent to {bookingData.personalInfo.email}
                  </p>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4 max-w-md mx-auto">
                    <p className="text-sm text-green-800">
                      <strong>Booking Reference:</strong> THB-{Date.now().toString().slice(-8).toUpperCase()}
                    </p>
                    <p className="text-sm text-green-800 mt-2">
                      <strong>Activity:</strong> {activity.name}
                    </p>
                    <p className="text-sm text-green-800 mt-1">
                      <strong>Number of People:</strong> {bookingData.numberOfPeople}
                    </p>
                    <p className="text-sm text-green-800 mt-1">
                      <strong>Total Paid:</strong> ${bookingData.totalPrice.toFixed(2)}
                    </p>
                  </div>
                </div>
              )}

          
              {currentStep < 2 && (
                <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
                  <button
                    onClick={handleBack}
                    disabled={currentStep === 0}
                    className={`px-6 py-2 rounded-lg border ${
                      currentStep === 0
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    Back
                  </button>
                  
                  <button
                    onClick={handleNext}
                    disabled={currentStep === 1}
                    className={`px-6 py-2 rounded-lg font-medium ${
                      currentStep === 1
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-blue-600 text-white hover:bg-blue-700 transition-colors'
                    }`}
                  >
                    {currentStep === 0 ? 'Continue to Payment' : 'Processing...'}
                  </button>
                </div>
              )}

              {currentStep === 2 && (
                <div className="text-center mt-8 pt-6 border-t border-gray-200 space-x-4">
                  <button
                    onClick={() => router.push('/tourist/profile')}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    View My Bookings
                  </button>
                  <button
                    onClick={() => router.push('/tourist/activities')}
                    className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Book Another Activity
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar - Booking Summary */}
          <div className="lg:col-span-1">
            <div className="sticky top-8">
            <BookingSummary 
              activity={activity} 
              bookingData={{
                numberOfPeople: bookingData.numberOfPeople,
                selectedDate: bookingData.selectedDate,
                totalPrice: bookingData.totalPrice,
                personalInfo: bookingData.personalInfo
              }} 
            />
                        
              {/* Additional Info Card */}
              <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 mt-6">
                <h4 className="font-semibold text-gray-900 mb-3">Need Help?</h4>
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center">
                    <span className="mr-2">📞</span>
                    <span>+1 234 567 890</span>
                  </div>
                  <div className="flex items-center">
                    <span className="mr-2">✉️</span>
                    <span>support@tourismhub.com</span>
                  </div>
                  <div className="flex items-center">
                    <span className="mr-2">🕒</span>
                    <span>24/7 Customer Support</span>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <h5 className="font-semibold text-gray-900 mb-2">Secure Payment</h5>
                  <div className="flex items-center space-x-2">
                    <div className="text-xs bg-gray-100 px-2 py-1 rounded">🔒 SSL</div>
                    <div className="text-xs bg-gray-100 px-2 py-1 rounded">💳 Stripe</div>
                    <div className="text-xs bg-gray-100 px-2 py-1 rounded">🛡️ PCI DSS</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}