"use client";

type DeskProps = {
  name: string;
  status: "available" | "busy" | "offline";
};


const statusColor: Record<DeskProps["status"], string> = {
  available: "#2ecc71",
  busy: "#f39c12",
  offline: "#bdc3c7",
};

export default function Desk({ name, status }: DeskProps) {
  return (
    <div
      onClick={() => {
        console.log(`Open Slack DM with ${name}`);
      }}
      style={{
        width: "120px",
        height: "90px",
        border: "1px solid #ddd",
        borderRadius: "8px",
        padding: "8px",
        cursor: "pointer",
        backgroundColor: "#fafafa",
        boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow =
          "0 4px 10px rgba(0,0,0,0.15)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow =
          "0 1px 3px rgba(0,0,0,0.1)";
      }}
    >
      <div
        style={{
          fontWeight: 600,
          marginBottom: "6px",
          fontSize: "14px",
        }}
      >
        {name}
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "6px",
          fontSize: "12px",
          color: "#555",
        }}
      >
        <span
          style={{
            width: "8px",
            height: "8px",
            borderRadius: "50%",
            backgroundColor: statusColor[status],
            display: "inline-block",
          }}
        />
        {status}
      </div>
    </div>
  );
}
