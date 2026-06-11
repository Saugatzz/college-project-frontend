"use client";
import { useState, useEffect } from "react";

const WHATSAPP_NUMBER = "9779845439816"; // Nepal country code + number
const WHATSAPP_URL    = `https://wa.me/${WHATSAPP_NUMBER}`;

// Real WhatsApp SVG icon
function WhatsAppIcon({ size = 28, color = "white" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M16 2C8.268 2 2 8.268 2 16c0 2.478.668 4.8 1.835 6.793L2 30l7.42-1.81A13.94 13.94 0 0 0 16 30c7.732 0 14-6.268 14-14S23.732 2 16 2z"
        fill={color}
      />
      <path
        d="M22.003 19.178c-.3-.15-1.77-.873-2.044-.973-.274-.099-.473-.149-.672.15-.199.298-.771.972-.945 1.171-.174.2-.348.224-.647.075-.3-.15-1.265-.466-2.41-1.485-.89-.794-1.491-1.774-1.665-2.073-.174-.3-.018-.461.13-.61.134-.133.3-.347.449-.521.15-.174.2-.298.3-.497.099-.199.05-.373-.025-.522-.075-.149-.672-1.62-.921-2.218-.242-.583-.488-.504-.672-.513l-.572-.01c-.199 0-.522.075-.795.373-.274.299-1.044 1.02-1.044 2.488 0 1.467 1.07 2.885 1.218 3.084.15.199 2.103 3.21 5.093 4.5.712.308 1.268.491 1.702.629.715.227 1.366.195 1.88.118.573-.085 1.77-.723 2.02-1.422.248-.698.248-1.297.173-1.422-.074-.124-.273-.199-.572-.348z"
        fill="#25D366"
      />
    </svg>
  );
}

// QR code using a real WhatsApp QR via API
function QRCode() {
  return (
    <div style={{
      width: 180, height: 180,
      background: "white",
      borderRadius: 12,
      padding: 8,
      boxShadow: "0 2px 16px rgba(0,0,0,0.10)",
      display: "flex", alignItems: "center", justifyContent: "center",
    }}>
      {/* Using QR server API to generate real QR for the WhatsApp link */}
      <img
        src={`https://api.qrserver.com/v1/create-qr-code/?size=164x164&data=${encodeURIComponent(WHATSAPP_URL)}&bgcolor=ffffff&color=000000&margin=2`}
        alt="WhatsApp QR Code"
        width={164}
        height={164}
        style={{ borderRadius: 6 }}
      />
    </div>
  );
}

