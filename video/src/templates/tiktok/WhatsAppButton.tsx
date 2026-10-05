import React from "react";
import { brandColors, brandFont } from "../../brand/tokens";

// Generic chat-bubble + handset glyph (handset from Material Icons, Apache 2.0).
const ChatPhoneIcon: React.FC<{ size: number }> = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 48 48">
    <path
      d="M24 4C13 4 4 12.6 4 23.3c0 3.8 1.2 7.4 3.2 10.4L5 44l10.6-2.9c2.6 1.3 5.4 2 8.4 2 11 0 20-8.6 20-19.3S35 4 24 4z"
      fill="none"
      stroke="#fff"
      strokeWidth={3.6}
      strokeLinejoin="round"
    />
    <path
      transform="translate(12.5 11.5) scale(0.95)"
      d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"
      fill="#fff"
    />
  </svg>
);

/** WhatsApp-style green pill carrying the phone number. */
export const WhatsAppButton: React.FC<{
  label: string;
  fontSize: number;
}> = ({ label, fontSize }) => {
  const height = fontSize * 1.75;
  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: fontSize * 0.3,
        height,
        padding: `0 ${fontSize * 0.55}px 0 ${fontSize * 0.4}px`,
        borderRadius: height / 2,
        backgroundColor: brandColors.whatsapp,
        border: `${Math.round(fontSize * 0.07)}px solid ${brandColors.crema}`,
        boxShadow: `0 ${fontSize * 0.12}px 0 ${brandColors.whatsappDark}, 0 ${
          fontSize * 0.2
        }px ${fontSize * 0.5}px rgba(0,0,0,0.4)`,
        color: "#fff",
        fontFamily: brandFont.family,
        fontWeight: brandFont.extrabold,
        fontSize,
        whiteSpace: "nowrap",
        boxSizing: "border-box",
      }}
    >
      <ChatPhoneIcon size={fontSize * 1.05} />
      <span style={{ lineHeight: 1, paddingTop: fontSize * 0.1 }}>{label}</span>
    </div>
  );
};
