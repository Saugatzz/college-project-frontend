'use client'; 

import { usePathname } from 'next/navigation';
import '@mantine/core/styles.css'; 
import './globals.css';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { MantineProvider } from '@mantine/core';
import WhatsAppWidget from '@/components/layout/WhatsappWidget';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  const isDashboard = pathname?.startsWith('/dashboard');
  const isAuthPage  = pathname?.startsWith('/auth');

  return (
    <html lang="en">
      <body>
        {!isDashboard && !isAuthPage && <Header />}
        
        <MantineProvider>
          {children}
        </MantineProvider>
        
        {!isDashboard && !isAuthPage && <Footer />}

        {/* WhatsApp floating widget — hidden on dashboard & auth */}
        {!isDashboard && !isAuthPage && <WhatsAppWidget />}
      </body>
    </html>
  );
}