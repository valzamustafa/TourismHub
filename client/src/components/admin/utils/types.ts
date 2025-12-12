// src/components/admin/utils/types.ts
export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  joinDate: string;
  status: string;
  isActive: boolean;
}

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
   delayedDate?: string;          
  rescheduledStartDate?: string;  
  rescheduledEndDate?: string;    
  isActive?: boolean;
  isExpired?: boolean;
  isUpcoming?: boolean;
}

export interface ActivityImage {
  id: string;
  imageUrl: string;
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
  // Shto këto nëse mungojnë
  providerId?: string;
  providerName?: string;
}

export interface Provider {
  id: string;
  name: string;
  email: string;
}

export interface NewActivity {
  name: string;
  description: string;
  price: number;
  availableSlots: number;
  location: string;
  categoryId: string;
  duration: string;
  providerId: string;
  providerName: string;
  images: string[];
  startDate: string;
  endDate: string;
  included?: string;
  requirements?: string;
  quickFacts?: string;
}

export interface Review {
  id: string;
  activityId: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface RecentActivity {
  id: number;
  user: string;
  action: string;
  target: string;
  time: string;
}

export interface AboutContent {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  mission: string;
  vision: string;
  values: string[];
  teamMembers?: TeamMember[];
  contactEmail: string;
  contactPhone: string;
  address: string;
  lastUpdated: string;
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  bio: string;
  imageUrl: string;
}

export interface QuickActionProps {
  title: string;
  description: string;
  icon: React.ReactElement;
  action: () => void;
  color: string;
  count?: number;
}

export interface StatCardProps {
  title: string;
  value: string | number;
  subtitle: string;
  icon: React.ReactElement;
  color: string;
  progress?: number;
}