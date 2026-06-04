import type { Highlight } from '@/types/tour';

export default function Highlights({ highlights }: { highlights: Highlight[] }) {
  return (
    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 list-none">
      {highlights.map((h, i) => (
        <li key={i} className="flex items-start gap-3 bg-mist border border-sky-mid/15 rounded-[10px] p-4">
          <span className="text-[1.4rem] flex-shrink-0 mt-0.5" aria-hidden="true">{h.icon}</span>
          <div className="text-[0.84rem] text-stone leading-[1.5]">
            <strong className="block text-ink font-medium mb-0.5 text-[0.88rem]">{h.title}</strong>
            {h.desc}
          </div>
        </li>
      ))}
    </ul>
  );
}
