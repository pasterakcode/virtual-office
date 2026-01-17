"use client";

import { useEffect, useState } from "react";

type SlackUser = {
  id: string;
  name: string;
  email: string;
};

export default function AdminPanel() {
  const [users, setUsers] = useState<SlackUser[]>([]);
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [slackConnected, setSlackConnected] = useState<boolean | null>(null);

  // check slack status
  useEffect(() => {
    fetch("/api/slack/status")
      .then((r) => r.json())
      .then((data) => setSlackConnected(data.connected));
  }, []);

  // load users only if connected
  useEffect(() => {
    if (!slackConnected) return;

    fetch("/api/slack/users")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setUsers(data);
      });
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

      {slackConnected === true &&
        users.map((u) => (
          <label
            key={u.id}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginTop: 10,
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
              <span style={{ color: "#666", fontSize: 12 }}>
                ({u.email})
              </span>
            </span>
          </label>
        ))}
    </div>
  );
}
