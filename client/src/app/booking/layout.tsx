// app/booking/layout.tsx
import '../globals.css';

export const metadata = {
  title: 'TourismHub - Booking',
  description: 'Book your activity',
};

export default function BookingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
