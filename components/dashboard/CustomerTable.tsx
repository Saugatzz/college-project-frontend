"use client";
import { useEffect, useState, useCallback } from "react";
import {
  Group, Text, Box, Loader, Center, ActionIcon, Tooltip, rem,
  Drawer, Stack, Divider, ThemeIcon, Paper,
} from "@mantine/core";
import {
  IconRefresh, IconAlertCircle, IconX, IconUser, IconMail, IconPhone,
  IconWorld, IconCalendar, IconMountain, IconClock, IconCurrencyDollar,
  IconShoppingBag,
} from "@tabler/icons-react";
import { ColumnDef } from "@tanstack/react-table";
import api from "@/lib/api/api";
import MantineTable from "@/components/common/MantineTable";

// ─── Types ────────────────────────────────────────────────────────────────────

type BookingStatus = "pending" | "confirmed" | "cancelled";
type PaymentMethod = "Khalti" | "eSewa" | "Card";

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
  tour?: {
    id?: number;
    title?: string;
    name?: string;
    duration?: string;
    durationDays?: number;
  };
  createdAt: string;
  updatedAt: string;
}

// Derived customer — built from grouping bookings by email
interface Customer {
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  country: string;
  bookingCount: number;
  totalSpent: number;
  firstBookingAt: string;
  lastBookingAt: string;
  bookings: Booking[];
}

const STATUS_CONFIG = {
  confirmed: { dot: "#10b981", bg: "#f0fdf4", label: "Confirmed" },
  pending:   { dot: "#f59e0b", bg: "#fffbeb", label: "Pending"   },
  cancelled: { dot: "#ef4444", bg: "#fef2f2", label: "Cancelled" },
} as const;

// ─── Derive customers from raw bookings ───────────────────────────────────────

