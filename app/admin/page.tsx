"use client";

import { useEffect, useState } from "react";

type SlackUser = {
  id: string;
  name: string;
};

export default function AdminPage() {
  const [users, setUsers] = useState<SlackUser[]>([]);
  const [selected, setSelected] = useState<Record<string, boolean>>({});

  useEffect(() => {
    fetch("/api/slack/users")
      .then((r) => r.json())
      .then(setUsers);
  }, []);

  return (
    <main style={{ padding: 32 }}>
      <h1>Admin</h1>
      <p>Select users to show on Teamfloor</p>

      {users.map((u) => (
        <label key={u.id} style={{ display: "block", marginTop: 8 }}>
          <input
            type="checkbox"
            checked={!!selected[u.id]}
            onChange={(e) =>
              setSelected({ ...selected, [u.id]: e.target.checked })
            }
          />{" "}
          {u.name}
        </label>
      ))}
    </main>
  );
}
