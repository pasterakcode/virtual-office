import type { Desk } from "@/types/desk";

export default function DeskCard({ desk }: { desk: Desk }) {
  const isOffline = desk.presence === "offline";

  return (
    <div
      style={{
        padding: 20,
        borderRadius: 16,
        background: "#fff",
        opacity: isOffline ? 0.5 : 1,
        boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
        display: "flex",
        flexDirection: "column",
        gap: 8,
        cursor: isOffline ? "default" : "pointer",
      }}
    >
      {/* Avatar / initial */}
      <div
        style={{
          width: 48,
          height: 48,
          borderRadius: "50%",
          background: isOffline ? "#ddd" : "#22c55e",
          color: "#fff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontWeight: 700,
          fontSize: 18,
        }}
      >
        {desk.name.charAt(0).toUpperCase()}
      </div>

      {/* Name */}
      <strong style={{ fontSize: 16 }}>{desk.name}</strong>

      {/* Presence label */}
      <span
        style={{
          fontSize: 12,
          color: "#666",
        }}
      >
        {desk.presence}
      </span>

      {/* ✅ STATUS — ZAWSZE, NIEZALEŻNIE OD PRESENCE */}
      {(desk.status_text || desk.status_emoji) && (
        <div
          style={{
            marginTop: 4,
            fontSize: 13,
            color: "#333",
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          {desk.status_emoji && (
            <span>{desk.status_emoji}</span>
          )}
          {desk.status_text && (
            <span>{desk.status_text}</span>
          )}
        </div>
      )}
    </div>
  );
}
