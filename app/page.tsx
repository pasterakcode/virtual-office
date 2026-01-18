"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import OfficeCanvas from "@/components/OfficeCanvas";
import AdminPanel from "@/components/AdminPanel";
import type { Desk } from "@/types/desk";

const ADMIN_WIDTH = 320;

export default function Home() {
  const [desks, setDesks] = useState<Desk[]>([]);
  const [adminOpen, setAdminOpen] = useState(false);

  useEffect(() => {
    let channel: any;

    const load = async () => {
      console.log("[Home] loading desks");

      const { data, error } = await supabase.from("desks").select("*");

      console.log("[Home] desks loaded:", data, error);

      const normalized: Desk[] = (data ?? []).map((d) => ({
        id: d.slack_user_id ?? d.id,
        name: d.name,
        presence:
          d.presence === "online" || d.presence === "busy"
            ? d.presence
            : "offline",
        slackUserId: d.slack_user_id ?? undefined,
      }));

      setDesks(normalized);
    };

    // initial load
    load();

    // realtime subscription
    console.log("[Home] subscribing to desks realtime");

    channel = supabase
      .channel("desks-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "desks" },
        (payload) => {
          console.log("[Home] realtime event:", payload);
          load();
        }
      )
      .subscribe((status) => {
        console.log("[Home] realtime status:", status);
      });

    return () => {
      console.log("[Home] cleanup realtime");
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, []);

  return (
    <>
      {/* ADMIN BUTTON */}
      <button
        onClick={() => setAdminOpen((v) => !v)}
        style={{
          position: "fixed",
          top: 16,
          left: 16,
          zIndex: 100,
          padding: "8px 14px",
          background: "#4A154B",
          color: "#fff",
          borderRadius: 6,
          border: "none",
          fontWeight: 600,
          cursor: "pointer",
        }}
      >
        {adminOpen ? "Close Admin" : "Admin"}
      </button>

      {/* ADMIN PANEL */}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: ADMIN_WIDTH,
          height: "100vh",
          transform: adminOpen
            ? "translateX(0)"
            : `translateX(-${ADMIN_WIDTH}px)`,
          transition: "transform 0.35s cubic-bezier(0.4, 0, 0.2, 1)",
          zIndex: 50,
          background: "#fff",
          borderRight: "1px solid #e5e7eb",
        }}
      >
        <AdminPanel />
      </div>

      {/* MAIN WORKSPACE */}
      <main
        style={{
          marginTop: 50,
          padding: 32,
          background: "#f7f7f7",
          minHeight: "100vh",
          marginLeft: adminOpen ? ADMIN_WIDTH : 0,
          transition: "margin-left 0.35s cubic-bezier(0.4, 0, 0.2, 1)",
        }}
      >
        <h1>Teamfloor</h1>
        <p>See your team. Talk instantly.</p>

        <OfficeCanvas desks={desks} />
      </main>
    </>
  );
}
