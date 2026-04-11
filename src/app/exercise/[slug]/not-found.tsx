import Link from "next/link";
import { FileX } from "lucide-react";

export default function ExerciseNotFound() {
  return (
    <main
      className="flex min-h-screen flex-col items-center justify-center"
      style={{
        backgroundColor: "#1a1f26",
        backgroundImage: "radial-gradient(rgba(34,197,94,0.12) 1px, transparent 1px)",
        backgroundSize: "28px 28px",
      }}
    >
      <div className="flex flex-col items-center gap-5 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-green/10">
          <FileX size={24} strokeWidth={1.5} className="text-green" />
        </div>
        <div>
          <p className="mb-2 text-lg font-bold tracking-tight text-soft-white">
            Exercise not found
          </p>
          <p className="max-w-xs text-sm leading-relaxed text-muted">
            This exercise has either been deleted or does not exist.
          </p>
        </div>
        <Link
          href="/"
          className="mt-1 rounded-xl bg-green/10 px-5 py-2 font-mono text-xs text-green transition-colors duration-150 hover:bg-green/20"
        >
          Go home
        </Link>
      </div>
    </main>
  );
}
