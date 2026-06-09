'use client';
import { useState, useEffect } from 'react';
import { ActionIcon, Badge as MBadge, Text, Button, Switch } from '@mantine/core';
import { IconEdit, IconTrash, IconPlus } from '@tabler/icons-react';
import type { ColumnDef } from '@tanstack/react-table';
import MantineTable from '../common/MantineTable';
import AddTourModal from './AddTourModal';
import api from '@/lib/api/api';

export interface TourItinerary { id?: number; dayNumber: number; title: string; description: string }
export interface TourHighlight  { id?: number; icon: string; title: string; desc: string }
export interface TourInclusion  { id?: number; text: string; included: boolean }
export interface TourAddon      { id?: number; name: string; desc: string; price: number }
export interface TourImage      { id?: number; src: string; alt: string; sortOrder?: number }

export interface Package {
  id: number; title: string; description: string; basePrice: number;
  durationDays: number; location: string; difficulty: string; category: string;
  rating: number; heroImage: string; badge: string; tagline: string;
  reviewCount: number; isActive: boolean; createdAt: string;
  itineraries: TourItinerary[]; highlights: TourHighlight[];
  inclusions: TourInclusion[]; addons: TourAddon[]; images: TourImage[];
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

  useEffect(() => {
    apiFetchAll().then(setData).finally(() => setLoading(false));
  }, []);

  const filtered = activeCategory === 'All'
    ? data
    : data.filter(p => p.category.toLowerCase() === activeCategory.toLowerCase());

  const activeCount   = data.filter(p => p.isActive).length;
  const inactiveCount = data.filter(p => !p.isActive).length;

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this tour?')) return;
    await apiDelete(id);
    setData(prev => prev.filter(p => p.id !== id));
  };

  const handleToggleActive = async (pkg: Package) => {
    setTogglingId(pkg.id);
    try {
      const updated = await apiToggleActive(pkg.id);
      setData(prev => prev.map(p => p.id === updated.id ? updated : p));
    } finally {
      setTogglingId(null);
    }
  };

  const handleSaved = (pkg: Package) => {
    setData(prev => {
      const idx = prev.findIndex(p => p.id === pkg.id);
      if (idx >= 0) { const next = [...prev]; next[idx] = pkg; return next; }
      return [...prev, pkg];
    });
    setEditTarget(null);
    setModalOpen(false);
  };

  const openEdit = (id: number) => { setEditTarget(data.find(p => p.id === id) ?? null); setModalOpen(true); };
  const openAdd  = () => { setEditTarget(null); setModalOpen(true); };

  const columns: ColumnDef<Package, any>[] = [
    {
      accessorKey: 'title',
      header: 'Tour Name',
      cell: ({ row }) => (
        <div>
          <Text fz={13} fw={500} c="dark.7">{row.original.title}</Text>
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
      cell: ({ getValue }) => <Text fz={13} c="gray.6">{getValue<number>()} days</Text>,
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
      accessorKey: 'basePrice',
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
      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {[
          { label: 'Total',    value: loading ? '…' : data.length,     color: 'text-[#1a1a2e]' },
          { label: 'Active',   value: loading ? '…' : activeCount,     color: 'text-teal-600'  },
          { label: 'Inactive', value: loading ? '…' : inactiveCount,   color: 'text-gray-400'  },
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

        {/* Toolbar */}
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