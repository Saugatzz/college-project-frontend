import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

const team = [
  { name: 'Aarav Shrestha', role: 'Founder & Lead Guide', bio: "Born in the shadow of the Himalayas, Aarav has led over 400 treks across Nepal's highest peaks.", initials: 'AS' },
  { name: 'Priya Tamang', role: 'Head of Operations', bio: 'With 12 years in sustainable tourism, Priya ensures every journey runs flawlessly and responsibly.', initials: 'PT' },
  { name: 'Bikash Gurung', role: 'Senior Trek Guide', bio: "A certified mountaineer who speaks five languages and knows every trail like the back of his hand.", initials: 'BG' },
  { name: 'Sunita Rai', role: 'Guest Experience Manager', bio: "Sunita's passion is crafting personalised moments that turn first-time visitors into lifelong adventurers.", initials: 'SR' },
];

const values = [
  { icon: '◎', title: 'Authentic Experiences', desc: "We curate journeys that connect you with Nepal's true spirit — its people, landscapes, and living traditions." },
  { icon: '⬡', title: 'Responsible Travel', desc: 'Every tour is designed with environmental stewardship and community benefit woven into its foundations.' },
  { icon: '△', title: 'Safety First', desc: 'Certified guides, real-time monitoring, and comprehensive insurance keep every adventurer protected.' },
  { icon: '✦', title: 'Unmatched Local Expertise', desc: 'A decade of relationships with local communities means you experience Nepal beyond the guidebook.' },
];

export default function AboutPage() {
  return (
    <>
      <Header />
      <main className="pt-[68px]">

        {/* Hero */}
        <section
          className="relative min-h-[480px] flex items-center bg-[url('/images/hero-4.jpg')] bg-center bg-cover px-6 md:px-12 py-20"
          aria-label="About hero"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-[rgba(4,12,24,0.80)] via-[rgba(4,12,24,0.55)] to-[rgba(4,12,24,0.20)]" />
          <div className="relative z-10 max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/30 text-white/90 text-xs font-medium tracking-widest uppercase px-4 py-1.5 rounded-full mb-7 backdrop-blur-sm">
              ✦ Our Story
            </div>
            <h1 className="font-serif text-[clamp(2.2rem,4.5vw,3.8rem)] font-light leading-[1.15] text-white mb-5">
              Born from a Love of<br /><em className="italic text-gold">the Mountains</em>
            </h1>
            <p className="text-[1rem] text-white/75 leading-[1.75] font-light max-w-[500px]">
              eBooking Nepal began in 2015 with a single promise: to share the magic of the Himalayas with the world, without compromising on authenticity or the environment.
            </p>
          </div>
        </section>

        {/* Mission section */}
        <section className="bg-mist py-20 px-6 md:px-12">
          <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-14 items-center">
            <div>
              <span className="text-[0.72rem] font-semibold tracking-[0.14em] uppercase text-pebble mb-4 block">Who We Are</span>
              <h2 className="font-serif text-[clamp(1.8rem,3vw,2.6rem)] font-light text-ink mb-5 leading-[1.25]">
                Nepal's Most Trusted<br />Tour Curator
              </h2>
              <p className="text-[0.95rem] text-stone leading-[1.8] font-light mb-5">
                We're a team of guides, storytellers, and mountain-lovers based in Kathmandu. Since our founding, we've led over 12,000 trekkers through Nepal's most breathtaking regions — from Everest Base Camp to the hidden valleys of Mustang.
              </p>
              <p className="text-[0.95rem] text-stone leading-[1.8] font-light">
                Our approach is simple: small groups, expert local guides, and an unwavering commitment to leaving every place better than we found it.
              </p>
              <div className="flex gap-10 mt-10 pt-8 border-t border-sky-mid/20">
                {[['12k+', 'Happy Trekkers'], ['48+', 'Curated Routes'], ['10', 'Years of Trust']].map(([n, l]) => (
                  <div key={l}>
                    <div className="font-serif text-[2rem] font-semibold text-sky-dark leading-none">{n}</div>
                    <div className="text-[0.75rem] text-pebble uppercase tracking-widest mt-1 font-light">{l}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <img src="/images/gallery-4-1.jpg" alt="" className="rounded-[14px] h-[200px] w-full object-cover" />
              <img src="/images/gallery-4-2.jpg" alt="" className="rounded-[14px] h-[200px] w-full object-cover mt-6" />
              <img src="/images/gallery-4-3.jpg" alt="" className="rounded-[14px] h-[200px] w-full object-cover col-span-2" />
            </div>
          </div>
        </section>

        {/* Values */}
        <section className="bg-white py-20 px-6 md:px-12">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-14">
              <span className="text-[0.72rem] font-semibold tracking-[0.14em] uppercase text-pebble mb-3 block">What Guides Us</span>
              <h2 className="font-serif text-[clamp(1.8rem,3vw,2.6rem)] font-light text-ink">Our Core Values</h2>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {values.map((v) => (
                <div key={v.title} className="bg-mist border border-sky-mid/15 rounded-[18px] p-7 hover:shadow-[0_8px_30px_rgba(30,80,120,0.12)] transition-shadow">
                  <div className="text-[1.8rem] text-sky-accent mb-4">{v.icon}</div>
                  <h3 className="font-serif text-[1.1rem] font-semibold text-ink mb-2 leading-[1.3]">{v.title}</h3>
                  <p className="text-[0.84rem] text-stone font-light leading-[1.7]">{v.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Team */}
        <section className="bg-mist py-20 px-6 md:px-12">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-14">
              <span className="text-[0.72rem] font-semibold tracking-[0.14em] uppercase text-pebble mb-3 block">The People Behind the Adventure</span>
              <h2 className="font-serif text-[clamp(1.8rem,3vw,2.6rem)] font-light text-ink">Meet Our Team</h2>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {team.map((t) => (
                <div key={t.name} className="bg-white border border-sky-mid/15 rounded-[18px] p-6 text-center shadow-[0_4px_20px_rgba(30,80,120,0.08)]">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-sky-accent to-sky-dark text-white font-serif text-[1.3rem] font-semibold flex items-center justify-center mx-auto mb-4">
                    {t.initials}
                  </div>
                  <h4 className="font-serif text-[1.1rem] font-semibold text-ink mb-0.5">{t.name}</h4>
                  <p className="text-[0.75rem] text-sky-accent font-medium tracking-wide mb-3">{t.role}</p>
                  <p className="text-[0.82rem] text-stone font-light leading-[1.65]">{t.bio}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="bg-sky-dark py-20 px-6 md:px-12 text-center">
          <div className="max-w-xl mx-auto">
            <h2 className="font-serif text-[clamp(1.8rem,3vw,2.6rem)] font-light text-white mb-4">
              Ready to Begin Your<br /><em className="italic text-gold">Himalayan Journey?</em>
            </h2>
            <p className="text-[0.92rem] text-white/60 font-light mb-8">
              Browse our curated tours or reach out — we'll craft the perfect adventure for you.
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <a href="/" className="bg-sky-accent text-white px-8 py-3.5 rounded-full text-[0.92rem] font-medium hover:bg-sky-dark hover:-translate-y-0.5 transition-all shadow-[0_4px_18px_rgba(46,134,193,0.35)] no-underline">
                Explore Tours
              </a>
              <a href="/contact" className="bg-white/10 text-white px-8 py-3.5 rounded-full text-[0.92rem] font-light border border-white/30 hover:border-white/60 hover:bg-white/15 transition-all no-underline">
                Contact Us
              </a>
            </div>
          </div>
        </section>

      </main>
    </>
  );
}