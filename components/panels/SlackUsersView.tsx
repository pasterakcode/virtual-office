"use client";

import { useEffect, useState } from "react";
const [activeUserIds, setActiveUserIds] = useState<string[]>([]);


interface SlackUser {
  id: string;
  name: string;
  email?: string;
}

export default function SlackUsersView() {
  const [users, setUsers] = useState<SlackUser[]>([]);
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/slack/users")
      .then(res => res.json())
      .then(data => {
        setUsers(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  function toggleUser(userId: string) {
    setSelectedUserIds(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  }

  useEffect(() => {
    console.log("[SELECTED SLACK USERS]", selectedUserIds);
  }, [selectedUserIds]);

  useEffect(() => {
  fetch("/api/desks")
    .then(res => res.json())
    .then(ids => {
      console.log("[SlackUsersView] active desks users:", ids);
      setActiveUserIds(ids);
    });
}, []);


  if (loading) return <p>Loading Slack users…</p>;

  if (!users.length) return <p>No Slack users found.</p>;

  return (
    <div>
      <h3 style={{ marginBottom: 12 }}>Slack users</h3>

      <ul style={{ listStyle: "none", padding: 0 }}>
        {users.map(user => (
          <li
            key={user.id}
            style={{
              display: "flex",
              alignItems: "center",
              padding: "6px 0",
              borderBottom: "1px solid #eee",
            }}
          >
            <input
              type="checkbox"
              checked={activeUserIds.includes(user.id)}
              onChange={() => toggleUser(user.id)}
              style={{ marginRight: 8 }}
            />

            <div>
              <div style={{ fontWeight: 500 }}>{user.name}</div>
              {user.email && (
                <div style={{ fontSize: 12, color: "#666" }}>
                  {user.email}
                </div>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
