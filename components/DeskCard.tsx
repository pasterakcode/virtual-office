"use client";

import type { Desk, DeskPresence } from "@/types/desk";

const statusColor: Record<DeskPresence, string> = {
  online: "#2ecc71",
  busy: "#f39c12",
  offline: "#bdc3c7",
};

export default function DeskCard({ desk }: { desk: Desk }) {
  const isOffline = desk.presence === "offline";

  const handleClick = () => {
    if (isOffline) return;
    if (!desk.slackUserId) return;

    window.open(
      `https://slack.com/app_redirect?channel=${desk.slackUserId}`,
      "_blank"
    );
  };

  return (
    <div
      onClick={handleClick}
      style={{
        padding: 24,
        borderRadius: 18,
        background: "#fff",
        border: "1px solid #e5e5e5",
        boxShadow: "0 6px 20px rgba(0,0,0,0.06)",
        opacity: isOffline ? 0.35 : 1,
        cursor: isOffline ? "default" : "pointer",
        transition: "all 0.2s ease",
      }}
    >
      {/* Avatar */}
      <div
        style={{
          width: 56,
          height: 56,
          borderRadius: "50%",
          background: statusColor[desk.presence],
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#fff",
          fontWeight: 600,
          fontSize: 20,
        }}
      >
        {desk.name.charAt(0)}
      </div>

      <div style={{ marginTop: 16 }}>
        <div style={{ fontWeight: 600, fontSize: 16 }}>
          {desk.name}
        </div>

        <div
          style={{
            marginTop: 6,
            fontSize: 13,
            color: isOffline ? "#999" : "#333",
          }}
        >
          {desk.presence}
        </div>

        {!isOffline && (
          <div
            style={{
              marginTop: 8,
              fontSize: 12,
              color: "#2563eb",
            }}
          >
            {desk.presence === "busy" ? "View status" : "Talk"}
          </div>
        )}
      </div>
    </div>
  );
}

const handleClick = () => {
  console.log("CLICK", desk);

  if (isOffline) {
    console.log("BLOCK: offline");
    return;
  }

  if (!desk.slackUserId) {
    console.log("BLOCK: no slackUserId");
    return;
  }

  window.open(
    `https://slack.com/app_redirect?channel=${desk.slackUserId}`,
    "_blank"
  );
};

