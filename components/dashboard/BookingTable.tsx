"use client";
import { useEffect, useState, useCallback } from "react";
import {
  Group, Text, Box, Loader, Center, ActionIcon, Tooltip, rem,
  Drawer, Stack, Divider, Select, Button, ThemeIcon, Paper, Notification,
} from "@mantine/core";
import {
  IconRefresh, IconAlertCircle, IconX, IconUser, IconMail, IconPhone,
  IconWorld, IconUsers, IconCreditCard, IconCalendar, IconMountain,
  IconCheck, IconClock, IconNotes, IconPackage, IconFileTypePdf,
} from "@tabler/icons-react";
import { ColumnDef } from "@tanstack/react-table";
import api from "@/lib/api/api";
import MantineTable from "@/components/common/MantineTable";
import AppNotification, { useNotification } from "@/components/common/AppNotification";

type BookingStatus = "pending" | "confirmed" | "cancelled";
type PaymentMethod = "Khalti" | "eSewa" | "Card";

interface BookingAddon { id: number; name: string; price: number }

interface Booking {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  country: string;
  travelers: number;
  departureDate?: string;
  notes?: string;
  paymentMethod: PaymentMethod;
  tourPrice: number;
  addonsTotal: number;
  totalAmount: number;
  status: BookingStatus;
  selectedAddons: BookingAddon[];
  receiptPath?: string;
  tour?: {
    id?: number;
    title?: string;
    name?: string;
    duration?: string;
    durationDays?: number;
    heroImage?: string;
    difficulty?: string;
  };
  createdAt: string;
  updatedAt: string;
}

const STATUS_CONFIG: Record<BookingStatus, { color: string; label: string; bg: string; dot: string }> = {
  confirmed: { color: "teal",   label: "Confirmed", bg: "#f0fdf4", dot: "#10b981" },
  pending:   { color: "orange", label: "Pending",   bg: "#fffbeb", dot: "#f59e0b" },
  cancelled: { color: "red",    label: "Cancelled", bg: "#fef2f2", dot: "#ef4444" },
};

const PAY_ICON: Record<PaymentMethod, string> = {
  Khalti: "💜", eSewa: "💚", Card: "💳",
};

function DetailField({ icon, label, value }: { icon: React.ReactNode; label: string; value: React.ReactNode }) {
  return (
    <Group gap={12} align="flex-start" wrap="nowrap">
      <ThemeIcon size={32} radius="md" variant="light" color="blue" style={{ flexShrink: 0, marginTop: 2 }}>
        {icon}
      </ThemeIcon>
      <Box>
        <Box component="span" style={{ display: "block", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 2, color: "var(--mantine-color-gray-6)", fontSize: rem(10), fontWeight: 700 }}>
          {label}
        </Box>
        <Box component="span" style={{ display: "block", fontSize: rem(13), fontWeight: 500, color: "var(--mantine-color-dark-7)" }}>
          {value || "—"}
        </Box>
      </Box>
    </Group>
  );
}

