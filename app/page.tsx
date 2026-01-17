export default function Home() {
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
      <header style={{ marginBottom: "32px" }}>
        <h1 style={{ marginBottom: "6px" }}>Teamfloor</h1>
        <p style={{ color: "#555" }}>
          See your team. Talk instantly.
        </p>
      </header>

      {/* Office canvas */}
      <section
        style={{
          width: "100%",
          height: "520px",
          backgroundColor: "#ffffff",
          border: "1px solid #ddd",
          borderRadius: "10px",
          position: "relative",
          padding: "16px",
        }}
      >
        <p
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            color: "#999",
            fontSize: "14px",
          }}
        >
          Teamfloor workspace (desks coming next)
        </p>
      </section>
    </main>
  );
}
