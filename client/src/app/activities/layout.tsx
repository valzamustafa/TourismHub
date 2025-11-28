// app/activities/layout.tsx
import '../globals.css';

export const metadata = {
  title: 'TourismHub - Activities',
  description: 'Explore activities',
};

export default function ActivitiesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}