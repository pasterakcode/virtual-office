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
      <h1 style={{ marginBottom: "8px" }}>Virtual Office</h1>
      <p style={{ marginBottom: "32px", color: "#555" }}>
        Team availability at a glance
      </p>

      {/* Office canvas */}
      <div
        style={{
          width: "100%",
          height: "500px",
          backgroundColor: "#ffffff",
          border: "1px solid #ddd",
          borderRadius: "8px",
          position: "relative",
        }}
      >
        <p
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            color: "#999",
          }}
        >
          Office space (coming next)
        </p>
      </div>
    </main>
  );
}
