import CodeWindow from "~/app/_components/editor/CodeWindow";

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
        <div
          className="h-128 w-240 overflow-hidden rounded-2xl"
          data-lenis-prevent
        >
          <CodeWindow />
        </div>
      </div>
    </main>
  );
}
