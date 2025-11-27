// app/booking/page.tsx
'use client';

import React, { useState } from 'react';
import { BookingStepper } from '@/components/booking/BookingStepper';
import { PersonalInfoForm } from '@/components/booking/PersonalInfoForm';
import { PaymentForm } from '@/components/booking/PaymentForm';
import { BookingSummary } from '@/components/booking/BookingSummary';
import { Card, CardContent } from '@/components/ui/Card';

const steps = ['Personal Information', 'Payment', 'Confirmation'];

export default function BookingPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [bookingData, setBookingData] = useState({
    activityId: '1',
    userId: 'user123',
    numberOfPeople: 2,
    selectedDate: new Date().toISOString().split('T')[0],
    totalPrice: 200,
    personalInfo: {
      fullName: '',
      email: '',
      phone: '',
      specialRequirements: ''
    },
    paymentInfo: {
      cardNumber: '',
      expiryDate: '',
      cvv: '',
      cardHolder: ''
    }
  });

  const activity = {
    id: '1',
    name: 'Auckland Nature Walk',
    description: 'Beautiful nature walk through Auckland parks',
    price: 100,
    availableSlots: 10,
    location: 'Auckland, New Zealand',
    category: 'Nature Tour',
    providerName: 'Nature Adventures',
    images: ['/images/nature-walk.jpg'],
    duration: '3 hours',
    included: ['Guide', 'Water', 'Snacks']
  };

  const handlePersonalInfoChange = (personalInfo: any) => {
    setBookingData(prev => ({ ...prev, personalInfo }));
  };

  const handlePaymentInfoChange = (paymentInfo: any) => {
    setBookingData(prev => ({ ...prev, paymentInfo }));
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSubmitBooking = async () => {
    try {

      console.log('Submitting booking:', bookingData);
     
      setCurrentStep(prev => prev + 1);
    } catch (error) {
      console.error('Booking failed:', error);
    }
  };

  return (
    <div className="min-h-screen bg-[#c8d5c0] py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Complete Your Booking</h1>
          <p className="text-gray-600">Secure your spot for an unforgettable experience</p>
        </div>

        {/* Stepper */}
        <BookingStepper currentStep={currentStep} steps={steps} />

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <Card>
              <CardContent className="p-6">
                {currentStep === 0 && (
                  <PersonalInfoForm
                    data={bookingData.personalInfo}
                    onChange={handlePersonalInfoChange}
                  />
                )}

                {currentStep === 1 && (
                  <PaymentForm
                    data={bookingData.paymentInfo}
                    onChange={handlePaymentInfoChange}
                  />
                )}

                {currentStep === 2 && (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Booking Confirmed!</h3>
                    <p className="text-gray-600 mb-4">
                      Thank you for your booking. A confirmation email has been sent to {bookingData.personalInfo.email}
                    </p>
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <p className="text-sm text-green-800">
                        <strong>Booking Reference:</strong> THB-{Date.now().toString().slice(-6)}
                      </p>
                    </div>
                  </div>
                )}

                {/* Navigation Buttons */}
                {currentStep < 2 && (
                  <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
                    <button
                      onClick={handleBack}
                      disabled={currentStep === 0}
                      className={`px-6 py-2 rounded-lg border ${
                        currentStep === 0
                          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      Back
                    </button>
                    
                    <button
                      onClick={currentStep === 1 ? handleSubmitBooking : handleNext}
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      {currentStep === 1 ? 'Complete Booking' : 'Continue'}
                    </button>
                  </div>
                )}

                {currentStep === 2 && (
                  <div className="text-center mt-8 pt-6 border-t border-gray-200">
                    <button
                      onClick={() => window.location.href = '/'}
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Return to Home
                    </button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - Booking Summary */}
          <div className="lg:col-span-1">
            <div className="sticky top-8">
              <BookingSummary activity={activity} bookingData={bookingData} />
              
              {/* Additional Info Card */}
              <Card className="mt-6">
                <CardContent className="p-6">
                  <h4 className="font-semibold text-gray-900 mb-3">Need Help?</h4>
                  <div className="space-y-2 text-sm text-gray-600">
                    <p>📞 +1 234 567 890</p>
                    <p>✉️ support@tourismhub.com</p>
                    <p>🕒 24/7 Customer Support</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}