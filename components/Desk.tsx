"use client";

type DeskProps = {
  name: string;
  presence: "available" | "busy" | "offline";
  status: "active" | "inactive";
  unreadCount: number;
  slackUserId: string;
};

const presenceColor: Record<DeskProps["presence"], string> = {
  available: "#2ecc71",
  busy: "#f39c12",
  offline: "#bdc3c7",
};

export default function Desk({
  name,
  presence,
  status,
  unreadCount,
  slackUserId,
}: DeskProps) {
  const isInactive = status === "inactive";

  return (
    <div
      onClick={() => {
        if (isInactive) return;
        window.open(
          `https://slack.com/app_redirect?channel=${slackUserId}`,
          "_blank"
        );
      }}
      style={{
        width: "120px",
        height: "100px",
        border: "1px solid #ddd",
        borderRadius: "8px",
        padding: "8px",
        cursor: isInactive ? "not-allowed" : "pointer",
        backgroundColor: "#fafafa",
        opacity: isInactive ? 0.4 : 1,
        position: "relative",
        transition: "all 0.2s ease",
      }}
    >
      {/* unread badge */}
      {unreadCount > 0 && !isInactive && (
        <div
          style={{
            position: "absolute",
            top: "6px",
            right: "6px",
            backgroundColor: "#e74c3c",
            color: "#fff",
            fontSize: "11px",
            padding: "2px 6px",
            borderRadius: "12px",
          }}
        >
          {unreadCount}
        </div>
      )}

      <div style={{ fontWeight: 600, fontSize: "14px" }}>{name}</div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "6px",
          fontSize: "12px",
          marginTop: "8px",
          color: "#555",
        }}
      >
        <span
          style={{
            width: "8px",
            height: "8px",
            borderRadius: "50%",
            backgroundColor: presenceColor[presence],
          }}
        />
        {presence}
      </div>
    </div>
  );
}
