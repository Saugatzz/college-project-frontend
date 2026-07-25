'use client';
import { useState, useEffect } from 'react';
import { ActionIcon, Badge as MBadge, Text, Button, Switch, Modal, Group, Box, ThemeIcon, rem, Divider } from '@mantine/core';
import { IconEdit, IconTrash, IconPlus, IconAlertTriangle } from '@tabler/icons-react';
import type { ColumnDef } from '@tanstack/react-table';
import MantineTable from '../common/MantineTable';
import AddTourModal from './AddTourModal';
import AppNotification, { useNotification } from '../common/AppNotification';
import api from '@/lib/api/api';

export interface TourItinerary { id?: number; dayNumber: number; title: string; description: string }
export interface TourHighlight  { id?: number; icon: string; title: string; desc: string }
export interface TourInclusion  { id?: number; text: string; included: boolean }
export interface TourAddon      { id?: number; name: string; desc: string; price: number }
export interface TourImage      { id?: number; src: string; alt: string; sortOrder?: number }

export interface Package {
  id: number;
  name: string;
  description: string;
  price: number;
  days: number;
  location: string;
  difficulty: string;
  category: string;
  rating: number;
  image: string;
  badge: string;
  tagline: string;
  reviewCount: number;
  isActive: boolean;
  createdAt: string;
  slug: string;
  itineraries: TourItinerary[];
  highlights: TourHighlight[];
  inclusions: TourInclusion[];
  addons: TourAddon[];
  images: TourImage[];
  tags?: string[];
}

async function apiFetchAll(): Promise<Package[]> {
  const { data } = await api.get<Package[]>('/packages/admin/all');
  return data;
}
export async function apiCreate(payload: unknown): Promise<Package> {
  const { data } = await api.post<Package>('/packages', payload);
  return data;
}
export async function apiUpdate(id: number, payload: unknown): Promise<Package> {
  const { data } = await api.put<Package>(`/packages/${id}`, payload);
  return data;
}
async function apiToggleActive(id: number): Promise<Package> {
  const { data } = await api.patch<Package>(`/packages/${id}/toggle-active`);
  return data;
}
async function apiDelete(id: number): Promise<void> {
  await api.delete(`/packages/${id}`);
}

const diffColor: Record<string, string> = {
  Easy: 'green', Moderate: 'yellow', Challenging: 'red', Hard: 'red',
};
const CATEGORIES = ['All', 'Trekking', 'Culture', 'Adventure'];

