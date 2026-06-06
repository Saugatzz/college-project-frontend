'use client';
import { useState } from 'react';
import Header from '@/components/layout/Header';
import api from '@/lib/api/api';

function Toast({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  if (!visible) return null;
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="flex items-center gap-3 bg-white border border-sky-mid/20 rounded-2xl px-5 py-4 shadow-[0_16px_48px_rgba(30,80,120,0.18)] min-w-[300px]">
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center flex-shrink-0">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        </div>
        <div className="flex-1">
          <p className="text-[0.88rem] font-semibold text-ink leading-snug">Message sent successfully!</p>
          <p className="text-[0.76rem] text-stone font-light">We'll get back to you within 24 hours.</p>
        </div>
        <button onClick={onClose} className="text-pebble hover:text-ink transition-colors ml-1 flex-shrink-0" aria-label="Dismiss">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>
    </div>
  );
}

const WHATSAPP_NUMBER = '9779845439816'; // Nepal country code 977 + number

const contactInfo = [
  {
    key: 'location',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
      </svg>
    ),
    label: 'Find Us',
    value: 'Thamel, Kathmandu 44600, Nepal',
    sub: 'Near the Thamel Chowk intersection',
    href: null,
    whatsapp: false,
  },
  {
    key: 'phone',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.44 2 2 0 0 1 3.6 1.26h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.9a16 16 0 0 0 6 6l.98-.98a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21.73 16.92z"/>
      </svg>
    ),
    label: 'Call Us',
    value: '+977 1 4701234',
    sub: 'Mon–Sat, 9am–6pm NST',
    href: 'tel:+97714701234',
    whatsapp: false,
  },
  {
    key: 'email',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
      </svg>
    ),
    label: 'Email Us',
    value: 'hello@ebookingnepal.com',
    sub: 'We reply within 24 hours',
    href: 'mailto:hello@ebookingnepal.com',
    whatsapp: false,
  },
  {
    key: 'whatsapp',
    icon: (
      // WhatsApp logo SVG
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
      </svg>
    ),
    label: 'WhatsApp',
    value: '+977 98454 39816',
    sub: 'Tap to chat — we reply fast',
    href: `https://wa.me/${WHATSAPP_NUMBER}?text=Hi%2C%20I%27m%20interested%20in%20a%20tour%20in%20Nepal!`,
    whatsapp: true,
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
  const [focused, setFocused] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toastVisible, setToastVisible] = useState(false);

  const inputBase = (key: string) =>
    `bg-snow border rounded-xl px-4 py-3 text-[0.92rem] text-ink outline-none transition-all placeholder-pebble/50 ${
      focused === key
        ? 'border-sky-accent/70 ring-2 ring-sky-accent/10 bg-white'
        : 'border-sky-mid/25 hover:border-sky-mid/50'
    }`;

  const handleSubmit = async () => {
    if (!form.name || !form.email || !form.message) return;
    setLoading(true);
    setError(null);
    try {
      await api.post('/contacts', form);
      setForm({ name: '', email: '', subject: '', message: '' });
      setToastVisible(true);
      setTimeout(() => setToastVisible(false), 4000);
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Header />
      <Toast visible={toastVisible} onClose={() => setToastVisible(false)} />

      <main className="pt-[68px]">
        {/* Hero */}
        <section className="relative bg-ink overflow-hidden">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full opacity-[0.06]"
              style={{ background: 'radial-gradient(circle, #2e86c1 0%, transparent 70%)' }} />
            <div className="absolute bottom-[-10%] left-[-5%] w-[400px] h-[400px] rounded-full opacity-[0.04]"
              style={{ background: 'radial-gradient(circle, #5fa8d3 0%, transparent 70%)' }} />
          </div>
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
              <div className="h-1.5 w-full bg-gradient-to-r from-sky-accent via-sky-mid to-sky-dark" />
              <div className="p-7 md:p-10">
                <h2 className="font-serif text-[1.75rem] font-light text-ink mb-1">Send Us a Message</h2>
                <p className="text-[0.87rem] text-stone font-light mb-8">Fill in the form below and we'll be in touch.</p>

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

                {error && (
                  <p className="text-[0.82rem] text-red-500 mb-4 text-center">{error}</p>
                )}

                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="w-full bg-gradient-to-br from-sky-accent to-sky-dark text-white py-4 rounded-full font-medium text-[0.95rem] hover:opacity-90 hover:-translate-y-0.5 transition-all shadow-[0_8px_28px_rgba(46,134,193,0.32)] flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed disabled:translate-y-0"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                      </svg>
                      Sending…
                    </>
                  ) : (
                    <>
                      Send Message
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
                      </svg>
                    </>
                  )}
                </button>

                <p className="text-center text-[0.74rem] text-pebble/70 mt-4">
                  🔒 Your information is kept private and never shared.
                </p>
              </div>
            </div>

            {/* Right column */}
            <div className="space-y-3">
              {contactInfo.map((c) => {
                const isWhatsApp = c.whatsapp;
                const inner = (
                  <>
                    {/* Icon */}
                    <div className={`w-10 h-10 rounded-[12px] flex items-center justify-center flex-shrink-0 transition-all ${
                      isWhatsApp
                        ? 'bg-[#25D366] text-white shadow-[0_4px_14px_rgba(37,211,102,0.35)] group-hover:shadow-[0_6px_20px_rgba(37,211,102,0.50)]'
                        : 'bg-gradient-to-br from-sky-light to-sky-mid/20 text-sky-accent group-hover:from-sky-accent group-hover:to-sky-dark group-hover:text-white'
                    }`}>
                      {c.icon}
                    </div>

                    {/* Text */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <p className={`text-[0.68rem] font-semibold tracking-[0.12em] uppercase ${isWhatsApp ? 'text-[#128C7E]' : 'text-pebble'}`}>
                          {c.label}
                        </p>
                        {isWhatsApp && (
                          <span className="inline-flex items-center gap-1 bg-[#dcfce7] text-[#16a34a] text-[0.6rem] font-semibold tracking-wide uppercase px-2 py-0.5 rounded-full">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#22c55e] animate-pulse" />
                            Live Chat
                          </span>
                        )}
                      </div>
                      <p className={`text-[0.9rem] font-medium leading-snug ${isWhatsApp ? 'text-[#128C7E]' : 'text-ink'}`}>
                        {c.value}
                      </p>
                      <p className="text-[0.78rem] text-stone font-light mt-0.5">{c.sub}</p>
                    </div>

                    {/* Arrow for WhatsApp */}
                    {isWhatsApp && (
                      <div className="flex-shrink-0 text-[#25D366] opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>
                        </svg>
                      </div>
                    )}
                  </>
                );

                // WhatsApp card — anchor tag, green highlight
                if (isWhatsApp) {
                  return (
                    <a
                      key={c.key}
                      href={c.href!}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex gap-4 items-center bg-[#f0fdf4] border-2 border-[#86efac] rounded-[18px] p-5 shadow-[0_2px_12px_rgba(37,211,102,0.10)] hover:shadow-[0_8px_28px_rgba(37,211,102,0.22)] hover:-translate-y-0.5 transition-all no-underline cursor-pointer"
                    >
                      {inner}
                    </a>
                  );
                }

                // Regular card — plain div (or anchor if href)
                const Tag = c.href ? 'a' : 'div';
                return (
                  <Tag
                    key={c.key}
                    {...(c.href ? { href: c.href } : {})}
                    className="group bg-white border border-sky-mid/15 rounded-[18px] p-5 shadow-[0_2px_12px_rgba(30,80,120,0.06)] flex gap-4 items-start hover:shadow-[0_8px_28px_rgba(30,80,120,0.12)] hover:-translate-y-0.5 transition-all no-underline"
                  >
                    {inner}
                  </Tag>
                );
              })}

              {/* Map */}
              <div className="relative bg-gradient-to-br from-sky-light to-sky-mid/20 border border-sky-mid/20 rounded-[18px] h-[190px] overflow-hidden flex flex-col items-center justify-center gap-3">
                <div className="absolute inset-0 opacity-20"
                  style={{
                    backgroundImage: 'linear-gradient(rgba(46,134,193,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(46,134,193,0.3) 1px, transparent 1px)',
                    backgroundSize: '28px 28px',
                  }}
                />
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