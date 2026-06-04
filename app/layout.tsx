import type { Metadata } from 'next';
// app/layout.tsx
import '@mantine/core/styles.css'; 
import './globals.css';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { MantineProvider } from '@mantine/core';

export const metadata: Metadata = {
  title: 'eBooking Nepal — Premier Tour Curator',
  description: 'Discover curated tours in Nepal — from Everest treks to cultural heritage journeys.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Header />
        <MantineProvider>
          {children}
        </MantineProvider>
        <Footer />
      </body>
    </html>
  );
}
