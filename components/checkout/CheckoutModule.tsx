'use client';
import { useState, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { TOURS } from '@/data/tours';
import {
  TextInput,
  Textarea,
  NumberInput,
  Checkbox,
  Group,
  Stack,
  Text,
  Paper,
  Button,
  Box,
  Badge,
  Divider,
  ThemeIcon,
  rem,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import {
  IconUser,
  IconMail,
  IconPhone,
  IconWorld,
  IconNotes,
  IconCheck,
  IconCreditCard,
  IconShieldCheck,
  IconMountain,
  IconArrowRight,
  IconArrowLeft,
  IconUsers,
} from '@tabler/icons-react';

const diffMap: Record<string, string> = {
  easy: 'Easy',
  moderate: 'Moderate',
  hard: 'Challenging',
};

const diffColor: Record<string, string> = {
  easy: 'teal',
  moderate: 'blue',
  hard: 'orange',
};

type PayMethod = 'Khalti' | 'eSewa' | 'Card';

export default function CheckoutClient() {
  const params = useSearchParams();
  const tourId = Number(params.get('tourId'));
  const addonParam = params.get('addons') ?? '';

  const tour = TOURS.find(t => t.id === tourId) ?? null;

  const selectedAddonIndices: number[] = useMemo(() => {
    if (!addonParam) return [];
    return addonParam.split(',').map(Number).filter(n => !isNaN(n));
  }, [addonParam]);

  const addonTotal = useMemo(() => {
    if (!tour) return 0;
    return selectedAddonIndices.reduce((sum, i) => sum + (tour.addons[i]?.price ?? 0), 0);
  }, [tour, selectedAddonIndices]);

  const [step, setStep] = useState(0);
  const [agreed, setAgreed] = useState(false);
  const [agreedError, setAgreedError] = useState('');
  const [payMethod, setPayMethod] = useState<PayMethod>('Card');

  const form = useForm({
    initialValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      country: '',
      travelers: 1,
      requests: '',
      cardNumber: '',
      expiry: '',
      cvv: '',
    },
    validate: {
      firstName: v =>
        v.trim().length < 2 ? 'First name must be at least 2 characters' : null,
      lastName: v =>
        v.trim().length < 2 ? 'Last name must be at least 2 characters' : null,
      email: v =>
        /^\S+@\S+\.\S+$/.test(v) ? null : 'Please enter a valid email address',
      phone: v =>
        /^\+?[\d\s\-().]{7,20}$/.test(v.trim()) ? null : 'Please enter a valid phone number',
      country: v =>
        v.trim().length < 2 ? 'Please enter your country of residence' : null,
      travelers: v =>
        v >= 1 && v <= 8 ? null : 'Please select 1–8 travelers',
      cardNumber: (v, values) => {
        if (step !== 2 || payMethod !== 'Card') return null;
        return /^\d{4}\s?\d{4}\s?\d{4}\s?\d{4}$/.test(v.replace(/\s/g, '').padEnd(16))
          ? null
          : 'Enter a valid 16-digit card number';
      },
      expiry: (v, values) => {
        if (step !== 2 || payMethod !== 'Card') return null;
        return /^(0[1-9]|1[0-2])\/\d{2}$/.test(v) ? null : 'Use MM/YY format';
      },
      cvv: (v, values) => {
        if (step !== 2 || payMethod !== 'Card') return null;
        return /^\d{3,4}$/.test(v) ? null : 'CVV must be 3–4 digits';
      },
    },
    validateInputOnBlur: true,
  });

  const baseTotal = (tour?.price ?? 0) * form.values.travelers;
  const grandTotal = baseTotal + addonTotal;

  const handleStep0 = () => {
    const result = form.validate();
    const fields = ['firstName', 'lastName', 'email', 'phone', 'country', 'travelers'] as const;
    const hasError = fields.some(f => result.errors[f]);
    if (!hasError) setStep(1);
  };

  const handleStep1 = () => {
    if (!agreed) {
      setAgreedError('You must accept the terms to continue');
      return;
    }
    setAgreedError('');
    setStep(2);
  };

  const handlePayment = () => {
    if (payMethod === 'Card') {
      const result = form.validate();
      const hasError = ['cardNumber', 'expiry', 'cvv'].some(f => result.errors[f]);
      if (hasError) return;
    }
    // Payment handler
  };

  const inputStyles = {
    input: {
      background: 'var(--mantine-color-gray-0)',
      border: '1.5px solid var(--mantine-color-gray-3)',
      borderRadius: rem(12),
      fontSize: rem(14),
      color: 'var(--mantine-color-dark-8)',
      transition: 'all 0.2s ease',
      '&:focus': {
        borderColor: 'var(--mantine-color-blue-5)',
        boxShadow: '0 0 0 3px rgba(46,134,193,0.12)',
      },
      '&::placeholder': {
        color: 'var(--mantine-color-gray-5)',
      },
    },
    label: {
      fontSize: rem(11),
      fontWeight: 700,
      letterSpacing: '0.1em',
      textTransform: 'uppercase' as const,
      color: 'var(--mantine-color-gray-6)',
      marginBottom: rem(6),
    },
    error: {
      fontSize: rem(12),
      marginTop: rem(4),
    },
  };

  if (!tour) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-mist pt-[68px] flex items-center justify-center px-6">
          <div className="text-center">
            <div className="text-[3rem] mb-4">🏔️</div>
            <h2 className="font-serif text-[1.8rem] font-light text-ink mb-3">No tour selected</h2>
            <p className="text-[0.9rem] text-stone font-light mb-6">Please go back and select a tour to book.</p>
            <Link href="/" className="bg-sky-accent text-white px-7 py-3 rounded-full text-[0.9rem] font-medium hover:bg-sky-dark transition-colors no-underline">
              Browse Tours
            </Link>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-mist pt-[68px]">

        {/* Hero step bar */}
        <div style={{ background: 'linear-gradient(135deg, #0f4c81 0%, #1a6ea8 50%, #2e86c1 100%)', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <div className="max-w-4xl mx-auto px-6 md:px-12 py-6">
            <div style={{ display: 'flex', alignItems: 'center' }}>
              {['Your Details', 'Review', 'Payment'].map((label, i) => {
                const isCompleted = i < step;
                const isActive = i === step;
                return (
                  <div key={label} style={{ display: 'flex', alignItems: 'center', flex: i < 2 ? 1 : 'none' }}>
                    <button
                      onClick={() => isCompleted && setStep(i)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: rem(10),
                        background: 'none', border: 'none', cursor: isCompleted ? 'pointer' : 'default', padding: 0,
                      }}
                    >
                      <span style={{
                        width: rem(32), height: rem(32), borderRadius: '50%',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: rem(13), fontWeight: 700, flexShrink: 0,
                        background: isActive ? 'rgba(255,255,255,0.95)' : isCompleted ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.1)',
                        border: isActive ? '2px solid white' : isCompleted ? '2px solid rgba(255,255,255,0.6)' : '2px solid rgba(255,255,255,0.25)',
                        color: isActive ? '#0f4c81' : 'rgba(255,255,255,0.85)',
                        transition: 'all 0.2s ease',
                      }}>
                        {isCompleted ? '✓' : i + 1}
                      </span>
                      <span style={{
                        fontSize: rem(12), fontWeight: 600, letterSpacing: '0.08em',
                        textTransform: 'uppercase', display: 'none',
                        color: isActive ? '#fff' : 'rgba(255,255,255,0.6)',
                      }}
                        className="sm:inline-block"
                      >
                        {label}
                      </span>
                    </button>
                    {i < 2 && (
                      <div style={{
                        flex: 1, height: rem(1), margin: `0 ${rem(12)}`,
                        background: isCompleted ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.2)',
                        transition: 'background 0.3s ease',
                      }} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-6 md:px-12 py-10 grid lg:grid-cols-[1fr_340px] gap-8 items-start">

          {/* ─── Step 0: Details ─── */}
          {step === 0 && (
            <Paper
              shadow="sm"
              radius="xl"
              p={{ base: 'xl', md: 40 }}
              style={{ border: '1px solid rgba(46,134,193,0.12)' }}
            >
              <Group mb={4} gap={10}>
                <ThemeIcon
                  size={38}
                  radius="xl"
                  variant="gradient"
                  gradient={{ from: '#2e86c1', to: '#0f4c81', deg: 135 }}
                >
                  <IconUser size={18} />
                </ThemeIcon>
                <div>
                  <Text ff="serif" fz={28} fw={300} c="dark.8" lh={1.1}>Your Details</Text>
                  <Text fz={13} c="dimmed" fw={300}>Tell us who's joining this adventure.</Text>
                </div>
              </Group>

              <Divider my="lg" color="rgba(46,134,193,0.1)" />

              <Stack gap="md">
                <Group grow gap="md">
                  <TextInput
                    label="First Name"
                    placeholder="Jane"
                    leftSection={<IconUser size={15} />}
                    {...form.getInputProps('firstName')}
                    styles={inputStyles}
                  />
                  <TextInput
                    label="Last Name"
                    placeholder="Doe"
                    leftSection={<IconUser size={15} />}
                    {...form.getInputProps('lastName')}
                    styles={inputStyles}
                  />
                </Group>

                <Group grow gap="md">
                  <TextInput
                    label="Email Address"
                    placeholder="jane@example.com"
                    type="email"
                    leftSection={<IconMail size={15} />}
                    {...form.getInputProps('email')}
                    styles={inputStyles}
                  />
                  <TextInput
                    label="Phone Number"
                    placeholder="+1 234 567 8900"
                    leftSection={<IconPhone size={15} />}
                    {...form.getInputProps('phone')}
                    styles={inputStyles}
                  />
                </Group>

                <Group grow gap="md">
                  <TextInput
                    label="Country of Residence"
                    placeholder="United States"
                    leftSection={<IconWorld size={15} />}
                    {...form.getInputProps('country')}
                    styles={inputStyles}
                  />
                  <NumberInput
                    label="Number of Travelers"
                    min={1}
                    max={8}
                    leftSection={<IconUsers size={15} />}
                    {...form.getInputProps('travelers')}
                    styles={inputStyles}
                  />
                </Group>

                <Textarea
                  label={
                    <Group gap={6}>
                      Special Requests
                      <Text span fz={11} c="dimmed" fw={400} style={{ textTransform: 'none', letterSpacing: 0 }}>
                        (optional)
                      </Text>
                    </Group>
                  }
                  placeholder="Dietary needs, accessibility requirements, etc."
                  rows={3}
                  leftSection={<IconNotes size={15} style={{ marginTop: rem(10) }} />}
                  {...form.getInputProps('requests')}
                  styles={{
                    ...inputStyles,
                    input: { ...inputStyles.input, resize: 'none' as const },
                  }}
                />
              </Stack>

              <Button
                fullWidth
                mt="xl"
                size="lg"
                radius="xl"
                rightSection={<IconArrowRight size={18} />}
                onClick={handleStep0}
                style={{
                  background: 'linear-gradient(135deg, #2e86c1, #0f4c81)',
                  boxShadow: '0 8px 28px rgba(46,134,193,0.35)',
                  fontSize: rem(15),
                  fontWeight: 500,
                  letterSpacing: '0.02em',
                  height: rem(52),
                  transition: 'transform 0.15s ease, opacity 0.15s ease',
                }}
                styles={{ root: { '&:hover': { opacity: 0.92, transform: 'translateY(-1px)' } } }}
              >
                Continue to Review
              </Button>
            </Paper>
          )}

          {/* ─── Step 1: Review ─── */}
          {step === 1 && (
            <Paper
              shadow="sm"
              radius="xl"
              p={{ base: 'xl', md: 40 }}
              style={{ border: '1px solid rgba(46,134,193,0.12)' }}
            >
              <Group mb={4} gap={10}>
                <ThemeIcon
                  size={38}
                  radius="xl"
                  variant="gradient"
                  gradient={{ from: '#2e86c1', to: '#0f4c81', deg: 135 }}
                >
                  <IconCheck size={18} />
                </ThemeIcon>
                <div>
                  <Text ff="serif" fz={28} fw={300} c="dark.8" lh={1.1}>Review Your Booking</Text>
                  <Text fz={13} c="dimmed" fw={300}>Please check all details before proceeding.</Text>
                </div>
              </Group>

              <Divider my="lg" color="rgba(46,134,193,0.1)" />

              {/* Details grid */}
              <Box
                p="lg"
                mb="lg"
                style={{
                  background: 'linear-gradient(135deg, #f0f8ff 0%, #e8f4fc 100%)',
                  borderRadius: rem(16),
                  border: '1px solid rgba(46,134,193,0.12)',
                }}
              >
                <Stack gap={10}>
                  {([
                    ['Tour', tour.name],
                    ['Duration', tour.duration],
                    ['Difficulty', diffMap[tour.difficulty]],
                    ['Name', `${form.values.firstName} ${form.values.lastName}`],
                    ['Email', form.values.email],
                    ['Phone', form.values.phone],
                    ['Country', form.values.country],
                    ['Travelers', String(form.values.travelers)],
                  ] as [string, string][]).map(([k, v]) => (
                    <Group key={k} justify="space-between" wrap="nowrap">
                      <Text fz={13} c="dimmed" fw={300}>{k}</Text>
                      {k === 'Difficulty'
                        ? <Badge color={diffColor[tour.difficulty]} variant="light" size="sm" radius="sm">{v || '—'}</Badge>
                        : <Text fz={13} fw={500} c="dark.7" ta="right" style={{ maxWidth: '60%' }}>{v || '—'}</Text>
                      }
                    </Group>
                  ))}
                  {selectedAddonIndices.length > 0 && (
                    <>
                      <Divider color="rgba(46,134,193,0.12)" />
                      <Group justify="space-between" wrap="nowrap" align="start">
                        <Text fz={13} c="dimmed" fw={300}>Add-ons</Text>
                        <Text fz={13} fw={500} c="dark.7" ta="right" style={{ maxWidth: '60%' }}>
                          {selectedAddonIndices.map(i => tour.addons[i]?.name).filter(Boolean).join(', ')}
                        </Text>
                      </Group>
                    </>
                  )}
                </Stack>
              </Box>

              {/* Terms checkbox */}
              <Box mb="xl">
                <Checkbox
                  checked={agreed}
                  onChange={e => {
                    setAgreed(e.currentTarget.checked);
                    if (e.currentTarget.checked) setAgreedError('');
                  }}
                  error={agreedError}
                  label={
                    <Text fz={13} c="dimmed" fw={300} lh={1.6}>
                      I agree to the{' '}
                      <Text span c="blue.6" style={{ cursor: 'pointer' }} component="a" href="#">Terms of Service</Text>
                      {' '}and{' '}
                      <Text span c="blue.6" style={{ cursor: 'pointer' }} component="a" href="#">Cancellation Policy</Text>.
                    </Text>
                  }
                  styles={{
                    input: {
                      borderColor: agreed ? 'var(--mantine-color-blue-5)' : 'var(--mantine-color-gray-4)',
                      borderRadius: rem(5),
                      cursor: 'pointer',
                    },
                  }}
                />
              </Box>

              <Group gap="sm">
                <Button
                  flex={1}
                  size="lg"
                  radius="xl"
                  variant="light"
                  color="gray"
                  leftSection={<IconArrowLeft size={16} />}
                  onClick={() => setStep(0)}
                  styles={{
                    root: {
                      border: '1px solid rgba(46,134,193,0.2)',
                      color: '#5a6a7a',
                      fontSize: rem(14),
                      height: rem(52),
                    },
                  }}
                >
                  Back
                </Button>
                <Button
                  flex={2}
                  size="lg"
                  radius="xl"
                  rightSection={<IconArrowRight size={18} />}
                  onClick={handleStep1}
                  style={{
                    background: agreed ? 'linear-gradient(135deg, #2e86c1, #0f4c81)' : undefined,
                    boxShadow: agreed ? '0 8px 28px rgba(46,134,193,0.3)' : undefined,
                    height: rem(52),
                    fontSize: rem(15),
                    fontWeight: 500,
                  }}
                  disabled={false}
                  color={agreed ? undefined : 'gray'}
                  variant={agreed ? 'filled' : 'light'}
                >
                  Proceed to Payment
                </Button>
              </Group>
            </Paper>
          )}

          {/* ─── Step 2: Payment ─── */}
          {step === 2 && (
            <Paper
              shadow="sm"
              radius="xl"
              p={{ base: 'xl', md: 40 }}
              style={{ border: '1px solid rgba(46,134,193,0.12)' }}
            >
              <Group mb={4} gap={10}>
                <ThemeIcon
                  size={38}
                  radius="xl"
                  variant="gradient"
                  gradient={{ from: '#2e86c1', to: '#0f4c81', deg: 135 }}
                >
                  <IconCreditCard size={18} />
                </ThemeIcon>
                <div>
                  <Text ff="serif" fz={28} fw={300} c="dark.8" lh={1.1}>Payment</Text>
                  <Text fz={13} c="dimmed" fw={300}>Complete your booking securely.</Text>
                </div>
              </Group>

              <Divider my="lg" color="rgba(46,134,193,0.1)" />

              {/* Payment method selector */}
              <Group grow gap="sm" mb="xl">
                {(['Khalti', 'eSewa', 'Card'] as const).map(m => (
                  <button
                    key={m}
                    onClick={() => setPayMethod(m)}
                    style={{
                      border: payMethod === m ? '2px solid #2e86c1' : '1.5px solid rgba(46,134,193,0.2)',
                      borderRadius: rem(14),
                      padding: `${rem(14)} ${rem(8)}`,
                      fontSize: rem(13),
                      fontWeight: 600,
                      color: payMethod === m ? '#1a6ea8' : '#6b7c8d',
                      background: payMethod === m ? 'linear-gradient(135deg, #f0f8ff, #e0f0fa)' : 'transparent',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: rem(4),
                    }}
                  >
                    <span style={{ fontSize: rem(22) }}>
                      {m === 'Khalti' ? '💜' : m === 'eSewa' ? '💚' : '💳'}
                    </span>
                    {m}
                  </button>
                ))}
              </Group>

              {payMethod === 'Card' && (
                <Stack gap="md" mb="xl">
                  <TextInput
                    label="Card Number"
                    placeholder="1234 5678 9012 3456"
                    leftSection={<IconCreditCard size={15} />}
                    maxLength={19}
                    {...form.getInputProps('cardNumber')}
                    onChange={e => {
                      const val = e.target.value.replace(/\D/g, '').slice(0, 16);
                      const formatted = val.replace(/(.{4})/g, '$1 ').trim();
                      form.setFieldValue('cardNumber', formatted);
                    }}
                    styles={inputStyles}
                  />
                  <Group grow gap="md">
                    <TextInput
                      label="Expiry"
                      placeholder="MM / YY"
                      maxLength={5}
                      {...form.getInputProps('expiry')}
                      onChange={e => {
                        let val = e.target.value.replace(/\D/g, '').slice(0, 4);
                        if (val.length >= 3) val = val.slice(0, 2) + '/' + val.slice(2);
                        form.setFieldValue('expiry', val);
                      }}
                      styles={inputStyles}
                    />
                    <TextInput
                      label="CVV"
                      placeholder="•••"
                      type="password"
                      maxLength={4}
                      {...form.getInputProps('cvv')}
                      styles={inputStyles}
                    />
                  </Group>
                </Stack>
              )}

              {(payMethod === 'Khalti' || payMethod === 'eSewa') && (
                <Box
                  p="lg"
                  mb="xl"
                  style={{
                    background: payMethod === 'Khalti'
                      ? 'linear-gradient(135deg, #f8f0ff, #f0e6ff)'
                      : 'linear-gradient(135deg, #f0fff4, #e0faea)',
                    borderRadius: rem(16),
                    border: `1px solid ${payMethod === 'Khalti' ? 'rgba(128,0,200,0.12)' : 'rgba(0,160,80,0.12)'}`,
                    textAlign: 'center',
                  }}
                >
                  <Text fz={34} mb={8}>{payMethod === 'Khalti' ? '💜' : '💚'}</Text>
                  <Text fz={14} c="dimmed" fw={300} lh={1.6}>
                    You will be redirected to{' '}
                    <Text span fw={600} c={payMethod === 'Khalti' ? 'violet.7' : 'teal.7'}>{payMethod}</Text>
                    {' '}to complete payment of{' '}
                    <Text span fw={700} c="dark.7">${grandTotal.toLocaleString()}</Text>.
                  </Text>
                </Box>
              )}

              <Group gap="sm">
                <Button
                  flex={1}
                  size="lg"
                  radius="xl"
                  variant="light"
                  color="gray"
                  leftSection={<IconArrowLeft size={16} />}
                  onClick={() => setStep(1)}
                  styles={{
                    root: {
                      border: '1px solid rgba(46,134,193,0.2)',
                      color: '#5a6a7a',
                      height: rem(52),
                      fontSize: rem(14),
                    },
                  }}
                >
                  Back
                </Button>
                <Button
                  flex={2}
                  size="lg"
                  radius="xl"
                  rightSection={<IconShieldCheck size={18} />}
                  onClick={handlePayment}
                  style={{
                    background: 'linear-gradient(135deg, #2e86c1, #0f4c81)',
                    boxShadow: '0 8px 28px rgba(46,134,193,0.35)',
                    height: rem(52),
                    fontSize: rem(15),
                    fontWeight: 500,
                  }}
                >
                  {payMethod === 'Card' ? 'Pay & Confirm Booking' : `Continue to ${payMethod}`}
                </Button>
              </Group>

              <Group justify="center" mt="md" gap={6}>
                <IconShieldCheck size={14} color="#94a3b8" />
                <Text fz={12} c="dimmed">Payments are encrypted and secure</Text>
              </Group>
            </Paper>
          )}

          {/* ─── Booking summary sidebar ─── */}
          <aside>
            <Paper
              shadow="sm"
              radius="xl"
              p="xl"
              style={{
                border: '1px solid rgba(46,134,193,0.12)',
                position: 'sticky',
                top: rem(88),
                overflow: 'hidden',
              }}
            >
              {/* Tour image with gradient overlay */}
              <Box
                style={{
                  height: rem(140),
                  borderRadius: rem(14),
                  overflow: 'hidden',
                  position: 'relative',
                  marginBottom: rem(16),
                }}
              >
                <img
                  src={tour.heroImage}
                  alt={tour.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'linear-gradient(to top, rgba(15,76,129,0.6) 0%, transparent 60%)',
                  }}
                />
                <Badge
                  color={diffColor[tour.difficulty]}
                  variant="filled"
                  size="sm"
                  radius="sm"
                  style={{ position: 'absolute', bottom: rem(10), left: rem(10) }}
                >
                  {diffMap[tour.difficulty]}
                </Badge>
              </Box>

              <Text ff="serif" fz={17} fw={600} c="dark.8" lh={1.3} mb={4}>{tour.name}</Text>
              <Group gap={6} mb="lg">
                <IconMountain size={13} color="#94a3b8" />
                <Text fz={12} c="dimmed">{tour.duration}</Text>
              </Group>

              <Divider color="rgba(46,134,193,0.1)" mb="md" />

              <Stack gap={10} pb="md" mb="md" style={{ borderBottom: '1px solid rgba(46,134,193,0.1)' }}>
                <Group justify="space-between">
                  <Text fz={13} c="dimmed" fw={300}>Base price</Text>
                  <Text fz={13} fw={500} c="dark.7">${tour.price.toLocaleString()}</Text>
                </Group>
                <Group justify="space-between">
                  <Text fz={13} c="dimmed" fw={300}>× {form.values.travelers} {form.values.travelers === 1 ? 'traveler' : 'travelers'}</Text>
                  <Text fz={13} fw={500} c="dark.7">${baseTotal.toLocaleString()}</Text>
                </Group>
                {selectedAddonIndices.map(i => {
                  const addon = tour.addons[i];
                  if (!addon) return null;
                  return (
                    <Group key={i} justify="space-between" wrap="nowrap">
                      <Text fz={13} c="dimmed" fw={300} style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginRight: rem(8) }}>
                        {addon.name}
                      </Text>
                      <Text fz={13} fw={500} c="blue.6" style={{ whiteSpace: 'nowrap' }}>+${addon.price}</Text>
                    </Group>
                  );
                })}
              </Stack>

              <Group justify="space-between" align="flex-end">
                <Text fz={13} c="dimmed">Total</Text>
                <Text
                  ff="serif"
                  fz={32}
                  fw={600}
                  style={{
                    background: 'linear-gradient(135deg, #2e86c1, #0f4c81)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  ${grandTotal.toLocaleString()}
                </Text>
              </Group>

              <Box
                mt="md"
                p="sm"
                style={{
                  background: 'linear-gradient(135deg, #f0f8ff, #e8f4fc)',
                  borderRadius: rem(10),
                  border: '1px solid rgba(46,134,193,0.12)',
                }}
              >
                <Group gap={6}>
                  <IconShieldCheck size={14} color="#2e86c1" />
                  <Text fz={12} c="blue.7" fw={500}>Free cancellation up to 14 days before departure</Text>
                </Group>
              </Box>
            </Paper>
          </aside>
        </div>
      </main>
    </>
  );
}