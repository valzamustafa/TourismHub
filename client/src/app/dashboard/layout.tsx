// app/dashboard/layout.tsx
import '../globals.css';

export const metadata = {
  title: 'TourismHub - Dashboard',
  description: 'TourismHub User Dashboard',
};

export default function DashboardLayout({
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