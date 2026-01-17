"use client";

import { useEffect, useState } from "react";

type SlackUser = {
  id: string;
  name: string;
  email: string;
};

export default function AdminPage() {
  const [users, setUsers] = useState<SlackUser[]>([]);
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [slackConnected, setSlackConnected] = useState<boolean | null>(null);

  // 1️⃣ Check Slack connection status
  useEffect(() => {
    fetch("/api/slack/status")
      .then((r) => r.json())
      .then((data) => setSlackConnected(data.connected));
  }, []);

  // 2️⃣ Load Slack users ONLY if connected
  useEffect(() => {
    if (!slackConnected) return;

    fetch("/api/slack/users")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setUsers(data);
        }
      });
  }, [slackConnected]);

  return (
    <main style={{ padding: 32 }}>
      <h1>Admin</h1>
      <p>Select users to show on Teamfloor</p>

      {/* Loading */}
      {slackConnected === null && (
        <p style={{ marginTop: 16 }}>Loading Slack status…</p>
      )}

      {/* Connect Slack */}
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

      {/* Slack users */}
      {slackConnected === true &&
        users.map((u) => (
          <label
            key={u.id}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginTop: 8,
            }}
          >
            <input
              type="checkbox"
              checked={!!selected[u.id]}
              onChange={(e) =>
                setSelected({ ...selected, [u.id]: e.target.checked })
              }
            />
            <span>
              <strong>{u.name}</strong>{" "}
              <span style={{ color: "#666", fontSize: 13 }}>
                ({u.email})
              </span>
            </span>
          </label>
        ))}
    </main>
  );
}
