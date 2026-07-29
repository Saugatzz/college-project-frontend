'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import TourCard from '@/components/tours/TourCard';
import api from '@/lib/api/api';
import { getUser, getToken, clearAuth, AuthUser } from '@/lib/auth/tokenStore';
import { packageToTour } from '@/lib/adapters/packageToTour';
import type { Package } from '@/components/dashboard/TourTable';
import type { Tour } from '@/types/tour';
import {
  IconCalendarCheck, IconMapPin, IconUsers, IconCreditCard,
  IconSparkles, IconLoader2, IconAlertCircle, IconLogout,
  IconLogin, IconUserPlus, IconPencil, IconX, IconCalendarEvent,
  IconCalendarTime,
} from '@tabler/icons-react';

type BookingStatus = 'pending' | 'confirmed' | 'cancelled';
type DateFlexibility = 'exact' | 'flexible';

const FLEXIBILITY_WINDOWS = ['±3 days', '±1 week', '±2 weeks', 'Whole month'] as const;

interface MyBooking {
  id: number;
  travelers: number;
  totalAmount: number;
  status: BookingStatus;
  paymentMethod: string;
  notes?: string;
  preferredDate?: string;
  dateFlexibility?: DateFlexibility;
  flexibilityWindow?: string;
  dateNotes?: string;
  departureDate?: string;
  createdAt: string;
  tour?: { id?: number; name?: string; duration?: string; durationDays?: number; image?: string };
}

const STATUS_CONFIG: Record<BookingStatus, { label: string; bg: string; dot: string; text: string }> = {
  confirmed: { label: 'Confirmed', bg: '#f0fdf4', dot: '#10b981', text: '#0d7d54' },
  pending:   { label: 'Pending',   bg: '#fffbeb', dot: '#f59e0b', text: '#a3690c' },
  cancelled: { label: 'Cancelled', bg: '#fef2f2', dot: '#ef4444', text: '#c0392b' },
};

function fmtDate(iso?: string) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

interface EditForm {
  travelers: number;
  dateFlexibility: DateFlexibility;
  preferredDate: string;   // used when exact
  preferredMonth: string;  // used when flexible (YYYY-MM)
  flexibilityWindow: string;
  dateNotes: string;
  notes: string;
}

function bookingToEditForm(b: MyBooking): EditForm {
  const flexibility = b.dateFlexibility ?? 'exact';
  return {
    travelers: b.travelers,
    dateFlexibility: flexibility,
    preferredDate: flexibility === 'exact' ? (b.preferredDate ?? '') : '',
    preferredMonth: flexibility === 'flexible' ? (b.preferredDate ?? '').slice(0, 7) : '',
    flexibilityWindow: b.flexibilityWindow ?? FLEXIBILITY_WINDOWS[1],
    dateNotes: b.dateNotes ?? '',
    notes: b.notes ?? '',
  };
}

