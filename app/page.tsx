import OfficeCanvas from "../components/OfficeCanvas";


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

      <OfficeCanvas />
    </main>
  );
}
