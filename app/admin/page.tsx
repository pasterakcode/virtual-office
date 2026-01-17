"use client";

export default function AdminPage() {
  return (
    <main style={{ padding: 32 }}>
      <h1>Admin Panel</h1>

      <a href="/api/slack/login">
        <button
          style={{
            marginTop: 16,
            padding: "10px 16px",
            fontSize: 14,
            cursor: "pointer",
          }}
        >
          Connect Slack Workspace
        </button>
      </a>
    </main>
  );
}
