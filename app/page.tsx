"use client";

import { useEffect, useState } from "react";
import OfficeCanvas from "@/components/OfficeCanvas";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/components/AuthProvider";

export default function HomePage() {
  const { user, loading } = useAuth();
  const [desks, setDesks] = useState([]);

  useEffect(() => {
    if (!user) {
      setDesks([]);
      return;
    }

    async function fetchDesks() {
      const { data, error } = await supabase.from("desks").select("*");

      if (error) {
        setDesks([]);
      } else {
        setDesks(data);
      }
    }

    fetchDesks();
  }, [user]);

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
