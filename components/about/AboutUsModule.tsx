import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

const team = [
  { name: 'Saugat Panta', role: 'Founder & Lead Guide', bio: "Born in the shadow of the Himalayas, Saugat has led over 400 treks across Nepal's highest peaks.", initials: 'SP', tours: '400+', years: '15' },
  { name: 'Shovit Regmi', role: 'Head of Operations', bio: 'With 12 years in sustainable tourism, Shovit ensures every journey runs flawlessly and responsibly.', initials: 'SR', tours: '200+', years: '12' },
  { name: 'Suman Basnet', role: 'Senior Trek Guide', bio: "A certified mountaineer who speaks five languages and knows every trail like the back of his hand.", initials: 'SB', tours: '300+', years: '10' },
  { name: 'Raman Achammi', role: 'Guest Experience Manager', bio: "Raman's passion is crafting personalised moments that turn first-time visitors into lifelong adventurers.", initials: 'RA', tours: '150+', years: '8' },
];

const values = [
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="4"/><line x1="4.93" y1="4.93" x2="9.17" y2="9.17"/><line x1="14.83" y1="14.83" x2="19.07" y2="19.07"/><line x1="14.83" y1="9.17" x2="19.07" y2="4.93"/><line x1="14.83" y1="9.17" x2="18.36" y2="5.64"/><line x1="4.93" y1="19.07" x2="9.17" y2="14.83"/>
      </svg>
    ),
    title: 'Authentic Experiences',
    desc: "We curate journeys that connect you with Nepal's true spirit — its people, landscapes, and living traditions.",
    color: 'from-sky-accent/15 to-sky-mid/10',
    border: 'border-sky-accent/20',
    iconColor: 'text-sky-accent',
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
      </svg>
    ),
    title: 'Responsible Travel',
    desc: 'Every tour is designed with environmental stewardship and community benefit woven into its foundations.',
    color: 'from-emerald-50 to-teal-50/50',
    border: 'border-emerald-200/50',
    iconColor: 'text-emerald-600',
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/><path d="M12 6v6l4 2"/>
      </svg>
    ),
    title: 'Safety First',
    desc: 'Certified guides, real-time monitoring, and comprehensive insurance keep every adventurer protected.',
    color: 'from-amber-50 to-orange-50/50',
    border: 'border-amber-200/50',
    iconColor: 'text-amber-600',
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
      </svg>
    ),
    title: 'Unmatched Local Expertise',
    desc: 'A decade of relationships with local communities means you experience Nepal beyond the guidebook.',
    color: 'from-purple-50 to-violet-50/50',
    border: 'border-purple-200/50',
    iconColor: 'text-purple-600',
  },
];

const stats = [
  { n: '12k+', l: 'Happy Trekkers' },
  { n: '48+', l: 'Curated Routes' },
  { n: '10', l: 'Years of Trust' },
];


const avatarGradients = [
  'from-sky-accent to-sky-dark',
  'from-teal-500 to-emerald-600',
  'from-violet-500 to-purple-600',
  'from-amber-500 to-orange-600',
];

