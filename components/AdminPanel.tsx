"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type SlackUser = {
  id: string;
  name: string;
  email: string;
};

export default function AdminPanel() {
  const [users, setUsers] = useState<SlackUser[]>([]);
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [slackConnected, setSlackConnected] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  // 1️⃣ sprawdź czy Slack jest podłączony
  useEffect(() => {
    console.log("[AdminPanel] checking slack status");

    fetch("/api/slack/status")
      .then((r) => r.json())
      .then((data) => {
        console.log("[AdminPanel] slack status response:", data);
        setSlackConnected(data.connected);
      });
  }, []);

  // 2️⃣ pobierz użytkowników Slacka (jeśli połączony)
  useEffect(() => {
    if (!slackConnected) return;

    console.log("[AdminPanel] slack connected, loading users");

    fetch("/api/slack/users")
      .then((r) => r.json())
      .then((data) => {
        console.log("[AdminPanel] slack users response:", data);

        if (Array.isArray(data)) {
          setUsers(data);
        } else {
          console.warn("[AdminPanel] users response is not an array");
        }
      });
  }, [slackConnected]);

  // 3️⃣ pobierz istniejące biurka → zaznacz checkboxy
  useEffect(() => {
    if (!slackConnected) return;

    const loadDesks = async () => {
      console.log("[AdminPanel] loading existing desks from Supabase");

      const { data, error } = await supabase
        .from("desks")
        .select("id");

      console.log("[AdminPanel] desks select result:", { data, error });

      const map: Record<string, boolean> = {};
      (data ?? []).forEach((d) => {
        map[d.id] = true;
      });

      setSelected(map);
      setLoading(false);
    };

    loadDesks();
  }, [slackConnected]);

  return (
    <div
      style={{
        width: 320,
        height: "100vh",
        padding: 24,
        background: "#ffffff",
        borderRight: "1px solid #e5e7eb",
        overflowY: "auto",
      }}
    >
      <h2>Admin</h2>
      <p>Select users to show on Teamfloor</p>

      {slackConnected === null && <p>Loading Slack status…</p>}

      {slackConnected === false && (
        <a
          href="/api/slack/login"
          style={{
            display: "inline-block",
            marginTop: 16,
            padding: "8px 14px",
            background: "#4A154B",
            color: "#fff",
            borderRadius: 6,
            textDecoration: "none",
            fontWeight: 600,
          }}
        >
          Connect Slack
        </a>
      )}

      {slackConnected === true && loading && <p>Loading users…</p>}

      {slackConnected === true &&
        !loading &&
        users.map((u) => (
          <label
            key={u.id}
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: 8,
              marginTop: 10,
              cursor: "pointer",
            }}
          >
            <input
              type="checkbox"
              checked={!!selected[u.id]}
              onChange={async (e) => {
                const checked = e.target.checked;

                console.log("[AdminPanel] checkbox change", {
                  slackUserId: u.id,
                  checked,
                  user: u,
                });

                setSelected((prev) => ({
                  ...prev,
                  [u.id]: checked,
                }));

                if (checked) {
                  console.log("[AdminPanel] INSERT desk");

                  const { error } = await supabase
                    .from("desks")
                    .upsert({
                      id: u.id,
                      slack_user_id: u.id,
                      name: u.name,
                      presence: "offline",
                    });

                  console.log("[AdminPanel] INSERT result:", error);
                } else {
                  console.log("[AdminPanel] DELETE desk");

                  const { error } = await supabase
                    .from("desks")
                    .delete()
                    .eq("id", u.id);

                  console.log("[AdminPanel] DELETE result:", error);
                }
              }}
            />

            <span>
              <strong>{u.name}</strong>
              <br />
              <span style={{ color: "#666", fontSize: 12 }}>
                {u.email}
              </span>
            </span>
          </label>
        ))}
    </div>
  );
}
