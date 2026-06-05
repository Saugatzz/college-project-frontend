'use client';
import { useEffect, useState } from 'react';
import {
  Badge, Group, Text, Box, Loader, Center, ActionIcon, Tooltip, rem,
} from '@mantine/core';
import { IconRefresh, IconAlertCircle } from '@tabler/icons-react';
import { ColumnDef } from '@tanstack/react-table';
import api from '@/lib/api/api';
import MantineTable from '@/components/common/MantineTable'; // 👈 adjust path as needed

// ── Types ─────────────────────────────────────────────────────────────────────
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

// ── Config ────────────────────────────────────────────────────────────────────
const STATUS_CONFIG: Record<BookingStatus, { color: string; label: string }> = {
  confirmed: { color: 'teal',   label: 'Confirmed' },
  pending:   { color: 'orange', label: 'Pending'   },
  cancelled: { color: 'red',    label: 'Cancelled' },
};

const PAY_ICON: Record<PaymentMethod, string> = { Khalti: '💜', eSewa: '💚', Card: '💳' };

// ── Column definitions ────────────────────────────────────────────────────────
// Defined outside component so they are not recreated on every render
const columns: ColumnDef<Booking, any>[] = [
  {
    id: 'id',
    accessorKey: 'id',
    header: '#',
    size: 72,
    cell: ({ row }) => (
      <Text fz={12} c="gray.4" ff="monospace">
        #{String(row.original.id).padStart(4, '0')}
      </Text>
    ),
  },
  {
    id: 'customer',
    header: 'Customer',
    size: 200,
    accessorFn: row => `${row.firstName} ${row.lastName}`,
    cell: ({ row }) => {
      const b = row.original;
      const initials = `${b.firstName[0] ?? ''}${b.lastName[0] ?? ''}`.toUpperCase();
      return (
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
            <Text fz={13} fw={600} c="dark.7" truncate>
              {b.firstName} {b.lastName}
            </Text>
            <Text fz={11} c="dimmed" truncate>{b.email}</Text>
          </Box>
        </Group>
      );
    },
  },
  {
    id: 'tour',
    header: 'Tour',
    accessorFn: row => row.tour?.name ?? '',
    cell: ({ row }) => {
      const b = row.original;
      return (
        <>
          <Text fz={13} c="dark.6" truncate>{b.tour?.name ?? '—'}</Text>
          {b.tour?.duration && <Text fz={11} c="dimmed">{b.tour.duration}</Text>}
        </>
      );
    },
  },
  {
    id: 'createdAt',
    accessorKey: 'createdAt',
    header: 'Booked On',
    size: 120,
    cell: ({ row }) => {
      const date = new Date(row.original.createdAt).toLocaleDateString('en-US', {
        month: 'short', day: 'numeric', year: 'numeric',
      });
      return <Text fz={12} c="gray.5">{date}</Text>;
    },
  },
  {
    id: 'travelers',
    accessorKey: 'travelers',
    header: 'People',
    size: 80,
    cell: ({ row }) => (
      <Text fz={13} c="dark.6" ta="center">{row.original.travelers}</Text>
    ),
  },
  {
    id: 'totalAmount',
    accessorKey: 'totalAmount',
    header: 'Amount',
    size: 110,
    cell: ({ row }) => {
      const b = row.original;
      return (
        <>
          <Text fz={13} fw={600} c="dark.7">${b.totalAmount.toLocaleString()}</Text>
          {b.addonsTotal > 0 && <Text fz={11} c="blue.5">+${b.addonsTotal} add-ons</Text>}
        </>
      );
    },
  },
  {
    id: 'paymentMethod',
    accessorKey: 'paymentMethod',
    header: 'Payment',
    size: 110,
    enableSorting: false,
    cell: ({ row }) => {
      const method = row.original.paymentMethod;
      return (
        <Group gap={5} wrap="nowrap">
          <span style={{ fontSize: rem(14) }}>{PAY_ICON[method] ?? '💳'}</span>
          <Text fz={12} c="gray.6">{method}</Text>
        </Group>
      );
    },
  },
  {
    id: 'status',
    accessorKey: 'status',
    header: 'Status',
    size: 110,
    cell: ({ row }) => {
      const sc = STATUS_CONFIG[row.original.status] ?? STATUS_CONFIG.pending;
      return (
        <Badge
          color={sc.color}
          variant="light"
          size="sm"
          radius="md"
          style={{ fontWeight: 600, letterSpacing: '0.03em' }}
        >
          {sc.label}
        </Badge>
      );
    },
  },
];

// ── Component ─────────────────────────────────────────────────────────────────
export default function BookingTable() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');

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

  // ── Loading ────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <Center py={60}>
        <Group gap={10}>
          <Loader size="sm" color="#1A5276" />
          <Text fz={13} c="dimmed">Loading bookings…</Text>
        </Group>
      </Center>
    );
  }

  // ── Error ──────────────────────────────────────────────────────────────────
  if (error) {
    return (
      <Center py={48}>
        <Group gap={10}>
          <IconAlertCircle size={28} color="#ef4444" />
          <Text fz={13} c="red.6" maw={380}>{error}</Text>
          <Tooltip label="Retry" withArrow>
            <ActionIcon variant="light" color="blue" size="md" radius="md" onClick={fetchBookings}>
              <IconRefresh size={15} />
            </ActionIcon>
          </Tooltip>
        </Group>
      </Center>
    );
  }

  // ── Table ──────────────────────────────────────────────────────────────────
  return (
    <Box style={{
      background: 'white',
      borderRadius: rem(20),
      border: '1px solid #f0f4f8',
      overflow: 'hidden',
    }}>
      <MantineTable<Booking>
        data={bookings}
        columns={columns}
        enableGlobalFilter={true}
        enablePagination={true}
        renderBottomToolbar={true}
      />
    </Box>
  );
}