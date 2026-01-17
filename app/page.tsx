"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import OfficeCanvas from "@/components/OfficeCanvas";
import AdminPanel from "@/components/AdminPanel";
import type { Desk } from "@/types/desk";

export default function Home() {
  const [desks, setDesks] = useState<Desk[]>([]);
  const [adminOpen, setAdminOpen] = useState(false);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase.from("desks").select("*");

      const normalized: Desk[] = (data ?? []).map((d) => ({
        id: d.id,
        name: d.name,
        presence:
          d.presence === "online" || d.presence === "busy"
            ? d.presence
            : "offline",
        slackUserId: d.slack_user_id ?? undefined,
      }));

      setDesks(normalized);
    };

    load();
  }, []);

  return (
    <>
      {/* ADMIN TOGGLE */}
      <button
        onClick={() => setAdminOpen(true)}
        style={{
          position: "fixed",
          top: 16,
          left: 16,
          zIndex: 50,
        }}
      >
        ⚙️ Admin
      </button>

      {/* MAIN APP */}
      <main
        style={{
          padding: 32,
          background: "#f7f7f7",
          minHeight: "100vh",
        }}
      >
        <h1>Teamfloor</h1>
        <p>See your team. Talk instantly.</p>

        <OfficeCanvas desks={desks} />
      </main>

      {/* ADMIN PANEL OVERLAY */}
      {adminOpen && (
        <>
          <div
            onClick={() => setAdminOpen(false)}
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0,0,0,0.3)",
              zIndex: 40,
            }}
          />
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              zIndex: 50,
              height: "100vh",
            }}
          >
            <AdminPanel />
          </div>
        </>
      )}
    </>
  );
}
