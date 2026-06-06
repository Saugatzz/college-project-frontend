'use client';
import React, { useEffect, useState, useCallback } from 'react';
import { Text, Badge, ActionIcon, Tooltip, Group, rem } from '@mantine/core';
import { IconMailOpened, IconTrash, IconRefresh, IconMail } from '@tabler/icons-react';
import { ColumnDef } from '@tanstack/react-table';
import MantineTable from '@/components/common/MantineTable';
import api from '@/lib/api/api';

interface ContactMessage {
  id: number;
  name: string;
  email: string;
  subject: string;
  message: string;
  read: boolean;
  createdAt: string;
}

function buildColumns(
  onMarkRead: (id: number) => void,
  onDelete: (id: number) => void,
): ColumnDef<ContactMessage, any>[] {
  return [
    {
      accessorKey: 'read',
      header: '',
      size: 36,
      cell: ({ row }) => (
        <div className="flex items-center justify-center">
          {row.original.read ? (
            <IconMailOpened size={15} color="#94a3b8" />
          ) : (
            <div className="w-2 h-2 rounded-full bg-sky-accent" title="Unread" />
          )}
        </div>
      ),
    },
    {
      accessorKey: 'name',
      header: 'Name',
      size: 140,
      cell: ({ getValue, row }) => (
        <Text fz={13} fw={row.original.read ? 400 : 600} c={row.original.read ? 'dimmed' : 'dark.7'}>
          {getValue<string>()}
        </Text>
      ),
    },
    {
      accessorKey: 'email',
      header: 'Email',
      size: 190,
      cell: ({ getValue }) => (
        <Text fz={12} c="dimmed" style={{ fontFamily: 'monospace' }}>{getValue<string>()}</Text>
      ),
    },
    {
      accessorKey: 'subject',
      header: 'Subject',
      size: 170,
      cell: ({ getValue }) => {
        const val = getValue<string>();
        return val ? (
          <Badge variant="light" color="blue" size="sm" radius="sm">{val}</Badge>
        ) : (
          <Text fz={12} c="dimmed">—</Text>
        );
      },
    },
    {
      accessorKey: 'message',
      header: 'Preview',
      size: 220,
      cell: ({ getValue }) => (
        <Text fz={12} c="dimmed" lineClamp={1} style={{ maxWidth: rem(200) }}>
          {getValue<string>()}
        </Text>
      ),
    },
    {
      accessorKey: 'createdAt',
      header: 'Received',
      size: 130,
      cell: ({ getValue }) => (
        <Text fz={12} c="dimmed">
          {new Date(getValue<string>()).toLocaleDateString('en-US', {
            month: 'short', day: 'numeric', year: 'numeric',
          })}
        </Text>
      ),
    },
  ];
}

function MessageDetail({ row }: { row: { original: ContactMessage } }) {
  return (
    <div className="bg-white border border-sky-mid/15 rounded-xl p-5 my-1 shadow-[0_2px_12px_rgba(30,80,120,0.06)]">
      <div className="grid sm:grid-cols-3 gap-4 mb-4 text-[0.78rem]">
        <div>
          <p className="text-pebble uppercase tracking-[0.08em] font-semibold mb-0.5">From</p>
          <p className="text-ink font-medium">{row.original.name}</p>
          <p className="text-stone">{row.original.email}</p>
        </div>
        <div>
          <p className="text-pebble uppercase tracking-[0.08em] font-semibold mb-0.5">Subject</p>
          <p className="text-ink">{row.original.subject || '—'}</p>
        </div>
        <div>
          <p className="text-pebble uppercase tracking-[0.08em] font-semibold mb-0.5">Received</p>
          <p className="text-ink">
            {new Date(row.original.createdAt).toLocaleString('en-US', {
              month: 'long', day: 'numeric', year: 'numeric',
              hour: '2-digit', minute: '2-digit',
            })}
          </p>
        </div>
      </div>
      <div>
        <p className="text-[0.72rem] text-pebble uppercase tracking-[0.08em] font-semibold mb-2">Message</p>
        <p className="text-[0.88rem] text-ink leading-[1.75] whitespace-pre-wrap bg-snow rounded-lg px-4 py-3 border border-sky-mid/10">
          {row.original.message}
        </p>
      </div>
    </div>
  );
}

