// src/components/admin/TourTable.tsx
'use client';
import { useState, useEffect } from 'react';
import { ActionIcon, Badge as MBadge, Text, Button, Switch } from '@mantine/core';
import { IconEdit, IconTrash, IconPlus } from '@tabler/icons-react';
import type { ColumnDef } from '@tanstack/react-table';
import MantineTable from '../common/MantineTable';
import AddTourModal from './AddTourModal';
import api from '@/lib/api/api';

// ── Types ────────────────────────────────────────────────────────────────────
export interface TourItinerary { id?: number; dayNumber: number; title: string; description: string }
export interface TourHighlight  { id?: number; icon: string; title: string; desc: string }
export interface TourInclusion  { id?: number; text: string; included: boolean }
export interface TourAddon      { id?: number; name: string; desc: string; price: number }
export interface TourImage      { id?: number; src: string; alt: string; sortOrder?: number }

export interface Package {
  id: number;
  title: string;
  description: string;
  basePrice: number;
  durationDays: number;
  location: string;
  difficulty: string;
  category: string;
  rating: number;
  heroImage: string;
  badge: string;
  tagline: string;
  reviewCount: number;
  isActive: boolean;
  createdAt: string;
  itineraries: TourItinerary[];
  highlights:  TourHighlight[];
  inclusions:  TourInclusion[];
  addons:      TourAddon[];
  images:      TourImage[];
}

// ── API helpers ──────────────────────────────────────────────────────────────
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

// ── Helpers ──────────────────────────────────────────────────────────────────
const diffColor: Record<string, string> = {
  Easy: 'green', Moderate: 'yellow', Challenging: 'red', Hard: 'red',
};

// ── Component ────────────────────────────────────────────────────────────────
export default function TourTable() {
  const [data,       setData]       = useState<Package[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [modalOpen,  setModalOpen]  = useState(false);
  const [editTarget, setEditTarget] = useState<Package | null>(null);
  const [togglingId, setTogglingId] = useState<number | null>(null);

  useEffect(() => {
    apiFetchAll()
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

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
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = pkg;
        return next;
      }
      return [...prev, pkg];
    });
    setEditTarget(null);
    setModalOpen(false);
  };

  const openEdit = (id: number) => {
    const fresh = data.find(p => p.id === id) ?? null;
    setEditTarget(fresh);
    setModalOpen(true);
  };

  const openAdd = () => {
    setEditTarget(null);
    setModalOpen(true);
  };

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
      cell: ({ getValue }) => (
        <Text fz={13} c="gray.6">{getValue<string>() ?? '—'}</Text>
      ),
    },
    {
      accessorKey: 'durationDays',
      header: 'Duration',
      cell: ({ getValue }) => (
        <Text fz={13} c="gray.6">{getValue<number>()} days</Text>
      ),
    },
    {
      accessorKey: 'difficulty',
      header: 'Difficulty',
      cell: ({ getValue }) => {
        const val = getValue<string>() ?? 'Moderate';
        return (
          <MBadge color={diffColor[val] ?? 'gray'} variant="light" size="sm" radius="xl">
            {val}
          </MBadge>
        );
      },
    },
    {
      accessorKey: 'basePrice',
      header: 'Price',
      cell: ({ getValue }) => (
        <Text fz={13} fw={500} c="dark.6">
          ${Number(getValue<number>()).toLocaleString()}
        </Text>
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
        const isToggling = togglingId === pkg.id;
        return (
          <div className="flex items-center gap-2">
            <Switch
              size="sm"
              checked={pkg.isActive}
              disabled={isToggling}
              onChange={() => handleToggleActive(pkg)}
              color="teal"
            />
            <MBadge
              color={pkg.isActive ? 'teal' : 'gray'}
              variant="light"
              size="sm"
              radius="xl"
            >
              {pkg.isActive ? 'Active' : 'Inactive'}
            </MBadge>
          </div>
        );
      },
    },
  ];

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-base font-semibold text-gray-800">All Tours</h2>
          <p className="text-xs text-gray-400 mt-0.5">
            {loading ? 'Loading…' : `${data.length} tours total`}
          </p>
        </div>
        <Button
          leftSection={<IconPlus size={15} />}
          size="sm"
          radius="xl"
          onClick={openAdd}
          styles={{
            root: {
              background: 'linear-gradient(135deg, #2E86C1, #1A5276)',
              border: 'none',
              fontSize: 13,
            },
          }}
        >
          Add Tour
        </Button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <MantineTable
          data={data}
          columns={columns}
          enablePagination
          renderBottomToolbar
          renderRowActions={(row) => (
            <div className="flex items-center gap-1">
              <ActionIcon
                size="sm" variant="subtle" color="blue"
                onClick={() => openEdit((row as Package).id)}
              >
                <IconEdit size={14} />
              </ActionIcon>
              <ActionIcon
                size="sm" variant="subtle" color="red"
                onClick={() => handleDelete((row as Package).id)}
              >
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