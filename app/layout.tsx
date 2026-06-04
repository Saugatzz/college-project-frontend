import type { Metadata } from 'next';
import './globals.css';
import Header from '@/components/layout/Header';

export const metadata: Metadata = {
  title: 'eBooking Nepal — Premier Tour Curator',
  description: 'Discover curated tours in Nepal — from Everest treks to cultural heritage journeys.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Header />
        {children}
      </body>
    </html>
  );
}