export default function TourTable() {
  const [data,           setData]           = useState<Package[]>([]);
  const [loading,        setLoading]        = useState(true);
  const [modalOpen,      setModalOpen]      = useState(false);
  const [editTarget,     setEditTarget]     = useState<Package | null>(null);
  const [togglingId,     setTogglingId]     = useState<number | null>(null);
  const [activeCategory, setActiveCategory] = useState('All');
  const [deleteTarget,   setDeleteTarget]   = useState<Package | null>(null);
  const [deleting,       setDeleting]       = useState(false);

  const { notifications, notify, dismiss } = useNotification();

  useEffect(() => {
    apiFetchAll()
      .then(setData)
      .catch(() => notify('error', 'Failed to load', 'Could not fetch tours. Is the backend running?'))
      .finally(() => setLoading(false));
  }, []);

  const filtered = activeCategory === 'All'
    ? data
    : data.filter(p => p.category.toLowerCase() === activeCategory.toLowerCase());

  const activeCount   = data.filter(p => p.isActive).length;
  const inactiveCount = data.filter(p => !p.isActive).length;

  const handleDelete = (id: number) => {
    setDeleteTarget(data.find(p => p.id === id) ?? null);
  };

  const doDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await apiDelete(deleteTarget.id);
      setData(prev => prev.filter(p => p.id !== deleteTarget.id));
      setDeleteTarget(null);
      notify('success', 'Tour deleted', `"${deleteTarget.name}" has been permanently removed.`);
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? 'Something went wrong. Please try again.';
      notify('error', 'Delete failed', msg);
    } finally {
      setDeleting(false);
    }
  };

  const handleToggleActive = async (pkg: Package) => {
  setTogglingId(pkg.id);
  try {
    const updated = await apiToggleActive(pkg.id);
    setData(prev => prev.map(p => p.id === updated.id ? updated : p));
    notify(
      'success',
      updated.isActive ? 'Tour activated' : 'Tour deactivated',
      `"${updated.name}" is now ${updated.isActive ? 'visible to customers' : 'hidden from listings'}.`,
    );

    // Bust the public site's cached package data (tour detail pages,
    // "You Might Also Like" recommendations, etc.) so the change is
    // reflected immediately instead of within the next revalidate window.
    fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/revalidate`, {
      method: 'POST',
      headers: { 'x-revalidate-secret': process.env.NEXT_PUBLIC_REVALIDATE_SECRET! },
    }).catch(() => {
      // Non-critical — the toggle itself already succeeded. Worst case,
      // the public site just falls back to the normal 60s revalidate window.
    });
  } catch (err: any) {
    const msg = err?.response?.data?.message ?? 'Could not update status.';
    notify('error', 'Status update failed', msg);
  } finally {
    setTogglingId(null);
  }
};

  const handleSaved = (pkg: Package) => {
    const isEdit = data.some(p => p.id === pkg.id);
    setData(prev => {
      const idx = prev.findIndex(p => p.id === pkg.id);
      if (idx >= 0) { const next = [...prev]; next[idx] = pkg; return next; }
      return [...prev, pkg];
    });
    setEditTarget(null);
    setModalOpen(false);
    notify(
      'success',
      isEdit ? 'Tour updated' : 'Tour created',
      isEdit
        ? `"${pkg.name}" has been updated successfully.`
        : `"${pkg.name}" has been added to the listings.`,
    );
  };

  const openEdit = (id: number) => { setEditTarget(data.find(p => p.id === id) ?? null); setModalOpen(true); };
  const openAdd  = () => { setEditTarget(null); setModalOpen(true); };

  const columns: ColumnDef<Package, any>[] = [
    {
      accessorKey: 'title',
      header: 'Tour Name',
      cell: ({ row }) => (
        <div>
          <Text fz={13} fw={500} c="dark.7">{row.original.name}</Text>
          <Text fz={11} c="dimmed">{row.original.location}</Text>
        </div>
      ),
    },
    {
      accessorKey: 'category',
      header: 'Category',
      cell: ({ getValue }) => <Text fz={13} c="gray.6">{getValue<string>() ?? '—'}</Text>,
    },
    {
      accessorKey: 'durationDays',
      header: 'Duration',
      cell: ({ row }) => <Text fz={13} c="gray.6">{row.original.days} days</Text>,
    },
    {
      accessorKey: 'difficulty',
      header: 'Difficulty',
      cell: ({ getValue }) => {
        const val = getValue<string>() ?? 'Moderate';
        return <MBadge color={diffColor[val] ?? 'gray'} variant="light" size="sm" radius="xl">{val}</MBadge>;
      },
    },
    {
      accessorKey: 'price',
      header: 'Price',
      cell: ({ getValue }) => (
        <Text fz={13} fw={500} c="dark.6">${Number(getValue<number>()).toLocaleString()}</Text>
      ),
    },
    {
      accessorKey: 'rating',
      header: 'Rating',
      cell: ({ getValue }) => (
        <div className="flex items-center gap-1">
          <svg className="w-3 h-3 fill-amber-400" viewBox="0 0 24 24">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
          <Text fz={13} c="gray.7">{Number(getValue<number>()).toFixed(1)}</Text>
        </div>
      ),
    },
    {
      accessorKey: 'isActive',
      header: 'Status',
      cell: ({ row }) => {
        const pkg = row.original;
        return (
          <div className="flex items-center gap-2">
            <Switch
              size="sm" checked={pkg.isActive} disabled={togglingId === pkg.id}
              onChange={() => handleToggleActive(pkg)} color="teal"
            />
            <MBadge color={pkg.isActive ? 'teal' : 'gray'} variant="light" size="sm" radius="xl">
              {pkg.isActive ? 'Active' : 'Inactive'}
            </MBadge>
          </div>
        );
      },
    },
  ];

  return (
    <>
      <AppNotification notifications={notifications} onDismiss={dismiss} />

      {/* Delete Confirmation Modal */}
      <Modal
        opened={!!deleteTarget}
        onClose={() => !deleting && setDeleteTarget(null)}
        centered radius="xl" size="sm" padding={0}
        withCloseButton={false}
        overlayProps={{ backgroundOpacity: 0.4, blur: 3 }}
        styles={{ content: { overflow: 'hidden', border: '1px solid rgba(220,38,38,0.15)' } }}
      >
        <Box style={{ background: 'linear-gradient(135deg, #7f1d1d 0%, #b91c1c 50%, #dc2626 100%)', padding: `${rem(24)} ${rem(28)} ${rem(20)}` }}>
          <Group gap={12}>
            <ThemeIcon size={44} radius="xl" style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.2)', flexShrink: 0 }}>
              <IconAlertTriangle size={21} color="white" />
            </ThemeIcon>
            <div>
              <Text ff="serif" fz={20} fw={400} c="white" lh={1.15}>Delete Tour</Text>
              <Text fz={12} c="rgba(255,255,255,0.65)" fw={300} mt={2}>This action cannot be undone.</Text>
            </div>
          </Group>
        </Box>

        <Box p={`${rem(22)} ${rem(28)} ${rem(26)}`}>
          <Box p="md" mb="lg" style={{ background: 'linear-gradient(135deg, #fff5f5, #fee2e2)', borderRadius: rem(12), border: '1px solid rgba(220,38,38,0.12)' }}>
            <Text fz={13} c="dark.7" fw={500} mb={4} style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {deleteTarget?.name}
            </Text>
            <Group gap={16}>
              <Text fz={12} c="dimmed" fw={300}>{deleteTarget?.location}</Text>
              {deleteTarget?.location && deleteTarget?.days ? <Text fz={12} c="dimmed">·</Text> : null}
              <Text fz={12} c="dimmed" fw={300}>{deleteTarget?.days} days</Text>
            </Group>
          </Box>

          <Text fz={13} c="gray.6" fw={300} lh={1.6} mb="xl">
            Deleting this tour will permanently remove all its itineraries, highlights, images, and bookings associated with it.
          </Text>

          <Group gap="sm">
            <Button flex={1} size="sm" radius="xl" variant="light" color="gray"
              onClick={() => setDeleteTarget(null)} disabled={deleting}
              styles={{ root: { border: '1px solid #e5e7eb', color: '#6b7280', height: rem(40), fontSize: rem(13) } }}
            >
              Cancel
            </Button>
            <Button flex={2} size="sm" radius="xl" color="red" loading={deleting}
              leftSection={!deleting ? <IconTrash size={14} /> : undefined}
              onClick={doDelete}
              style={{ background: 'linear-gradient(135deg, #dc2626, #7f1d1d)', boxShadow: '0 6px 20px rgba(220,38,38,0.3)', height: rem(40), fontSize: rem(13), fontWeight: 500 }}
            >
              {deleting ? 'Deleting…' : 'Yes, Delete Tour'}
            </Button>
          </Group>
        </Box>
      </Modal>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {[
          { label: 'Total',    value: loading ? '…' : data.length,   color: 'text-[#1a1a2e]' },
          { label: 'Active',   value: loading ? '…' : activeCount,   color: 'text-teal-600'  },
          { label: 'Inactive', value: loading ? '…' : inactiveCount, color: 'text-gray-400'  },
        ].map(s => (
          <div key={s.label} className="bg-white border border-gray-100 rounded-[14px] px-4 py-3 shadow-[0_2px_8px_rgba(30,80,120,0.05)]">
            <div className={`font-playfair text-[1.6rem] font-light leading-none ${s.color}`}>{s.value}</div>
            <div className="text-[0.7rem] text-gray-400 uppercase tracking-[0.10em] font-medium mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Table card */}
      <div className="bg-white border border-gray-100 rounded-[18px] shadow-[0_4px_24px_rgba(30,80,120,0.07)] overflow-hidden">
        <div className="h-1 w-full bg-gradient-to-r from-[#C9963B] via-[#2E86C1] to-[#1A5276]" />

        <div className="flex items-center justify-between px-4 pt-4 pb-2">
          <div className="flex items-center gap-2">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-1.5 rounded-full text-[0.78rem] font-medium border transition-all ${
                  activeCategory === cat
                    ? 'bg-[#1A5276] text-white border-[#1A5276]'
                    : 'bg-white text-gray-500 border-gray-200 hover:border-gray-400'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
          <Button
            leftSection={<IconPlus size={15} />}
            size="sm" radius="xl" onClick={openAdd}
            styles={{ root: { background: 'linear-gradient(135deg, #2E86C1, #1A5276)', border: 'none', fontSize: 13 } }}
          >
            Add Tour
          </Button>
        </div>

        <MantineTable
          data={filtered}
          columns={columns}
          enablePagination
          renderBottomToolbar
          renderRowActions={(row) => (
            <div className="flex items-center gap-1">
              <ActionIcon size="sm" variant="subtle" color="blue" onClick={() => openEdit((row as Package).id)}>
                <IconEdit size={14} />
              </ActionIcon>
              <ActionIcon size="sm" variant="subtle" color="red" onClick={() => handleDelete((row as Package).id)}>
                <IconTrash size={14} />
              </ActionIcon>
            </div>
          )}
        />
      </div>

      <AddTourModal
        opened={modalOpen}
        onClose={() => { setModalOpen(false); setEditTarget(null); }}
        onSaved={handleSaved}
        editData={editTarget}
      />
    </>
  );
}