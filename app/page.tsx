"use client";

import OfficeCanvas from "../components/OfficeCanvas";
import { useState } from "react";

export default function Home() {
  const [isAdmin, setIsAdmin] = useState(true);

  return (
    <main
      style={{
        minHeight: "100vh",
        padding: "40px",
        fontFamily: "Arial, sans-serif",
        backgroundColor: "#f5f5f5",
      }}
    >
      {/* Header */}
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
            onClick={() => alert("Admin panel coming next")}
            style={{
              padding: "8px 14px",
              borderRadius: "6px",
              border: "1px solid #ccc",
              backgroundColor: "#fff",
              cursor: "pointer",
            }}
          >
            Admin mode
          </button>
        )}
      </header>

      <OfficeCanvas />
    </main>
  );
}
