"use client";

import Desk from "./Desk";
import { desks } from "../data/desks";

export default function OfficeCanvas() {
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
        <Desk
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