export default function MessagesPage() {
  const [contacts, setContacts] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get<ContactMessage[]>('/contacts');
      setContacts(data);
    } catch {
      setError('Failed to load messages.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleMarkRead = async (id: number) => {
    try {
      const { data } = await api.patch<ContactMessage>(`/contacts/${id}/read`);
      setContacts(prev => prev.map(c => c.id === id ? data : c));
    } catch { /* silent */ }
  };

  const handleDelete = async (id: number) => {
    try {
      await api.delete(`/contacts/${id}`);
      setContacts(prev => prev.filter(c => c.id !== id));
    } catch { /* silent */ }
  };

  const unreadCount = contacts.filter(c => !c.read).length;
  const columns = buildColumns(handleMarkRead, handleDelete);

  return (
    <div className="p-6 md:p-8 max-w-[1200px] mx-auto">
      {/* Page header */}
      <div className="flex items-start justify-between mb-6 gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <h1 className="font-serif text-[1.6rem] font-light text-ink leading-none">Messages</h1>
            {unreadCount > 0 && (
              <Badge color="blue" size="sm" radius="xl" variant="filled">
                {unreadCount} new
              </Badge>
            )}
          </div>
          <p className="text-[0.82rem] text-stone font-light">Contact form submissions from your website.</p>
        </div>
        <Tooltip label="Refresh" withArrow>
          <ActionIcon
            variant="light" color="blue" size="md" radius="md"
            onClick={load}
            loading={loading}
          >
            <IconRefresh size={15} />
          </ActionIcon>
        </Tooltip>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
        {[
          { label: 'Total', value: contacts.length, color: 'text-ink' },
          { label: 'Unread', value: unreadCount, color: 'text-sky-accent' },
          { label: 'Read', value: contacts.length - unreadCount, color: 'text-stone' },
        ].map(s => (
          <div key={s.label} className="bg-white border border-sky-mid/12 rounded-[14px] px-4 py-3 shadow-[0_2px_8px_rgba(30,80,120,0.05)]">
            <div className={`font-serif text-[1.6rem] font-light leading-none ${s.color}`}>{s.value}</div>
            <div className="text-[0.7rem] text-pebble uppercase tracking-[0.10em] font-medium mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Table card */}
      <div className="bg-white border border-sky-mid/12 rounded-[18px] shadow-[0_4px_24px_rgba(30,80,120,0.07)] overflow-hidden">
        <div className="h-1 w-full bg-gradient-to-r from-sky-accent via-sky-mid to-sky-dark" />

        {error ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <IconMail size={32} color="#cbd5e1" />
            <Text fz={13} c="dimmed">{error}</Text>
            <button onClick={load} className="text-[0.82rem] text-sky-accent hover:text-sky-dark underline">
              Try again
            </button>
          </div>
        ) : loading && contacts.length === 0 ? (
          <div className="flex items-center justify-center py-16">
            <Text fz={13} c="dimmed">Loading messages…</Text>
          </div>
        ) : (
          <MantineTable
            data={contacts}
            columns={columns}
            enableGlobalFilter
            enablePagination
            renderBottomToolbar
            renderRowActions={(row) => (
              <Group gap={4} wrap="nowrap">
                {!row.read && (
                  <Tooltip label="Mark as read" withArrow>
                    <ActionIcon size="sm" variant="subtle" color="blue" radius="md" onClick={() => handleMarkRead(row.id)}>
                      <IconMailOpened size={14} />
                    </ActionIcon>
                  </Tooltip>
                )}
                <Tooltip label="Delete" withArrow>
                  <ActionIcon size="sm" variant="subtle" color="red" radius="md" onClick={() => handleDelete(row.id)}>
                    <IconTrash size={14} />
                  </ActionIcon>
                </Tooltip>
              </Group>
            )}
            renderDetailPanel={({ row }) => <MessageDetail row={row} />}
          />
        )}
      </div>
    </div>
  );
}