import './globals.css';

export const metadata = {
  title: 'TourismHub - Login',
  description: 'Login to your TourismHub account',
};

export default function RootLayout({
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