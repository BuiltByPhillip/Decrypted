"use client";

import { useState } from "react";
import Button from "~/components/Button";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsPending(true);

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const data = await res.json() as { error?: string };
        setError(data.error ?? "Login failed");
        return;
      }

      window.location.href = "/";
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
      <div className="flex flex-col gap-1.5">
        <label className="font-mono text-[10px] tracking-[0.2em] text-muted uppercase">
          Email
        </label>
        <input
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full rounded-lg border border-medium/60 bg-dark/60 px-4 py-2.5 font-mono text-sm text-soft-white placeholder:text-muted/40 transition duration-200 focus:border-green/60 focus:ring-1 focus:ring-green/20 focus:outline-none"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="font-mono text-[10px] tracking-[0.2em] text-muted uppercase">
          Password
        </label>
        <input
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="w-full rounded-lg border border-medium/60 bg-dark/60 px-4 py-2.5 font-mono text-sm text-soft-white placeholder:text-muted/40 transition duration-200 focus:border-green/60 focus:ring-1 focus:ring-green/20 focus:outline-none"
        />
      </div>

      {error && (
        <p className="font-mono text-xs text-danger">{error}</p>
      )}

      <Button
        variant="submit"
        size="md"
        type="submit"
        className="mt-2 w-full rounded-xl font-mono tracking-wider"
        disabled={isPending}
      >
        {isPending ? "Authenticating..." : "Access system"}
      </Button>
    </form>
  );
}
