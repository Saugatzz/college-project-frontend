'use client';
import { useEffect, useState, useMemo } from 'react';
import api from '@/lib/api';
import {
  Table, Badge, TextInput, Group, Text, Box, Select,
  Loader, Center, ActionIcon, Tooltip, rem,
} from '@mantine/core';
import {
  IconSearch, IconRefresh, IconChevronUp, IconChevronDown,
  IconSelector, IconAlertCircle,
} from '@tabler/icons-react';

// ── Types ────────────────────────────────────────────────────────────────────
type BookingStatus = 'pending' | 'confirmed' | 'cancelled';
type PaymentMethod = 'Khalti' | 'eSewa' | 'Card';

interface BookingAddon { id: number; name: string; price: number; }

interface Booking {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  country: string;
  travelers: number;
  paymentMethod: PaymentMethod;
  tourPrice: number;
  addonsTotal: number;
  totalAmount: number;
  status: BookingStatus;
  selectedAddons: BookingAddon[];
  tour?: { name?: string; duration?: string };
  createdAt: string;
}

// ── Status badge config ───────────────────────────────────────────────────────
const STATUS_CONFIG: Record<BookingStatus, { color: string; label: string }> = {
  confirmed: { color: 'teal',   label: 'Confirmed' },
  pending:   { color: 'orange', label: 'Pending'   },
  cancelled: { color: 'red',    label: 'Cancelled' },
};

const PAY_ICON: Record<PaymentMethod, string> = { Khalti: '💜', eSewa: '💚', Card: '💳' };

// ── Sort helper ───────────────────────────────────────────────────────────────
type SortKey = 'id' | 'customer' | 'tour' | 'createdAt' | 'travelers' | 'totalAmount' | 'status';

function sortBookings(list: Booking[], key: SortKey, dir: 'asc' | 'desc'): Booking[] {
  return [...list].sort((a, b) => {
    let av: string | number, bv: string | number;
    switch (key) {
      case 'customer': av = `${a.firstName} ${a.lastName}`; bv = `${b.firstName} ${b.lastName}`; break;
      case 'tour':     av = a.tour?.name ?? ''; bv = b.tour?.name ?? ''; break;
      default:         av = (a as any)[key]; bv = (b as any)[key];
    }
    if (av < bv) return dir === 'asc' ? -1 : 1;
    if (av > bv) return dir === 'asc' ?  1 : -1;
    return 0;
  });
}

