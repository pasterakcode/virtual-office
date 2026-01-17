"use client";

import DeskComponent from "./Desk";
import { Desk } from "../data/desks";

export default function OfficeCanvas({ desks }: { desks: Desk[] }) {
  return (
    <section
      style={{
        width: "100%",
        height: "520px",
        backgroundColor: "#ffffff",
        border: "1px solid #ddd",
        borderRadius: "10px",
        padding: "24px",
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
        gap: "24px",
        alignContent: "start",
      }}
    >
      {desks.map((desk) => (
        <DeskComponent
          key={desk.id}
          name={desk.name}
          presence={desk.presence}
          status={desk.status}
          unreadCount={desk.unreadCount}
          slackUserId={desk.slackUserId}
        />
      ))}
    </section>
  );
}
