"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type SlackUser = {
  id: string;
  name: string;
  email: string;
};

interface AdminPanelProps {
  user: { id: string; email?: string } | null;
  loading: boolean;
  workspace: { team_name?: string } | null;
}

export default function AdminPanel({ user, loading, workspace }: AdminPanelProps) {
  const [users, setUsers] = useState<SlackUser[]>([]);
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [slackConnected, setSlackConnected] = useState<boolean | null>(null);
  const [loadingUsers, setLoadingUsers] = useState(true);

  // 🔴 LOGOUT FROM SLACK
  const logoutSlack = async () => {
    if (!confirm("Disconnect Slack?")) return;

    const res = await fetch("/api/slack/logout", {
      method: "POST",
    });

    const data = await res.json();

    if (!data.ok) {
      alert("Slack logout failed");
      return;
    }

    setSlackConnected(false);
    setUsers([]);
    setSelected({});
    setLoadingUsers(true);
  };

  // 1⃣ check slack connection status
  useEffect(() => {
    fetch("/api/slack/status")
      .then((r) => r.json())
      .then((data) => {
        setSlackConnected(data.connected);
      });
  }, []);

  // 2⃣ load slack users
  useEffect(() => {
    if (slackConnected !== true) return;

    setLoadingUsers(true);

    fetch("/api/slack/users")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setUsers(data);
        } else {
          setUsers([]);
        }
        setLoadingUsers(false);
      });
  }, [slackConnected]);

  // 3⃣ load existing desks
  useEffect(() => {
    if (slackConnected !== true) return;

    const loadDesks = async () => {
      const { data, error } = await supabase
        .from("desks")
        .select("id");

      if (error || !data) {
        setSelected({});
        return;
      }

      const map: Record<string, boolean> = {};
      data.forEach((d) => {
        map[d.id] = true;
      });

      setSelected(map);
    };

    loadDesks();
  }, [slackConnected]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return (
      <div style={{ padding: 24 }}>
        <h1>Please log in to access the admin panel</h1>
        <a href="/login" style={{ color: '#4A154B', fontWeight: 'bold', textDecoration: 'underline' }}>
          Login with Slack
        </a>
      </div>
    );
  }

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

      {slackConnected === true && (
        <button
          onClick={logoutSlack}
          style={{
            marginTop: 12,
            marginBottom: 16,
            width: "100%",
            padding: "8px 12px",
            background: "#e11d48",
            color: "#fff",
            border: "none",
            borderRadius: 6,
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          Logout from Slack
        </button>
      )}

      {slackConnected === true && loadingUsers && <p>Loading users…</p>}

      {slackConnected === true &&
        !loadingUsers &&
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

                setSelected((prev) => ({
                  ...prev,
                  [u.id]: checked,
                }));

                if (checked) {
                  await supabase.from("desks").upsert(
                    {
                      id: u.id,
                      slack_user_id: u.id,
                      name: u.name,
                      presence: "offline",
                    },
                    { onConflict: "id" }
                  );
                } else {
                  await supabase
                    .from("desks")
                    .delete()
                    .eq("id", u.id);
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
