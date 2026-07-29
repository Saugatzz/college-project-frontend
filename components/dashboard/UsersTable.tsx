"use client";
import { useEffect, useState, useCallback } from "react";
import {
  Group, Text, Box, Loader, Center, ActionIcon, Tooltip, rem, Badge,
} from "@mantine/core";
import {
  IconRefresh, IconAlertCircle, IconMail, IconCalendar,
  IconShieldCheck, IconBan, IconUserCog, IconShoppingBag,
} from "@tabler/icons-react";
import { ColumnDef } from "@tanstack/react-table";
import api from "@/lib/api/api";
import MantineTable from "@/components/common/MantineTable";
import AppNotification, { useNotification } from "@/components/common/AppNotification";

interface AccountRow {
  id: string;
  name: string;
  email: string;
  role: "user" | "admin";
  isActive: boolean;
  createdAt: string;
  bookingCount: number;
}

function fmtDate(iso?: string) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default function UsersTable() {
  const [users,      setUsers]      = useState<AccountRow[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState("");
  const [actingOn,   setActingOn]   = useState<string | null>(null);

  const { notifications, notify, dismiss } = useNotification();

  const fetchUsers = async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await api.get<AccountRow[]>("/users");
      setUsers(data);
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? "Failed to load users. Is the backend running?";
      setError(msg);
      notify('error', 'Failed to load accounts', msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const toggleBan = useCallback(async (row: AccountRow) => {
    setActingOn(row.id);
    try {
      const action = row.isActive ? "ban" : "unban";
      await api.patch(`/users/${row.id}/${action}`);
      setUsers(prev => prev.map(u => u.id === row.id ? { ...u, isActive: !row.isActive } : u));
      notify(
        'success',
        row.isActive ? 'Account banned' : 'Account restored',
        `${row.email} has been ${row.isActive ? 'banned and can no longer sign in' : 'unbanned and can sign in again'}.`,
      );
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? 'Could not update this account.';
      notify('error', 'Update failed', msg);
    } finally {
      setActingOn(null);
    }
  }, [notify]);

  const totalUsers   = users.length;
  const activeCount  = users.filter(u => u.isActive).length;
  const bannedCount  = users.filter(u => !u.isActive).length;
  const totalBookings = users.reduce((s, u) => s + u.bookingCount, 0);

  const columns: ColumnDef<AccountRow, any>[] = [
    {
      id: "account", header: "Account", size: 240,
      accessorFn: (row) => row.name || row.email,
      cell: ({ row }) => {
        const u = row.original;
        const initials = (u.name || u.email).slice(0, 2).toUpperCase();
        return (
          <Group gap={10} wrap="nowrap">
            <Box style={{
              width: rem(30), height: rem(30), borderRadius: "50%",
              background: u.isActive
                ? "linear-gradient(135deg, #dbeafe, #bfdbfe)"
                : "linear-gradient(135deg, #fee2e2, #fecaca)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: rem(10), fontWeight: 700,
              color: u.isActive ? "#1e40af" : "#991b1b", flexShrink: 0,
            }}>
              {initials}
            </Box>
            <Box style={{ overflow: "hidden" }}>
              <Text fz={13} fw={600} c="dark.7" truncate>{u.name || "—"}</Text>
              <Text fz={11} c="dimmed" truncate>{u.email}</Text>
            </Box>
          </Group>
        );
      },
    },
    {
      id: "role", accessorKey: "role", header: "Role", size: 90,
      cell: ({ getValue }) => {
        const role = getValue<string>();
        return (
          <Badge
            size="sm"
            radius="sm"
            variant="light"
            color={role === "admin" ? "grape" : "blue"}
          >
            {role}
          </Badge>
        );
      },
    },
    {
      id: "bookingCount", accessorKey: "bookingCount", header: "Bookings", size: 100,
      cell: ({ getValue }) => (
        <Group gap={5} wrap="nowrap">
          <IconShoppingBag size={13} color="#94a3b8" />
          <Text fz={13} c="dark.6">{getValue<number>()}</Text>
        </Group>
      ),
    },
    {
      id: "createdAt", accessorKey: "createdAt", header: "Joined", size: 120,
      cell: ({ getValue }) => <Text fz={12} c="gray.5">{fmtDate(getValue<string>())}</Text>,
    },
    {
      id: "status", accessorKey: "isActive", header: "Status", size: 110,
      cell: ({ row }) => {
        const active = row.original.isActive;
        return (
          <Box style={{
            display: "inline-flex", alignItems: "center", gap: rem(6),
            background: active ? "#f0fdf4" : "#fef2f2",
            borderRadius: rem(20), padding: `${rem(3)} ${rem(10)}`,
          }}>
            <Box style={{ width: 7, height: 7, borderRadius: "50%", background: active ? "#10b981" : "#ef4444" }} />
            <Text fz={11} fw={700} style={{ color: active ? "#10b981" : "#ef4444" }}>
              {active ? "Active" : "Banned"}
            </Text>
          </Box>
        );
      },
    },
    {
      id: "actions", header: "Actions", size: 130, enableSorting: false,
      cell: ({ row }) => {
        const u = row.original;
        if (u.role === "admin") {
          return <Text fz={11} c="dimmed" fs="italic">Protected</Text>;
        }
        const isActing = actingOn === u.id;
        return (
          <Box onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => toggleBan(u)}
              disabled={isActing}
              style={{
                display: "flex", alignItems: "center", gap: rem(5),
                border: `1.5px solid ${u.isActive ? "#fecaca" : "#bbf7d0"}`,
                borderRadius: rem(20),
                padding: `${rem(4)} ${rem(12)}`,
                fontSize: rem(11.5), fontWeight: 700,
                color: u.isActive ? "#ef4444" : "#10b981",
                background: u.isActive ? "#fef2f2" : "#f0fdf4",
                cursor: isActing ? "not-allowed" : "pointer",
                opacity: isActing ? 0.6 : 1,
              }}
            >
              {u.isActive ? <IconBan size={13} /> : <IconShieldCheck size={13} />}
              {isActing ? "Working…" : u.isActive ? "Ban" : "Unban"}
            </button>
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
          <Text fz={13} c="dimmed">Loading accounts…</Text>
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
            <ActionIcon variant="light" color="blue" size="md" radius="md" onClick={fetchUsers}>
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
          { label: "Total Accounts",  value: totalUsers,    color: "text-[#1a1a2e]" },
          { label: "Active",         value: activeCount,   color: "text-teal-600"  },
          { label: "Banned",         value: bannedCount,    color: "text-red-500"   },
          { label: "Bookings Made",  value: totalBookings, color: "text-[#2E86C1]" },
        ].map(s => (
          <div key={s.label} className="bg-white border border-gray-100 rounded-[14px] px-4 py-3 shadow-[0_2px_8px_rgba(30,80,120,0.05)]">
            <div className={`font-playfair text-[1.6rem] font-light leading-none ${s.color}`}>{s.value}</div>
            <div className="text-[0.7rem] text-gray-400 uppercase tracking-[0.10em] font-medium mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="bg-white border border-gray-100 rounded-[18px] shadow-[0_4px_24px_rgba(30,80,120,0.07)] overflow-hidden">
        <div className="h-1 w-full bg-gradient-to-r from-[#0f4c81] via-[#2E86C1] to-[#1a6ea8]" />
        <MantineTable<AccountRow>
          data={users}
          columns={columns}
          enableGlobalFilter
          enablePagination
          renderBottomToolbar
        />
      </div>
    </>
  );
}
