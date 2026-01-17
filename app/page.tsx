"use client";

import { useState } from "react";
import OfficeCanvas from "../components/OfficeCanvas";
import { Desk } from "../data/desks";
import { desks as initialDesks } from "../data/desks";

export default function Home() {
  const [isAdmin] = useState(true);
  const [desks, setDesks] = useState<Desk[]>(initialDesks);
  const [showAdmin, setShowAdmin] = useState(false);

  const toggleDeskStatus = (id: string) => {
    setDesks((prev) =>
      prev.map((desk) =>
        desk.id === id
          ? {
              ...desk,
              status:
                desk.status === "active" ? "inactive" : "active",
            }
          : desk
      )
    );
  };

  const addDesk = () => {
    setDesks((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        slackUserId: "U_NEW",
        name: "New user",
        status: "inactive",
        presence: "offline",
        unreadCount: 0,
      },
    ]);
  };

  return (
    <main
      style={{
        minHeight: "100vh",
        padding: "40px",
        fontFamily: "Arial, sans-serif",
        backgroundColor: "#f5f5f5",
        display: "flex",
        gap: "24px",
      }}
    >
      {/* Main area */}
      <div style={{ flex: 1 }}>
        <header
          style={{
            marginBottom: "24px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div>
            <h1 style={{ marginBottom: "6px" }}>Teamfloor</h1>
            <p style={{ color: "#555" }}>
              See your team. Talk instantly.
            </p>
          </div>

          {isAdmin && (
            <button
              onClick={() => setShowAdmin((v) => !v)}
              style={{
                padding: "8px 14px",
                borderRadius: "6px",
                border: "1px solid #ccc",
                backgroundColor: "#fff",
                cursor: "pointer",
              }}
            >
              {showAdmin ? "Close admin" : "Admin mode"}
            </button>
          )}
        </header>

        <OfficeCanvas desks={desks} />
      </div>

      {/* Admin panel */}
      {showAdmin && (
        <aside
          style={{
            width: "280px",
            backgroundColor: "#ffffff",
            border: "1px solid #ddd",
            borderRadius: "8px",
            padding: "16px",
          }}
        >
          <h3 style={{ marginBottom: "12px" }}>Admin panel</h3>

          <button
            onClick={addDesk}
            style={{
              width: "100%",
              marginBottom: "16px",
              padding: "8px",
              borderRadius: "6px",
              border: "1px solid #ccc",
              backgroundColor: "#f5f5f5",
              cursor: "pointer",
            }}
          >
            + Add user
          </button>

          {desks.map((desk) => (
            <div
              key={desk.id}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "10px",
                fontSize: "14px",
              }}
            >
              <span>{desk.name}</span>

              <button
                onClick={() => toggleDeskStatus(desk.id)}
                style={{
                  padding: "4px 8px",
                  fontSize: "12px",
                  borderRadius: "4px",
                  border: "1px solid #ccc",
                  backgroundColor:
                    desk.status === "active"
                      ? "#e8f8f0"
                      : "#f2f2f2",
                  cursor: "pointer",
                }}
              >
                {desk.status === "active" ? "Active" : "Inactive"}
              </button>
            </div>
          ))}
        </aside>
      )}
    </main>
  );
}