// ── SortIcon ─────────────────────────────────────────────────────────────────
function SortIcon({ col, sortKey, dir }: { col: SortKey; sortKey: SortKey; dir: 'asc' | 'desc' }) {
  if (col !== sortKey) return <IconSelector size={13} color="#cbd5e1" />;
  return dir === 'asc' ? <IconChevronUp size={13} color="#1A5276" /> : <IconChevronDown size={13} color="#1A5276" />;
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function BookingTable() {
  const [bookings, setBookings]   = useState<Booking[]>([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState('');
  const [search, setSearch]       = useState('');
  const [filter, setFilter]       = useState<string>('All');
  const [sortKey, setSortKey]     = useState<SortKey>('createdAt');
  const [sortDir, setSortDir]     = useState<'asc' | 'desc'>('desc');

  const fetchBookings = async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await api.get<Booking[]>('/bookings');
      setBookings(data);
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'Failed to load bookings. Is the backend running?');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchBookings(); }, []);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('asc'); }
  };

  const filtered = useMemo(() => {
    let list = bookings;
    if (filter !== 'All') list = list.filter(b => b.status === filter.toLowerCase());
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(b =>
        `${b.firstName} ${b.lastName}`.toLowerCase().includes(q) ||
        b.email.toLowerCase().includes(q) ||
        (b.tour?.name ?? '').toLowerCase().includes(q) ||
        String(b.id).includes(q)
      );
    }
    return sortBookings(list, sortKey, sortDir);
  }, [bookings, filter, search, sortKey, sortDir]);

  // ── Column header ─────────────────────────────────────────────────────────
  const TH = ({ col, label, width }: { col: SortKey; label: string; width?: number }) => (
    <Table.Th
      onClick={() => toggleSort(col)}
      style={{
        cursor: 'pointer', userSelect: 'none', width,
        padding: `${rem(10)} ${rem(16)}`,
        whiteSpace: 'nowrap',
      }}
    >
      <Group gap={4} wrap="nowrap">
        <Text fz={11} fw={600} c="gray.5" style={{ letterSpacing: '0.08em', textTransform: 'uppercase' }}>{label}</Text>
        <SortIcon col={col} sortKey={sortKey} dir={sortDir} />
      </Group>
    </Table.Th>
  );

  return (
    <Box style={{ background: 'white', borderRadius: rem(20), border: '1px solid #f0f4f8', overflow: 'hidden' }}>

      {/* ── Toolbar ── */}
      <Group justify="space-between" px={20} py={14} style={{ borderBottom: '1px solid #f0f4f8' }} wrap="wrap" gap="sm">
        {/* Status filters */}
        <Group gap={6} wrap="wrap">
          {['All', 'Confirmed', 'Pending', 'Cancelled'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                fontSize: rem(12), padding: `${rem(5)} ${rem(12)}`, borderRadius: rem(20),
                border: filter === f ? 'none' : '1px solid #e2e8f0',
                background: filter === f ? '#1A5276' : 'transparent',
                color: filter === f ? 'white' : '#94a3b8',
                cursor: 'pointer', transition: 'all 0.18s ease', fontWeight: 500,
              }}
            >
              {f}
              {f !== 'All' && (
                <span style={{
                  marginLeft: rem(5), fontSize: rem(10),
                  background: filter === f ? 'rgba(255,255,255,0.2)' : '#f1f5f9',
                  color: filter === f ? 'white' : '#64748b',
                  padding: `1px ${rem(5)}`, borderRadius: rem(8),
                }}>
                  {bookings.filter(b => b.status === f.toLowerCase()).length}
                </span>
              )}
            </button>
          ))}
        </Group>

        {/* Search + refresh */}
        <Group gap={8}>
          <TextInput
            value={search}
            onChange={e => setSearch(e.currentTarget.value)}
            placeholder="Search name, email, tour…"
            leftSection={<IconSearch size={14} color="#94a3b8" />}
            size="xs"
            radius="md"
            style={{ width: rem(210) }}
            styles={{ input: { border: '1px solid #e2e8f0', fontSize: rem(13), '&:focus': { borderColor: '#1A5276' } } }}
          />
          <Tooltip label="Refresh" withArrow>
            <ActionIcon variant="light" color="blue" size="md" radius="md" onClick={fetchBookings} loading={loading}>
              <IconRefresh size={15} />
            </ActionIcon>
          </Tooltip>
        </Group>
      </Group>

      {/* ── States ── */}
      {loading && (
        <Center py={60}><Group gap={10}><Loader size="sm" color="#1A5276" /><Text fz={13} c="dimmed">Loading bookings…</Text></Group></Center>
      )}

      {!loading && error && (
        <Center py={48}>
          <Group gap={10} direction="column" style={{ textAlign: 'center' }}>
            <IconAlertCircle size={28} color="#ef4444" />
            <Text fz={13} c="red.6" maw={380}>{error}</Text>
          </Group>
        </Center>
      )}

      {!loading && !error && filtered.length === 0 && (
        <Center py={52}><Text fz={13} c="dimmed">{search || filter !== 'All' ? 'No bookings match your search.' : 'No bookings yet.'}</Text></Center>
      )}

      {/* ── Table ── */}
      {!loading && !error && filtered.length > 0 && (
        <Table
          highlightOnHover
          horizontalSpacing={0}
          verticalSpacing={0}
          style={{ tableLayout: 'fixed', width: '100%' }}
        >
          <Table.Thead style={{ background: '#fafbfc', borderBottom: '1px solid #f0f4f8' }}>
            <Table.Tr>
              <TH col="id"          label="#"          width={72}  />
              <TH col="customer"    label="Customer"   width={180} />
              <TH col="tour"        label="Tour"               />
              <TH col="createdAt"   label="Booked On"  width={120} />
              <TH col="travelers"   label="People"     width={80}  />
              <TH col="totalAmount" label="Amount"     width={110} />
              <Table.Th style={{ padding: `${rem(10)} ${rem(16)}`, width: 110 }}>
                <Text fz={11} fw={600} c="gray.5" style={{ letterSpacing: '0.08em', textTransform: 'uppercase' }}>Payment</Text>
              </Table.Th>
              <TH col="status"      label="Status"     width={110} />
            </Table.Tr>
          </Table.Thead>

          <Table.Tbody>
            {filtered.map(b => {
              const sc  = STATUS_CONFIG[b.status] ?? STATUS_CONFIG.pending;
              const date = new Date(b.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
              const initials = `${b.firstName[0] ?? ''}${b.lastName[0] ?? ''}`.toUpperCase();

              return (
                <Table.Tr
                  key={b.id}
                  style={{ borderBottom: '1px solid #f8fafc', transition: 'background 0.15s' }}
                >
                  {/* # */}
                  <Table.Td style={{ padding: `${rem(12)} ${rem(16)}` }}>
                    <Text fz={12} c="gray.4" ff="monospace">#{String(b.id).padStart(4, '0')}</Text>
                  </Table.Td>

                  {/* Customer */}
                  <Table.Td style={{ padding: `${rem(12)} ${rem(16)}` }}>
                    <Group gap={10} wrap="nowrap">
                      <Box style={{
                        width: rem(30), height: rem(30), borderRadius: '50%',
                        background: 'linear-gradient(135deg, #dbeafe, #bfdbfe)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: rem(10), fontWeight: 700, color: '#1e40af', flexShrink: 0,
                      }}>
                        {initials}
                      </Box>
                      <Box style={{ overflow: 'hidden' }}>
                        <Text fz={13} fw={600} c="dark.7" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {b.firstName} {b.lastName}
                        </Text>
                        <Text fz={11} c="dimmed" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{b.email}</Text>
                      </Box>
                    </Group>
                  </Table.Td>

                  {/* Tour */}
                  <Table.Td style={{ padding: `${rem(12)} ${rem(16)}` }}>
                    <Text fz={13} c="dark.6" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {b.tour?.name ?? '—'}
                    </Text>
                    {b.tour?.duration && <Text fz={11} c="dimmed">{b.tour.duration}</Text>}
                  </Table.Td>

                  {/* Date */}
                  <Table.Td style={{ padding: `${rem(12)} ${rem(16)}` }}>
                    <Text fz={12} c="gray.5">{date}</Text>
                  </Table.Td>

                  {/* Travelers */}
                  <Table.Td style={{ padding: `${rem(12)} ${rem(16)}` }}>
                    <Text fz={13} c="dark.6" ta="center">{b.travelers}</Text>
                  </Table.Td>

                  {/* Amount */}
                  <Table.Td style={{ padding: `${rem(12)} ${rem(16)}` }}>
                    <Text fz={13} fw={600} c="dark.7">${b.totalAmount.toLocaleString()}</Text>
                    {b.addonsTotal > 0 && <Text fz={11} c="blue.5">+${b.addonsTotal} add-ons</Text>}
                  </Table.Td>

                  {/* Payment method */}
                  <Table.Td style={{ padding: `${rem(12)} ${rem(16)}` }}>
                    <Group gap={5} wrap="nowrap">
                      <span style={{ fontSize: rem(14) }}>{PAY_ICON[b.paymentMethod] ?? '💳'}</span>
                      <Text fz={12} c="gray.6">{b.paymentMethod}</Text>
                    </Group>
                  </Table.Td>

                  {/* Status */}
                  <Table.Td style={{ padding: `${rem(12)} ${rem(16)}` }}>
                    <Badge
                      color={sc.color}
                      variant="light"
                      size="sm"
                      radius="md"
                      style={{ fontWeight: 600, letterSpacing: '0.03em' }}
                    >
                      {sc.label}
                    </Badge>
                  </Table.Td>
                </Table.Tr>
              );
            })}
          </Table.Tbody>
        </Table>
      )}

      {/* ── Footer count ── */}
      {!loading && !error && bookings.length > 0 && (
        <Box px={20} py={10} style={{ borderTop: '1px solid #f0f4f8' }}>
          <Text fz={12} c="dimmed">
            Showing <Text span fw={600} c="dark.6">{filtered.length}</Text> of <Text span fw={600} c="dark.6">{bookings.length}</Text> bookings
          </Text>
        </Box>
      )}
    </Box>
  );
}