function BookingDrawer({ booking, opened, onClose, onStatusChange, onNotify }: {
  booking: Booking | null;
  opened: boolean;
  onClose: () => void;
  onStatusChange: (id: number, status: BookingStatus) => void;
  onNotify: (type: 'success' | 'error', title: string, message: string) => void;
}) {
  const [localStatus, setLocalStatus] = useState<BookingStatus>("pending");
  const [saving,      setSaving]      = useState(false);
  const [saved,       setSaved]       = useState(false);

  useEffect(() => { if (booking) setLocalStatus(booking.status); }, [booking]);
  if (!booking) return null;

  const sc          = STATUS_CONFIG[localStatus] ?? STATUS_CONFIG.pending;
  const tourName    = booking.tour?.title ?? booking.tour?.name ?? "—";
  const tourDuration = booking.tour?.durationDays
    ? `${booking.tour.durationDays} Days`
    : (booking.tour?.duration ?? "—");

  const handleSaveStatus = async () => {
    setSaving(true);
    try {
      await api.patch(`/bookings/${booking.id}/status`, { status: localStatus });
      onStatusChange(booking.id, localStatus);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
      onNotify(
        'success',
        'Status updated',
        `Booking #${String(booking.id).padStart(4, '0')} is now ${localStatus}.`,
      );
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? 'Could not update status. Try again.';
      onNotify('error', 'Update failed', msg);
      setLocalStatus(booking.status);
    } finally {
      setSaving(false);
    }
  };

  const initials   = `${booking.firstName[0] ?? ""}${booking.lastName[0] ?? ""}`.toUpperCase();
  const receiptUrl = booking.receiptPath
    ? `${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000"}/${booking.receiptPath}`
    : null;

  return (
    <Drawer
      opened={opened} onClose={onClose} position="right" size={480}
      padding={0} withCloseButton={false}
      styles={{
        body: { padding: 0, height: "100%", display: "flex", flexDirection: "column" },
        content: { borderLeft: "1px solid #e8f0f8" },
      }}
    >
      <Box style={{ background: "linear-gradient(135deg, #0f4c81 0%, #1a6ea8 50%, #2e86c1 100%)", padding: `${rem(24)} ${rem(28)}`, position: "relative", flexShrink: 0 }}>
        <div style={{ position: "absolute", top: -20, right: -20, width: 120, height: 120, borderRadius: "50%", background: "rgba(255,255,255,0.05)" }} />
        <div style={{ position: "absolute", bottom: -30, left: 40, width: 80, height: 80, borderRadius: "50%", background: "rgba(255,255,255,0.04)" }} />
        <Group justify="space-between" align="flex-start" mb={16}>
          <Group gap={14}>
            <Box style={{ width: rem(48), height: rem(48), borderRadius: "50%", background: "rgba(255,255,255,0.15)", border: "2px solid rgba(255,255,255,0.3)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: rem(16), fontWeight: 800, color: "white" }}>
              {initials}
            </Box>
            <Box>
              <Text fz={17} fw={600} c="white" lh={1.2}>{booking.firstName} {booking.lastName}</Text>
              <Text fz={12} c="rgba(255,255,255,0.65)" mt={2}>{booking.email}</Text>
            </Box>
          </Group>
          <ActionIcon variant="subtle" onClick={onClose} style={{ color: "rgba(255,255,255,0.7)", marginTop: 2 }} size="md">
            <IconX size={18} />
          </ActionIcon>
        </Group>
        <Group gap={10} align="center">
          <Box style={{ display: "flex", alignItems: "center", gap: rem(6), background: sc.bg, borderRadius: rem(20), padding: `${rem(4)} ${rem(12)}` }}>
            <Box style={{ width: 7, height: 7, borderRadius: "50%", background: sc.dot, flexShrink: 0 }} />
            <Text fz={12} fw={700} style={{ color: sc.dot }}>{sc.label}</Text>
          </Box>
          <Text fz={11} c="rgba(255,255,255,0.5)">Booking #{String(booking.id).padStart(4, "0")}</Text>
        </Group>
      </Box>

      <Box style={{ flex: 1, overflowY: "auto", padding: `${rem(24)} ${rem(28)}` }}>
        {booking.tour?.heroImage && (
          <Box style={{ height: rem(110), borderRadius: rem(14), overflow: "hidden", position: "relative", marginBottom: rem(20) }}>
            <img src={booking.tour.heroImage} alt={tourName} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(15,76,129,0.7) 0%, transparent 55%)" }} />
            <Text fz={14} fw={600} c="white" style={{ position: "absolute", bottom: rem(10), left: rem(12) }}>{tourName}</Text>
          </Box>
        )}

        <Paper radius="lg" p="md" mb="lg" style={{ background: "linear-gradient(135deg, #f0f8ff, #e8f4fc)", border: "1px solid rgba(46,134,193,0.12)" }}>
          <Text fz={10} fw={700} c="blue.6" mb={10} style={{ letterSpacing: "0.12em", textTransform: "uppercase" }}>Tour Details</Text>
          <Stack gap={10}>
            <DetailField icon={<IconMountain size={15} />} label="Tour"     value={tourName} />
            <DetailField icon={<IconCalendar size={15} />} label="Duration" value={tourDuration} />
            {booking.departureDate && (
              <DetailField icon={<IconClock size={15} />} label="Departure"
                value={new Date(booking.departureDate).toLocaleDateString("en-US", { weekday: "short", year: "numeric", month: "long", day: "numeric" })}
              />
            )}
            <DetailField icon={<IconUsers size={15} />} label="Travelers"
              value={`${booking.travelers} ${booking.travelers === 1 ? "person" : "people"}`}
            />
          </Stack>
        </Paper>

        <Paper radius="lg" p="md" mb="lg" style={{ background: "#fafbfc", border: "1px solid #eef2f7" }}>
          <Text fz={10} fw={700} c="gray.6" mb={10} style={{ letterSpacing: "0.12em", textTransform: "uppercase" }}>Traveler Info</Text>
          <Stack gap={10}>
            <DetailField icon={<IconUser size={15} />}  label="Full Name" value={`${booking.firstName} ${booking.lastName}`} />
            <DetailField icon={<IconMail size={15} />}  label="Email"     value={booking.email} />
            <DetailField icon={<IconPhone size={15} />} label="Phone"     value={booking.phone} />
            <DetailField icon={<IconWorld size={15} />} label="Country"   value={booking.country} />
          </Stack>
        </Paper>

        <Paper radius="lg" p="md" mb="lg" style={{ background: "#fafbfc", border: "1px solid #eef2f7" }}>
          <Text fz={10} fw={700} c="gray.6" mb={10} style={{ letterSpacing: "0.12em", textTransform: "uppercase" }}>Payment</Text>
          <Stack gap={8}>
            <DetailField icon={<IconCreditCard size={15} />} label="Method"
              value={<Group gap={6}><span>{PAY_ICON[booking.paymentMethod] ?? "💳"}</span><span>{booking.paymentMethod}</span></Group>}
            />
            <Divider color="#eef2f7" />
            <Group justify="space-between">
              <Text fz={12} c="dimmed">Tour price</Text>
              <Text fz={12} fw={500} c="dark.6">${Number(booking.tourPrice).toLocaleString()}</Text>
            </Group>
            {Number(booking.addonsTotal) > 0 && (
              <Group justify="space-between">
                <Text fz={12} c="dimmed">Add-ons</Text>
                <Text fz={12} fw={500} c="blue.6">+${Number(booking.addonsTotal).toLocaleString()}</Text>
              </Group>
            )}
            <Group justify="space-between" pt={4} style={{ borderTop: "1.5px solid #e8f0f8" }}>
              <Text fz={13} fw={600} c="dark.7">Total</Text>
              <Text fz={18} fw={700} style={{ background: "linear-gradient(135deg, #2e86c1, #0f4c81)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                ${Number(booking.totalAmount).toLocaleString()}
              </Text>
            </Group>
            {receiptUrl && (
              <>
                <Divider color="#eef2f7" />
                <Group justify="space-between" align="center">
                  <Text fz={12} c="dimmed">Receipt</Text>
                  <a href={receiptUrl} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}
                    style={{ display: "flex", alignItems: "center", gap: rem(5), fontSize: rem(12), fontWeight: 600, color: "#2e86c1", textDecoration: "none", background: "#f0f8ff", borderRadius: rem(8), padding: `${rem(4)} ${rem(10)}`, border: "1px solid rgba(46,134,193,0.2)" }}
                  >
                    <IconFileTypePdf size={14} /> View PDF
                  </a>
                </Group>
              </>
            )}
            {!receiptUrl && (booking.paymentMethod === "Khalti" || booking.paymentMethod === "eSewa") && (
              <>
                <Divider color="#eef2f7" />
                <Group gap={6}>
                  <IconAlertCircle size={13} color="#f59e0b" />
                  <Text fz={11} c="yellow.7" fw={500}>Receipt not uploaded yet</Text>
                </Group>
              </>
            )}
          </Stack>
        </Paper>

        {booking.selectedAddons?.length > 0 && (
          <Paper radius="lg" p="md" mb="lg" style={{ background: "#fafbfc", border: "1px solid #eef2f7" }}>
            <Text fz={10} fw={700} c="gray.6" mb={10} style={{ letterSpacing: "0.12em", textTransform: "uppercase" }}>Add-ons Selected</Text>
            <Stack gap={8}>
              {booking.selectedAddons.map((addon, idx) => (
                <Group key={addon.id ?? idx} justify="space-between" wrap="nowrap">
                  <Group gap={8}><IconPackage size={13} color="#94a3b8" /><Text fz={12} c="dark.6">{addon.name}</Text></Group>
                  <Text fz={12} fw={600} c="blue.6">${Number(addon.price).toLocaleString()}</Text>
                </Group>
              ))}
            </Stack>
          </Paper>
        )}

        {booking.notes && (
          <Paper radius="lg" p="md" mb="lg" style={{ background: "#fffbeb", border: "1px solid rgba(245,158,11,0.2)" }}>
            <Group gap={8} mb={8}>
              <IconNotes size={14} color="#f59e0b" />
              <Text fz={10} fw={700} c="yellow.7" style={{ letterSpacing: "0.12em", textTransform: "uppercase" }}>Special Requests</Text>
            </Group>
            <Text fz={13} c="dark.6" lh={1.6}>{booking.notes}</Text>
          </Paper>
        )}

        <Text fz={10} c="dimmed" ta="right" mt={4}>
          Created {new Date(booking.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
          {" · "}Updated {new Date(booking.updatedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
        </Text>
      </Box>

      <Box style={{ padding: `${rem(16)} ${rem(28)}`, borderTop: "1px solid #eef2f7", background: "white", flexShrink: 0 }}>
        {saved && (
          <Notification icon={<IconCheck size={14} />} color="teal" title="Status updated" mb={10} withCloseButton={false} style={{ padding: `${rem(8)} ${rem(12)}` }}>
            <Text fz={12}>Booking status saved successfully.</Text>
          </Notification>
        )}
        <Text fz={11} fw={700} c="gray.6" mb={8} style={{ letterSpacing: "0.1em", textTransform: "uppercase" }}>Update Status</Text>
        <Group gap={10}>
          <Select
            value={localStatus}
            onChange={(v) => v && setLocalStatus(v as BookingStatus)}
            data={[
              { value: "pending",   label: "🟡 Pending"   },
              { value: "confirmed", label: "🟢 Confirmed" },
              { value: "cancelled", label: "🔴 Cancelled" },
            ]}
            style={{ flex: 1 }}
            styles={{ input: { borderRadius: rem(10), border: "1.5px solid #dbeafe", fontSize: rem(13), fontWeight: 500 } }}
          />
          <Button
            onClick={handleSaveStatus} loading={saving}
            disabled={localStatus === booking.status}
            radius="xl"
            style={{
              background: localStatus !== booking.status ? "linear-gradient(135deg, #2e86c1, #0f4c81)" : undefined,
              height: rem(36), fontSize: rem(13), fontWeight: 500,
            }}
          >
            Save
          </Button>
        </Group>
      </Box>
    </Drawer>
  );
}

export default function BookingTable() {
  const [bookings,   setBookings]   = useState<Booking[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState("");
  const [selected,   setSelected]   = useState<Booking | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const { notifications, notify, dismiss } = useNotification();

  const fetchBookings = async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await api.get<Booking[]>("/bookings");
      setBookings(data);
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? "Failed to load bookings. Is the backend running?";
      setError(msg);
      notify('error', 'Failed to load bookings', msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchBookings(); }, []);

  const handleRowClick = useCallback((booking: Booking) => {
    setSelected(booking);
    setDrawerOpen(true);
  }, []);

  const handleStatusChange = useCallback((id: number, status: BookingStatus) => {
    setBookings(prev => prev.map(b => b.id === id ? { ...b, status } : b));
    setSelected(prev => prev?.id === id ? { ...prev, status } : prev);
  }, []);

  const handleInlineStatusChange = async (b: Booking, newStatus: BookingStatus) => {
    try {
      await api.patch(`/bookings/${b.id}/status`, { status: newStatus });
      handleStatusChange(b.id, newStatus);
      notify(
        'success',
        'Status updated',
        `Booking #${String(b.id).padStart(4, '0')} is now ${newStatus}.`,
      );
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? 'Could not update status.';
      notify('error', 'Update failed', msg);
    }
  };

  const pendingCount   = bookings.filter(b => b.status === "pending").length;
  const confirmedCount = bookings.filter(b => b.status === "confirmed").length;
  const totalRevenue   = bookings.reduce((s, b) => s + Number(b.totalAmount), 0);

  const columns: ColumnDef<Booking, any>[] = [
    {
      id: "id", accessorKey: "id", header: "#", size: 72,
      cell: ({ row }) => (
        <Text fz={12} c="gray.4" ff="monospace">#{String(row.original.id).padStart(4, "0")}</Text>
      ),
    },
    {
      id: "customer", header: "Customer", size: 200,
      accessorFn: (row) => `${row.firstName} ${row.lastName}`,
      cell: ({ row }) => {
        const b = row.original;
        const initials = `${b.firstName[0] ?? ""}${b.lastName[0] ?? ""}`.toUpperCase();
        return (
          <Group gap={10} wrap="nowrap">
            <Box style={{ width: rem(30), height: rem(30), borderRadius: "50%", background: "linear-gradient(135deg, #dbeafe, #bfdbfe)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: rem(10), fontWeight: 700, color: "#1e40af", flexShrink: 0 }}>
              {initials}
            </Box>
            <Box style={{ overflow: "hidden" }}>
              <Text fz={13} fw={600} c="dark.7" truncate>{b.firstName} {b.lastName}</Text>
              <Text fz={11} c="dimmed" truncate>{b.email}</Text>
            </Box>
          </Group>
        );
      },
    },
    {
      id: "tour", header: "Tour",
      accessorFn: (row) => row.tour?.title ?? row.tour?.name ?? "",
      cell: ({ row }) => {
        const b        = row.original;
        const name     = b.tour?.title ?? b.tour?.name;
        const duration = b.tour?.durationDays ? `${b.tour.durationDays} Days` : b.tour?.duration;
        return (
          <>
            <Text fz={13} c="dark.6" truncate>{name ?? "—"}</Text>
            {duration && <Text fz={11} c="dimmed">{duration}</Text>}
          </>
        );
      },
    },
    {
      id: "createdAt", accessorKey: "createdAt", header: "Booked On", size: 120,
      cell: ({ row }) => (
        <Text fz={12} c="gray.5">
          {new Date(row.original.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
        </Text>
      ),
    },
    {
      id: "travelers", accessorKey: "travelers", header: "People", size: 80,
      cell: ({ row }) => <Text fz={13} c="dark.6" ta="center">{row.original.travelers}</Text>,
    },
    {
      id: "totalAmount", accessorKey: "totalAmount", header: "Amount", size: 110,
      cell: ({ row }) => {
        const b = row.original;
        return (
          <>
            <Text fz={13} fw={600} c="dark.7">${Number(b.totalAmount).toLocaleString()}</Text>
            {Number(b.addonsTotal) > 0 && <Text fz={11} c="blue.5">+${Number(b.addonsTotal).toLocaleString()} add-ons</Text>}
          </>
        );
      },
    },
    {
      id: "paymentMethod", accessorKey: "paymentMethod", header: "Payment", size: 110, enableSorting: false,
      cell: ({ row }) => {
        const method = row.original.paymentMethod;
        return (
          <Group gap={5} wrap="nowrap">
            <span style={{ fontSize: rem(14) }}>{PAY_ICON[method] ?? "💳"}</span>
            <Text fz={12} c="gray.6">{method}</Text>
          </Group>
        );
      },
    },
    {
      id: "receipt", header: "Receipt", size: 90, enableSorting: false,
      cell: ({ row }) => {
        const b = row.original;
        if (b.paymentMethod === "Card") return <Text fz={11} c="dimmed">—</Text>;
        if (!b.receiptPath) return (
          <Box style={{ display: "flex", alignItems: "center", gap: rem(4) }}>
            <IconAlertCircle size={12} color="#f59e0b" />
            <Text fz={11} c="yellow.6" fw={500}>Pending</Text>
          </Box>
        );
        const url = `${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000"}/${b.receiptPath}`;
        return (
          <a href={url} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}
            style={{ display: "flex", alignItems: "center", gap: rem(4), fontSize: rem(11), fontWeight: 600, color: "#2e86c1", textDecoration: "none" }}
          >
            <IconFileTypePdf size={13} /> View
          </a>
        );
      },
    },
    {
      id: "status", accessorKey: "status", header: "Status", size: 130,
      cell: ({ row }) => {
        const b  = row.original;
        const sc = STATUS_CONFIG[b.status] ?? STATUS_CONFIG.pending;
        return (
          <Box onClick={(e) => e.stopPropagation()}>
            <select
              value={b.status}
              onChange={(e) => handleInlineStatusChange(b, e.target.value as BookingStatus)}
              style={{
                border: `1.5px solid ${sc.dot}33`, borderRadius: rem(20),
                padding: `${rem(3)} ${rem(10)}`, fontSize: rem(11), fontWeight: 700,
                color: sc.dot, background: sc.bg, cursor: "pointer", outline: "none",
                appearance: "none", WebkitAppearance: "none", paddingRight: rem(22),
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6'%3E%3Cpath d='M0 0l5 6 5-6z' fill='%23${sc.dot.slice(1)}'/%3E%3C/svg%3E")`,
                backgroundRepeat: "no-repeat", backgroundPosition: `right ${rem(7)} center`,
              }}
            >
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </Box>
        );
      },
    },
  ];

  if (loading)
    return (
      <Center py={60}>
        <Group gap={10}>
          <Loader size="sm" color="#1A5276" />
          <Text fz={13} c="dimmed">Loading bookings…</Text>
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
            <ActionIcon variant="light" color="blue" size="md" radius="md" onClick={fetchBookings}>
              <IconRefresh size={15} />
            </ActionIcon>
          </Tooltip>
        </Group>
      </Center>
    );

  return (
    <>
      <AppNotification notifications={notifications} onDismiss={dismiss} />

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          { label: "Total Bookings", value: bookings.length,                     color: "text-[#1a1a2e]" },
          { label: "Confirmed",      value: confirmedCount,                      color: "text-teal-600"  },
          { label: "Pending",        value: pendingCount,                        color: "text-amber-500" },
          { label: "Revenue",        value: `$${totalRevenue.toLocaleString()}`, color: "text-[#2E86C1]" },
        ].map(s => (
          <div key={s.label} className="bg-white border border-gray-100 rounded-[14px] px-4 py-3 shadow-[0_2px_8px_rgba(30,80,120,0.05)]">
            <div className={`font-playfair text-[1.6rem] font-light leading-none ${s.color}`}>{s.value}</div>
            <div className="text-[0.7rem] text-gray-400 uppercase tracking-[0.10em] font-medium mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="bg-white border border-gray-100 rounded-[18px] shadow-[0_4px_24px_rgba(30,80,120,0.07)] overflow-hidden">
        <div className="h-1 w-full bg-gradient-to-r from-[#0f4c81] via-[#2E86C1] to-[#1a6ea8]" />
        <MantineTable<Booking>
          data={bookings}
          columns={columns}
          enableGlobalFilter
          enablePagination
          renderBottomToolbar
          onRowClick={handleRowClick}
        />
      </div>

      <BookingDrawer
        booking={selected}
        opened={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onStatusChange={handleStatusChange}
        onNotify={notify}
      />
    </>
  );
}