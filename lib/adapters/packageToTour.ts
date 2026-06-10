import { Package } from '@/components/dashboard/TourTable';
import type { Tour } from '@/types/tour';

const diffMap: Record<string, 'easy' | 'moderate' | 'hard'> = {
  Easy:        'easy',
  Moderate:    'moderate',
  Challenging: 'hard',
  Hard:        'hard',
};

const categoryMap: Record<string, Tour['category']> = {
  TREKKING:       'trek',
  CULTURAL:       'culture',
  ADVENTURE:      'adventure',
  WILDLIFE:       'adventure',
  'MOST POPULAR': 'trek',
};

export function packageToTour(pkg: Package): Tour {
  const includes = pkg.inclusions?.filter(i =>  i.included).map(i => i.text) ?? [];
  const excludes = pkg.inclusions?.filter(i => !i.included).map(i => i.text) ?? [];

  const gallery = pkg.images?.length
    ? [...pkg.images]
        .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
        .map(img => ({ src: img.src, alt: img.alt }))
    : [{ src: pkg.image ?? '/placeholder.jpg', alt: pkg.name }];

 return {
    id:          pkg.id,
    slug:        pkg.slug,
    name:        pkg.name,
    tagline:     pkg.tagline  || pkg.description.slice(0, 80),
    description: pkg.description,
    duration:    `${pkg.days} days`,
    days:        pkg.days,           // ✅ added
    tags:        pkg.tags ?? [],     // ✅ added (fallback to empty array)
    difficulty:  diffMap[pkg.difficulty]  ?? 'moderate',
    category:    categoryMap[pkg.category] ?? 'trek',
    price:       Number(pkg.price),
    rating:      Number(pkg.rating),
    reviewCount: pkg.reviewCount ?? 0,
    badge:       pkg.badge     || pkg.category || 'Popular',
    heroImage:   pkg.image ?? '/placeholder.jpg',
    image:       pkg.images?.[0]?.src ?? pkg.image ?? '/placeholder.jpg',
    gallery,
    itinerary: [...(pkg.itineraries ?? [])]
  .sort((a, b) => a.dayNumber - b.dayNumber)
  .map((item) => ({
    title: item.title,
    desc: item.description ?? '',
  })),
    highlights:  pkg.highlights ?? [],
    includes,
    excludes,
    addons:      pkg.addons?.map(a => ({
      name:  a.name,
      desc:  a.desc,
      price: Number(a.price),
    })) ?? [],
  };
}