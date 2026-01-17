"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Desk = {
  id: string;
  name: string;
  status: string;
  presence: string;
  unread_count: number;
};

export default function Home() {
  const [desks, setDesks] = useState<Desk[]>([]);

  useEffect(() => {
    const loadDesks = async () => {
      const { data, error } = await supabase
        .from("desks")
        .select("*")
        .order("name");

      if (error) {
        console.error("Supabase error:", error);
      } else {
        setDesks(data ?? []);
      }
    };

    loadDesks();
  }, []);

  return (
    <main style={{ padding: 24 }}>
      <h1>Teamfloor</h1>

      <div style={{ display: "flex", gap: 16 }}>
        {desks.map(desk => (
          <div
            key={desk.id}
            style={{
              padding: 16,
              border: "1px solid #ddd",
              borderRadius: 8,
              opacity: desk.presence === "offline" ? 0.4 : 1
            }}
          >
            <strong>{desk.name}</strong>
            <div>{desk.presence}</div>
          </div>
        ))}
      </div>
    </main>
  );
}
