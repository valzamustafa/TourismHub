import { Activity, BookingData } from '@/types/booking';

export const getActivityById = async (id: string): Promise<Activity> => {
  const response = await fetch(`/api/activities/${id}`);
  if (!response.ok) throw new Error('Activity not found');
  return response.json();
};

export const createBooking = async (bookingData: BookingData) => {
  const response = await fetch('/api/bookings', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(bookingData),
  });
  
  if (!response.ok) throw new Error('Booking failed');
  return response.json();
};

export const processPayment = async (paymentData: any) => {
  const response = await fetch('/api/payments', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(paymentData),
  });
  
  if (!response.ok) throw new Error('Payment failed');
  return response.json();
};