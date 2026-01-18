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

  // 🔄 manual refresh state
  const [refreshing, setRefreshing] = useState(false);
  const [refreshResult, setRefreshResult] =
    useState<"ok" | "error" | null>(null);

  // 1️⃣ sprawdź czy Slack jest podłączony
  useEffect(() => {
    fetch("/api/slack/status")
      .then((r) => r.json())
      .then((data) => setSlackConnected(data.connected));
  }, []);

  // 2️⃣ pobierz użytkowników Slacka
  useEffect(() => {
    if (!slackConnected) return;

    fetch("/api/slack/users")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setUsers(data);
      });
  }, [slackConnected]);

  // 3️⃣ pobierz istniejące biurka
  useEffect(() => {
    if (!slackConnected) return;

    const loadDesks = async () => {
      const { data } = await supabase.from("desks").select("id");

      const map: Record<string, boolean> = {};
      (data ?? []).forEach((d) => {
        map[d.id] = true;
      });

      setSelected(map);
      setLoading(false);
    };

    loadDesks();
  }, [slackConnected]);

  // 🔄 ręczna aktualizacja statusów
  const refreshStatuses = async () => {
    try {
      setRefreshing(true);
      setRefreshResult(null);

      const res = await fetch("/api/slack/presence", {
        method: "POST",
      });

      if (!res.ok) {
        throw new Error("Request failed");
      }

      setRefreshResult("ok");
    } catch (e) {
      console.error("Presence refresh error", e);
      setRefreshResult("error");
    } finally {
      setRefreshing(false);

      // chowamy komunikat po 3s
      setTimeout(() => setRefreshResult(null), 3000);
    }
  };

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
        <>
          {/* 🔄 REFRESH BUTTON */}
          <div style={{ marginTop: 16 }}>
            <button
              onClick={refreshStatuses}
              disabled={refreshing}
              style={{
                width: "100%",
                padding: "8px 12px",
                borderRadius: 8,
                border: "1px solid #e5e7eb",
                background: refreshing ? "#f3f4f6" : "#fff",
                cursor: refreshing ? "default" : "pointer",
                fontWeight: 600,
              }}
            >
              {refreshing
                ? "Updating statuses…"
                : "🔄 Update statuses from Slack"}
            </button>

            {refreshResult === "ok" && (
              <div
                style={{
                  marginTop: 6,
                  fontSize: 12,
                  color: "#16a34a",
                }}
              >
                Statuses updated successfully
              </div>
            )}

            {refreshResult === "error" && (
              <div
                style={{
                  marginTop: 6,
                  fontSize: 12,
                  color: "#dc2626",
                }}
              >
                Failed to update statuses
              </div>
            )}
          </div>
        </>
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
              marginTop: 12,
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
                  await supabase.from("desks").upsert({
                    id: u.id,
                    slack_user_id: u.id,
                    name: u.name,
                    presence: "offline",
                  });
                } else {
                  await supabase.from("desks").delete().eq("id", u.id);
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
