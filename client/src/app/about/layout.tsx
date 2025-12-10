// app/about/layout.tsx
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About Us - TourismHub',
  description: 'Learn about TourismHub, our mission, vision, values, and meet our expert providers.',
};

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}