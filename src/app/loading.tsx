export default function Loading() {
  return (
    <div
      className="flex min-h-screen items-center justify-center"
      style={{
        backgroundColor: "#1a1f26",
        backgroundImage: "radial-gradient(rgba(34,197,94,0.12) 1px, transparent 1px)",
        backgroundSize: "28px 28px",
      }}
    >
      <div className="flex flex-col items-center gap-3">
        <div className="relative h-1 w-40 overflow-hidden rounded-full bg-green/15">
          <div
            className="absolute top-0 left-0 h-full w-1/2 rounded-full bg-gradient-to-r from-transparent via-green to-transparent shadow-[0_0_8px_rgba(34,197,94,0.8)]"
            style={{ animation: "slide 1.4s ease-in-out infinite" }}
          />
        </div>
        <span className="font-mono text-[11px] tracking-[0.2em] text-muted uppercase">
          Loading...
        </span>
      </div>
      <style>{`
        @keyframes slide {
          0%   { transform: translateX(-100%); }
          100% { transform: translateX(300%); }
        }
      `}</style>
    </div>
  );
}
