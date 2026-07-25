// src/components/tours/Pagination.tsx
'use client';

interface Props {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({ page, totalPages, onPageChange }: Props) {
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <nav
      className="flex items-center justify-center gap-2 mt-12"
      aria-label="Tour results pages"
    >
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={page === 1}
        className="px-3 py-2 rounded-full border border-sky-mid text-stone text-sm disabled:opacity-40 disabled:cursor-not-allowed hover:bg-sky-accent hover:text-white hover:border-sky-accent transition-all"
        aria-label="Previous page"
      >
        ‹
      </button>

      {pages.map(p => (
        <button
          key={p}
          onClick={() => onPageChange(p)}
          aria-current={p === page ? 'page' : undefined}
          className={`w-9 h-9 rounded-full border text-sm transition-all
            ${p === page
              ? 'bg-sky-accent border-sky-accent text-white'
              : 'border-sky-mid text-stone hover:bg-sky-accent hover:border-sky-accent hover:text-white'
            }`}
        >
          {p}
        </button>
      ))}

      <button
        onClick={() => onPageChange(page + 1)}
        disabled={page === totalPages}
        className="px-3 py-2 rounded-full border border-sky-mid text-stone text-sm disabled:opacity-40 disabled:cursor-not-allowed hover:bg-sky-accent hover:text-white hover:border-sky-accent transition-all"
        aria-label="Next page"
      >
        ›
      </button>
    </nav>
  );
}