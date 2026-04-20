export default function EditorLayout({ children }: { children: React.ReactNode }) {
  return (
    <main
      className="text-cream fixed inset-0 flex flex-col items-center overflow-y-auto"
      style={{
        backgroundColor: "#1a1f26",
        backgroundImage: "radial-gradient(rgba(34,197,94,0.12) 1px, transparent 1px)",
        backgroundSize: "28px 28px",
      }}
    >
      <div className="flex min-h-full flex-col items-center justify-center py-8">
        {children}
      </div>
    </main>
  );
}
