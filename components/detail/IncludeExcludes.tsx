interface Props {
  includes: string[];
  excludes: string[];
}

function ListItem({ text, included }: { text: string; included: boolean }) {
  return (
    <li className="flex items-start gap-2.5 text-[0.84rem] text-stone leading-[1.55] py-1">
      <span
        aria-label={included ? 'Included' : 'Not included'}
        className={`w-[18px] h-[18px] rounded-full flex-shrink-0 flex items-center justify-center text-[0.6rem] font-extrabold mt-0.5
          ${included ? 'bg-green-100 text-[#1a8a59]' : 'bg-red-100 text-[#b03030]'}`}
      >
        {included ? '✓' : '✗'}
      </span>
      {text}
    </li>
  );
}

export default function IncludesExcludes({ includes, excludes }: Props) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 md:gap-7">
      <div>
        <p className="text-[0.72rem] font-semibold tracking-[0.1em] uppercase text-[#1a8a59] mb-3.5">Included</p>
        <ul className="list-none">{includes.map((item, i) => <ListItem key={i} text={item} included={true} />)}</ul>
      </div>
      <div>
        <p className="text-[0.72rem] font-semibold tracking-[0.1em] uppercase text-[#b03030] mb-3.5">Not Included</p>
        <ul className="list-none">{excludes.map((item, i) => <ListItem key={i} text={item} included={false} />)}</ul>
      </div>
    </div>
  );
}
