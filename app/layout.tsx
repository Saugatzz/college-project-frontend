'use client'; 

import type { Metadata } from 'next';
import { usePathname } from 'next/navigation';
import '@mantine/core/styles.css'; 
import './globals.css';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { MantineProvider } from '@mantine/core';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  
  const isDashboard = pathname?.startsWith('/dashboard');
  const isAuthPage = pathname?.startsWith('/auth');

  return (
    <html lang="en">
      <body>
        {/* Only show the marketing Header if NOT on a dashboard page */}
        {!isDashboard && !isAuthPage && <Header />}
        
        <MantineProvider>
          {children}
        </MantineProvider>
        
        {/* Only show the marketing Footer if NOT on a dashboard page */}
        {!isDashboard && !isAuthPage && <Footer />}
      </body>
    </html>
  );
}