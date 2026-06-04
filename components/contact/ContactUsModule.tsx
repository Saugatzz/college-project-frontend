'use client';
import { useState } from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

const contactInfo = [
  { icon: '📍', label: 'Find Us', value: 'Thamel, Kathmandu 44600, Nepal', sub: 'Near the Thamel Chowk intersection' },
  { icon: '📞', label: 'Call Us', value: '+977 1 4701234', sub: 'Mon–Sat, 9am–6pm NST' },
  { icon: '✉️', label: 'Email Us', value: 'hello@ebookingnepal.com', sub: 'We reply within 24 hours' },
  { icon: '💬', label: 'WhatsApp', value: '+977 98012 34567', sub: 'Available for quick queries' },
];

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [sent, setSent] = useState(false);

  const handleSubmit = () => {
    if (form.name && form.email && form.message) setSent(true);
  };

  return (
    <>
      <Header />
      <main className="pt-[68px]">

        {/* Hero */}
        <section className="bg-ink py-20 px-6 md:px-12 relative overflow-hidden">
          <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 70% 50%, #5fa8d3 0%, transparent 60%)' }} />
          <div className="max-w-5xl mx-auto relative z-10">
            <span className="text-[0.72rem] font-semibold tracking-[0.14em] uppercase text-pebble mb-4 block">Get In Touch</span>
            <h1 className="font-serif text-[clamp(2rem,4.5vw,3.6rem)] font-light text-white mb-4 leading-[1.2]">
              We'd Love to Hear<br /><em className="italic text-gold">From You</em>
            </h1>
            <p className="text-[0.95rem] text-white/60 font-light max-w-[480px] leading-[1.75]">
              Questions, custom itinerary requests, or just excited about your next adventure — our team is here to help.
            </p>
          </div>
        </section>

        {/* Main content */}
        <section className="bg-mist py-16 px-6 md:px-12">
          <div className="max-w-5xl mx-auto grid lg:grid-cols-[1fr_380px] gap-10 items-start">

            {/* Form */}
            <div className="bg-white rounded-[20px] border border-sky-mid/15 shadow-[0_4px_24px_rgba(30,80,120,0.08)] p-7 md:p-10">
              {sent ? (
                <div className="text-center py-10">
                  <div className="text-[3rem] mb-5">🏔️</div>
                  <h3 className="font-serif text-[1.8rem] font-light text-ink mb-3">Message Received!</h3>
                  <p className="text-[0.92rem] text-stone font-light leading-[1.7] max-w-xs mx-auto">
                    Thank you for reaching out. Our team will get back to you within 24 hours.
                  </p>
                  <button
                    onClick={() => { setSent(false); setForm({ name: '', email: '', subject: '', message: '' }); }}
                    className="mt-7 bg-sky-accent text-white px-7 py-2.5 rounded-full text-[0.88rem] font-medium hover:bg-sky-dark transition-colors"
                  >
                    Send Another Message
                  </button>
                </div>
              ) : (
                <>
                  <h2 className="font-serif text-[1.7rem] font-light text-ink mb-1">Send Us a Message</h2>
                  <p className="text-[0.88rem] text-stone font-light mb-8">Fill in the form below and we'll be in touch.</p>

                  <div className="grid sm:grid-cols-2 gap-5 mb-5">
                    {[['name', 'Your Name', 'text', 'Jane Doe'], ['email', 'Email Address', 'email', 'jane@example.com']].map(([k, l, t, p]) => (
                      <div key={k} className="flex flex-col gap-1.5">
                        <label className="text-[0.78rem] font-semibold tracking-[0.10em] uppercase text-pebble">{l}</label>
                        <input
                          type={t}
                          value={form[k as keyof typeof form]}
                          onChange={e => setForm(f => ({ ...f, [k]: e.target.value }))}
                          placeholder={p}
                          className="bg-snow border border-sky-mid/30 rounded-xl px-4 py-3 text-[0.92rem] text-ink outline-none focus:border-sky-accent/60 focus:ring-2 focus:ring-sky-accent/10 transition-all placeholder-pebble/50"
                        />
                      </div>
                    ))}
                  </div>

                  <div className="flex flex-col gap-1.5 mb-5">
                    <label className="text-[0.78rem] font-semibold tracking-[0.10em] uppercase text-pebble">Subject</label>
                    <select
                      value={form.subject}
                      onChange={e => setForm(f => ({ ...f, subject: e.target.value }))}
                      className="bg-snow border border-sky-mid/30 rounded-xl px-4 py-3 text-[0.92rem] text-ink outline-none focus:border-sky-accent/60 transition-all"
                    >
                      <option value="">Select a topic...</option>
                      <option>Tour Inquiry</option>
                      <option>Custom Itinerary Request</option>
                      <option>Booking Support</option>
                      <option>Cancellation / Refund</option>
                      <option>General Question</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-1.5 mb-8">
                    <label className="text-[0.78rem] font-semibold tracking-[0.10em] uppercase text-pebble">Message</label>
                    <textarea
                      rows={5}
                      value={form.message}
                      onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                      placeholder="Tell us about your dream trek, travel dates, group size, or anything else on your mind..."
                      className="bg-snow border border-sky-mid/30 rounded-xl px-4 py-3 text-[0.92rem] text-ink outline-none focus:border-sky-accent/60 focus:ring-2 focus:ring-sky-accent/10 transition-all placeholder-pebble/50 resize-none"
                    />
                  </div>

                  <button
                    onClick={handleSubmit}
                    className="w-full bg-gradient-to-br from-sky-accent to-sky-dark text-white py-4 rounded-full font-medium text-[0.95rem] hover:opacity-90 hover:-translate-y-0.5 transition-all shadow-[0_6px_24px_rgba(46,134,193,0.30)]"
                  >
                    Send Message →
                  </button>
                </>
              )}
            </div>

            {/* Contact info */}
            <div className="space-y-4">
              {contactInfo.map((c) => (
                <div key={c.label} className="bg-white border border-sky-mid/15 rounded-[18px] p-6 shadow-[0_4px_16px_rgba(30,80,120,0.07)] flex gap-4 items-start">
                  <span className="text-[1.5rem] flex-shrink-0 mt-0.5">{c.icon}</span>
                  <div>
                    <p className="text-[0.72rem] font-semibold tracking-[0.12em] uppercase text-pebble mb-0.5">{c.label}</p>
                    <p className="text-[0.92rem] font-medium text-ink">{c.value}</p>
                    <p className="text-[0.8rem] text-stone font-light">{c.sub}</p>
                  </div>
                </div>
              ))}

              {/* Map placeholder */}
              <div className="bg-sky-light border border-sky-mid/20 rounded-[18px] h-[200px] flex flex-col items-center justify-center gap-2 overflow-hidden relative">
                <div className="absolute inset-0 bg-gradient-to-br from-sky-mid/20 to-sky-deep/10" />
                <span className="text-[2rem] relative z-10">🗺️</span>
                <p className="text-[0.82rem] text-sky-dark font-medium relative z-10">Thamel, Kathmandu</p>
                <a
                  href="https://maps.google.com/?q=Thamel+Kathmandu"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1 bg-sky-accent text-white px-5 py-1.5 rounded-full text-[0.78rem] font-medium hover:bg-sky-dark transition-colors no-underline relative z-10"
                >
                  Open in Maps
                </a>
              </div>
            </div>
          </div>
        </section>

      </main>
    </>
  );
}