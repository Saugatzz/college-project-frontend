import TourDetailPage from '@/components/pages/TourDetailPage';

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <TourDetailPage id={id} />;
}
