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

  useEffect(() => {
    fetch("/api/slack/status")
      .then((r) => r.json())
      .then((data) => setSlackConnected(data.connected));
  }, []);

  useEffect(() => {
    if (!slackConnected) return;

    fetch("/api/slack/users")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setUsers(data);
      });
  }, [slackConnected]);

  return (
    <div style={{ width: 320, padding: 24 }}>
      <h2>Admin</h2>

      {slackConnected === false && <a href="/api/slack/login">Connect Slack</a>}

      {slackConnected === true &&
        users.map((u) => (
          <label key={u.id} style={{ display: "block", marginTop: 8 }}>
            <input
              type="checkbox"
              checked={!!selected[u.id]}
              onChange={async (e) => {
                const checked = e.target.checked;
                setSelected((prev) => ({ ...prev, [u.id]: checked }));

                if (checked) {
                  console.log("INSERT DESK", u);

                  const { error } = await supabase.from("desks").insert({
                    id: u.id,
                    slack_user_id: u.id,
                    name: u.name,
                    presence: "offline",
                  });

                  console.log("INSERT RESULT", error);
                } else {
                  console.log("DELETE DESK", u.id);

                  const { error } = await supabase
                    .from("desks")
                    .delete()
                    .eq("id", u.id);

                  console.log("DELETE RESULT", error);
                }
              }}
            />
            {u.name} ({u.email})
          </label>
        ))}
    </div>
  );
}