function deriveCustomers(bookings: Booking[]): Customer[] {
  const map = new Map<string, Customer>();

  for (const b of bookings) {
    const key = b.email.toLowerCase().trim();
    if (!map.has(key)) {
      map.set(key, {
        email:          b.email,
        firstName:      b.firstName,
        lastName:       b.lastName,
        phone:          b.phone,
        country:        b.country,
        bookingCount:   0,
        totalSpent:     0,
        firstBookingAt: b.createdAt,
        lastBookingAt:  b.createdAt,
        bookings:       [],
      });
    }
    const c = map.get(key)!;
    c.bookingCount   += 1;
    c.totalSpent     += Number(b.totalAmount);
    c.bookings.push(b);
    if (b.createdAt < c.firstBookingAt) c.firstBookingAt = b.createdAt;
    if (b.createdAt > c.lastBookingAt)  c.lastBookingAt  = b.createdAt;
  }

  return Array.from(map.values()).sort((a, b) => b.totalSpent - a.totalSpent);
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtDate(iso?: string) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function DetailField({ icon, label, value }: { icon: React.ReactNode; label: string; value: React.ReactNode }) {
  return (
    <Group gap={12} align="flex-start" wrap="nowrap">
      <ThemeIcon size={32} radius="md" variant="light" color="teal" style={{ flexShrink: 0, marginTop: 2 }}>
        {icon}
      </ThemeIcon>
      <Box>
        <Box component="span" style={{
          display: "block", letterSpacing: "0.1em", textTransform: "uppercase",
          marginBottom: 2, color: "var(--mantine-color-gray-6)", fontSize: rem(10), fontWeight: 700,
        }}>
          {label}
        </Box>
        <Box component="span" style={{
          display: "block", fontSize: rem(13), fontWeight: 500, color: "var(--mantine-color-dark-7)",
        }}>
          {value || "—"}
        </Box>
      </Box>
    </Group>
  );
}

// ─── Drawer ───────────────────────────────────────────────────────────────────

function CustomerDrawer({ customer, opened, onClose }: {
  customer: Customer | null;
  opened: boolean;
  onClose: () => void;
}) {
  if (!customer) return null;

  const initials = `${customer.firstName[0] ?? ""}${customer.lastName[0] ?? ""}`.toUpperCase();

  return (
    <Drawer
      opened={opened} onClose={onClose} position="right" size={480}
      padding={0} withCloseButton={false}
      styles={{
        body:    { padding: 0, height: "100%", display: "flex", flexDirection: "column" },
        content: { borderLeft: "1px solid #e8f0f8" },
      }}
    >
      {/* Header */}
      <Box style={{
        background: "linear-gradient(135deg, #064e3b 0%, #065f46 50%, #059669 100%)",
        padding: `${rem(24)} ${rem(28)}`, position: "relative", flexShrink: 0,
      }}>
        <div style={{ position: "absolute", top: -20, right: -20, width: 120, height: 120, borderRadius: "50%", background: "rgba(255,255,255,0.05)" }} />
        <div style={{ position: "absolute", bottom: -30, left: 40, width: 80, height: 80, borderRadius: "50%", background: "rgba(255,255,255,0.04)" }} />

        <Group justify="space-between" align="flex-start" mb={16}>
          <Group gap={14}>
            <Box style={{
              width: rem(48), height: rem(48), borderRadius: "50%",
              background: "rgba(255,255,255,0.15)", border: "2px solid rgba(255,255,255,0.3)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: rem(16), fontWeight: 800, color: "white",
            }}>
              {initials}
            </Box>
            <Box>
              <Text fz={17} fw={600} c="white" lh={1.2}>{customer.firstName} {customer.lastName}</Text>
              <Text fz={12} c="rgba(255,255,255,0.65)" mt={2}>{customer.email}</Text>
            </Box>
          </Group>
          <ActionIcon variant="subtle" onClick={onClose} style={{ color: "rgba(255,255,255,0.7)", marginTop: 2 }} size="md">
            <IconX size={18} />
          </ActionIcon>
        </Group>

        <Group gap={10} align="center">
          <Box style={{
            display: "flex", alignItems: "center", gap: rem(6),
            background: "rgba(255,255,255,0.15)", borderRadius: rem(20), padding: `${rem(4)} ${rem(12)}`,
          }}>
            <IconShoppingBag size={12} color="white" />
            <Text fz={12} fw={700} c="white">{customer.bookingCount} {customer.bookingCount === 1 ? "booking" : "bookings"}</Text>
          </Box>
          <Box style={{
            display: "flex", alignItems: "center", gap: rem(6),
            background: "rgba(255,255,255,0.15)", borderRadius: rem(20), padding: `${rem(4)} ${rem(12)}`,
          }}>
            <IconCurrencyDollar size={12} color="white" />
            <Text fz={12} fw={700} c="white">${Number(customer.totalSpent).toLocaleString()} spent</Text>
          </Box>
        </Group>
      </Box>

      {/* Body */}
      <Box style={{ flex: 1, overflowY: "auto", padding: `${rem(24)} ${rem(28)}` }}>

        {/* Personal info */}
        <Paper radius="lg" p="md" mb="lg" style={{ background: "linear-gradient(135deg, #f0fdf4, #dcfce7)", border: "1px solid rgba(5,150,105,0.12)" }}>
          <Text fz={10} fw={700} c="teal.7" mb={10} style={{ letterSpacing: "0.12em", textTransform: "uppercase" }}>Personal Info</Text>
          <Stack gap={10}>
            <DetailField icon={<IconUser size={15} />}     label="Full Name"    value={`${customer.firstName} ${customer.lastName}`} />
            <DetailField icon={<IconMail size={15} />}     label="Email"        value={customer.email} />
            <DetailField icon={<IconPhone size={15} />}    label="Phone"        value={customer.phone} />
            <DetailField icon={<IconWorld size={15} />}    label="Country"      value={customer.country} />
            <DetailField icon={<IconCalendar size={15} />} label="First Booked" value={fmtDate(customer.firstBookingAt)} />
            <DetailField icon={<IconClock size={15} />}    label="Last Booked"  value={fmtDate(customer.lastBookingAt)} />
          </Stack>
        </Paper>

        {/* Spending summary */}
        <Paper radius="lg" p="md" mb="lg" style={{ background: "#fafbfc", border: "1px solid #eef2f7" }}>
          <Text fz={10} fw={700} c="gray.6" mb={10} style={{ letterSpacing: "0.12em", textTransform: "uppercase" }}>Spending Summary</Text>
          <Stack gap={8}>
            <Group justify="space-between">
              <Text fz={12} c="dimmed">Total bookings</Text>
              <Text fz={12} fw={600} c="dark.7">{customer.bookingCount}</Text>
            </Group>
            <Divider color="#eef2f7" />
            <Group justify="space-between" pt={2}>
              <Text fz={13} fw={600} c="dark.7">Total spent</Text>
              <Text fz={18} fw={700} style={{ background: "linear-gradient(135deg, #059669, #064e3b)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                ${Number(customer.totalSpent).toLocaleString()}
              </Text>
            </Group>
          </Stack>
        </Paper>

        {/* All bookings */}
        {customer.bookings.length > 0 && (
          <Paper radius="lg" p="md" mb="lg" style={{ background: "#fafbfc", border: "1px solid #eef2f7" }}>
            <Text fz={10} fw={700} c="gray.6" mb={10} style={{ letterSpacing: "0.12em", textTransform: "uppercase" }}>Booking History</Text>
            <Stack gap={10}>
              {customer.bookings
                .slice()
                .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
                .map((b) => {
                  const sc = STATUS_CONFIG[b.status] ?? STATUS_CONFIG.pending;
                  const tourName = b.tour?.title ?? b.tour?.name ?? "—";
                  return (
                    <Box key={b.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: rem(8) }}>
                      <Group gap={8} wrap="nowrap" style={{ flex: 1, overflow: "hidden" }}>
                        <IconMountain size={13} color="#94a3b8" style={{ flexShrink: 0 }} />
                        <Box style={{ overflow: "hidden" }}>
                          <Text fz={12} fw={500} c="dark.6" truncate>{tourName}</Text>
                          <Text fz={11} c="dimmed">{fmtDate(b.createdAt)}</Text>
                        </Box>
                      </Group>
                      <Group gap={8} wrap="nowrap" style={{ flexShrink: 0 }}>
                        <Text fz={12} fw={600} c="dark.7">${Number(b.totalAmount).toLocaleString()}</Text>
                        <Box style={{
                          display: "flex", alignItems: "center", gap: rem(5),
                          background: sc.bg, borderRadius: rem(20), padding: `${rem(2)} ${rem(8)}`,
                          border: `1px solid ${sc.dot}33`,
                        }}>
                          <Box style={{ width: 6, height: 6, borderRadius: "50%", background: sc.dot }} />
                          <Text fz={10} fw={700} style={{ color: sc.dot }}>{sc.label}</Text>
                        </Box>
                      </Group>
                    </Box>
                  );
                })}
            </Stack>
          </Paper>
        )}

        <Text fz={10} c="dimmed" ta="right" mt={4}>
          First booked {fmtDate(customer.firstBookingAt)}
        </Text>
      </Box>
    </Drawer>
  );
}

// ─── Main Table ───────────────────────────────────────────────────────────────

export default function CustomerTable() {
  const [bookings,   setBookings]   = useState<Booking[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState("");
  const [selected,   setSelected]   = useState<Customer | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const fetchBookings = async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await api.get<Booking[]>("/bookings");
      setBookings(data);
    } catch (err: any) {
      setError(err?.response?.data?.message ?? "Failed to load bookings. Is the backend running?");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchBookings(); }, []);

  const customers = deriveCustomers(bookings);

  const handleRowClick = useCallback((customer: Customer) => {
    setSelected(customer);
    setDrawerOpen(true);
  }, []);

  const totalRevenue = customers.reduce((s, c) => s + c.totalSpent, 0);
  const repeatCount  = customers.filter(c => c.bookingCount > 1).length;
  const countries    = new Set(customers.map(c => c.country).filter(Boolean)).size;

  const columns: ColumnDef<Customer, any>[] = [
    {
      id: "customer", header: "Customer",
      accessorFn: (row) => `${row.firstName} ${row.lastName}`,
      cell: ({ row }) => {
        const c = row.original;
        const initials = `${c.firstName[0] ?? ""}${c.lastName[0] ?? ""}`.toUpperCase();
        return (
          <Group gap={10} wrap="nowrap">
            <Box style={{
              width: rem(30), height: rem(30), borderRadius: "50%",
              background: "linear-gradient(135deg, #d1fae5, #a7f3d0)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: rem(10), fontWeight: 700, color: "#065f46", flexShrink: 0,
            }}>
              {initials}
            </Box>
            <Box style={{ overflow: "hidden" }}>
              <Text fz={13} fw={600} c="dark.7" truncate>{c.firstName} {c.lastName}</Text>
              <Text fz={11} c="dimmed"  truncate>{c.email}</Text>
            </Box>
          </Group>
        );
      },
    },
    {
      id: "country", accessorKey: "country", header: "Country",
      cell: ({ getValue }) => <Text fz={13} c="gray.6">{getValue<string>() || "—"}</Text>,
    },
    {
      id: "bookingCount", accessorKey: "bookingCount", header: "Bookings", size: 100,
      cell: ({ getValue }) => (
        <Text fz={13} fw={500} c="dark.6" ta="center">{getValue<number>()}</Text>
      ),
    },
    {
      id: "totalSpent", accessorKey: "totalSpent", header: "Total Spent", size: 130,
      cell: ({ getValue }) => (
        <Text fz={13} fw={600} c="dark.7">${Number(getValue<number>()).toLocaleString()}</Text>
      ),
    },
    {
      id: "lastBookingAt", accessorKey: "lastBookingAt", header: "Last Booking", size: 130,
      cell: ({ getValue }) => <Text fz={12} c="gray.5">{fmtDate(getValue<string>())}</Text>,
    },
    {
      id: "firstBookingAt", accessorKey: "firstBookingAt", header: "Joined", size: 120,
      cell: ({ getValue }) => <Text fz={12} c="gray.5">{fmtDate(getValue<string>())}</Text>,
    },
  ];

  if (loading)
    return (
      <Center py={60}>
        <Group gap={10}>
          <Loader size="sm" color="#065f46" />
          <Text fz={13} c="dimmed">Loading customers…</Text>
        </Group>
      </Center>
    );

  if (error)
    return (
      <Center py={48}>
        <Group gap={10}>
          <IconAlertCircle size={28} color="#ef4444" />
          <Text fz={13} c="red.6" maw={380}>{error}</Text>
          <Tooltip label="Retry" withArrow>
            <ActionIcon variant="light" color="teal" size="md" radius="md" onClick={fetchBookings}>
              <IconRefresh size={15} />
            </ActionIcon>
          </Tooltip>
        </Group>
      </Center>
    );

  return (
    <>
      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          { label: "Total Customers", value: customers.length,                    color: "text-[#1a1a2e]"  },
          { label: "Repeat Bookers",  value: repeatCount,                         color: "text-teal-600"   },
          { label: "Countries",       value: countries,                           color: "text-emerald-500" },
          { label: "Revenue",         value: `$${totalRevenue.toLocaleString()}`, color: "text-[#059669]"  },
        ].map(s => (
          <div key={s.label} className="bg-white border border-gray-100 rounded-[14px] px-4 py-3 shadow-[0_2px_8px_rgba(30,80,120,0.05)]">
            <div className={`font-playfair text-[1.6rem] font-light leading-none ${s.color}`}>{s.value}</div>
            <div className="text-[0.7rem] text-gray-400 uppercase tracking-[0.10em] font-medium mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Table card */}
      <div className="bg-white border border-gray-100 rounded-[18px] shadow-[0_4px_24px_rgba(30,80,120,0.07)] overflow-hidden">
        <div className="h-1 w-full bg-gradient-to-r from-[#064e3b] via-[#059669] to-[#34d399]" />
        <MantineTable<Customer>
          data={customers}
          columns={columns}
          enableGlobalFilter
          enablePagination
          renderBottomToolbar
          onRowClick={handleRowClick}
        />
      </div>

      <CustomerDrawer
        customer={selected}
        opened={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      />
    </>
  );
}