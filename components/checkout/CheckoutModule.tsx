"use client";
import { useState, useMemo, useRef, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import type { Tour } from "@/types/tour";
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
  Loader,
  Modal,
  Select,
} from "@mantine/core";
import { useForm } from "@mantine/form";
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
  IconUpload,
  IconFileTypePdf,
  IconX,
  IconAlertCircle,
  IconBrandWhatsapp,
  IconCalendarTime,
  IconCalendarEvent,
} from "@tabler/icons-react";
import api from "@/lib/api/api";
import { getUser, getToken, AuthUser } from "@/lib/auth/tokenStore";
import { COUNTRY_NAMES, dialCodeForCountry, stripDialCode } from "@/lib/constants/countries";
import { IconTrash, IconLogin } from "@tabler/icons-react";

const EMAIL_REGEX = /^\S+@\S+\.\S+$/;

const diffMap: Record<string, string> = {
  easy: "Easy",
  moderate: "Moderate",
  hard: "Challenging",
};
const diffColor: Record<string, string> = {
  easy: "teal",
  moderate: "blue",
  hard: "orange",
};
type PayMethod = "Khalti" | "eSewa" | "Card";
type ContactMethod = "email" | "whatsapp";
type DateFlexibility = "exact" | "flexible";

const FLEXIBILITY_WINDOWS = [
  "±3 days",
  "±1 week",
  "±2 weeks",
  "Whole month",
] as const;

// Choosing an exact date guarantees a dedicated local guide for that date
// rather than "we'll do our best" — this fee funds that guarantee. It's
// a percentage of the base tour price (before add-ons) and is 0 for
// flexible bookings, since those are worked out within a window instead
// of guaranteed outright.
const EXACT_DATE_SURCHARGE_RATE = 0.1; // 10% of base tour price

function FakeQRCode({ label, color }: { label: string; color: string }) {
  const SIZE = 21;
  const cells: boolean[][] = Array.from({ length: SIZE }, (_, row) =>
    Array.from({ length: SIZE }, (_, col) => {
      if (
        (row < 7 && col < 7) ||
        (row < 7 && col >= SIZE - 7) ||
        (row >= SIZE - 7 && col < 7)
      ) {
        const inOuter =
          row === 0 ||
          row === 6 ||
          col === 0 ||
          col === 6 ||
          (row >= SIZE - 7 &&
            (row === SIZE - 7 || row === SIZE - 1 || col === 0 || col === 6)) ||
          (row < 7 &&
            col >= SIZE - 7 &&
            (row === 0 || row === 6 || col === SIZE - 7 || col === SIZE - 1));
        const inInner =
          (row >= 2 && row <= 4 && col >= 2 && col <= 4) ||
          (row >= 2 && row <= 4 && col >= SIZE - 5 && col <= SIZE - 3) ||
          (row >= SIZE - 5 && row <= SIZE - 3 && col >= 2 && col <= 4);
        return inOuter || inInner;
      }
      const seed =
        label.charCodeAt(row % label.length) ^
        label.charCodeAt(col % label.length);
      return (seed * (row + 1) * (col + 1) * 31) % 7 < 3;
    }),
  );
  const cellPx = 7;
  const totalPx = SIZE * cellPx + 16;
  return (
    <svg
      width={totalPx}
      height={totalPx}
      viewBox={`0 0 ${totalPx} ${totalPx}`}
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: "block" }}
    >
      <rect width={totalPx} height={totalPx} fill="white" rx={8} />
      {cells.map((row, r) =>
        row.map((on, c) =>
          on ? (
            <rect
              key={`${r}-${c}`}
              x={8 + c * cellPx}
              y={8 + r * cellPx}
              width={cellPx - 1}
              height={cellPx - 1}
              fill={color}
              rx={1}
            />
          ) : null,
        ),
      )}
    </svg>
  );
}

