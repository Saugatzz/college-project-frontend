import { notFound }      from 'next/navigation';
import { packageToTour } from '@/lib/adapters/packageToTour';
import { Package }       from '@/components/dashboard/TourTable';
import TourDetailPage    from '@/components/pages/TourDetailPage';

const BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

async function fetchBySlug(slug: string): Promise<Package | null> {
  try {
    const res = await fetch(`${BASE}/packages/slug/${slug}`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

async function fetchPackages(): Promise<Package[]> {
  try {
    const res = await fetch(`${BASE}/packages`, { next: { revalidate: 60 } });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

export default async function TourPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const [pkg, all] = await Promise.all([fetchBySlug(slug), fetchPackages()]);
  if (!pkg) notFound();

  const tour    = packageToTour(pkg);
  const similar = all
    .filter(p => p.id !== pkg.id && p.category === pkg.category)
    .slice(0, 3)
    .map(packageToTour);

  return <TourDetailPage tour={tour} similarTours={similar} />;
}