export default function AboutPage() {
  return (
    <>
      <Header />
      <main className="pt-[68px]">

        {/* ── Hero ── */}
        <section
          className="relative min-h-[520px] flex items-center bg-[url('/images/hero-4.jpg')] bg-center bg-cover px-6 md:px-12 py-24"
          aria-label="About hero"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-[rgba(4,12,24,0.85)] via-[rgba(4,12,24,0.58)] to-[rgba(4,12,24,0.22)]" />
          
          <div className="absolute bottom-0 inset-x-0 h-32 bg-gradient-to-t from-mist to-transparent pointer-events-none" />

          <div className="relative z-10 max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/25 text-white/80 text-[0.68rem] font-semibold tracking-[0.14em] uppercase px-4 py-1.5 rounded-full mb-7 backdrop-blur-sm">
              ✦ Our Story
            </div>
            <h1 className="font-serif text-[clamp(2.2rem,4.5vw,3.8rem)] font-light leading-[1.15] text-white mb-5">
              Born from a Love of<br /><em className="italic text-gold">the Mountains</em>
            </h1>
            <p className="text-[1rem] text-white/70 leading-[1.8] font-light max-w-[480px]">
              eBooking Nepal began in 2015 with a single promise: to share the magic of the Himalayas with the world, without compromising on authenticity or the environment.
            </p>
          </div>
        </section>

       
        <section className="bg-mist py-20 px-6 md:px-12">
          <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-14 items-center">
            <div>
              <span className="text-[0.7rem] font-semibold tracking-[0.14em] uppercase text-pebble mb-4 block">Who We Are</span>
              <h2 className="font-serif text-[clamp(1.8rem,3vw,2.6rem)] font-light text-ink mb-5 leading-[1.25]">
                Nepal's Most Trusted<br />Tour Curator
              </h2>
              <p className="text-[0.95rem] text-stone leading-[1.85] font-light mb-4">
                We're a team of guides, storytellers, and mountain-lovers based in Kathmandu. Since our founding, we've led over 12,000 trekkers through Nepal's most breathtaking regions — from Everest Base Camp to the hidden valleys of Mustang.
              </p>
              <p className="text-[0.95rem] text-stone leading-[1.85] font-light">
                Our approach is simple: small groups, expert local guides, and an unwavering commitment to leaving every place better than we found it.
              </p>

              {/* Stats row */}
              <div className="flex gap-0 mt-10 pt-8 border-t border-sky-mid/20">
                {stats.map(({ n, l }, i) => (
                  <div key={l} className={`flex-1 ${i > 0 ? 'pl-6 border-l border-sky-mid/20' : ''} ${i < stats.length - 1 ? 'pr-6' : ''}`}>
                    <div className="font-serif text-[2rem] font-semibold text-sky-dark leading-none">{n}</div>
                    <div className="text-[0.7rem] text-pebble uppercase tracking-widest mt-1.5 font-light leading-[1.4]">{l}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Photo mosaic */}
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-[16px] h-[200px] overflow-hidden shadow-[0_4px_20px_rgba(30,80,120,0.12)]">
                <img src="/images/gallery-4-1.jpg" alt="" className="w-full h-full object-cover hover:scale-105 transition-transform duration-700" />
              </div>
              <div className="rounded-[16px] h-[200px] overflow-hidden shadow-[0_4px_20px_rgba(30,80,120,0.12)] mt-6">
                <img src="/images/gallery-4-2.jpg" alt="" className="w-full h-full object-cover hover:scale-105 transition-transform duration-700" />
              </div>
              <div className="rounded-[16px] h-[200px] overflow-hidden shadow-[0_4px_20px_rgba(30,80,120,0.12)] col-span-2">
                <img src="/images/gallery-4-3.jpg" alt="" className="w-full h-full object-cover hover:scale-105 transition-transform duration-700" />
              </div>
            </div>
          </div>
        </section>

        {/* ── Values ── */}
        <section className="bg-white py-20 px-6 md:px-12">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-14">
              <span className="text-[0.7rem] font-semibold tracking-[0.14em] uppercase text-pebble mb-3 block">What Guides Us</span>
              <h2 className="font-serif text-[clamp(1.8rem,3vw,2.6rem)] font-light text-ink">Our Core Values</h2>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {values.map((v) => (
                <div
                  key={v.title}
                  className={`bg-gradient-to-br ${v.color} border ${v.border} rounded-[20px] p-6 hover:shadow-[0_12px_36px_rgba(30,80,120,0.12)] hover:-translate-y-1 transition-all`}
                >
                  <div className={`w-11 h-11 rounded-[12px] bg-white shadow-[0_2px_10px_rgba(30,80,120,0.10)] flex items-center justify-center mb-5 ${v.iconColor}`}>
                    {v.icon}
                  </div>
                  <h3 className="font-serif text-[1.05rem] font-semibold text-ink mb-2.5 leading-[1.3]">{v.title}</h3>
                  <p className="text-[0.83rem] text-stone font-light leading-[1.75]">{v.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Team ── */}
        <section className="bg-mist py-20 px-6 md:px-12">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-14">
              <span className="text-[0.7rem] font-semibold tracking-[0.14em] uppercase text-pebble mb-3 block">The People Behind the Adventure</span>
              <h2 className="font-serif text-[clamp(1.8rem,3vw,2.6rem)] font-light text-ink">Meet Our Team</h2>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {team.map((t, i) => (
                <div
                  key={t.name}
                  className="bg-white border border-sky-mid/15 rounded-[20px] overflow-hidden shadow-[0_4px_20px_rgba(30,80,120,0.08)] hover:shadow-[0_12px_36px_rgba(30,80,120,0.13)] hover:-translate-y-1 transition-all group"
                >
                  {/* Top accent bar */}
                  <div className={`h-1 w-full bg-gradient-to-r ${avatarGradients[i]}`} />

                  <div className="p-6 text-center">
                    {/* Avatar */}
                    <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${avatarGradients[i]} text-white font-serif text-[1.3rem] font-semibold flex items-center justify-center mx-auto mb-4 shadow-[0_4px_16px_rgba(30,80,120,0.20)] group-hover:scale-105 transition-transform`}>
                      {t.initials}
                    </div>

                    <h4 className="font-serif text-[1.05rem] font-semibold text-ink mb-0.5">{t.name}</h4>
                    <p className="text-[0.72rem] text-sky-accent font-semibold tracking-wide mb-3 uppercase">{t.role}</p>
                    <p className="text-[0.81rem] text-stone font-light leading-[1.7] mb-4">{t.bio}</p>

                    {/* Mini stats */}
                    <div className="flex justify-center gap-4 pt-4 border-t border-sky-mid/15">
                      <div className="text-center">
                        <div className="font-serif text-[1.1rem] font-semibold text-sky-dark">{t.tours}</div>
                        <div className="text-[0.65rem] text-pebble uppercase tracking-wide">Treks</div>
                      </div>
                      <div className="w-px bg-sky-mid/20" />
                      <div className="text-center">
                        <div className="font-serif text-[1.1rem] font-semibold text-sky-dark">{t.years}yr</div>
                        <div className="text-[0.65rem] text-pebble uppercase tracking-wide">Exp.</div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA ── */}
        <section className="relative bg-ink py-24 px-6 md:px-12 text-center overflow-hidden">
          {/* Background glows */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] rounded-full opacity-[0.07]"
              style={{ background: 'radial-gradient(ellipse, #2e86c1 0%, transparent 70%)' }} />
          </div>
          <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-sky-accent/30 to-transparent" />

          <div className="max-w-xl mx-auto relative z-10">
            <div className="inline-flex items-center gap-2 bg-white/8 border border-white/15 text-white/60 text-[0.68rem] font-semibold tracking-[0.14em] uppercase px-4 py-1.5 rounded-full mb-8">
              ✦ Start Your Journey
            </div>
            <h2 className="font-serif text-[clamp(1.8rem,3vw,2.8rem)] font-light text-white mb-4 leading-[1.2]">
              Ready to Begin Your<br /><em className="italic text-gold">Himalayan Journey?</em>
            </h2>
            <p className="text-[0.92rem] text-white/55 font-light mb-10 leading-[1.8]">
              Browse our curated tours or reach out — we'll craft the perfect adventure for you.
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <a
                href="/"
                className="bg-gradient-to-br from-sky-accent to-sky-dark text-white px-8 py-3.5 rounded-full text-[0.92rem] font-medium hover:opacity-90 hover:-translate-y-0.5 transition-all shadow-[0_6px_24px_rgba(46,134,193,0.35)] no-underline"
              >
                Explore Tours
              </a>
              <a
                href="/contact"
                className="bg-white/8 text-white px-8 py-3.5 rounded-full text-[0.92rem] font-light border border-white/25 hover:border-white/50 hover:bg-white/14 transition-all no-underline"
              >
                Contact Us
              </a>
            </div>
          </div>
        </section>

      </main>
    </>
  );
}