// app/page.tsx
'use client';

import { Home } from '@/components/Home';
import { useRouter } from 'next/navigation';

export default function LandingPage() {
  const router = useRouter();

  const handleNavigate = (page: string, data?: any) => {
    if (page === 'login' || page === 'register') {
      router.push(`/${page}`);
    } else if (page === 'activities') {
      router.push('/tourist/activities');
    } else if (page === 'booking') {
      router.push('/booking');
    } else if (page === 'activity-detail') {
      router.push(`/tourist/activities/${data.activityId}`);
    } else if (page === 'provider-registration') {
      router.push('/provider/register');
    }
  };

  return <Home onNavigate={handleNavigate} />;
}