// Formats the customer's chosen exact date / flexible month + window into a
// single human-readable line used in the review step, confirmation modal,
// and (mirrored server-side) the confirmation email.
function formatPreferredTiming(values: {
  dateFlexibility: DateFlexibility;
  preferredDate: string;
  preferredMonth: string;
  flexibilityWindow: string;
}): string {
  if (values.dateFlexibility === "exact") {
    if (!values.preferredDate) return "—";
    const d = new Date(values.preferredDate + "T00:00:00");
    return d.toLocaleDateString("en-US", {
      weekday: "short",
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  }
  if (!values.preferredMonth) return "—";
  const [y, m] = values.preferredMonth.split("-").map(Number);
  const monthLabel = new Date(y, (m || 1) - 1, 1).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
  return `${monthLabel} · flexible (${values.flexibilityWindow})`;
}

export default function CheckoutClient() {
  const params = useSearchParams();
  const router = useRouter();
  const tourId = params.get("tourId");
  const addonParam = params.get("addons") ?? "";

  const [tour, setTour] = useState<Tour | null>(null);
  const [tourLoading, setTourLoading] = useState(true);

  useEffect(() => {
    if (!tourId) {
      setTourLoading(false);
      return;
    }
    api
      .get(`/packages/${tourId}`)
      .then(({ data: d }) => {
        const mapped: Tour = {
          id: d.id,
          slug: d.slug ?? "",
          name: d.name,
          tagline: d.tagline ?? "",
          image: d.image ?? "",
          heroImage: d.image ?? "",
          badge: d.badge ?? "",
          category: d.category?.toLowerCase() ?? "trek",
          difficulty: d.difficulty?.toLowerCase() ?? "moderate",
          duration: `${d.days} Days`,
          days: d.days,
          price: parseFloat(d.price) || 0,
          rating: parseFloat(d.rating) || 0,
          reviewCount: d.reviewCount ?? 0,
          tags: [],
          description: d.description ?? "",
          gallery: (d.images ?? []).map((img: any) => ({
            src: img.src,
            alt: img.alt,
          })),
          itinerary: (d.itineraries ?? []).map((it: any) => ({
            title: it.title,
            desc: it.description,
          })),
          highlights: (d.highlights ?? []).map((h: any) => ({
            icon: h.icon,
            title: h.title,
            desc: h.desc,
          })),
          includes: (d.inclusions ?? [])
            .filter((i: any) => i.included)
            .map((i: any) => i.text),
          excludes: (d.inclusions ?? [])
            .filter((i: any) => !i.included)
            .map((i: any) => i.text),
          addons: (d.addons ?? []).map((a: any) => ({
            name: a.name,
            desc: a.desc,
            price: parseFloat(a.price) || 0,
          })),
        };
        setTour(mapped);
      })
      .catch(() => setTour(null))
      .finally(() => setTourLoading(false));
  }, [tourId]);

  const selectedAddonIndices: number[] = useMemo(() => {
    if (!addonParam) return [];
    return addonParam
      .split(",")
      .map(Number)
      .filter((n) => !isNaN(n));
  }, [addonParam]);

  const [step, setStep] = useState(0);
  const [agreed, setAgreed] = useState(false);
  const [agreedError, setAgreedError] = useState("");
  const [payMethod, setPayMethod] = useState<PayMethod>("Card");
  const [txFile, setTxFile] = useState<File | null>(null);
  const [txFileError, setTxFileError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── Account awareness: prefill details, offer sign-in before guest
  // checkout, and saved cards for logged-in users ──────────────────────
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [showGuestPrompt, setShowGuestPrompt] = useState(false);

  interface SavedCardView {
    id: string;
    brand: string;
    last4: string;
    expiryMonth: string;
    expiryYear: string;
  }
  const [savedCards, setSavedCards] = useState<SavedCardView[]>([]);
  const [savedCardsLoading, setSavedCardsLoading] = useState(false);
  const [selectedCardId, setSelectedCardId] = useState<string>("new"); // "new" | saved card id
  const [savedCardCvv, setSavedCardCvv] = useState("");
  const [saveNewCard, setSaveNewCard] = useState(false);
  const [removingCardId, setRemovingCardId] = useState<string | null>(null);

  // ── Email verification (proves the address actually exists / is
  // reachable, rather than just matching a regex) ──────────────────────
  const [emailForVerification, setEmailForVerification] = useState("");
  const [codeSent, setCodeSent] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);
  const [verificationToken, setVerificationToken] = useState<string | null>(null);
  const [verificationCode, setVerificationCode] = useState("");
  const [sendingCode, setSendingCode] = useState(false);
  const [verifyingCode, setVerifyingCode] = useState(false);
  const [verifyError, setVerifyError] = useState("");
  const [resendCooldown, setResendCooldown] = useState(0);

  const todayISO = useMemo(() => new Date().toISOString().slice(0, 10), []);
  const todayMonthISO = useMemo(() => new Date().toISOString().slice(0, 7), []);

  const form = useForm({
    initialValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      country: "",
      travelers: 1,
      requests: "",
      cardNumber: "",
      expiry: "",
      cvv: "",
      contactMethod: "email" as ContactMethod,
      whatsappNumber: "",
      // ── Preferred start timing ──
      dateFlexibility: "exact" as DateFlexibility,
      preferredDate: "",
      preferredMonth: "",
      flexibilityWindow: "±1 week" as (typeof FLEXIBILITY_WINDOWS)[number],
      dateNotes: "",
    },
    validate: {
      firstName: (v) =>
        v.trim().length < 2 ? "First name must be at least 2 characters" : null,
      lastName: (v) =>
        v.trim().length < 2 ? "Last name must be at least 2 characters" : null,
      email: (v) =>
        EMAIL_REGEX.test(v) ? null : "Please enter a valid email address",
      phone: (v) =>
        /^\+?[\d\s\-().]{7,20}$/.test(v.trim())
          ? null
          : "Please enter a valid phone number",
      country: (v) =>
        v.trim().length < 2 ? "Please enter your country of residence" : null,
      travelers: (v) =>
        v >= 1 && v <= 100 ? null : "Please select 1–100 travelers",
      whatsappNumber: (v, values) =>
        values.contactMethod === "whatsapp" &&
        !/^\+?[\d\s\-().]{7,20}$/.test((v ?? "").trim())
          ? "Please enter a valid WhatsApp number"
          : null,
      preferredDate: (v, values) =>
        values.dateFlexibility === "exact" && !v
          ? "Please pick your preferred start date"
          : null,
      preferredMonth: (v, values) =>
        values.dateFlexibility === "flexible" && !v
          ? "Please pick a preferred month"
          : null,
      cardNumber: (v) => {
        if (step !== 2 || payMethod !== "Card") return null;
        return /^\d{16}$/.test(v.replace(/\s/g, ""))
          ? null
          : "Enter a valid 16-digit card number";
      },
      expiry: (v) => {
        if (step !== 2 || payMethod !== "Card") return null;
        return /^(0[1-9]|1[0-2])\/\d{2}$/.test(v) ? null : "Use MM/YY format";
      },
      cvv: (v) => {
        if (step !== 2 || payMethod !== "Card") return null;
        return /^\d{3,4}$/.test(v) ? null : "CVV must be 3–4 digits";
      },
    },
    validateInputOnBlur: true,
  });

  // Runs once per mount, after hydration. If the person is logged in:
  // prefill their name/email (only into still-empty fields, so we never
  // clobber something they've already typed) and fetch their saved
  // cards. If they're a guest, offer a one-time nudge to sign in first —
  // "continue as guest" is always right there too, so nobody's blocked.
  useEffect(() => {
    const token = getToken();
    const user = token ? getUser() : null;
    setAuthUser(user);
    setAuthChecked(true);

    if (user) {
      const [first, ...rest] = (user.name || "").trim().split(/\s+/);
      if (!form.values.firstName && first) form.setFieldValue("firstName", first);
      if (!form.values.lastName && rest.length) form.setFieldValue("lastName", rest.join(" "));
      if (!form.values.email && user.email) form.setFieldValue("email", user.email);

      setSavedCardsLoading(true);
      api
        .get<SavedCardView[]>("/payments/cards/me")
        .then(({ data }) => setSavedCards(data))
        .catch(() => setSavedCards([]))
        .finally(() => setSavedCardsLoading(false));
    } else {
      const alreadyDismissed = sessionStorage.getItem("checkoutGuestPromptDismissed");
      if (!alreadyDismissed) setShowGuestPrompt(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const dismissGuestPrompt = () => {
    setShowGuestPrompt(false);
    try { sessionStorage.setItem("checkoutGuestPromptDismissed", "1"); } catch {}
  };

  const handleRemoveSavedCard = async (id: string) => {
    setRemovingCardId(id);
    try {
      await api.delete(`/payments/cards/${id}`);
      setSavedCards((prev) => prev.filter((c) => c.id !== id));
      if (selectedCardId === id) setSelectedCardId("new");
    } catch {
      // Non-critical — leave the card in the list if deletion failed.
    } finally {
      setRemovingCardId(null);
    }
  };

  // If the user edits the email after it was verified (or while a code is
  // pending), the old verification no longer proves anything about the new
  // address — reset so they have to verify the new one.
  useEffect(() => {
    if (emailForVerification && form.values.email.trim() !== emailForVerification) {
      setEmailVerified(false);
      setVerificationToken(null);
      setCodeSent(false);
      setVerificationCode("");
      setVerifyError("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.values.email]);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const t = setTimeout(() => setResendCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [resendCooldown]);

  const handleSendCode = async () => {
    const email = form.values.email.trim();
    if (!EMAIL_REGEX.test(email)) {
      form.setFieldError("email", "Please enter a valid email address first");
      return;
    }
    setSendingCode(true);
    setVerifyError("");
    try {
      await api.post("/bookings/email/send-code", { email });
      setEmailForVerification(email);
      setCodeSent(true);
      setEmailVerified(false);
      setVerificationToken(null);
      setVerificationCode("");
      setResendCooldown(60);
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ??
        "Could not send a verification code. Please check the address and try again.";
      setVerifyError(typeof msg === "string" ? msg : JSON.stringify(msg));
    } finally {
      setSendingCode(false);
    }
  };

  const handleVerifyCode = async () => {
    if (verificationCode.trim().length !== 6) {
      setVerifyError("Enter the 6-digit code from your email.");
      return;
    }
    setVerifyingCode(true);
    setVerifyError("");
    try {
      const { data } = await api.post("/bookings/email/verify-code", {
        email: form.values.email.trim(),
        code: verificationCode.trim(),
      });
      setEmailVerified(true);
      setVerificationToken(data.token);
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? "That code didn't match. Please try again.";
      setVerifyError(typeof msg === "string" ? msg : JSON.stringify(msg));
    } finally {
      setVerifyingCode(false);
    }
  };

  const addonTotal = useMemo(() => {
    if (!tour) return 0;
    return (
      selectedAddonIndices.reduce(
        (sum, i) => sum + (tour.addons[i]?.price ?? 0),
        0,
      ) * form.values.travelers
    );
  }, [tour, selectedAddonIndices, form.values.travelers]);

  const baseTotal = (tour?.price ?? 0) * form.values.travelers;

  // Guarantees a guide for an exact preferred date — flexible bookings pay
  // nothing extra but wait for guide confirmation within their window.
  const isExactDate = form.values.dateFlexibility === "exact";
  const exactDateSurcharge = isExactDate ? baseTotal * EXACT_DATE_SURCHARGE_RATE : 0;

  const grandTotal = baseTotal + addonTotal + exactDateSurcharge;

  // The date the API will actually receive: for "exact" it's the picked
  // date as-is; for "flexible" we anchor on the 1st of the chosen month so
  // the backend/admin always has a concrete reference point, while
  // `flexibilityWindow` communicates how loose that anchor really is.
  const preferredDateForSubmit =
    form.values.dateFlexibility === "exact"
      ? form.values.preferredDate || undefined
      : form.values.preferredMonth
        ? `${form.values.preferredMonth}-01`
        : undefined;

  // Selecting a country auto-fills/replaces the leading dial code on
  // whichever phone-style fields already have one, so the person only
  // has to specify their country once instead of typing the code
  // themselves too. They can still freely edit the number afterward —
  // this just seeds a sensible starting point.
  const handleCountryChange = (countryName: string | null) => {
    if (!countryName) return;
    form.setFieldValue("country", countryName);

    const dialCode = dialCodeForCountry(countryName);
    if (!dialCode) return;

    const currentPhone = stripDialCode(form.values.phone);
    form.setFieldValue("phone", currentPhone ? `${dialCode} ${currentPhone}` : `${dialCode} `);

    const currentWhatsapp = stripDialCode(form.values.whatsappNumber);
    form.setFieldValue(
      "whatsappNumber",
      currentWhatsapp ? `${dialCode} ${currentWhatsapp}` : `${dialCode} `,
    );
  };

  const handleStep0 = () => {
    const result = form.validate();
    const fields = [
      "firstName",
      "lastName",
      "email",
      "phone",
      "country",
      "travelers",
      ...(form.values.contactMethod === "whatsapp" ? (["whatsappNumber"] as const) : []),
      ...(form.values.dateFlexibility === "exact"
        ? (["preferredDate"] as const)
        : (["preferredMonth"] as const)),
    ] as const;
    if (fields.some((f) => result.errors[f])) return;

    if (!authUser && !emailVerified) {
      setVerifyError("Please verify your email address before continuing.");
      return;
    }
    setStep(1);
  };

  const handleStep1 = () => {
    if (!agreed) {
      setAgreedError("You must accept the terms to continue");
      return;
    }
    setAgreedError("");
    setStep(2);
  };

  // Opens confirmation modal after validation
  const handlePayment = () => {
    // Defensive re-check: the step indicator lets users jump back to a
    // completed step and edit fields without re-running the full
    // form.validate() flow, so email could be invalid/unverified here even
    // though Step 0 was "passed" once already.
    if (!authUser && (!EMAIL_REGEX.test(form.values.email.trim()) || !emailVerified)) {
      setSubmitError("Please verify a valid email address before confirming your booking.");
      setStep(0);
      return;
    }

    if (payMethod === "Card") {
      if (selectedCardId !== "new") {
        if (!/^\d{3,4}$/.test(savedCardCvv)) {
          setSubmitError("Please enter the CVV for your saved card.");
          return;
        }
      } else {
        const result = form.validate();
        if (["cardNumber", "expiry", "cvv"].some((f) => result.errors[f])) return;
      }
    } else {
      if (!txFile) {
        setTxFileError(
          "Please upload your transaction receipt PDF to continue",
        );
        return;
      }
    }
    setTxFileError("");
    setSubmitError("");
    setConfirmOpen(true);
  };

  // Actual submission — called from inside the confirmation modal
  const doPayment = async () => {
    // Final guard: never let an unverified/invalid email reach the
    // booking API, even if this is somehow called without going through
    // handlePayment first.
    if (!authUser && (!EMAIL_REGEX.test(form.values.email.trim()) || !emailVerified || !verificationToken)) {
      setConfirmOpen(false);
      setSubmitError("Please verify a valid email address before confirming your booking.");
      setStep(0);
      return;
    }

    setConfirmOpen(false);
    setSubmitting(true);
    setSubmitError("");

    try {
      let cardPaymentToken: string | undefined;

      // Card gets the same "prove payment happened" treatment Khalti/eSewa
      // get via receipt upload: attempt a (test-mode) charge and require
      // it to succeed, obtaining a signed token as proof. The token — not
      // any raw card fields — is what the booking API trusts.
      if (payMethod === "Card") {
        try {
          if (selectedCardId !== "new") {
            const { data: charge } = await api.post(
              `/payments/cards/${selectedCardId}/charge`,
              { cvv: savedCardCvv, amount: grandTotal },
            );
            cardPaymentToken = charge.token;
          } else {
            const { data: charge } = await api.post("/payments/card/charge", {
              cardNumber: form.values.cardNumber.replace(/\s/g, ""),
              expiry: form.values.expiry,
              cvv: form.values.cvv,
              amount: grandTotal,
              saveCard: !!authUser && saveNewCard,
            });
            cardPaymentToken = charge.token;
          }
        } catch (err: any) {
          const msg =
            err?.response?.data?.message ??
            "Card payment failed. Please check your card details and try again.";
          setSubmitError(typeof msg === "string" ? msg : JSON.stringify(msg));
          setSubmitting(false);
          setStep(2);
          return;
        }
      }

      const selectedAddons = selectedAddonIndices
        .map((i) => tour?.addons[i])
        .filter(Boolean)
        .map((a) => ({ name: a!.name, price: a!.price }));

      const { data: booking } = await api.post("/bookings", {
        tourId: Number(tourId),
        firstName: form.values.firstName,
        lastName: form.values.lastName,
        email: form.values.email,
        phone: form.values.phone,
        country: form.values.country,
        travelers: form.values.travelers,
        notes: form.values.requests || undefined,
        paymentMethod: payMethod,
        tourPrice: tour?.price ?? 0,
        addonsTotal: addonTotal,
        dateSurcharge: exactDateSurcharge,
        totalAmount: grandTotal,
        selectedAddons,
        contactMethod: form.values.contactMethod,
        contactValue:
          form.values.contactMethod === "whatsapp"
            ? form.values.whatsappNumber
            : form.values.email,
        emailVerificationToken: authUser ? undefined : (verificationToken ?? undefined),
        cardPaymentToken,
        // ── Preferred start timing ──
        preferredDate: preferredDateForSubmit,
        dateFlexibility: form.values.dateFlexibility,
        flexibilityWindow:
          form.values.dateFlexibility === "flexible"
            ? form.values.flexibilityWindow
            : undefined,
        dateNotes: form.values.dateNotes || undefined,
      });

      if ((payMethod === "Khalti" || payMethod === "eSewa") && txFile) {
        const formData = new FormData();
        formData.append("receipt", txFile);
        await api.post(`/bookings/${booking.id}/receipt`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }

      // Card details never need to leave this device beyond the charge
      // call above — clear them from state now that they're no longer
      // needed.
      form.setFieldValue("cardNumber", "");
      form.setFieldValue("cvv", "");
      setSavedCardCvv("");

      try {
        sessionStorage.setItem(
          "bookingDetails",
          JSON.stringify({
            bookingId: booking.id,
            tourName: tour?.name,
            duration: tour?.duration,
            travelers: form.values.travelers,
            grandTotal,
            email: form.values.email,
            payMethod,
            preferredTiming: formatPreferredTiming(form.values),
          }),
        );
      } catch {}

      router.push("/checkout/payment-success");
    } catch (err: any) {
      const raw = err?.response?.data?.message;
      const msg = Array.isArray(raw)
        ? raw.join(", ")
        : (raw ?? "Something went wrong. Please try again.");
      setSubmitError(typeof msg === "string" ? msg : JSON.stringify(msg));
    } finally {
      setSubmitting(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    if (file && file.type !== "application/pdf") {
      setTxFileError("Only PDF files are accepted");
      setTxFile(null);
      return;
    }
    if (file && file.size > 10 * 1024 * 1024) {
      setTxFileError("File must be smaller than 10 MB");
      setTxFile(null);
      return;
    }
    setTxFile(file);
    setTxFileError("");
  };

  const inputStyles = {
    input: {
      background: "var(--mantine-color-gray-0)",
      border: "1.5px solid var(--mantine-color-gray-3)",
      borderRadius: rem(12),
      fontSize: rem(14),
      color: "var(--mantine-color-dark-8)",
      transition: "all 0.2s ease",
      "&:focus": {
        borderColor: "var(--mantine-color-blue-5)",
        boxShadow: "0 0 0 3px rgba(46,134,193,0.12)",
      },
      "&::placeholder": { color: "var(--mantine-color-gray-5)" },
    },
    label: {
      fontSize: rem(11),
      fontWeight: 700,
      letterSpacing: "0.1em",
      textTransform: "uppercase" as const,
      color: "var(--mantine-color-gray-6)",
      marginBottom: rem(6),
    },
    error: { fontSize: rem(12), marginTop: rem(4) },
  };

  if (tourLoading)
    return (
      <>
        <Header />
        <main className="min-h-screen bg-mist pt-[68px] flex items-center justify-center">
          <Loader size="lg" color="blue" />
        </main>
        <Footer />
      </>
    );
  if (!tour)
    return (
      <>
        <Header />
        <main className="min-h-screen bg-mist pt-[68px] flex items-center justify-center px-6">
          <div className="text-center">
            <div className="text-[3rem] mb-4">🏔️</div>
            <h2 className="font-serif text-[1.8rem] font-light text-ink mb-3">
              No tour selected
            </h2>
            <p className="text-[0.9rem] text-stone font-light mb-6">
              Please go back and select a tour to book.
            </p>
            <Link
              href="/"
              className="bg-sky-accent text-white px-7 py-3 rounded-full text-[0.9rem] font-medium hover:bg-sky-dark transition-colors no-underline"
            >
              Browse Tours
            </Link>
          </div>
        </main>
        <Footer />
      </>
    );

  const preferredTimingDisplay = formatPreferredTiming(form.values);

  return (
    <>
      <Header />

      {/* ── Sign in or continue as guest — shown once per session for
          logged-out visitors, right when checkout starts ── */}
      {authChecked && showGuestPrompt && (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center bg-black/40 px-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="guest-prompt-title"
          onClick={dismissGuestPrompt}
        >
          <div
            className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-7 text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-[2.2rem] mb-3">🔑</div>
            <h3 id="guest-prompt-title" className="font-serif text-lg font-semibold text-ink mb-2">
              Sign in for a smoother checkout
            </h3>
            <p className="text-sm text-stone mb-6 leading-relaxed">
              Signed-in bookings are saved to your account, your details autofill next time,
              and you can save a card for faster payment. Or just continue as a guest — that works too.
            </p>
            <div className="flex flex-col gap-2.5">
              <Link
                href={`/user/login?redirect=${encodeURIComponent(`/checkout?${params.toString()}`)}`}
                onClick={dismissGuestPrompt}
                className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium text-white bg-sky-accent hover:bg-sky-dark transition-colors no-underline"
              >
                <IconLogin size={16} /> Sign in
              </Link>
              <Link
                href={`/user/signup?redirect=${encodeURIComponent(`/checkout?${params.toString()}`)}`}
                onClick={dismissGuestPrompt}
                className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium text-ink border border-sky-mid/30 hover:bg-sky-light transition-colors no-underline"
              >
                Create an account
              </Link>
              <button
                type="button"
                onClick={dismissGuestPrompt}
                className="px-4 py-2.5 rounded-full text-sm font-medium text-stone hover:bg-sky-light transition-colors"
              >
                Continue as guest
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Confirmation Modal ── */}
      <Modal
        opened={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        centered
        radius="xl"
        size="md"
        padding={0}
        withCloseButton={false}
        overlayProps={{ backgroundOpacity: 0.45, blur: 4 }}
        styles={{
          content: {
            overflow: "hidden",
            border: "1px solid rgba(46,134,193,0.18)",
            display: "flex",
            flexDirection: "column",
            maxHeight: "90vh",
          },
          body: {
            display: "flex",
            flexDirection: "column",
            flex: 1,
            minHeight: 0,
            padding: 0,
          },
        }}
      >
        {/* Gradient header band — stays fixed at the top */}
        <Box
          style={{
            flexShrink: 0,
            background:
              "linear-gradient(135deg, #0f4c81 0%, #1a6ea8 50%, #2e86c1 100%)",
            padding: `${rem(28)} ${rem(32)} ${rem(24)}`,
          }}
        >
          <Group gap={14}>
            <ThemeIcon
              size={46}
              radius="xl"
              style={{
                background: "rgba(255,255,255,0.15)",
                backdropFilter: "blur(8px)",
                border: "1px solid rgba(255,255,255,0.2)",
                flexShrink: 0,
              }}
            >
              <IconShieldCheck size={22} color="white" />
            </ThemeIcon>
            <div>
              <Text ff="serif" fz={22} fw={400} c="white" lh={1.15}>
                Confirm Your Booking
              </Text>
              <Text fz={12} c="rgba(255,255,255,0.65)" fw={300} mt={2}>
                Please review the details below before we confirm.
              </Text>
            </div>
          </Group>
        </Box>

        {/* Scrollable body — everything except the header/footer scrolls
            if it doesn't fit, so the action buttons below are never
            pushed off-screen regardless of how many add-ons/fees show up. */}
        <Box
          style={{
            flex: 1,
            minHeight: 0,
            overflowY: "auto",
            padding: `${rem(24)} ${rem(32)} ${rem(4)}`,
          }}
        >
          {/* Summary rows */}
          <Box
            p="lg"
            mb="lg"
            style={{
              background: "linear-gradient(135deg, #f0f8ff 0%, #e8f4fc 100%)",
              borderRadius: rem(16),
              border: "1px solid rgba(46,134,193,0.12)",
            }}
          >
            <Stack gap={10}>
              {(
                [
                  ["Tour", tour.name],
                  ["Duration", tour.duration],
                  [
                    "Traveler",
                    `${form.values.firstName} ${form.values.lastName}`,
                  ],
                  ["Email", form.values.email],
                  [
                    "Contact via",
                    form.values.contactMethod === "whatsapp"
                      ? `WhatsApp (${form.values.whatsappNumber})`
                      : "Email",
                  ],
                  [
                    "Travelers",
                    `${form.values.travelers} ${form.values.travelers === 1 ? "person" : "people"}`,
                  ],
                  ["Preferred start", preferredTimingDisplay],
                  ["Payment", payMethod],
                ] as [string, string][]
              ).map(([k, v]) => (
                <Group key={k} justify="space-between" wrap="nowrap">
                  <Text fz={13} c="dimmed" fw={300} style={{ flexShrink: 0 }}>
                    {k}
                  </Text>
                  <Text
                    fz={13}
                    fw={500}
                    c="dark.7"
                    ta="right"
                    style={{
                      maxWidth: "65%",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {v || "—"}
                  </Text>
                </Group>
              ))}

              {selectedAddonIndices.length > 0 && (
                <>
                  <Divider color="rgba(46,134,193,0.12)" />
                  <Group justify="space-between" wrap="nowrap" align="start">
                    <Text fz={13} c="dimmed" fw={300} style={{ flexShrink: 0 }}>
                      Add-ons
                    </Text>
                    <Text
                      fz={13}
                      fw={500}
                      c="dark.7"
                      ta="right"
                      style={{ maxWidth: "65%" }}
                    >
                      {selectedAddonIndices
                        .map((i) => tour.addons[i]?.name)
                        .filter(Boolean)
                        .join(", ")}
                    </Text>
                  </Group>
                </>
              )}

              {exactDateSurcharge > 0 && (
                <Group justify="space-between">
                  <Text fz={13} c="dimmed" fw={300}>
                    Exact date guarantee fee
                  </Text>
                  <Text fz={13} fw={500} c="orange.6">
                    +${exactDateSurcharge.toLocaleString()}
                  </Text>
                </Group>
              )}

              <Divider color="rgba(46,134,193,0.2)" />

              {/* Total highlighted */}
              <Group justify="space-between" align="flex-end">
                <Text fz={13} c="dimmed" fw={300}>
                  Total due
                </Text>
                <Text
                  ff="serif"
                  fz={28}
                  fw={600}
                  style={{
                    background: "linear-gradient(135deg, #2e86c1, #0f4c81)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    lineHeight: 1,
                  }}
                >
                  ${grandTotal.toLocaleString()}
                </Text>
              </Group>
            </Stack>
          </Box>

          {/* Cancellation + guide-coordination note */}
          <Box
            p="sm"
            mb="lg"
            style={{
              background: "linear-gradient(135deg, #f0f8ff, #e8f4fc)",
              borderRadius: rem(10),
              border: "1px solid rgba(46,134,193,0.15)",
            }}
          >
            <Stack gap={6}>
              <Group gap={6}>
                <IconShieldCheck size={13} color="#2e86c1" />
                <Text fz={12} c="blue.7" fw={400}>
                  Free cancellation up to 14 days before departure
                </Text>
              </Group>
              <Group gap={6} align="flex-start">
                <IconCalendarTime size={13} color="#2e86c1" style={{ marginTop: 2, flexShrink: 0 }} />
                <Text fz={12} c="blue.7" fw={400}>
                  {isExactDate ? (
                    <>
                      A guide is guaranteed for{" "}
                      <Text span fw={700}>{preferredTimingDisplay}</Text>{" — "}
                      we'll follow up shortly to finalize arrangements.
                    </>
                  ) : (
                    <>
                      We'll reach out to our local guides to confirm your
                      exact departure date around{" "}
                      <Text span fw={700}>{preferredTimingDisplay}</Text>.
                    </>
                  )}
                </Text>
              </Group>
            </Stack>
          </Box>
        </Box>

        {/* Actions — pinned below the scroll area, always visible even
            when the summary above doesn't fully fit on screen. */}
        <Box
          style={{
            flexShrink: 0,
            padding: `${rem(16)} ${rem(32)} ${rem(24)}`,
            borderTop: "1px solid rgba(46,134,193,0.12)",
            background: "white",
          }}
        >
          <Group gap="sm">
            <Button
              flex={1}
              size="md"
              radius="xl"
              variant="light"
              color="gray"
              leftSection={<IconArrowLeft size={15} />}
              onClick={() => setConfirmOpen(false)}
              styles={{
                root: {
                  border: "1px solid rgba(46,134,193,0.2)",
                  color: "#5a6a7a",
                  height: rem(48),
                  fontSize: rem(13),
                },
              }}
            >
              Go Back
            </Button>
            <Button
              flex={2}
              size="md"
              radius="xl"
              rightSection={<IconShieldCheck size={17} />}
              onClick={doPayment}
              style={{
                background: "linear-gradient(135deg, #2e86c1, #0f4c81)",
                boxShadow: "0 8px 24px rgba(46,134,193,0.35)",
                height: rem(48),
                fontSize: rem(14),
                fontWeight: 500,
              }}
            >
              Yes, Confirm Booking
            </Button>
          </Group>
        </Box>
      </Modal>

      <main className="min-h-screen bg-mist pt-[68px]">
        {/* Step indicator */}
        <div
          style={{
            background:
              "linear-gradient(135deg, #0f4c81 0%, #1a6ea8 50%, #2e86c1 100%)",
            borderBottom: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          <div className="max-w-4xl mx-auto px-6 md:px-12 py-6">
            <div style={{ display: "flex", alignItems: "center" }}>
              {["Your Details", "Review", "Payment"].map((label, i) => {
                const isCompleted = i < step;
                const isActive = i === step;
                return (
                  <div
                    key={label}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      flex: i < 2 ? 1 : "none",
                    }}
                  >
                    <button
                      onClick={() => isCompleted && setStep(i)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: rem(10),
                        background: "none",
                        border: "none",
                        cursor: isCompleted ? "pointer" : "default",
                        padding: 0,
                      }}
                    >
                      <span
                        style={{
                          width: rem(32),
                          height: rem(32),
                          borderRadius: "50%",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: rem(13),
                          fontWeight: 700,
                          flexShrink: 0,
                          background: isActive
                            ? "rgba(255,255,255,0.95)"
                            : isCompleted
                              ? "rgba(255,255,255,0.25)"
                              : "rgba(255,255,255,0.1)",
                          border: isActive
                            ? "2px solid white"
                            : isCompleted
                              ? "2px solid rgba(255,255,255,0.6)"
                              : "2px solid rgba(255,255,255,0.25)",
                          color: isActive
                            ? "#0f4c81"
                            : "rgba(255,255,255,0.85)",
                          transition: "all 0.2s ease",
                        }}
                      >
                        {isCompleted ? "✓" : i + 1}
                      </span>
                      <span
                        style={{
                          fontSize: rem(12),
                          fontWeight: 600,
                          letterSpacing: "0.08em",
                          textTransform: "uppercase",
                          display: "none",
                          color: isActive ? "#fff" : "rgba(255,255,255,0.6)",
                        }}
                        className="sm:inline-block"
                      >
                        {label}
                      </span>
                    </button>
                    {i < 2 && (
                      <div
                        style={{
                          flex: 1,
                          height: rem(1),
                          margin: `0 ${rem(12)}`,
                          background: isCompleted
                            ? "rgba(255,255,255,0.5)"
                            : "rgba(255,255,255,0.2)",
                          transition: "background 0.3s ease",
                        }}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-6 md:px-12 py-10 grid lg:grid-cols-[1fr_340px] gap-8 items-start">
          {/* Step 0 */}
          {step === 0 && (
            <Paper
              shadow="sm"
              radius="xl"
              p={{ base: "xl", md: 40 }}
              style={{ border: "1px solid rgba(46,134,193,0.12)" }}
            >
              <Group mb={4} gap={10}>
                <ThemeIcon
                  size={38}
                  radius="xl"
                  variant="gradient"
                  gradient={{ from: "#2e86c1", to: "#0f4c81", deg: 135 }}
                >
                  <IconUser size={18} />
                </ThemeIcon>
                <div>
                  <Text ff="serif" fz={28} fw={300} c="dark.8" lh={1.1}>
                    Your Details
                  </Text>
                  <Text fz={13} c="dimmed" fw={300}>
                    Tell us who's joining this adventure.
                  </Text>
                </div>
              </Group>
              <Divider my="lg" color="rgba(46,134,193,0.1)" />
              <Stack gap="md">
                <Group grow gap="md">
                  <TextInput
                    label="First Name"
                    placeholder="Jane"
                    leftSection={<IconUser size={15} />}
                    {...form.getInputProps("firstName")}
                    styles={inputStyles}
                  />
                  <TextInput
                    label="Last Name"
                    placeholder="Doe"
                    leftSection={<IconUser size={15} />}
                    {...form.getInputProps("lastName")}
                    styles={inputStyles}
                  />
                </Group>
                <Group grow gap="md">
                  <TextInput
                    label="Email Address"
                    placeholder="jane@example.com"
                    type="email"
                    leftSection={<IconMail size={15} />}
                    {...form.getInputProps("email")}
                    styles={inputStyles}
                  />
                  <TextInput
                    label="Phone Number"
                    placeholder="+1 234 567 8900"
                    leftSection={<IconPhone size={15} />}
                    {...form.getInputProps("phone")}
                    styles={inputStyles}
                  />
                </Group>

                {/* ── Email verification ── */}
                {authUser ? (
                  <Box
                    p="md"
                    style={{
                      background: "linear-gradient(135deg, #f0fff4, #e8faf0)",
                      border: "1.5px solid rgba(39,174,96,0.35)",
                      borderRadius: rem(14),
                    }}
                  >
                    <Group gap={6}>
                      <IconCheck size={16} color="#10b981" />
                      <Text fz={13} c="teal.7" fw={600}>
                        Email verified via your account
                      </Text>
                    </Group>
                  </Box>
                ) : (
                <Box
                  p="md"
                  style={{
                    background: emailVerified
                      ? "linear-gradient(135deg, #f0fff4, #e8faf0)"
                      : "linear-gradient(135deg, #f8fafc, #f1f5f9)",
                    border: emailVerified
                      ? "1.5px solid rgba(39,174,96,0.35)"
                      : "1.5px solid rgba(46,134,193,0.15)",
                    borderRadius: rem(14),
                  }}
                >
                  <Group justify="space-between" align="center" wrap="nowrap">
                    <Box style={{ flex: 1 }}>
                      {emailVerified ? (
                        <Group gap={6}>
                          <IconCheck size={16} color="#10b981" />
                          <Text fz={13} c="teal.7" fw={600}>
                            Email verified
                          </Text>
                        </Group>
                      ) : (
                        <Text fz={12} c="dimmed" fw={300}>
                          {codeSent
                            ? `We sent a 6-digit code to ${emailForVerification}. Enter it below to confirm this email exists.`
                            : "We'll send a code to confirm this email address actually exists before you can book."}
                        </Text>
                      )}
                    </Box>
                    {!emailVerified && (
                      <Button
                        variant="light"
                        size="xs"
                        radius="xl"
                        loading={sendingCode}
                        disabled={resendCooldown > 0}
                        onClick={handleSendCode}
                        style={{ flexShrink: 0 }}
                      >
                        {codeSent
                          ? resendCooldown > 0
                            ? `Resend in ${resendCooldown}s`
                            : "Resend code"
                          : "Send code"}
                      </Button>
                    )}
                  </Group>

                  {codeSent && !emailVerified && (
                    <Group gap={8} mt={10} align="flex-end">
                      <TextInput
                        placeholder="6-digit code"
                        maxLength={6}
                        value={verificationCode}
                        onChange={(e) =>
                          setVerificationCode(e.target.value.replace(/\D/g, "").slice(0, 6))
                        }
                        style={{ flex: 1 }}
                        styles={inputStyles}
                      />
                      <Button
                        radius="xl"
                        size="sm"
                        loading={verifyingCode}
                        onClick={handleVerifyCode}
                        style={{ background: "linear-gradient(135deg, #2e86c1, #0f4c81)" }}
                      >
                        Verify
                      </Button>
                    </Group>
                  )}
                  {verifyError && (
                    <Text fz={12} c="red.6" mt={8}>
                      {verifyError}
                    </Text>
                  )}
                </Box>
                )}

                <Group grow gap="md">
                  <Select
                    label="Country of Residence"
                    placeholder="Select your country"
                    leftSection={<IconWorld size={15} />}
                    data={COUNTRY_NAMES}
                    searchable
                    nothingFoundMessage="No country found"
                    value={form.values.country || null}
                    onChange={handleCountryChange}
                    error={form.errors.country}
                    styles={inputStyles}
                  />
                  <NumberInput
                    label="Number of Travelers"
                    min={1}
                    max={100}
                    leftSection={<IconUsers size={15} />}
                    {...form.getInputProps("travelers")}
                    styles={inputStyles}
                  />
                </Group>

                {/* ── Preferred start date / timeframe ── */}
                <Box>
                  <Group justify="space-between" mb={8}>
                    <Text
                      fz={11}
                      fw={700}
                      c="gray.6"
                      style={{ letterSpacing: "0.1em", textTransform: "uppercase" }}
                    >
                      When would you like to start?
                    </Text>
                    {isExactDate && exactDateSurcharge > 0 && (
                      <Text fz={11} fw={700} c="orange.6">
                        +${exactDateSurcharge.toLocaleString()} guarantee fee
                      </Text>
                    )}
                  </Group>
                  <Group grow gap="sm" mb="sm">
                    {(["exact", "flexible"] as const).map((opt) => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => form.setFieldValue("dateFlexibility", opt)}
                        style={{
                          border:
                            form.values.dateFlexibility === opt
                              ? "2px solid #2e86c1"
                              : "1.5px solid rgba(46,134,193,0.2)",
                          borderRadius: rem(14),
                          padding: `${rem(12)} ${rem(8)}`,
                          fontSize: rem(13),
                          fontWeight: 600,
                          color:
                            form.values.dateFlexibility === opt
                              ? "#1a6ea8"
                              : "#6b7c8d",
                          background:
                            form.values.dateFlexibility === opt
                              ? "linear-gradient(135deg, #f0f8ff, #e0f0fa)"
                              : "transparent",
                          cursor: "pointer",
                          transition: "all 0.2s ease",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: rem(8),
                        }}
                      >
                        {opt === "exact" ? (
                          <IconCalendarEvent size={16} />
                        ) : (
                          <IconCalendarTime size={16} />
                        )}
                        {opt === "exact" ? "I have an exact date" : "I'm flexible"}
                      </button>
                    ))}
                  </Group>

                  {form.values.dateFlexibility === "exact" ? (
                    <TextInput
                      type="date"
                      label="Preferred start date"
                      min={todayISO}
                      leftSection={<IconCalendarEvent size={15} />}
                      {...form.getInputProps("preferredDate")}
                      styles={inputStyles}
                    />
                  ) : (
                    <Stack gap="sm">
                      <TextInput
                        type="month"
                        label="Preferred month"
                        min={todayMonthISO}
                        leftSection={<IconCalendarTime size={15} />}
                        {...form.getInputProps("preferredMonth")}
                        styles={inputStyles}
                      />
                      <Box>
                        <Text
                          fz={11}
                          fw={700}
                          c="gray.6"
                          mb={6}
                          style={{ letterSpacing: "0.1em", textTransform: "uppercase" }}
                        >
                          How flexible?
                        </Text>
                        <Group gap={8}>
                          {FLEXIBILITY_WINDOWS.map((w) => (
                            <button
                              key={w}
                              type="button"
                              onClick={() => form.setFieldValue("flexibilityWindow", w)}
                              style={{
                                border:
                                  form.values.flexibilityWindow === w
                                    ? "2px solid #2e86c1"
                                    : "1.5px solid rgba(46,134,193,0.2)",
                                borderRadius: rem(20),
                                padding: `${rem(6)} ${rem(14)}`,
                                fontSize: rem(12),
                                fontWeight: 600,
                                color:
                                  form.values.flexibilityWindow === w
                                    ? "#1a6ea8"
                                    : "#6b7c8d",
                                background:
                                  form.values.flexibilityWindow === w
                                    ? "linear-gradient(135deg, #f0f8ff, #e0f0fa)"
                                    : "transparent",
                                cursor: "pointer",
                                transition: "all 0.2s ease",
                              }}
                            >
                              {w}
                            </button>
                          ))}
                        </Group>
                      </Box>
                    </Stack>
                  )}

                  <Text fz={11} c="dimmed" fw={300} mt={8} lh={1.5}>
                    {isExactDate
                      ? "An exact date guarantees a dedicated local guide for your trip on this date — a small guarantee fee applies, shown in your total below. Our team will follow up to finalize arrangements."
                      : "We'll coordinate with our trusted local guides within this window and confirm your exact departure date shortly after booking."}
                  </Text>
                </Box>

                {/* ── Preferred contact method ── */}
                <Box>
                  <Text
                    fz={11}
                    fw={700}
                    c="gray.6"
                    mb={8}
                    style={{ letterSpacing: "0.1em", textTransform: "uppercase" }}
                  >
                    How should we contact you after booking?
                  </Text>
                  <Group grow gap="sm">
                    {(["email", "whatsapp"] as const).map((m) => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => form.setFieldValue("contactMethod", m)}
                        style={{
                          border:
                            form.values.contactMethod === m
                              ? "2px solid #2e86c1"
                              : "1.5px solid rgba(46,134,193,0.2)",
                          borderRadius: rem(14),
                          padding: `${rem(12)} ${rem(8)}`,
                          fontSize: rem(13),
                          fontWeight: 600,
                          color: form.values.contactMethod === m ? "#1a6ea8" : "#6b7c8d",
                          background:
                            form.values.contactMethod === m
                              ? "linear-gradient(135deg, #f0f8ff, #e0f0fa)"
                              : "transparent",
                          cursor: "pointer",
                          transition: "all 0.2s ease",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: rem(8),
                        }}
                      >
                        {m === "email" ? <IconMail size={16} /> : <IconBrandWhatsapp size={16} />}
                        {m === "email" ? "Email" : "WhatsApp"}
                      </button>
                    ))}
                  </Group>
                  {form.values.contactMethod === "whatsapp" && (
                    <TextInput
                      mt="sm"
                      label="WhatsApp Number"
                      placeholder="+1 234 567 8900"
                      leftSection={<IconBrandWhatsapp size={15} />}
                      {...form.getInputProps("whatsappNumber")}
                      styles={inputStyles}
                    />
                  )}
                </Box>

                <Textarea
                  label={
                    <Group gap={6}>
                      Special Requests{" "}
                      <Text
                        span
                        fz={11}
                        c="dimmed"
                        fw={400}
                        style={{ textTransform: "none", letterSpacing: 0 }}
                      >
                        (optional)
                      </Text>
                    </Group>
                  }
                  placeholder="Dietary needs, accessibility requirements, etc."
                  rows={3}
                  leftSection={
                    <IconNotes size={15} style={{ marginTop: rem(10) }} />
                  }
                  {...form.getInputProps("requests")}
                  styles={{
                    ...inputStyles,
                    input: { ...inputStyles.input, resize: "none" as const },
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
                  background: "linear-gradient(135deg, #2e86c1, #0f4c81)",
                  boxShadow: "0 8px 28px rgba(46,134,193,0.35)",
                  fontSize: rem(15),
                  fontWeight: 500,
                  letterSpacing: "0.02em",
                  height: rem(52),
                }}
              >
                Continue to Review
              </Button>
            </Paper>
          )}

          {/* Step 1 */}
          {step === 1 && (
            <Paper
              shadow="sm"
              radius="xl"
              p={{ base: "xl", md: 40 }}
              style={{ border: "1px solid rgba(46,134,193,0.12)" }}
            >
              <Group mb={4} gap={10}>
                <ThemeIcon
                  size={38}
                  radius="xl"
                  variant="gradient"
                  gradient={{ from: "#2e86c1", to: "#0f4c81", deg: 135 }}
                >
                  <IconCheck size={18} />
                </ThemeIcon>
                <div>
                  <Text ff="serif" fz={28} fw={300} c="dark.8" lh={1.1}>
                    Review Your Booking
                  </Text>
                  <Text fz={13} c="dimmed" fw={300}>
                    Please check all details before proceeding.
                  </Text>
                </div>
              </Group>
              <Divider my="lg" color="rgba(46,134,193,0.1)" />
              <Box
                p="lg"
                mb="lg"
                style={{
                  background:
                    "linear-gradient(135deg, #f0f8ff 0%, #e8f4fc 100%)",
                  borderRadius: rem(16),
                  border: "1px solid rgba(46,134,193,0.12)",
                }}
              >
                <Stack gap={10}>
                  {(
                    [
                      ["Tour", tour.name],
                      ["Duration", tour.duration],
                      ["Difficulty", diffMap[tour.difficulty]],
                      [
                        "Name",
                        `${form.values.firstName} ${form.values.lastName}`,
                      ],
                      ["Email", form.values.email],
                      ["Phone", form.values.phone],
                      ["Country", form.values.country],
                      ["Travelers", String(form.values.travelers)],
                      [
                        "Contact via",
                        form.values.contactMethod === "whatsapp"
                          ? `WhatsApp (${form.values.whatsappNumber})`
                          : "Email",
                      ],
                      ["Preferred start", preferredTimingDisplay],
                    ] as [string, string][]
                  ).map(([k, v]) => (
                    <Group key={k} justify="space-between" wrap="nowrap">
                      <Text fz={13} c="dimmed" fw={300}>
                        {k}
                      </Text>
                      {k === "Difficulty" ? (
                        <Badge
                          color={diffColor[tour.difficulty]}
                          variant="light"
                          size="sm"
                          radius="sm"
                        >
                          {v || "—"}
                        </Badge>
                      ) : (
                        <Text
                          fz={13}
                          fw={500}
                          c="dark.7"
                          ta="right"
                          style={{ maxWidth: "60%" }}
                        >
                          {v || "—"}
                        </Text>
                      )}
                    </Group>
                  ))}
                  {selectedAddonIndices.length > 0 && (
                    <>
                      <Divider color="rgba(46,134,193,0.12)" />
                      <Group
                        justify="space-between"
                        wrap="nowrap"
                        align="start"
                      >
                        <Text fz={13} c="dimmed" fw={300}>
                          Add-ons
                        </Text>
                        <Text
                          fz={13}
                          fw={500}
                          c="dark.7"
                          ta="right"
                          style={{ maxWidth: "60%" }}
                        >
                          {selectedAddonIndices
                            .map((i) => tour.addons[i]?.name)
                            .filter(Boolean)
                            .join(", ")}
                        </Text>
                      </Group>
                    </>
                  )}
                  {exactDateSurcharge > 0 && (
                    <>
                      <Divider color="rgba(46,134,193,0.12)" />
                      <Group justify="space-between">
                        <Text fz={13} c="dimmed" fw={300}>
                          Exact date guarantee fee
                        </Text>
                        <Text fz={13} fw={500} c="orange.6">
                          +${exactDateSurcharge.toLocaleString()}
                        </Text>
                      </Group>
                    </>
                  )}
                </Stack>
              </Box>
              <Box mb="xl">
                <Checkbox
                  checked={agreed}
                  onChange={(e) => {
                    setAgreed(e.currentTarget.checked);
                    if (e.currentTarget.checked) setAgreedError("");
                  }}
                  error={agreedError}
                  label={
                    <Text fz={13} c="dimmed" fw={300} lh={1.6}>
                      I agree to the{" "}
                      <Text
                        span
                        c="blue.6"
                        style={{ cursor: "pointer" }}
                        component="a"
                        href="#"
                      >
                        Terms of Service
                      </Text>{" "}
                      and{" "}
                      <Text
                        span
                        c="blue.6"
                        style={{ cursor: "pointer" }}
                        component="a"
                        href="#"
                      >
                        Cancellation Policy
                      </Text>
                      .
                    </Text>
                  }
                  styles={{
                    input: {
                      borderColor: agreed
                        ? "var(--mantine-color-blue-5)"
                        : "var(--mantine-color-gray-4)",
                      borderRadius: rem(5),
                      cursor: "pointer",
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
                      border: "1px solid rgba(46,134,193,0.2)",
                      color: "#5a6a7a",
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
                    background: agreed
                      ? "linear-gradient(135deg, #2e86c1, #0f4c81)"
                      : undefined,
                    boxShadow: agreed
                      ? "0 8px 28px rgba(46,134,193,0.3)"
                      : undefined,
                    height: rem(52),
                    fontSize: rem(15),
                    fontWeight: 500,
                  }}
                  color={agreed ? undefined : "gray"}
                  variant={agreed ? "filled" : "light"}
                >
                  Proceed to Payment
                </Button>
              </Group>
            </Paper>
          )}

          {/* Step 2 */}
          {step === 2 && (
            <Paper
              shadow="sm"
              radius="xl"
              p={{ base: "xl", md: 40 }}
              style={{ border: "1px solid rgba(46,134,193,0.12)" }}
            >
              <Group mb={4} gap={10}>
                <ThemeIcon
                  size={38}
                  radius="xl"
                  variant="gradient"
                  gradient={{ from: "#2e86c1", to: "#0f4c81", deg: 135 }}
                >
                  <IconCreditCard size={18} />
                </ThemeIcon>
                <div>
                  <Text ff="serif" fz={28} fw={300} c="dark.8" lh={1.1}>
                    Payment
                  </Text>
                  <Text fz={13} c="dimmed" fw={300}>
                    Complete your booking securely.
                  </Text>
                </div>
              </Group>
              <Divider my="lg" color="rgba(46,134,193,0.1)" />
              <Group grow gap="sm" mb="xl">
                {(["Khalti", "eSewa", "Card"] as const).map((m) => (
                  <button
                    key={m}
                    onClick={() => {
                      setPayMethod(m);
                      setTxFile(null);
                      setTxFileError("");
                      setSubmitError("");
                    }}
                    style={{
                      border:
                        payMethod === m
                          ? "2px solid #2e86c1"
                          : "1.5px solid rgba(46,134,193,0.2)",
                      borderRadius: rem(14),
                      padding: `${rem(14)} ${rem(8)}`,
                      fontSize: rem(13),
                      fontWeight: 600,
                      color: payMethod === m ? "#1a6ea8" : "#6b7c8d",
                      background:
                        payMethod === m
                          ? "linear-gradient(135deg, #f0f8ff, #e0f0fa)"
                          : "transparent",
                      cursor: "pointer",
                      transition: "all 0.2s ease",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: rem(4),
                    }}
                  >
                    <span style={{ fontSize: rem(22) }}>
                      {m === "Khalti" ? "💜" : m === "eSewa" ? "💚" : "💳"}
                    </span>
                    {m}
                  </button>
                ))}
              </Group>

              {payMethod === "Card" && (
                <Stack gap="md" mb="xl">
                  {authUser && savedCards.length > 0 && (
                    <Box>
                      <Text fz={11} fw={700} c="gray.6" mb={8} style={{ letterSpacing: "0.1em", textTransform: "uppercase" }}>
                        Saved Cards
                      </Text>
                      <Stack gap={8}>
                        {savedCards.map((c) => (
                          <button
                            key={c.id}
                            type="button"
                            onClick={() => setSelectedCardId(c.id)}
                            style={{
                              display: "flex", alignItems: "center", justifyContent: "space-between",
                              border: selectedCardId === c.id ? "2px solid #2e86c1" : "1.5px solid rgba(46,134,193,0.2)",
                              borderRadius: rem(12),
                              padding: `${rem(10)} ${rem(14)}`,
                              background: selectedCardId === c.id ? "linear-gradient(135deg, #f0f8ff, #e0f0fa)" : "white",
                              cursor: "pointer",
                              transition: "all 0.2s ease",
                              width: "100%",
                            }}
                          >
                            <Group gap={10}>
                              <IconCreditCard size={16} color={selectedCardId === c.id ? "#1a6ea8" : "#94a3b8"} />
                              <Text fz={13} fw={600} c="dark.7">
                                {c.brand} •••• {c.last4}
                              </Text>
                              <Text fz={12} c="dimmed">
                                Exp {c.expiryMonth}/{c.expiryYear}
                              </Text>
                            </Group>
                            <span
                              role="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRemoveSavedCard(c.id);
                              }}
                              style={{ color: "#cbd5e1", display: "flex", alignItems: "center" }}
                            >
                              {removingCardId === c.id ? (
                                <Loader size={13} />
                              ) : (
                                <IconTrash size={15} />
                              )}
                            </span>
                          </button>
                        ))}
                        <button
                          type="button"
                          onClick={() => setSelectedCardId("new")}
                          style={{
                            border: selectedCardId === "new" ? "2px solid #2e86c1" : "1.5px dashed rgba(46,134,193,0.3)",
                            borderRadius: rem(12),
                            padding: `${rem(10)} ${rem(14)}`,
                            fontSize: rem(13),
                            fontWeight: 600,
                            color: selectedCardId === "new" ? "#1a6ea8" : "#6b7c8d",
                            background: selectedCardId === "new" ? "linear-gradient(135deg, #f0f8ff, #e0f0fa)" : "transparent",
                            cursor: "pointer",
                            transition: "all 0.2s ease",
                          }}
                        >
                          + Use a different card
                        </button>
                      </Stack>
                    </Box>
                  )}

                  {authUser && selectedCardId !== "new" ? (
                    <TextInput
                      label="CVV"
                      placeholder="•••"
                      type="password"
                      maxLength={4}
                      value={savedCardCvv}
                      onChange={(e) => setSavedCardCvv(e.target.value.replace(/\D/g, "").slice(0, 4))}
                      styles={inputStyles}
                    />
                  ) : (
                    <>
                      <TextInput
                        label="Card Number"
                        placeholder="1234 5678 9012 3456"
                        leftSection={<IconCreditCard size={15} />}
                        maxLength={19}
                        {...form.getInputProps("cardNumber")}
                        onChange={(e) => {
                          const val = e.target.value
                            .replace(/\D/g, "")
                            .slice(0, 16);
                          form.setFieldValue(
                            "cardNumber",
                            val.replace(/(.{4})/g, "$1 ").trim(),
                          );
                        }}
                        styles={inputStyles}
                      />
                      <Group grow gap="md">
                        <TextInput
                          label="Expiry"
                          placeholder="MM / YY"
                          maxLength={5}
                          {...form.getInputProps("expiry")}
                          onChange={(e) => {
                            let val = e.target.value.replace(/\D/g, "").slice(0, 4);
                            if (val.length >= 3)
                              val = val.slice(0, 2) + "/" + val.slice(2);
                            form.setFieldValue("expiry", val);
                          }}
                          styles={inputStyles}
                        />
                        <TextInput
                          label="CVV"
                          placeholder="•••"
                          type="password"
                          maxLength={4}
                          {...form.getInputProps("cvv")}
                          styles={inputStyles}
                        />
                      </Group>
                      <Text fz={11} c="dimmed" fw={300}>
                        Test mode — try 4242 4242 4242 4242 (approved) or 4000 0000 0000 0002 (declined).
                      </Text>
                      {authUser && (
                        <Checkbox
                          checked={saveNewCard}
                          onChange={(e) => setSaveNewCard(e.currentTarget.checked)}
                          label={
                            <Text fz={12.5} c="dimmed" fw={400}>
                              Save this card for faster checkout next time
                            </Text>
                          }
                          styles={{ input: { cursor: "pointer" } }}
                        />
                      )}
                    </>
                  )}
                </Stack>
              )}

              {(payMethod === "Khalti" || payMethod === "eSewa") && (
                <Stack gap="md" mb="xl">
                  <Box
                    p="lg"
                    style={{
                      background:
                        payMethod === "Khalti"
                          ? "linear-gradient(135deg, #f8f0ff, #ede0ff)"
                          : "linear-gradient(135deg, #f0fff4, #d8faea)",
                      borderRadius: rem(16),
                      border: `1px solid ${payMethod === "Khalti" ? "rgba(128,0,200,0.15)" : "rgba(0,160,80,0.15)"}`,
                    }}
                  >
                    <Text
                      fz={12}
                      fw={700}
                      c={payMethod === "Khalti" ? "violet.7" : "teal.7"}
                      style={{
                        letterSpacing: "0.12em",
                        textTransform: "uppercase",
                        marginBottom: rem(12),
                      }}
                    >
                      Scan to Pay with {payMethod}
                    </Text>
                    <Group justify="center" mb={12}>
                      <Box
                        style={{
                          padding: rem(10),
                          background: "white",
                          borderRadius: rem(12),
                          boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
                          display: "inline-block",
                        }}
                      >
                        <FakeQRCode
                          label={`${payMethod}-${grandTotal}`}
                          color={payMethod === "Khalti" ? "#5b21b6" : "#059669"}
                        />
                      </Box>
                    </Group>
                    <Text fz={13} c="dimmed" fw={300} ta="center" lh={1.6}>
                      Send exactly{" "}
                      <Text span fw={700} c="dark.7">
                        NPR {(grandTotal * 133).toLocaleString()}
                      </Text>{" "}
                      (≈{" "}
                      <Text span fw={600}>
                        ${grandTotal.toLocaleString()}
                      </Text>
                      ) to the {payMethod} QR above.
                    </Text>
                  </Box>
                  <Box>
                    <Text
                      fz={11}
                      fw={700}
                      c="gray.6"
                      mb={6}
                      style={{
                        letterSpacing: "0.1em",
                        textTransform: "uppercase",
                      }}
                    >
                      Upload Transaction Receipt{" "}
                      <Text span c="red.5">
                        *
                      </Text>
                    </Text>
                    {!txFile ? (
                      <Box
                        onClick={() => fileInputRef.current?.click()}
                        style={{
                          border: txFileError
                            ? "2px dashed var(--mantine-color-red-5)"
                            : "2px dashed rgba(46,134,193,0.35)",
                          borderRadius: rem(14),
                          padding: `${rem(28)} ${rem(16)}`,
                          textAlign: "center",
                          cursor: "pointer",
                          background: "rgba(240,248,255,0.5)",
                          transition: "all 0.2s ease",
                        }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.borderColor = "#2e86c1")
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.borderColor = txFileError
                            ? "var(--mantine-color-red-5)"
                            : "rgba(46,134,193,0.35)")
                        }
                      >
                        <IconUpload
                          size={28}
                          color="#94a3b8"
                          style={{ marginBottom: rem(8) }}
                        />
                        <Text fz={14} fw={500} c="dark.6" mb={4}>
                          Click to upload your receipt
                        </Text>
                        <Text fz={12} c="dimmed" fw={300}>
                          PDF only · Max 10 MB
                        </Text>
                      </Box>
                    ) : (
                      <Box
                        style={{
                          border: "1.5px solid rgba(39,174,96,0.4)",
                          borderRadius: rem(14),
                          padding: `${rem(14)} ${rem(16)}`,
                          background:
                            "linear-gradient(135deg, #f0fff4, #e8faf0)",
                          display: "flex",
                          alignItems: "center",
                          gap: rem(12),
                        }}
                      >
                        <IconFileTypePdf
                          size={30}
                          color="#27ae60"
                          style={{ flexShrink: 0 }}
                        />
                        <Box style={{ flex: 1, overflow: "hidden" }}>
                          <Text
                            fz={13}
                            fw={600}
                            c="dark.7"
                            style={{
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {txFile.name}
                          </Text>
                          <Text fz={12} c="dimmed">
                            {(txFile.size / 1024).toFixed(1)} KB
                          </Text>
                        </Box>
                        <button
                          onClick={() => {
                            setTxFile(null);
                            if (fileInputRef.current)
                              fileInputRef.current.value = "";
                          }}
                          style={{
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            padding: rem(4),
                            borderRadius: rem(6),
                            color: "#94a3b8",
                            display: "flex",
                            alignItems: "center",
                          }}
                        >
                          <IconX size={16} />
                        </button>
                      </Box>
                    )}
                    {txFileError && (
                      <Text fz={12} c="red.6" mt={6}>
                        {txFileError}
                      </Text>
                    )}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="application/pdf"
                      style={{ display: "none" }}
                      onChange={handleFileChange}
                    />
                  </Box>
                  <Text fz={12} c="dimmed" fw={300} lh={1.5}>
                    After completing payment in {payMethod}, download your
                    receipt and upload it here. We will verify and confirm your
                    booking within 2 business hours.
                  </Text>
                </Stack>
              )}

              {submitError && (
                <Box
                  mb="md"
                  p="md"
                  style={{
                    background: "rgba(231,76,60,0.06)",
                    border: "1px solid rgba(231,76,60,0.25)",
                    borderRadius: rem(12),
                  }}
                >
                  <Group gap={8}>
                    <IconAlertCircle size={16} color="#e74c3c" />
                    <Text fz={13} c="red.7" fw={400}>
                      {submitError}
                    </Text>
                  </Group>
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
                  disabled={submitting}
                  styles={{
                    root: {
                      border: "1px solid rgba(46,134,193,0.2)",
                      color: "#5a6a7a",
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
                  rightSection={
                    submitting ? (
                      <Loader size={16} color="white" />
                    ) : (
                      <IconShieldCheck size={18} />
                    )
                  }
                  onClick={handlePayment}
                  disabled={submitting}
                  style={{
                    background: "linear-gradient(135deg, #2e86c1, #0f4c81)",
                    boxShadow: "0 8px 28px rgba(46,134,193,0.35)",
                    height: rem(52),
                    fontSize: rem(15),
                    fontWeight: 500,
                  }}
                >
                  {submitting
                    ? "Processing…"
                    : payMethod === "Card"
                      ? "Pay & Confirm Booking"
                      : "Submit & Confirm Booking"}
                </Button>
              </Group>
              <Group justify="center" mt="md" gap={6}>
                <IconShieldCheck size={14} color="#94a3b8" />
                <Text fz={12} c="dimmed">
                  Payments are encrypted and secure
                </Text>
              </Group>
            </Paper>
          )}

          {/* Sidebar */}
          <aside>
            <Paper
              shadow="sm"
              radius="xl"
              p="xl"
              style={{
                border: "1px solid rgba(46,134,193,0.12)",
                position: "sticky",
                top: rem(88),
                overflow: "hidden",
              }}
            >
              <Box
                style={{
                  height: rem(140),
                  borderRadius: rem(14),
                  overflow: "hidden",
                  position: "relative",
                  marginBottom: rem(16),
                }}
              >
                <img
                  src={tour.heroImage}
                  alt={tour.name}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    background:
                      "linear-gradient(to top, rgba(15,76,129,0.6) 0%, transparent 60%)",
                  }}
                />
                <Badge
                  color={diffColor[tour.difficulty]}
                  variant="filled"
                  size="sm"
                  radius="sm"
                  style={{
                    position: "absolute",
                    bottom: rem(10),
                    left: rem(10),
                  }}
                >
                  {diffMap[tour.difficulty]}
                </Badge>
              </Box>
              <Text ff="serif" fz={17} fw={600} c="dark.8" lh={1.3} mb={4}>
                {tour.name}
              </Text>
              <Group gap={6} mb="lg">
                <IconMountain size={13} color="#94a3b8" />
                <Text fz={12} c="dimmed">
                  {tour.duration}
                </Text>
              </Group>
              <Divider color="rgba(46,134,193,0.1)" mb="md" />
              <Stack
                gap={10}
                pb="md"
                mb="md"
                style={{ borderBottom: "1px solid rgba(46,134,193,0.1)" }}
              >
                <Group justify="space-between">
                  <Text fz={13} c="dimmed" fw={300}>
                    Base price
                  </Text>
                  <Text fz={13} fw={500} c="dark.7">
                    ${tour.price.toLocaleString()}
                  </Text>
                </Group>
                <Group justify="space-between">
                  <Text fz={13} c="dimmed" fw={300}>
                    × {form.values.travelers}{" "}
                    {form.values.travelers === 1 ? "traveler" : "travelers"}
                  </Text>
                  <Text fz={13} fw={500} c="dark.7">
                    ${baseTotal.toLocaleString()}
                  </Text>
                </Group>
                {selectedAddonIndices.map((i) => {
                  const addon = tour.addons[i];
                  if (!addon) return null;
                  return (
                    <Group key={i} justify="space-between" wrap="nowrap">
                      <Text
                        fz={13}
                        c="dimmed"
                        fw={300}
                        style={{
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                          marginRight: rem(8),
                        }}
                      >
                        {addon.name}
                      </Text>
                      <Text
                        fz={13}
                        fw={500}
                        c="blue.6"
                        style={{ whiteSpace: "nowrap" }}
                      >
                        +${addon.price}
                      </Text>
                    </Group>
                  );
                })}
                {exactDateSurcharge > 0 && (
                  <Group justify="space-between">
                    <Text fz={13} c="dimmed" fw={300}>
                      Exact date guarantee fee
                    </Text>
                    <Text fz={13} fw={500} c="orange.6">
                      +${exactDateSurcharge.toLocaleString()}
                    </Text>
                  </Group>
                )}
              </Stack>
              <Group justify="space-between" align="flex-end">
                <Text fz={13} c="dimmed">
                  Total
                </Text>
                <Text
                  ff="serif"
                  fz={32}
                  fw={600}
                  style={{
                    background: "linear-gradient(135deg, #2e86c1, #0f4c81)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  ${grandTotal.toLocaleString()}
                </Text>
              </Group>
              <Box
                mt="md"
                p="sm"
                style={{
                  background: "linear-gradient(135deg, #f0f8ff, #e8f4fc)",
                  borderRadius: rem(10),
                  border: "1px solid rgba(46,134,193,0.12)",
                }}
              >
                <Stack gap={6}>
                  <Group gap={6}>
                    <IconShieldCheck size={14} color="#2e86c1" />
                    <Text fz={12} c="blue.7" fw={500}>
                      Free cancellation up to 14 days before departure
                    </Text>
                  </Group>
                  {step > 0 && (
                    <Group gap={6} align="flex-start">
                      <IconCalendarTime size={14} color="#2e86c1" style={{ marginTop: 1, flexShrink: 0 }} />
                      <Text fz={12} c="blue.7" fw={500}>
                        {isExactDate ? "Guaranteed" : "Preferred"} start: {preferredTimingDisplay}
                      </Text>
                    </Group>
                  )}
                </Stack>
              </Box>
            </Paper>
          </aside>
        </div>
      </main>
    </>
  );
}