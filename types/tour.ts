export interface GalleryImage {
  src: string;
  alt: string;
}

export interface ItineraryDay {
  title: string;
  desc: string;
}

export interface Highlight {
  icon: string;
  title: string;
  desc: string;
}

export interface Addon {
  name: string;
  desc: string;
  price: number;
}

export type Difficulty = 'easy' | 'moderate' | 'hard';
export type Category = 'trek' | 'culture' | 'adventure';

export interface Tour {
  id: number;
  name: string;
  tagline: string;
  image: string;
  badge: string;
  category: Category;
  difficulty: Difficulty;
  duration: string;
  days: number;
  price: number;
  rating: number;
  slug:string;
  reviewCount: number;
  tags: string[];
  heroImage: string;
  gallery: GalleryImage[];
  description: string;
  itinerary: ItineraryDay[];
  highlights: Highlight[];
  includes: string[];
  excludes: string[];
  addons: Addon[];
  slug: string;
}