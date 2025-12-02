// types/booking.ts
export interface BookingData {
  activityId: string;
  userId: string;
  numberOfPeople: number;
  selectedDate: string;
  totalPrice: number;
  personalInfo: {
    fullName: string;
    email: string;
    phone: string;
    specialRequirements?: string;
  };
  paymentInfo?: {
    cardNumber: string;
    expiryDate: string;
    cvv: string;
    cardHolder: string;
  };
}

export interface Activity {
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
}