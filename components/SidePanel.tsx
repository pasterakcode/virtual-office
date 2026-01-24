"use client";

import { useUI } from "./UIProvider";

export default function SidePanel() {
  const { activePanel, closePanel } = useUI();

  const isOpen = activePanel !== null;

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          onClick={closePanel}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.35)",
            zIndex: 999,
          }}
        />
      )}

      {/* Panel */}
      <aside
        style={{
          position: "fixed",
          top: 0,
          left: isOpen ? 0 : -320,
          width: 320,
          height: "100vh",
          backgroundColor: "#ffffff",
          zIndex: 1000,
          transition: "left 0.3s ease",
          boxShadow: "2px 0 12px rgba(0,0,0,0.2)",
          padding: 16,
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Header */}
        <div style={{ marginBottom: 16, display: "flex", justifyContent: "space-between" }}>
          <strong>Panel</strong>
          <button onClick={closePanel}>✖</button>
        </div>

        {/* Content placeholder */}
        {activePanel === "slackUsers" && (
          <div>
            <p>Slack users panel (coming next)</p>
          </div>
        )}

        {activePanel === "admin" && (
          <div>
            <p>Admin panel</p>
          </div>
        )}
      </aside>
    </>
  );
}
