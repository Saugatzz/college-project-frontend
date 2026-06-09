// src/app/page.tsx
import { packageToTour }  from '@/lib/adapters/packageToTour';
import type { Package }   from '@/components/dashboard/TourTable';
import HomePageClient from '@/components/pages/HomePage';

const BASE = process.env.API_URL ?? 'http://localhost:4000';

async function fetchPackages(): Promise<Package[]> {
  try {
    const res = await fetch(`${BASE}/packages`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

export default async function HomePage() {
  const packages = await fetchPackages();
  const tours    = packages.map(packageToTour);

  return <HomePageClient tours={tours} />;
}