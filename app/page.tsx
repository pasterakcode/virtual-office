"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import OfficeCanvas from "@/components/OfficeCanvas";

<main style={{ padding: 32, background: "#f7f7f7", minHeight: "100vh" }}>

type Desk = {
  id: string;
  name: string;
  presence: string;
};

export default function Home() {
  const [desks, setDesks] = useState<Desk[]>([]);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase.from("desks").select("*");
      setDesks(data ?? []);
    };
    load();
  }, []);

  return (
    <main style={{ padding: 24 }}>
      <h1>Teamfloor</h1>
      <p>See your team. Talk instantly.</p>

      <OfficeCanvas desks={desks} />
    </main>
  );
}
