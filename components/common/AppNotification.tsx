'use client';
// src/components/common/AppNotification.tsx
import { useCallback, useState } from 'react';
import { Notification, Stack } from '@mantine/core';
import { IconCheck, IconX, IconInfoCircle, IconAlertTriangle } from '@tabler/icons-react';

export type NotifType = 'success' | 'error' | 'info' | 'warning';

export interface NotifItem {
  id:      number;
  type:    NotifType;
  title:   string;
  message: string;
}

const CONFIG: Record<NotifType, { color: string; icon: React.ReactNode }> = {
  success: { color: 'teal',   icon: <IconCheck         size={16} /> },
  error:   { color: 'red',    icon: <IconX             size={16} /> },
  info:    { color: 'blue',   icon: <IconInfoCircle    size={16} /> },
  warning: { color: 'orange', icon: <IconAlertTriangle size={16} /> },
};

// ─── Hook ────────────────────────────────────────────────────────────────────
let _counter = 0;

export function useNotification() {
  const [notifications, setNotifications] = useState<NotifItem[]>([]);

  const notify = useCallback(
    (type: NotifType, title: string, message: string, duration = 4000) => {
      const id = ++_counter;
      setNotifications(prev => [...prev, { id, type, title, message }]);
      setTimeout(
        () => setNotifications(prev => prev.filter(n => n.id !== id)),
        duration,
      );
    },
    [],
  );

  const dismiss = useCallback((id: number) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  return { notifications, notify, dismiss };
}

// ─── Component ───────────────────────────────────────────────────────────────
interface Props {
  notifications: NotifItem[];
  onDismiss:     (id: number) => void;
}

export default function AppNotification({ notifications, onDismiss }: Props) {
  if (!notifications.length) return null;

  return (
    <Stack
      gap="xs"
      style={{
        position:   'fixed',
        bottom:     24,
        right:      24,
        zIndex:     9999,
        width:      360,
        maxWidth:   'calc(100vw - 48px)',
      }}
    >
      {notifications.map(n => {
        const { color, icon } = CONFIG[n.type];
        return (
          <Notification
            key={n.id}
            icon={icon}
            color={color}
            title={n.title}
            onClose={() => onDismiss(n.id)}
            withBorder
            radius="lg"
            styles={{
              root:  { boxShadow: '0 4px 20px rgba(0,0,0,0.12)' },
              title: { fontWeight: 600, fontSize: 13 },
              description: { fontSize: 13 },
            }}
          >
            {n.message}
          </Notification>
        );
      })}
    </Stack>
  );
}