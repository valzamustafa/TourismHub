// app/admin/layout.tsx
export const metadata = {
  title: 'TourismHub - Admin Dashboard',
  description: 'TourismHub Admin Dashboard',
};


export default function AdminLayout({
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