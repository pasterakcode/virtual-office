"use client";

import { useEffect, useState } from "react";
import OfficeCanvas from "@/components/OfficeCanvas";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/components/AuthProvider";
import type { Desk } from "@/types/desk";

export default function HomePage() {
  const { user, loading } = useAuth();
  const [desks, setDesks] = useState<Desk[]>([]);

  useEffect(() => {
    if (!user) {
      setDesks([]);
      return;
    }

    async function fetchDesks() {
      const { data, error } = await supabase.from("desks").select("*");

      if (error || !data) {
        setDesks([]);
      } else {
        setDesks(data as Desk[]);
      }
    }

    fetchDesks();
  }, [user]);

  // Added console log for user and desks length
  console.log("[HomePage] user:", user);
  console.log("[HomePage] desks.length:", desks.length);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return (
      <div style={{ padding: 24 }}>
        <h1>Welcome to Teamfloor</h1>
        <p>
          Please <a href="/login" style={{ color: '#4A154B', fontWeight: 'bold', textDecoration: 'underline' }}>log in with Slack</a> to continue.
        </p>
      </div>
    );
  }

  return (
    <main style={{ padding: 24 }}>
      <h1>Welcome, {user.email || user.id}</h1>
      <OfficeCanvas desks={desks} />
    </main>
  );
}
