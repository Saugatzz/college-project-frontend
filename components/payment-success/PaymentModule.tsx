'use client';
import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import {
  Text,
  Paper,
  Button,
  Box,
  Group,
  Stack,
  Divider,
  ThemeIcon,
  rem,
  Badge,
} from '@mantine/core';
import {
  IconCheck,
  IconMountain,
  IconCalendar,
  IconUsers,
  IconDownload,
  IconHome,
  IconMail,
} from '@tabler/icons-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

// Confetti particle
function ConfettiPiece({ style }: { style: React.CSSProperties }) {
  return <div style={style} />;
}

function Confetti() {
  const [pieces, setPieces] = useState<React.CSSProperties[]>([]);

  useEffect(() => {
    const colors = ['#2e86c1', '#0f4c81', '#27ae60', '#f39c12', '#8e44ad', '#e74c3c', '#1abc9c'];
    const generated = Array.from({ length: 60 }, (_, i) => ({
      position: 'fixed' as const,
      top: '-10px',
      left: `${Math.random() * 100}vw`,
      width: `${6 + Math.random() * 8}px`,
      height: `${6 + Math.random() * 8}px`,
      background: colors[Math.floor(Math.random() * colors.length)],
      borderRadius: Math.random() > 0.5 ? '50%' : '2px',
      animation: `confettiFall ${2 + Math.random() * 3}s ease-in forwards`,
      animationDelay: `${Math.random() * 1.5}s`,
      opacity: 0.85,
      zIndex: 9999,
      transform: `rotate(${Math.random() * 360}deg)`,
    }));
    setPieces(generated);
    const t = setTimeout(() => setPieces([]), 5000);
    return () => clearTimeout(t);
  }, []);

  return (
    <>
      <style>{`
        @keyframes confettiFall {
          0%   { transform: translateY(0) rotate(0deg); opacity: 1; }
          100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
        }
        @keyframes scaleIn {
          0%   { transform: scale(0) rotate(-180deg); opacity: 0; }
          60%  { transform: scale(1.15) rotate(10deg); }
          80%  { transform: scale(0.95) rotate(-5deg); }
          100% { transform: scale(1) rotate(0deg); opacity: 1; }
        }
        @keyframes slideUp {
          from { transform: translateY(24px); opacity: 0; }
          to   { transform: translateY(0);   opacity: 1; }
        }
        @keyframes pulse-ring {
          0%   { transform: scale(0.9); box-shadow: 0 0 0 0 rgba(46,134,193,0.5); }
          70%  { transform: scale(1);   box-shadow: 0 0 0 18px rgba(46,134,193,0); }
          100% { transform: scale(0.9); box-shadow: 0 0 0 0 rgba(46,134,193,0); }
        }
      `}</style>
      {pieces.map((s, i) => <ConfettiPiece key={i} style={s} />)}
    </>
  );
}

