"use client";

type Desk = {
  id: string;
  name: string;
  presence: string;
};

export default function OfficeCanvas({ desks }: { desks: Desk[] }) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
        gap: 24,
        marginTop: 32
      }}
    >
      {desks.map(desk => {
        const isOffline = desk.presence === "offline";

        return (
          <div
            key={desk.id}
            style={{
              padding: 24,
              borderRadius: 16,
              background: "#fff",
              border: "1px solid #e5e5e5",
              boxShadow: "0 4px 12px rgba(0,0,0,0.04)",
              opacity: isOffline ? 0.35 : 1,
              transition: "all 0.2s ease"
            }}
          >
            <div style={{ fontWeight: 600, fontSize: 16 }}>
              {desk.name}
            </div>

            <div
              style={{
                marginTop: 8,
                fontSize: 13,
                color: isOffline ? "#999" : "#2e7d32"
              }}
            >
              {desk.presence}
            </div>
          </div>
        );
      })}
    </div>
  );
}
