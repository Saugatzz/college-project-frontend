// src/components/admin/TourTable.tsx
'use client';
import { useState, useEffect } from 'react';
import { ActionIcon, Badge as MBadge, Text, Button } from '@mantine/core';
import { IconEdit, IconTrash, IconPlus } from '@tabler/icons-react';
import type { ColumnDef } from '@tanstack/react-table';
import MantineTable from '../common/MantineTable';
import AddTourModal from './AddTourModal';

const BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

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

// ── API helpers (inline) ─────────────────────────────────────────────────────
async function apiFetchAll(): Promise<Package[]> {
  const res = await fetch(`${BASE}/packages`);
  if (!res.ok) throw new Error('Failed to fetch packages');
  return res.json();
}

export async function apiCreate(data: unknown): Promise<Package> {
  const res = await fetch(`${BASE}/packages`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to create package');
  return res.json();
}

export async function apiUpdate(id: number, data: unknown): Promise<Package> {
  const res = await fetch(`${BASE}/packages/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to update package');
  return res.json();
}

async function apiDelete(id: number): Promise<void> {
  const res = await fetch(`${BASE}/packages/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete package');
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

  // Fetch on mount
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
      cell: ({ getValue }) => (
        <MBadge
          color={getValue<boolean>() ? 'teal' : 'gray'}
          variant="light" size="sm" radius="xl"
        >
          {getValue<boolean>() ? 'Active' : 'Inactive'}
        </MBadge>
      ),
    },
  ];

  return (
    <>
      {/* Header row */}
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
          onClick={() => { setEditTarget(null); setModalOpen(true); }}
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
                onClick={() => { setEditTarget(row as Package); setModalOpen(true); }}
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
        onClose={() => setModalOpen(false)}
        onSaved={handleSaved}
        editData={editTarget}
      />
    </>
  );
}