export default function AccountDashboard() {
  const [authUser, setAuthUser]   = useState<AuthUser | null>(null);
  const [checked, setChecked]     = useState(false);

  const [bookings, setBookings]   = useState<MyBooking[]>([]);
  const [bookingsLoading, setBookingsLoading] = useState(true);
  const [bookingsError, setBookingsError]     = useState('');

  const [recommended, setRecommended] = useState<Tour[]>([]);
  const [recoLoading, setRecoLoading] = useState(true);

  // ── Cancel (pending only) ──
  const [cancelConfirmId, setCancelConfirmId] = useState<number | null>(null);
  const [cancellingId, setCancellingId] = useState<number | null>(null);
  const [cancelError, setCancelError] = useState('');

  // ── Edit (pending only) ──
  const [editingBooking, setEditingBooking] = useState<MyBooking | null>(null);
  const [editForm, setEditForm] = useState<EditForm | null>(null);
  const [editSaving, setEditSaving] = useState(false);
  const [editError, setEditError] = useState('');

  const todayISO = new Date().toISOString().slice(0, 10);
  const todayMonthISO = new Date().toISOString().slice(0, 7);

  useEffect(() => {
    setAuthUser(getToken() ? getUser() : null);
    setChecked(true);
  }, []);

  useEffect(() => {
    if (!authUser) {
      setBookingsLoading(false);
      setRecoLoading(false);
      return;
    }

    api.get<MyBooking[]>('/bookings/my')
      .then(({ data }) => setBookings(data))
      .catch((err) => {
        setBookingsError(
          err?.response?.data?.message ?? 'Could not load your bookings right now.',
        );
      })
      .finally(() => setBookingsLoading(false));

    api.get<Package[]>('/packages/recommendations/me?limit=6')
      .then(({ data }) => setRecommended(data.map(packageToTour)))
      .catch(() => setRecommended([]))
      .finally(() => setRecoLoading(false));
  }, [authUser]);

  const handleSignOut = () => {
    clearAuth();
    setAuthUser(null);
  };

  const upcomingCount = bookings.filter(
    (b) => b.status !== 'cancelled',
  ).length;
  const totalSpent = bookings
    .filter((b) => b.status !== 'cancelled')
    .reduce((s, b) => s + Number(b.totalAmount), 0);

  // ── Cancel handlers ──
  const confirmCancel = async () => {
    if (cancelConfirmId == null) return;
    setCancellingId(cancelConfirmId);
    setCancelError('');
    try {
      await api.patch(`/bookings/my/${cancelConfirmId}/cancel`);
      setBookings((prev) =>
        prev.map((b) => (b.id === cancelConfirmId ? { ...b, status: 'cancelled' } : b)),
      );
      setCancelConfirmId(null);
    } catch (err: any) {
      setCancelError(err?.response?.data?.message ?? 'Could not cancel this booking. Please try again.');
    } finally {
      setCancellingId(null);
    }
  };

  // ── Edit handlers ──
  const openEdit = (b: MyBooking) => {
    setEditingBooking(b);
    setEditForm(bookingToEditForm(b));
    setEditError('');
  };

  const closeEdit = () => {
    setEditingBooking(null);
    setEditForm(null);
    setEditError('');
  };

  const saveEdit = async () => {
    if (!editingBooking || !editForm) return;

    if (editForm.dateFlexibility === 'exact' && !editForm.preferredDate) {
      setEditError('Please pick a preferred start date.');
      return;
    }
    if (editForm.dateFlexibility === 'flexible' && !editForm.preferredMonth) {
      setEditError('Please pick a preferred month.');
      return;
    }

    setEditSaving(true);
    setEditError('');
    try {
      const preferredDate =
        editForm.dateFlexibility === 'exact'
          ? editForm.preferredDate
          : `${editForm.preferredMonth}-01`;

      const { data: updated } = await api.patch<MyBooking>(`/bookings/my/${editingBooking.id}`, {
        travelers: editForm.travelers,
        dateFlexibility: editForm.dateFlexibility,
        preferredDate,
        flexibilityWindow: editForm.dateFlexibility === 'flexible' ? editForm.flexibilityWindow : undefined,
        dateNotes: editForm.dateNotes || undefined,
        notes: editForm.notes || undefined,
      });

      setBookings((prev) => prev.map((b) => (b.id === editingBooking.id ? { ...b, ...updated } : b)));
      closeEdit();
    } catch (err: any) {
      setEditError(err?.response?.data?.message ?? 'Could not save your changes. Please try again.');
    } finally {
      setEditSaving(false);
    }
  };

  if (!checked) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-mist pt-[68px]" />
        <Footer />
      </>
    );
  }

  if (!authUser) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-mist pt-[68px] flex items-center justify-center px-6">
          <div className="text-center max-w-sm">
            <div className="text-[3rem] mb-4">🔒</div>
            <h2 className="font-serif text-[1.7rem] font-light text-ink mb-3">
              Sign in to view your dashboard
            </h2>
            <p className="text-[0.9rem] text-stone font-light mb-6">
              Track your bookings and get tour recommendations picked just for you.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/user/login?redirect=/account"
                className="flex items-center gap-2 bg-sky-accent text-white px-7 py-3 rounded-full text-[0.9rem] font-medium hover:bg-sky-dark transition-colors no-underline"
              >
                <IconLogin size={16} /> Sign in
              </Link>
              <Link
                href="/user/signup?redirect=/account"
                className="flex items-center gap-2 border border-sky-mid/30 text-ink px-7 py-3 rounded-full text-[0.9rem] font-medium hover:bg-sky-light transition-colors no-underline"
              >
                <IconUserPlus size={16} /> Create account
              </Link>
            </div>
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
        <div className="max-w-5xl mx-auto px-6 md:px-12 py-10">

          {/* Profile header */}
          <div className="flex items-center justify-between flex-wrap gap-4 mb-8">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-sky-accent text-white flex items-center justify-center text-lg font-semibold shrink-0">
                {(authUser.name || authUser.email).slice(0, 2).toUpperCase()}
              </div>
              <div>
                <h1 className="font-serif text-[1.7rem] font-semibold text-ink leading-tight">
                  {authUser.name || 'My Account'}
                </h1>
                <p className="text-sm text-pebble">{authUser.email}</p>
              </div>
            </div>
            <button
              onClick={handleSignOut}
              className="flex items-center gap-2 text-sm text-red-500 hover:text-red-600 border border-red-200 hover:bg-red-50 rounded-full px-4 py-2 transition-colors"
            >
              <IconLogout size={15} /> Sign out
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-10">
            {[
              { label: 'Total Bookings', value: bookings.length },
              { label: 'Active',         value: upcomingCount },
              { label: 'Total Spent',    value: `$${totalSpent.toLocaleString()}` },
            ].map((s) => (
              <div key={s.label} className="bg-white border border-sky-mid/15 rounded-[14px] px-4 py-3 shadow-[0_2px_8px_rgba(30,80,120,0.05)]">
                <div className="font-serif text-[1.5rem] font-light text-ink leading-none">{s.value}</div>
                <div className="text-[0.68rem] text-pebble uppercase tracking-[0.10em] font-medium mt-1">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Bookings */}
          <section className="mb-12">
            <h2 className="font-serif text-[1.3rem] font-semibold text-ink mb-4 flex items-center gap-2">
              <IconCalendarCheck size={20} className="text-sky-accent" />
              My Bookings
            </h2>

            {bookingsLoading ? (
              <div className="flex items-center gap-2 text-sm text-pebble py-6">
                <IconLoader2 size={16} className="animate-spin" /> Loading your bookings…
              </div>
            ) : bookingsError ? (
              <div className="flex items-center gap-2 text-sm text-red-500 py-6">
                <IconAlertCircle size={16} /> {bookingsError}
              </div>
            ) : bookings.length === 0 ? (
              <div className="bg-white border border-sky-mid/15 rounded-2xl p-8 text-center">
                <p className="text-sm text-stone">You haven&apos;t booked a tour yet.</p>
                <a href="/" className="inline-block mt-3 text-sky-accent text-sm font-medium hover:underline">
                  Browse tours →
                </a>
              </div>
            ) : (
              <div className="space-y-3">
                {bookings.map((b) => {
                  const sc = STATUS_CONFIG[b.status] ?? STATUS_CONFIG.pending;
                  const tourName = b.tour?.name ?? 'Tour';
                  const duration = b.tour?.durationDays ? `${b.tour.durationDays} Days` : b.tour?.duration;
                  const isPending = b.status === 'pending';
                  return (
                    <div
                      key={b.id}
                      className="bg-white border border-sky-mid/15 rounded-2xl p-5 flex items-center justify-between gap-4 flex-wrap shadow-[0_2px_8px_rgba(30,80,120,0.05)]"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-serif text-[1.05rem] font-semibold text-ink truncate">{tourName}</span>
                          <span
                            className="text-[0.68rem] font-semibold px-2.5 py-0.5 rounded-full shrink-0"
                            style={{ background: sc.bg, color: sc.text }}
                          >
                            {sc.label}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-[0.78rem] text-pebble flex-wrap">
                          {duration && (
                            <span className="flex items-center gap-1"><IconMapPin size={13} /> {duration}</span>
                          )}
                          <span className="flex items-center gap-1"><IconUsers size={13} /> {b.travelers} {b.travelers === 1 ? 'person' : 'people'}</span>
                          <span className="flex items-center gap-1"><IconCreditCard size={13} /> {b.paymentMethod}</span>
                          <span>Booked {fmtDate(b.createdAt)}</span>
                          {b.departureDate && <span>Departs {fmtDate(b.departureDate)}</span>}
                        </div>
                        {isPending && (
                          <div className="flex items-center gap-3 mt-3">
                            <button
                              onClick={() => openEdit(b)}
                              className="flex items-center gap-1.5 text-[0.78rem] font-medium text-sky-accent border border-sky-accent/30 rounded-full px-3 py-1.5 hover:bg-sky-light transition-colors"
                            >
                              <IconPencil size={13} /> Edit
                            </button>
                            <button
                              onClick={() => setCancelConfirmId(b.id)}
                              className="flex items-center gap-1.5 text-[0.78rem] font-medium text-red-500 border border-red-200 rounded-full px-3 py-1.5 hover:bg-red-50 transition-colors"
                            >
                              <IconX size={13} /> Cancel booking
                            </button>
                          </div>
                        )}
                      </div>
                      <div className="text-right shrink-0">
                        <span className="block text-[0.68rem] text-pebble">Total</span>
                        <span className="font-serif text-[1.2rem] font-semibold text-sky-dark">
                          ${Number(b.totalAmount).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* Recommendations */}
          <section>
            <h2 className="font-serif text-[1.3rem] font-semibold text-ink mb-1 flex items-center gap-2">
              <IconSparkles size={20} className="text-sky-accent" />
              Recommended For You
            </h2>
            <p className="text-[0.82rem] text-pebble mb-5">
              Picked based on the tours you&apos;ve viewed and booked.
            </p>

            {recoLoading ? (
              <div className="flex items-center gap-2 text-sm text-pebble py-6">
                <IconLoader2 size={16} className="animate-spin" /> Finding tours you&apos;ll love…
              </div>
            ) : recommended.length === 0 ? (
              <div className="bg-white border border-sky-mid/15 rounded-2xl p-8 text-center">
                <p className="text-sm text-stone">
                  Browse a few tours and we&apos;ll start tailoring recommendations for you.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {recommended.map((tour) => (
                  <TourCard key={tour.id} tour={tour} />
                ))}
              </div>
            )}
          </section>

        </div>
      </main>
      <Footer />

      {/* ── Cancel confirmation ── */}
      {cancelConfirmId != null && (
        <div
          className="fixed inset-0 z-[80] flex items-center justify-center bg-black/45 px-4"
          role="dialog"
          aria-modal="true"
          onClick={() => (cancellingId ? undefined : setCancelConfirmId(null))}
        >
          <div
            className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-serif text-lg font-semibold text-ink mb-2">Cancel this booking?</h3>
            <p className="text-sm text-stone mb-2">
              This can&apos;t be undone. You&apos;ll get a confirmation email once it&apos;s cancelled.
            </p>
            {cancelError && (
              <p className="text-[0.8rem] text-red-500 mb-2">{cancelError}</p>
            )}
            <div className="flex justify-end gap-3 mt-4">
              <button
                onClick={() => setCancelConfirmId(null)}
                disabled={!!cancellingId}
                className="px-4 py-2 rounded-full text-sm font-medium text-ink border border-sky-mid/30 hover:bg-sky-light transition-colors disabled:opacity-50"
              >
                Keep booking
              </button>
              <button
                onClick={confirmCancel}
                disabled={!!cancellingId}
                className="px-4 py-2 rounded-full text-sm font-medium text-white bg-red-500 hover:bg-red-600 transition-colors disabled:opacity-60"
              >
                {cancellingId ? 'Cancelling…' : 'Yes, cancel it'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Edit booking ── */}
      {editingBooking && editForm && (
        <div
          className="fixed inset-0 z-[80] flex items-center justify-center bg-black/45 px-4 py-8 overflow-y-auto"
          role="dialog"
          aria-modal="true"
          onClick={() => (editSaving ? undefined : closeEdit())}
        >
          <div
            className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 my-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-serif text-lg font-semibold text-ink">
                Edit booking #{String(editingBooking.id).padStart(4, '0')}
              </h3>
              <button onClick={closeEdit} disabled={editSaving} className="text-gray-400 hover:text-gray-600">
                <IconX size={18} />
              </button>
            </div>

            {editError && (
              <div className="mb-4 px-3.5 py-2.5 rounded-lg bg-red-50 border border-red-100">
                <p className="text-[0.78rem] text-red-500">{editError}</p>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-[0.72rem] font-medium text-gray-500 uppercase tracking-wider mb-1.5">
                  Travelers
                </label>
                <input
                  type="number"
                  min={1}
                  max={100}
                  value={editForm.travelers}
                  onChange={(e) => setEditForm({ ...editForm, travelers: Math.max(1, Math.min(100, Number(e.target.value) || 1)) })}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-800 outline-none focus:border-sky-accent focus:ring-2 focus:ring-sky-accent/10 transition-all"
                />
              </div>

              <div>
                <label className="block text-[0.72rem] font-medium text-gray-500 uppercase tracking-wider mb-1.5">
                  When would you like to start?
                </label>
                <div className="grid grid-cols-2 gap-2 mb-2">
                  {(['exact', 'flexible'] as const).map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => setEditForm({ ...editForm, dateFlexibility: opt })}
                      className="flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-[0.8rem] font-semibold border transition-colors"
                      style={{
                        borderColor: editForm.dateFlexibility === opt ? '#2e86c1' : 'rgba(46,134,193,0.2)',
                        background: editForm.dateFlexibility === opt ? 'linear-gradient(135deg, #f0f8ff, #e0f0fa)' : 'transparent',
                        color: editForm.dateFlexibility === opt ? '#1a6ea8' : '#6b7c8d',
                      }}
                    >
                      {opt === 'exact' ? <IconCalendarEvent size={15} /> : <IconCalendarTime size={15} />}
                      {opt === 'exact' ? 'Exact date' : 'Flexible'}
                    </button>
                  ))}
                </div>

                {editForm.dateFlexibility === 'exact' ? (
                  <input
                    type="date"
                    min={todayISO}
                    value={editForm.preferredDate}
                    onChange={(e) => setEditForm({ ...editForm, preferredDate: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-800 outline-none focus:border-sky-accent focus:ring-2 focus:ring-sky-accent/10 transition-all"
                  />
                ) : (
                  <div className="space-y-2">
                    <input
                      type="month"
                      min={todayMonthISO}
                      value={editForm.preferredMonth}
                      onChange={(e) => setEditForm({ ...editForm, preferredMonth: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-800 outline-none focus:border-sky-accent focus:ring-2 focus:ring-sky-accent/10 transition-all"
                    />
                    <div className="flex flex-wrap gap-2">
                      {FLEXIBILITY_WINDOWS.map((w) => (
                        <button
                          key={w}
                          type="button"
                          onClick={() => setEditForm({ ...editForm, flexibilityWindow: w })}
                          className="px-3 py-1 rounded-full text-[0.74rem] font-medium border transition-colors"
                          style={{
                            borderColor: editForm.flexibilityWindow === w ? '#2e86c1' : 'rgba(46,134,193,0.2)',
                            background: editForm.flexibilityWindow === w ? 'linear-gradient(135deg, #f0f8ff, #e0f0fa)' : 'transparent',
                            color: editForm.flexibilityWindow === w ? '#1a6ea8' : '#6b7c8d',
                          }}
                        >
                          {w}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-[0.72rem] font-medium text-gray-500 uppercase tracking-wider mb-1.5">
                  Timing notes <span className="normal-case font-normal text-gray-400">(optional)</span>
                </label>
                <input
                  type="text"
                  value={editForm.dateNotes}
                  onChange={(e) => setEditForm({ ...editForm, dateNotes: e.target.value })}
                  placeholder="e.g. arriving a day early"
                  className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-800 placeholder-gray-300 outline-none focus:border-sky-accent focus:ring-2 focus:ring-sky-accent/10 transition-all"
                />
              </div>

              <div>
                <label className="block text-[0.72rem] font-medium text-gray-500 uppercase tracking-wider mb-1.5">
                  Special requests <span className="normal-case font-normal text-gray-400">(optional)</span>
                </label>
                <textarea
                  rows={3}
                  value={editForm.notes}
                  onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                  placeholder="Dietary needs, accessibility requirements, etc."
                  className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-800 placeholder-gray-300 outline-none focus:border-sky-accent focus:ring-2 focus:ring-sky-accent/10 transition-all resize-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={closeEdit}
                disabled={editSaving}
                className="px-4 py-2 rounded-full text-sm font-medium text-ink border border-sky-mid/30 hover:bg-sky-light transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={saveEdit}
                disabled={editSaving}
                className="px-5 py-2 rounded-full text-sm font-medium text-white transition-opacity disabled:opacity-60"
                style={{ background: 'linear-gradient(135deg, #2E86C1, #1A5276)' }}
              >
                {editSaving ? 'Saving…' : 'Save changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}