export default function PaymentModule() {
  const bookingRef = `SH-${Date.now().toString(36).toUpperCase().slice(-6)}`;
  const today = new Date();
  const departureDate = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);

  // Read from sessionStorage (set by checkout page before redirect)
  const [booking, setBooking] = useState({
    tourName: 'Everest Base Camp Trek',
    duration: '14 Days / 13 Nights',
    travelers: 2,
    grandTotal: 3298,
    email: 'traveler@example.com',
    payMethod: 'Card' as 'Card' | 'Khalti' | 'eSewa',
  });

  useEffect(() => {
    try {
      const stored = sessionStorage.getItem('bookingDetails');
      if (stored) setBooking(JSON.parse(stored));
    } catch {}
  }, []);

  const formattedDeparture = departureDate.toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });

  return (
    <>
      <Header />
      <Confetti />

      <main className="min-h-screen pt-[68px]" style={{ background: 'linear-gradient(160deg, #f0f8ff 0%, #e8f2fa 50%, #f5fbff 100%)' }}>
        <div className="max-w-2xl mx-auto px-6 py-14">

          {/* Success badge */}
          <div style={{ textAlign: 'center', marginBottom: rem(32), animation: 'slideUp 0.5s ease both' }}>
            <div style={{
              width: rem(88),
              height: rem(88),
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #27ae60, #1e8449)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto',
              boxShadow: '0 0 0 0 rgba(39,174,96,0.4)',
              animation: 'scaleIn 0.6s cubic-bezier(0.34,1.56,0.64,1) both, pulse-ring 2s ease-out 0.6s 2',
            }}>
              <IconCheck size={40} color="white" stroke={3} />
            </div>
            <Text
              ff="serif"
              fz={{ base: 34, sm: 42 }}
              fw={300}
              c="dark.8"
              mt={20}
              lh={1.1}
              style={{ animation: 'slideUp 0.5s ease 0.2s both', opacity: 0 }}
            >
              Booking Confirmed!
            </Text>
            <Text
              fz={15}
              c="dimmed"
              fw={300}
              mt={8}
              style={{ animation: 'slideUp 0.5s ease 0.3s both', opacity: 0 }}
            >
              Your adventure is locked in. A confirmation has been sent to{' '}
              <Text span fw={600} c="blue.7">{booking.email}</Text>.
            </Text>
          </div>

          {/* Booking reference card */}
          <Paper
            shadow="md"
            radius="xl"
            p={{ base: 'xl', sm: 40 }}
            mb="lg"
            style={{
              border: '1px solid rgba(46,134,193,0.15)',
              animation: 'slideUp 0.5s ease 0.4s both',
              opacity: 0,
              background: 'white',
            }}
          >
            {/* Reference */}
            <Box
              p="lg"
              mb="xl"
              style={{
                background: 'linear-gradient(135deg, #0f4c81 0%, #2e86c1 100%)',
                borderRadius: rem(16),
                textAlign: 'center',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              {/* Decorative circles */}
              <div style={{ position: 'absolute', top: -20, right: -20, width: 80, height: 80, borderRadius: '50%', background: 'rgba(255,255,255,0.06)' }} />
              <div style={{ position: 'absolute', bottom: -15, left: -15, width: 60, height: 60, borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />
              <Text fz={11} fw={700} c="rgba(255,255,255,0.6)" style={{ letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: rem(6) }}>
                Booking Reference
              </Text>
              <Text fz={30} fw={800} c="white" style={{ fontFamily: 'monospace', letterSpacing: '0.12em' }}>
                {bookingRef}
              </Text>
            </Box>

            {/* Tour details */}
            <Group align="flex-start" gap="md" mb="lg">
              <ThemeIcon size={42} radius="xl" variant="gradient" gradient={{ from: '#2e86c1', to: '#0f4c81' }}>
                <IconMountain size={20} />
              </ThemeIcon>
              <div style={{ flex: 1 }}>
                <Text fz={17} fw={600} c="dark.8" ff="serif" lh={1.2}>{booking.tourName}</Text>
                <Text fz={13} c="dimmed" fw={300}>{booking.duration}</Text>
              </div>
              <Badge color="green" variant="light" size="md" radius="md">Confirmed</Badge>
            </Group>

            <Divider color="rgba(46,134,193,0.1)" mb="lg" />

            <Stack gap={12} mb="lg">
              <Group justify="space-between">
                <Group gap={8}>
                  <IconCalendar size={15} color="#94a3b8" />
                  <Text fz={13} c="dimmed" fw={300}>Departure</Text>
                </Group>
                <Text fz={13} fw={500} c="dark.7">{formattedDeparture}</Text>
              </Group>
              <Group justify="space-between">
                <Group gap={8}>
                  <IconUsers size={15} color="#94a3b8" />
                  <Text fz={13} c="dimmed" fw={300}>Travelers</Text>
                </Group>
                <Text fz={13} fw={500} c="dark.7">
                  {booking.travelers} {booking.travelers === 1 ? 'person' : 'people'}
                </Text>
              </Group>
              <Group justify="space-between">
                <Group gap={8}>
                  <span style={{ fontSize: 14 }}>
                    {booking.payMethod === 'Khalti' ? '💜' : booking.payMethod === 'eSewa' ? '💚' : '💳'}
                  </span>
                  <Text fz={13} c="dimmed" fw={300}>Paid via</Text>
                </Group>
                <Text fz={13} fw={500} c="dark.7">{booking.payMethod}</Text>
              </Group>
            </Stack>

            <Divider color="rgba(46,134,193,0.1)" mb="lg" />

            <Group justify="space-between" align="flex-end">
              <Text fz={13} c="dimmed">Total Paid</Text>
              <Text
                ff="serif"
                fz={36}
                fw={600}
                style={{
                  background: 'linear-gradient(135deg, #27ae60, #1e8449)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                ${booking.grandTotal.toLocaleString()}
              </Text>
            </Group>
          </Paper>

          {/* What's next */}
          <Paper
            shadow="sm"
            radius="xl"
            p="xl"
            mb="lg"
            style={{
              border: '1px solid rgba(46,134,193,0.12)',
              animation: 'slideUp 0.5s ease 0.55s both',
              opacity: 0,
            }}
          >
            <Text fz={14} fw={700} c="dark.7" mb="md" style={{ letterSpacing: '0.06em', textTransform: 'uppercase' }}>
              What happens next?
            </Text>
            <Stack gap={12}>
              {[
                { icon: '📧', text: 'A detailed itinerary and packing guide will be emailed within 24 hours.' },
                { icon: '📞', text: 'Your trek coordinator will call you 7 days before departure.' },
                { icon: '📋', text: 'Permits and accommodation are arranged by our team.' },
              ].map((item, i) => (
                <Group key={i} gap={12} align="flex-start">
                  <Text fz={20}>{item.icon}</Text>
                  <Text fz={13} c="dimmed" fw={300} lh={1.6}>{item.text}</Text>
                </Group>
              ))}
            </Stack>
          </Paper>

          {/* Actions */}
          <Stack
            gap="sm"
            style={{ animation: 'slideUp 0.5s ease 0.7s both', opacity: 0 }}
          >
            <Button
              fullWidth
              size="lg"
              radius="xl"
              leftSection={<IconDownload size={18} />}
              style={{
                background: 'linear-gradient(135deg, #2e86c1, #0f4c81)',
                boxShadow: '0 8px 28px rgba(46,134,193,0.3)',
                height: rem(52),
                fontSize: rem(15),
                fontWeight: 500,
              }}
              onClick={() => alert('Downloading confirmation PDF…')}
            >
              Download Confirmation PDF
            </Button>
            <Group grow gap="sm">
              <Button
                size="md"
                radius="xl"
                variant="light"
                color="blue"
                leftSection={<IconMail size={16} />}
                style={{ height: rem(46), fontSize: rem(13) }}
                onClick={() => alert('Resending confirmation email…')}
              >
                Resend Email
              </Button>
              <Link href="/" style={{ flex: 1, textDecoration: 'none' }}>
                <Button
                  fullWidth
                  size="md"
                  radius="xl"
                  variant="light"
                  color="gray"
                  leftSection={<IconHome size={16} />}
                  style={{ height: rem(46), fontSize: rem(13) }}
                >
                  Browse More Tours
                </Button>
              </Link>
            </Group>
          </Stack>

        </div>
      </main>
    </>
  );
}