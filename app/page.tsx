"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import OfficeCanvas from "@/components/OfficeCanvas";

import type { Desk } from "@/types/desk";

export default function Home() {
  const [desks, setDesks] = useState<Desk[]>([]);

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
    }));

    setDesks(normalized);
  };

  load();
}, []);


  return (
    <main
      style={{
        padding: 32,
        background: "#f7f7f7",
        minHeight: "100vh"
      }}
    >
      <h1>Teamfloor</h1>
      <p>See your team. Talk instantly.</p>

      <OfficeCanvas desks={desks} />
    </main>
  );
}
