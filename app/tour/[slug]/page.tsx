import { notFound }      from 'next/navigation';
import { packageToTour } from '@/lib/adapters/packageToTour';
import { Package }       from '@/components/dashboard/TourTable';
import TourDetailPage    from '@/components/pages/TourDetailPage';

const BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

async function fetchBySlug(slug: string): Promise<Package | null> {
  try {
    const res = await fetch(`${BASE}/packages/slug/${slug}`, {
      cache: 'no-store',
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

// Feature-similarity content-based recommendations computed server-side
// (see backend: src/packages/algorithms/recommendation.util.ts).
async function fetchSimilar(id: number): Promise<Package[]> {
  try {
    const res = await fetch(`${BASE}/packages/${id}/similar?limit=3`, {
      cache: 'no-store',
    });
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

  const pkg = await fetchBySlug(slug);
  if (!pkg) notFound();

  const similarPkgs = await fetchSimilar(pkg.id);

  const tour    = packageToTour(pkg);
  const similar = similarPkgs.map(packageToTour);

  return <TourDetailPage tour={tour} similarTours={similar} />;
}