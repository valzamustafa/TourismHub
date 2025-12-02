// types/index.ts
export interface Activity {
  id: string;
  name: string;
  description: string;
  price: number;
  availableSlots: number;
  location: string;
  category: string;
  categoryId: string;
  providerName: string;
  providerId: string;
  duration: string;
  status: string;
  images: ActivityImage[];
  createdAt: string;
  startDate: string;
  endDate: string;
}

export interface ActivityImage {
  id: string;
  imageUrl: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  joinDate: string;
  status: string;
  isActive: boolean;
}

export interface Category {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  featured: boolean;
  activityCount: number;
}

export interface Booking {
  id: string;
  activityName: string;
  userName: string;
  userId: string;
  activityId: string;
  bookingDate: string;
  numberOfPeople: number;
  totalAmount: number;
  status: string;
  paymentStatus: string;
}

export interface Provider {
  id: string;
  name: string;
  email: string;
}

export interface RecentActivity {
  id: number;
  user: string;
  action: string;
  target: string;
  time: string;
}

export interface StatCardProps {
  title: string;
  value: string | number;
  subtitle: string;
  icon: React.ReactElement;
  color: string;
  progress?: number;
}

export interface QuickActionProps {
  title: string;
  description: string;
  icon: React.ReactElement;
  action: () => void;
  color: string;
  count?: number;
}

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5224/api';