export default function WhatsAppWidget() {
  const [open,    setOpen]    = useState(false);
  const [visible, setVisible] = useState(false);

  // Slight delay before showing the FAB so it doesn't flash on first paint
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 800);
    return () => clearTimeout(t);
  }, []);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  return (
    <>
      {/* ── Backdrop ── */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          style={{
            position: "fixed", inset: 0,
            background: "rgba(0,0,0,0.25)",
            backdropFilter: "blur(2px)",
            zIndex: 9998,
            animation: "wa-fade-in 0.18s ease",
          }}
        />
      )}

      {/* ── Popup ── */}
      {open && (
        <div
          style={{
            position: "fixed",
            bottom: 88,
            right: 24,
            width: 300,
            background: "white",
            borderRadius: 20,
            boxShadow: "0 20px 60px rgba(0,0,0,0.18), 0 4px 16px rgba(37,211,102,0.15)",
            zIndex: 9999,
            overflow: "hidden",
            animation: "wa-pop-up 0.22s cubic-bezier(0.34,1.56,0.64,1)",
            transformOrigin: "bottom right",
          }}
        >
          {/* Header */}
          <div style={{
            background: "linear-gradient(135deg, #075e54 0%, #128c7e 60%, #25d366 100%)",
            padding: "20px 20px 16px",
            position: "relative",
          }}>
            {/* Decorative circles — pointerEvents none so they don't block clicks */}
            <div style={{ position: "absolute", top: -16, right: -16, width: 80, height: 80, borderRadius: "50%", background: "rgba(255,255,255,0.06)", pointerEvents: "none" }} />
            <div style={{ position: "absolute", bottom: -20, left: 20, width: 50, height: 50, borderRadius: "50%", background: "rgba(255,255,255,0.05)", pointerEvents: "none" }} />

            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", position: "relative", zIndex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{
                  width: 40, height: 40, borderRadius: "50%",
                  background: "rgba(255,255,255,0.15)",
                  border: "2px solid rgba(255,255,255,0.3)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <WhatsAppIcon size={22} color="white" />
                </div>
                <div>
                  <div style={{ color: "white", fontWeight: 700, fontSize: 14, lineHeight: 1.2 }}>eBooking Nepal</div>
                  <div style={{ color: "rgba(255,255,255,0.75)", fontSize: 11, marginTop: 2 }}>Typically replies instantly</div>
                </div>
              </div>
              <button
                onClick={() => setOpen(false)}
                style={{
                  background: "rgba(255,255,255,0.15)", border: "none", borderRadius: "50%",
                  width: 30, height: 30, display: "flex", alignItems: "center", justifyContent: "center",
                  cursor: "pointer", flexShrink: 0,
                  transition: "background 0.15s",
                }}
                onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.28)")}
                onMouseLeave={e => (e.currentTarget.style.background = "rgba(255,255,255,0.15)")}
              >
                <svg width={14} height={14} viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M1 1l12 12M13 1L1 13" stroke="white" strokeWidth={2} strokeLinecap="round" />
                </svg>
              </button>
            </div>
          </div>

          {/* Body */}
          <div style={{ padding: "20px 20px 8px", textAlign: "center" }}>
            <div style={{ fontWeight: 700, fontSize: 15, color: "#111", marginBottom: 4 }}>Scan to Chat</div>
            <div style={{ height: 1, background: "linear-gradient(to right, transparent, #e5e7eb, transparent)", marginBottom: 16 }} />

            <div style={{ display: "flex", justifyContent: "center", marginBottom: 14 }}>
              <QRCode />
            </div>

            <p style={{ fontSize: 12.5, color: "#6b7280", lineHeight: 1.6, margin: "0 0 4px" }}>
              Scan this QR code to start a chat with us.
            </p>
            <p style={{ fontSize: 12.5, color: "#9ca3af", margin: "0 0 16px", fontWeight: 600, letterSpacing: "0.05em" }}>OR</p>

            {/* CTA button */}
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                background: "linear-gradient(135deg, #25d366, #128c7e)",
                color: "white", textDecoration: "none",
                borderRadius: 50, padding: "12px 20px",
                fontSize: 14, fontWeight: 700,
                boxShadow: "0 4px 16px rgba(37,211,102,0.35)",
                transition: "transform 0.15s, box-shadow 0.15s",
                marginBottom: 4,
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = "0 6px 20px rgba(37,211,102,0.45)"; }}
              onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = "0 4px 16px rgba(37,211,102,0.35)"; }}
            >
              <WhatsAppIcon size={18} color="white" />
              Continue to Chat
            </a>
          </div>

          {/* Footer note */}
          <div style={{ padding: "8px 20px 14px", textAlign: "center" }}>
            <p style={{ fontSize: 11, color: "#d1d5db", margin: 0 }}>
              🔒 End-to-end encrypted via WhatsApp
            </p>
          </div>
        </div>
      )}

      {/* ── FAB ── */}
      <button
        onClick={() => setOpen(prev => !prev)}
        aria-label="Chat on WhatsApp"
        style={{
          position: "fixed",
          bottom: 24,
          right: 24,
          width: 56,
          height: 56,
          borderRadius: "50%",
          background: "linear-gradient(135deg, #25d366 0%, #128c7e 100%)",
          border: "none",
          cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: "0 4px 20px rgba(37,211,102,0.5), 0 2px 8px rgba(0,0,0,0.15)",
          zIndex: 9999,
          transition: "transform 0.2s, box-shadow 0.2s",
          opacity: visible ? 1 : 0,
          transform: visible ? (open ? "scale(1.1) rotate(10deg)" : "scale(1)") : "scale(0)",
          // Pulse ring animation when closed
        }}
        onMouseEnter={e => { if (!open) e.currentTarget.style.transform = "scale(1.12)"; }}
        onMouseLeave={e => { if (!open) e.currentTarget.style.transform = "scale(1)"; }}
      >
        <WhatsAppIcon size={28} color="white" />

        {/* Pulse ring */}
        {!open && (
          <span style={{
            position: "absolute", inset: -4,
            borderRadius: "50%",
            border: "2px solid rgba(37,211,102,0.5)",
            animation: "wa-pulse 2s ease-out infinite",
            pointerEvents: "none",
          }} />
        )}
      </button>

      {/* ── Keyframe styles ── */}
      <style>{`
        @keyframes wa-pulse {
          0%   { transform: scale(1);   opacity: 0.8; }
          70%  { transform: scale(1.4); opacity: 0; }
          100% { transform: scale(1.4); opacity: 0; }
        }
        @keyframes wa-pop-up {
          from { opacity: 0; transform: scale(0.7) translateY(12px); }
          to   { opacity: 1; transform: scale(1)   translateY(0); }
        }
        @keyframes wa-fade-in {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
      `}</style>
    </>
  );
}