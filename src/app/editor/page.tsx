import EditorControls from "~/app/_components/editor/EditorControls";

export default function CodePage() {
  return (
    <main
      className="text-cream flex min-h-screen flex-col items-center justify-center"
      style={{
        backgroundColor: "#1a1f26",
        backgroundImage: "radial-gradient(rgba(34,197,94,0.12) 1px, transparent 1px)",
        backgroundSize: "28px 28px",
      }}
    >
      <div className="flex flex-col items-center">
        <EditorControls />
      </div>
    </main>
  );
}
