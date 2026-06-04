import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-12">
      <div className="text-5xl mb-4">🗺️</div>
      <h2 className="font-serif text-[2rem] text-ink mb-3">Page not found</h2>
      <p className="text-pebble mb-7">We could not locate the page you are looking for.</p>
      <Link href="/" className="bg-sky-accent text-white px-7 py-3 rounded-full no-underline text-[0.9rem] font-medium hover:bg-sky-dark transition-colors">
        Back to all tours
      </Link>
    </div>
  );
}
