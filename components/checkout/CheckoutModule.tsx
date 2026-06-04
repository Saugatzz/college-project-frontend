'use client';
import { useState, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { TOURS } from '@/data/tours';

const steps = ['Your Details', 'Review', 'Payment'];

const diffMap = {
  easy: 'Easy',
  moderate: 'Moderate',
  hard: 'Challenging',
};

export default function CheckoutClient() {
  const params = useSearchParams();
  const tourId = Number(params.get('tourId'));
  const addonParam = params.get('addons') ?? '';

  const tour = TOURS.find(t => t.id === tourId) ?? null;

  // Parse selected addon indices from URL
  const selectedAddonIndices: number[] = useMemo(() => {
    if (!addonParam) return [];
    return addonParam.split(',').map(Number).filter(n => !isNaN(n));
  }, [addonParam]);

  const addonTotal = useMemo(() => {
    if (!tour) return 0;
    return selectedAddonIndices.reduce((sum, i) => sum + (tour.addons[i]?.price ?? 0), 0);
  }, [tour, selectedAddonIndices]);

  const [step, setStep] = useState(0);
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', phone: '', country: '', travelers: '1', requests: '' });
  const [agreed, setAgreed] = useState(false);
  const [payMethod, setPayMethod] = useState<'Khalti' | 'eSewa' | 'Card'>('Card');

  const baseTotal = (tour?.price ?? 0) * parseInt(form.travelers);
  const grandTotal = baseTotal + addonTotal;

  const field = (key: keyof typeof form, label: string, type = 'text', placeholder = '') => (
    <div className="flex flex-col gap-1.5">
      <label className="text-[0.78rem] font-semibold tracking-[0.10em] uppercase text-pebble">{label}</label>
      <input
        type={type}
        value={form[key]}
        onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
        placeholder={placeholder}
        className="bg-snow border border-sky-mid/30 rounded-xl px-4 py-3 text-[0.92rem] text-ink outline-none focus:border-sky-accent/60 focus:ring-2 focus:ring-sky-accent/10 transition-all placeholder-pebble/50"
      />
    </div>
  );

  // No tour found fallback
  if (!tour) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-mist pt-[68px] flex items-center justify-center px-6">
          <div className="text-center">
            <div className="text-[3rem] mb-4">🏔️</div>
            <h2 className="font-serif text-[1.8rem] font-light text-ink mb-3">No tour selected</h2>
            <p className="text-[0.9rem] text-stone font-light mb-6">Please go back and select a tour to book.</p>
            <Link href="/" className="bg-sky-accent text-white px-7 py-3 rounded-full text-[0.9rem] font-medium hover:bg-sky-dark transition-colors no-underline">
              Browse Tours
            </Link>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-mist pt-[68px]">

        {/* Step indicator */}
        <div className="bg-white border-b border-sky-mid/15">
          <div className="max-w-4xl mx-auto px-6 md:px-12 py-5 flex items-center">
            {steps.map((s, i) => (
              <div key={s} className="flex items-center flex-1 last:flex-none">
                <button
                  onClick={() => i < step && setStep(i)}
                  className={`flex items-center gap-2.5 shrink-0 ${i < step ? 'cursor-pointer' : 'cursor-default'}`}
                >
                  <span className={`w-8 h-8 rounded-full flex items-center justify-center text-[0.8rem] font-semibold transition-all ${i === step ? 'bg-sky-accent text-white shadow-[0_4px_14px_rgba(46,134,193,0.35)]' : i < step ? 'bg-sky-dark text-white' : 'bg-sky-mid/30 text-pebble'}`}>
                    {i < step ? '✓' : i + 1}
                  </span>
                  <span className={`text-[0.82rem] font-medium hidden sm:block ${i === step ? 'text-sky-accent' : i < step ? 'text-sky-dark' : 'text-pebble'}`}>{s}</span>
                </button>
                {i < steps.length - 1 && (
                  <div className={`flex-1 h-px mx-3 ${i < step ? 'bg-sky-dark' : 'bg-sky-mid/25'}`} />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-6 md:px-12 py-10 grid lg:grid-cols-[1fr_340px] gap-8 items-start">

          {/* Main form */}
          <div>
            {step === 0 && (
              <div className="bg-white rounded-[20px] border border-sky-mid/15 shadow-[0_4px_24px_rgba(30,80,120,0.08)] p-7 md:p-10">
                <h2 className="font-serif text-[1.9rem] font-light text-ink mb-1">Your Details</h2>
                <p className="text-[0.88rem] text-stone font-light mb-8">Tell us who&apos;s joining this adventure.</p>
                <div className="grid sm:grid-cols-2 gap-5 mb-5">
                  {field('firstName', 'First Name', 'text', 'Jane')}
                  {field('lastName', 'Last Name', 'text', 'Doe')}
                </div>
                <div className="grid sm:grid-cols-2 gap-5 mb-5">
                  {field('email', 'Email Address', 'email', 'jane@example.com')}
                  {field('phone', 'Phone Number', 'tel', '+1 234 567 8900')}
                </div>
                <div className="grid sm:grid-cols-2 gap-5 mb-5">
                  {field('country', 'Country of Residence', 'text', 'United States')}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[0.78rem] font-semibold tracking-[0.10em] uppercase text-pebble">Number of Travelers</label>
                    <select
                      value={form.travelers}
                      onChange={e => setForm(f => ({ ...f, travelers: e.target.value }))}
                      className="bg-snow border border-sky-mid/30 rounded-xl px-4 py-3 text-[0.92rem] text-ink outline-none focus:border-sky-accent/60 transition-all"
                    >
                      {[1,2,3,4,5,6,7,8].map(n => <option key={n} value={n}>{n} {n === 1 ? 'traveler' : 'travelers'}</option>)}
                    </select>
                  </div>
                </div>
                <div className="flex flex-col gap-1.5 mb-8">
                  <label className="text-[0.78rem] font-semibold tracking-[0.10em] uppercase text-pebble">
                    Special Requests <span className="text-pebble/50 font-normal normal-case tracking-normal">(optional)</span>
                  </label>
                  <textarea
                    value={form.requests}
                    onChange={e => setForm(f => ({ ...f, requests: e.target.value }))}
                    rows={3}
                    placeholder="Dietary needs, accessibility requirements, etc."
                    className="bg-snow border border-sky-mid/30 rounded-xl px-4 py-3 text-[0.92rem] text-ink outline-none focus:border-sky-accent/60 focus:ring-2 focus:ring-sky-accent/10 transition-all placeholder-pebble/50 resize-none"
                  />
                </div>
                <button
                  onClick={() => setStep(1)}
                  className="w-full bg-gradient-to-br from-sky-accent to-sky-dark text-white py-4 rounded-full font-medium text-[0.95rem] hover:opacity-90 hover:-translate-y-0.5 transition-all shadow-[0_6px_24px_rgba(46,134,193,0.30)]"
                >
                  Continue to Review →
                </button>
              </div>
            )}

            {step === 1 && (
              <div className="bg-white rounded-[20px] border border-sky-mid/15 shadow-[0_4px_24px_rgba(30,80,120,0.08)] p-7 md:p-10">
                <h2 className="font-serif text-[1.9rem] font-light text-ink mb-1">Review Your Booking</h2>
                <p className="text-[0.88rem] text-stone font-light mb-8">Please check all details before proceeding.</p>

                <div className="bg-mist rounded-2xl p-6 mb-6 space-y-3">
                  {([
                    ['Tour', tour.name],
                    ['Duration', tour.duration],
                    ['Difficulty', diffMap[tour.difficulty]],
                    ['Name', `${form.firstName} ${form.lastName}`],
                    ['Email', form.email],
                    ['Phone', form.phone],
                    ['Country', form.country],
                    ['Travelers', form.travelers],
                  ] as [string, string][]).map(([k, v]) => (
                    <div key={k} className="flex justify-between text-[0.88rem]">
                      <span className="text-pebble font-light">{k}</span>
                      <span className="text-ink font-medium">{v || '—'}</span>
                    </div>
                  ))}
                  {selectedAddonIndices.length > 0 && (
                    <div className="flex justify-between text-[0.88rem] pt-2 border-t border-sky-mid/15">
                      <span className="text-pebble font-light">Add-ons</span>
                      <span className="text-ink font-medium text-right max-w-[55%]">
                        {selectedAddonIndices.map(i => tour.addons[i]?.name).join(', ')}
                      </span>
                    </div>
                  )}
                </div>

                <label className="flex items-start gap-3 mb-8 cursor-pointer">
                  <span
                    onClick={() => setAgreed(a => !a)}
                    className={`w-5 h-5 mt-0.5 flex-shrink-0 rounded border-2 flex items-center justify-center transition-all ${agreed ? 'bg-sky-accent border-sky-accent' : 'border-sky-mid'}`}
                  >
                    {agreed && <span className="text-white text-[0.65rem] font-bold">✓</span>}
                  </span>
                  <span className="text-[0.85rem] text-stone font-light leading-[1.6]">
                    I agree to the <a href="#" className="text-sky-accent hover:underline">Terms of Service</a> and <a href="#" className="text-sky-accent hover:underline">Cancellation Policy</a>.
                  </span>
                </label>

                <div className="flex gap-3">
                  <button onClick={() => setStep(0)} className="flex-1 bg-mist text-stone border border-sky-mid/25 py-3.5 rounded-full font-medium text-[0.92rem] hover:bg-sky-light/50 transition-all">← Back</button>
                  <button
                    onClick={() => agreed && setStep(2)}
                    className={`flex-[2] py-3.5 rounded-full font-medium text-[0.95rem] transition-all ${agreed ? 'bg-gradient-to-br from-sky-accent to-sky-dark text-white hover:opacity-90 hover:-translate-y-0.5 shadow-[0_6px_24px_rgba(46,134,193,0.30)]' : 'bg-pebble/20 text-pebble cursor-not-allowed'}`}
                  >
                    Proceed to Payment →
                  </button>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="bg-white rounded-[20px] border border-sky-mid/15 shadow-[0_4px_24px_rgba(30,80,120,0.08)] p-7 md:p-10">
                <h2 className="font-serif text-[1.9rem] font-light text-ink mb-1">Payment</h2>
                <p className="text-[0.88rem] text-stone font-light mb-7">Complete your booking securely.</p>

                {/* Payment method selector */}
                <div className="flex gap-3 mb-7">
                  {(['Khalti', 'eSewa', 'Card'] as const).map(m => (
                    <button
                      key={m}
                      onClick={() => setPayMethod(m)}
                      className={`flex-1 border-2 rounded-2xl py-4 text-[0.85rem] font-medium transition-all ${payMethod === m ? 'border-sky-accent text-sky-accent bg-sky-light/40' : 'border-sky-mid/30 text-stone hover:border-sky-accent/50'}`}
                    >
                      {m === 'Khalti' ? '💜 Khalti' : m === 'eSewa' ? '💚 eSewa' : '💳 Card'}
                    </button>
                  ))}
                </div>

                {payMethod === 'Card' && (
                  <div className="space-y-4 mb-7">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[0.78rem] font-semibold tracking-[0.10em] uppercase text-pebble">Card Number</label>
                      <input type="text" placeholder="1234 5678 9012 3456" className="bg-snow border border-sky-mid/30 rounded-xl px-4 py-3 text-[0.92rem] text-ink outline-none focus:border-sky-accent/60 transition-all placeholder-pebble/50" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[0.78rem] font-semibold tracking-[0.10em] uppercase text-pebble">Expiry</label>
                        <input type="text" placeholder="MM / YY" className="bg-snow border border-sky-mid/30 rounded-xl px-4 py-3 text-[0.92rem] text-ink outline-none focus:border-sky-accent/60 transition-all placeholder-pebble/50" />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[0.78rem] font-semibold tracking-[0.10em] uppercase text-pebble">CVV</label>
                        <input type="text" placeholder="•••" className="bg-snow border border-sky-mid/30 rounded-xl px-4 py-3 text-[0.92rem] text-ink outline-none focus:border-sky-accent/60 transition-all placeholder-pebble/50" />
                      </div>
                    </div>
                  </div>
                )}

                {(payMethod === 'Khalti' || payMethod === 'eSewa') && (
                  <div className="bg-mist border border-sky-mid/20 rounded-2xl p-5 mb-7 text-center">
                    <p className="text-[0.88rem] text-stone font-light">
                      You will be redirected to <strong className="text-ink font-medium">{payMethod}</strong> to complete the payment of{' '}
                      <strong className="text-sky-dark font-semibold">${grandTotal.toLocaleString()}</strong>.
                    </p>
                  </div>
                )}

                <div className="flex gap-3">
                  <button onClick={() => setStep(1)} className="flex-1 bg-mist text-stone border border-sky-mid/25 py-3.5 rounded-full font-medium text-[0.92rem] hover:bg-sky-light/50 transition-all">← Back</button>
                  <button className="flex-[2] bg-gradient-to-br from-sky-accent to-sky-dark text-white py-3.5 rounded-full font-medium text-[0.95rem] hover:opacity-90 hover:-translate-y-0.5 transition-all shadow-[0_6px_24px_rgba(46,134,193,0.30)]">
                    {payMethod === 'Card' ? 'Pay & Confirm Booking' : `Continue to ${payMethod}`}
                  </button>
                </div>
                <p className="text-center text-[0.75rem] text-pebble mt-4">🔒 Payments are encrypted and secure</p>
              </div>
            )}
          </div>

          {/* Booking summary sidebar — fully dynamic */}
          <aside className="bg-white rounded-[20px] border border-sky-mid/15 shadow-[0_4px_24px_rgba(30,80,120,0.08)] p-6 lg:sticky lg:top-[88px]">
            <h3 className="font-serif text-[1.2rem] font-semibold text-ink mb-4">Booking Summary</h3>
            <div className="h-[130px] rounded-[14px] overflow-hidden mb-4 bg-sky-light">
              <img src={tour.heroImage} alt={tour.name} className="w-full h-full object-cover" />
            </div>
            <p className="font-serif text-[1.1rem] text-ink font-semibold mb-0.5 leading-[1.3]">{tour.name}</p>
            <p className="text-[0.8rem] text-pebble mb-5">{tour.duration} · {diffMap[tour.difficulty]}</p>

            <div className="space-y-2.5 pb-4 border-b border-sky-mid/15 mb-4">
              <div className="flex justify-between text-[0.85rem]">
                <span className="text-stone font-light">Base price</span>
                <span className="text-ink font-medium">${tour.price.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-[0.85rem]">
                <span className="text-stone font-light">Travelers × {form.travelers}</span>
                <span className="text-ink font-medium">${baseTotal.toLocaleString()}</span>
              </div>
              {selectedAddonIndices.map(i => {
                const addon = tour.addons[i];
                if (!addon) return null;
                return (
                  <div key={i} className="flex justify-between text-[0.85rem]">
                    <span className="text-stone font-light truncate mr-2">{addon.name}</span>
                    <span className="text-ink font-medium whitespace-nowrap">+${addon.price}</span>
                  </div>
                );
              })}
            </div>

            <div className="flex justify-between items-end">
              <span className="text-[0.88rem] text-stone">Total</span>
              <span className="font-serif text-[1.8rem] font-semibold text-sky-dark">${grandTotal.toLocaleString()}</span>
            </div>
            <p className="text-[0.74rem] text-pebble mt-2">✓ Free cancellation up to 14 days before departure</p>
          </aside>
        </div>
      </main>
    </>
  );
}