export default function OfficeCanvas() {
  return (
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
  );
}
