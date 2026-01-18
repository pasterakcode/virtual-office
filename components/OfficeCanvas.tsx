"use client";

import type { Desk } from "@/types/desk";
import DeskCard from "./DeskCard";

export default function OfficeCanvas({ desks }: { desks: Desk[] }) {
  return (
    <section
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
        gap: 32,
        marginTop: 40
      }}
    >
      {desks.map(desk => (
        <DeskCard key={desk.id} desk={desk} />
      ))}
    </section>
  );
}
