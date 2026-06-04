import type { GalleryImage } from '@/types/tour';

interface Props {
  gallery: GalleryImage[];
  tourName: string;
}

export default function PhotoGallery({ gallery, tourName }: Props) {
  return (
    <div
      className="grid grid-cols-2 grid-rows-[190px_190px] gap-2.5 rounded-[18px] overflow-hidden"
      role="list"
      aria-label={`${tourName} photo gallery`}
    >
      {gallery.map((img, i) => (
        <div
          key={i}
          role="listitem"
          className={`overflow-hidden bg-sky-light relative group ${i === 0 ? 'row-span-2 col-span-1' : ''}`}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={img.src}
            alt={img.alt}
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-[550ms] ease-[cubic-bezier(0.25,0.46,0.45,0.94)] group-hover:scale-[1.06]"
          />
        </div>
      ))}
    </div>
  );
}
