import Desk from "@/components/Desk";

export default function OfficeCanvas() {
  return (
    <section
      style={{
        width: "100%",
        height: "520px",
        backgroundColor: "#ffffff",
        border: "1px solid #ddd",
        borderRadius: "10px",
        padding: "24px",
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
        gap: "24px",
        alignContent: "start",
      }}
    >
      <Desk name="Anna" status="available" />
      <Desk name="Bartek" status="busy" />
      <Desk name="Kasia" status="offline" />
    </section>
  );
}
