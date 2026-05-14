"use client"

import { Lock, LockOpen } from "lucide-react";
import { useEffect, useState } from "react";
import Link from "next/link";
import Button from "~/components/Button";
import StarRating from "~/app/_components/exercises/StarRating";

type FinishScreenProps = {
  totalExercises: number;
  results: Record<number, boolean>;
  onRestart: () => void;
  onRate?: (rating: number) => void;
};

const SHAKE_DURATION_MS = 750;

const fadeUp = (delay: string) => ({
  animation: `fade-up 0.6s cubic-bezier(0.4, 0, 0.2, 1) ${delay} both`,
});

export default function FinishScreen({ totalExercises, results, onRestart, onRate }: FinishScreenProps) {
  const [unlocked, setUnlocked] = useState(false);
  const correct = Object.values(results).filter(Boolean).length;
  const perfect = correct === totalExercises;

  useEffect(() => {
    const t = setTimeout(() => setUnlocked(true), SHAKE_DURATION_MS);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center gap-12 select-none">

      {/* Ambient glow — fades in on unlock */}
      <div
        className="absolute w-120 h-120 rounded-full bg-success/5 blur-3xl pointer-events-none transition-opacity duration-1000"
        style={{ opacity: unlocked ? 1 : 0 }}
      />

      {/* Lock icon */}
      <div style={fadeUp("0ms")} className="relative flex items-center justify-center w-16 h-16">
        {unlocked && (
          <div
            className="absolute inset-0 rounded-full border border-success/40"
            style={{ animation: "glow-expand 0.9s ease-out both" }}
          />
        )}
        {!unlocked ? (
          <Lock
            size={34}
            strokeWidth={1.5}
            className="text-muted"
            style={{ animation: `lock-shake ${SHAKE_DURATION_MS}ms ease-in-out both` }}
          />
        ) : (
          <LockOpen
            size={34}
            strokeWidth={1.5}
            className="text-success"
            style={{ animation: "lock-open 0.65s ease-out both" }}
          />
        )}
      </div>

      {/* Title + subtitle */}
      <div className="flex flex-col items-center gap-3" style={fadeUp("100ms")}>
        <span className="logo-shimmer text-6xl font-bold tracking-widest uppercase">
          Decrypted
        </span>
        <span className="text-xl text-gray/60">
          {perfect
            ? "Flawless. Every exercise solved correctly."
            : "You've completed all exercises."}
        </span>
      </div>

      {/* Divider */}
      <div className="w-40 border-t border-muted/20" style={fadeUp("180ms")} />

      {/* Per-exercise dots + score line */}
      <div className="flex flex-col items-center gap-4" style={fadeUp("240ms")}>
        <div className="flex gap-2.5">
          {Array.from({ length: totalExercises }, (_, i) => (
            <div
              key={i}
              className={`w-2.5 h-2.5 rounded-full transition-colors ${results[i] ? "bg-success" : "bg-muted/30"}`}
            />
          ))}
        </div>
        <span className="text-sm tracking-wider text-muted/60">
          {correct} of {totalExercises} correct
        </span>
      </div>

      {/* Star rating */}
      <div style={fadeUp("300ms")}>
        <StarRating onRate={onRate} />
      </div>

      {/* Actions */}
      <div className="flex gap-4" style={fadeUp("400ms")}>
        <Button variant="ghostMuted" size="md" onClick={onRestart}>
          Try again
        </Button>
        <Link href="/">
          <Button variant="continue" size="md" className="w-36">
            Done
          </Button>
        </Link>
      </div>

    </div>
  );
}
