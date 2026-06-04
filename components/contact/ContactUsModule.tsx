'use client';
import { useState } from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

const contactInfo = [
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
      </svg>
    ),
    label: 'Find Us',
    value: 'Thamel, Kathmandu 44600, Nepal',
    sub: 'Near the Thamel Chowk intersection',
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.44 2 2 0 0 1 3.6 1.26h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.9a16 16 0 0 0 6 6l.98-.98a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21.73 16.92z"/>
      </svg>
    ),
    label: 'Call Us',
    value: '+977 1 4701234',
    sub: 'Mon–Sat, 9am–6pm NST',
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
      </svg>
    ),
    label: 'Email Us',
    value: 'hello@ebookingnepal.com',
    sub: 'We reply within 24 hours',
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
      </svg>
    ),
    label: 'WhatsApp',
    value: '+977 98012 34567',
    sub: 'Available for quick queries',
  },
];

const subjects = [
  'Tour Inquiry',
  'Custom Itinerary Request',
  'Booking Support',
  'Cancellation / Refund',
  'General Question',
];

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [sent, setSent] = useState(false);
  const [focused, setFocused] = useState<string | null>(null);

  const handleSubmit = () => {
    if (form.name && form.email && form.message) setSent(true);
  };

  const inputBase = (key: string) =>
    `bg-snow border rounded-xl px-4 py-3 text-[0.92rem] text-ink outline-none transition-all placeholder-pebble/50 ${
      focused === key
        ? 'border-sky-accent/70 ring-2 ring-sky-accent/10 bg-white'
        : 'border-sky-mid/25 hover:border-sky-mid/50'
    }`;

  return (
    <>
      <Header />
      <main className="pt-[68px]">

        {/* Hero */}
        <section className="relative bg-ink overflow-hidden">
          {/* Atmospheric glows */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full opacity-[0.06]"
              style={{ background: 'radial-gradient(circle, #2e86c1 0%, transparent 70%)' }} />
            <div className="absolute bottom-[-10%] left-[-5%] w-[400px] h-[400px] rounded-full opacity-[0.04]"
              style={{ background: 'radial-gradient(circle, #5fa8d3 0%, transparent 70%)' }} />
          </div>

          {/* Decorative horizontal rule */}
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-sky-accent/30 to-transparent" />

          <div className="max-w-5xl mx-auto px-6 md:px-12 py-24 relative z-10 grid md:grid-cols-[1fr_auto] gap-10 items-end">
            <div>
              <div className="inline-flex items-center gap-2 bg-white/8 border border-white/15 text-white/70 text-[0.68rem] font-semibold tracking-[0.14em] uppercase px-4 py-1.5 rounded-full mb-7">
                ✦ Get In Touch
              </div>
              <h1 className="font-serif text-[clamp(2rem,4.5vw,3.6rem)] font-light text-white mb-5 leading-[1.15]">
                We'd Love to Hear<br />
                <em className="italic text-gold">From You</em>
              </h1>
              <p className="text-[0.95rem] text-white/55 font-light max-w-[460px] leading-[1.8]">
                Questions, custom itinerary requests, or just excited about your next adventure — our team is here to help.
              </p>
            </div>

            {/* Response time badge */}
            <div className="hidden md:flex flex-col items-center justify-center bg-white/6 border border-white/12 rounded-[20px] px-8 py-6 text-center backdrop-blur-sm self-center">
              <div className="font-serif text-[2.4rem] font-light text-white leading-none mb-1">&lt;24h</div>
              <div className="text-[0.7rem] text-white/50 tracking-[0.12em] uppercase font-medium">Average Reply Time</div>
            </div>
          </div>
        </section>

        {/* Main content */}
        <section className="bg-mist py-16 px-6 md:px-12">
          <div className="max-w-5xl mx-auto grid lg:grid-cols-[1fr_360px] gap-10 items-start">

            {/* Form card */}
            <div className="bg-white rounded-[24px] border border-sky-mid/15 shadow-[0_8px_40px_rgba(30,80,120,0.09)] overflow-hidden">

              {/* Card header strip */}
              <div className="h-1.5 w-full bg-gradient-to-r from-sky-accent via-sky-mid to-sky-dark" />

              <div className="p-7 md:p-10">
                {sent ? (
                  <div className="text-center py-14">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-sky-accent/20 to-sky-dark/20 flex items-center justify-center mx-auto mb-6 border border-sky-accent/20">
                      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#2e86c1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
                      </svg>
                    </div>
                    <h3 className="font-serif text-[1.9rem] font-light text-ink mb-3">Message Received!</h3>
                    <p className="text-[0.92rem] text-stone font-light leading-[1.75] max-w-xs mx-auto mb-8">
                      Thank you for reaching out. Our team will get back to you within 24 hours.
                    </p>
                    <button
                      onClick={() => { setSent(false); setForm({ name: '', email: '', subject: '', message: '' }); }}
                      className="bg-gradient-to-br from-sky-accent to-sky-dark text-white px-8 py-3 rounded-full text-[0.88rem] font-medium hover:opacity-90 hover:-translate-y-0.5 transition-all shadow-[0_6px_20px_rgba(46,134,193,0.28)]"
                    >
                      Send Another Message
                    </button>
                  </div>
                ) : (
                  <>
                    <h2 className="font-serif text-[1.75rem] font-light text-ink mb-1">Send Us a Message</h2>
                    <p className="text-[0.87rem] text-stone font-light mb-8">Fill in the form below and we'll be in touch.</p>

                    {/* Name + Email */}
                    <div className="grid sm:grid-cols-2 gap-4 mb-4">
                      {([
                        ['name', 'Your Name', 'text', 'Jane Doe'],
                        ['email', 'Email Address', 'email', 'jane@example.com'],
                      ] as const).map(([k, l, t, p]) => (
                        <div key={k} className="flex flex-col gap-1.5">
                          <label className="text-[0.72rem] font-semibold tracking-[0.10em] uppercase text-pebble">{l}</label>
                          <input
                            type={t}
                            value={form[k]}
                            placeholder={p}
                            onFocus={() => setFocused(k)}
                            onBlur={() => setFocused(null)}
                            onChange={e => setForm(f => ({ ...f, [k]: e.target.value }))}
                            className={inputBase(k)}
                          />
                        </div>
                      ))}
                    </div>

                    {/* Subject */}
                    <div className="flex flex-col gap-1.5 mb-4">
                      <label className="text-[0.72rem] font-semibold tracking-[0.10em] uppercase text-pebble">Subject</label>
                      <div className="relative">
                        <select
                          value={form.subject}
                          onChange={e => setForm(f => ({ ...f, subject: e.target.value }))}
                          onFocus={() => setFocused('subject')}
                          onBlur={() => setFocused(null)}
                          className={`${inputBase('subject')} w-full appearance-none pr-10`}
                        >
                          <option value="">Select a topic...</option>
                          {subjects.map(s => <option key={s}>{s}</option>)}
                        </select>
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-pebble">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="6 9 12 15 18 9"/>
                          </svg>
                        </div>
                      </div>
                    </div>

                    {/* Message */}
                    <div className="flex flex-col gap-1.5 mb-8">
                      <label className="text-[0.72rem] font-semibold tracking-[0.10em] uppercase text-pebble">Message</label>
                      <textarea
                        rows={5}
                        value={form.message}
                        placeholder="Tell us about your dream trek, travel dates, group size, or anything else on your mind..."
                        onFocus={() => setFocused('message')}
                        onBlur={() => setFocused(null)}
                        onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                        className={`${inputBase('message')} resize-none`}
                      />
                    </div>

                    <button
                      onClick={handleSubmit}
                      className="w-full bg-gradient-to-br from-sky-accent to-sky-dark text-white py-4 rounded-full font-medium text-[0.95rem] hover:opacity-90 hover:-translate-y-0.5 transition-all shadow-[0_8px_28px_rgba(46,134,193,0.32)] flex items-center justify-center gap-2"
                    >
                      Send Message
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
                      </svg>
                    </button>

                    <p className="text-center text-[0.74rem] text-pebble/70 mt-4">
                      🔒 Your information is kept private and never shared.
                    </p>
                  </>
                )}
              </div>
            </div>

            {/* Right column */}
            <div className="space-y-3">
              {contactInfo.map((c) => (
                <div
                  key={c.label}
                  className="group bg-white border border-sky-mid/15 rounded-[18px] p-5 shadow-[0_2px_12px_rgba(30,80,120,0.06)] flex gap-4 items-start hover:shadow-[0_8px_28px_rgba(30,80,120,0.12)] hover:-translate-y-0.5 transition-all"
                >
                  <div className="w-10 h-10 rounded-[12px] bg-gradient-to-br from-sky-light to-sky-mid/20 flex items-center justify-center flex-shrink-0 text-sky-accent group-hover:from-sky-accent group-hover:to-sky-dark group-hover:text-white transition-all">
                    {c.icon}
                  </div>
                  <div>
                    <p className="text-[0.68rem] font-semibold tracking-[0.12em] uppercase text-pebble mb-0.5">{c.label}</p>
                    <p className="text-[0.9rem] font-medium text-ink leading-snug">{c.value}</p>
                    <p className="text-[0.78rem] text-stone font-light mt-0.5">{c.sub}</p>
                  </div>
                </div>
              ))}

              {/* Map */}
              <div className="relative bg-gradient-to-br from-sky-light to-sky-mid/20 border border-sky-mid/20 rounded-[18px] h-[190px] overflow-hidden flex flex-col items-center justify-center gap-3">
                {/* Decorative grid pattern */}
                <div className="absolute inset-0 opacity-20"
                  style={{
                    backgroundImage: 'linear-gradient(rgba(46,134,193,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(46,134,193,0.3) 1px, transparent 1px)',
                    backgroundSize: '28px 28px',
                  }}
                />
                {/* Pin */}
                <div className="relative z-10 w-12 h-12 rounded-full bg-white shadow-[0_4px_16px_rgba(30,80,120,0.20)] flex items-center justify-center">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2e86c1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
                  </svg>
                </div>
                <p className="text-[0.82rem] text-sky-dark font-semibold relative z-10">Thamel, Kathmandu</p>
                <a
                  href="https://maps.google.com/?q=Thamel+Kathmandu"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="relative z-10 bg-sky-accent text-white px-5 py-2 rounded-full text-[0.78rem] font-medium hover:bg-sky-dark transition-colors no-underline shadow-[0_4px_14px_rgba(46,134,193,0.30)] flex items-center gap-1.5"
                >
                  Open in Maps
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </section>

      </main>
    </>
  );
}