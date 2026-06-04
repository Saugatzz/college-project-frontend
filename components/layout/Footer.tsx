import Link from 'next/link';
import Image from 'next/image';

const destinations = ['Everest Region', 'Annapurna Circuit', 'Langtang Valley', 'Mustang & Upper Mustang', 'Chitwan Jungle'];
const company = [
  { label: 'About Us', href: '/about' },
  { label: 'Contact Us', href: '/contact' },
  { label: 'Our Team', href: '#' },
  { label: 'Sustainability', href: '#' },
  { label: 'Press', href: '#' },
];
const support = ['FAQs', 'Booking Policy', 'Cancellation Terms', 'Travel Insurance', 'Safety Guidelines'];

export default function Footer() {
  return (
    <footer className="bg-[#0f4c81] text-white/80 pt-16 pb-8 mt-0">
      <div className="max-w-7xl mx-auto px-6 md:px-12">

        {/* Top grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 pb-12 border-b border-white/10">

          {/* Brand column */}
          <div className="lg:col-span-1">
            <Link href="/" className="bg-white p-3 rounded-xl inline-block mb-5">
              <Image src="/images/logo.png" alt="eBooking Nepal" width={110} height={35} className="h-[35px] w-auto brightness-200" />
            </Link>
            <p className="text-[0.875rem] text-white/55 leading-[1.75] font-light mb-6">
              Nepal's premier curated tour platform — connecting adventurers with the Himalayan soul since 2015.
            </p>
            <div className="flex gap-3">
              {['facebook', 'instagram', 'twitter', 'youtube'].map((s) => (
                <a
                  key={s}
                  href="#"
                  aria-label={s}
                  className="w-9 h-9 rounded-full border border-white/15 flex items-center justify-center text-white/50 hover:text-sky-accent hover:border-sky-accent/50 transition-all text-xs"
                >
                  {s === 'facebook' ? 'f' : s === 'instagram' ? '◎' : s === 'twitter' ? '𝕏' : '▷'}
                </a>
              ))}
            </div>
          </div>

          {/* Destinations */}
          <div>
            <h4 className="text-[0.72rem] font-semibold tracking-[0.14em] uppercase text-pebble mb-5">Destinations</h4>
            <ul className="space-y-3">
              {destinations.map((d) => (
                <li key={d}>
                  <a href="#" className="text-[0.875rem] text-white/55 hover:text-sky-accent transition-colors font-light">
                    {d}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-[0.72rem] font-semibold tracking-[0.14em] uppercase text-pebble mb-5">Company</h4>
            <ul className="space-y-3">
              {company.map((c) => (
                <li key={c.label}>
                  <Link href={c.href} className="text-[0.875rem] text-white/55 hover:text-sky-accent transition-colors font-light no-underline">
                    {c.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support + newsletter */}
          <div>
            <h4 className="text-[0.72rem] font-semibold tracking-[0.14em] uppercase text-pebble mb-5">Support</h4>
            <ul className="space-y-3 mb-8">
              {support.map((s) => (
                <li key={s}>
                  <a href="#" className="text-[0.875rem] text-white/55 hover:text-sky-accent transition-colors font-light">
                    {s}
                  </a>
                </li>
              ))}
            </ul>
            <h4 className="text-[0.72rem] font-semibold tracking-[0.14em] uppercase text-pebble mb-3">Newsletter</h4>
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="Your email"
                className="flex-1 bg-white/5 border border-white/15 rounded-full px-4 py-2 text-[0.82rem] text-white placeholder-white/30 outline-none focus:border-sky-accent/50 transition-colors"
              />
              <button className="bg-sky-accent hover:bg-sky-dark text-white px-4 py-2 rounded-full text-[0.82rem] font-medium transition-colors whitespace-nowrap">
                Join
              </button>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-7">
          <p className="text-[0.78rem] text-white/35 font-light">
            © {new Date().getFullYear()} eBooking Nepal. All rights reserved.
          </p>
          <div className="flex gap-6">
            {['Privacy Policy', 'Terms of Service', 'Cookie Policy'].map((t) => (
              <a key={t} href="#" className="text-[0.78rem] text-white/35 hover:text-white/60 transition-colors font-light">
                {t}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}