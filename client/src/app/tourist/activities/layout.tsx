// app/tourist/activities/layout.tsx
export const metadata = {
  title: 'TourismHub - Activities',
  description: 'Explore amazing activities and categories',
};

export default function ActivitiesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-white">
      {children}
    </div>
  );
}