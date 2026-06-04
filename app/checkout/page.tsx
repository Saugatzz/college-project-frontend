import CheckoutClient from '@/components/checkout/CheckoutModule';
import { Suspense } from 'react';

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-mist flex items-center justify-center"><span className="text-pebble text-sm">Loading checkout…</span></div>}>
      <CheckoutClient />
    </Suspense>
  );
}