"use client";

type Desk = {
  id: string;
  name: string;
  presence: string;
};

export default function OfficeCanvas({ desks }: { desks: Desk[] }) {
  return (
    <div style={{ display: "flex", gap: 16 }}>
      {desks.map(desk => (
        <div
          key={desk.id}
          style={{
            padding: 16,
            width: 120,
            borderRadius: 12,
            border: "1px solid #ddd",
            opacity: desk.presence === "offline" ? 0.4 : 1
          }}
        >
          <strong>{desk.name}</strong>
          <div>{desk.presence}</div>
        </div>
      ))}
    </div>
  );
}
