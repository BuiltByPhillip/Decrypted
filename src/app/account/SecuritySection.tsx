"use client";

import { useState } from "react";
import Button from "~/components/Button";

export default function SecuritySection() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isPending, setIsPending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (newPassword !== confirm) {
      setError("Passwords do not match");
      return;
    }

    setIsPending(true);
    try {
      const res = await fetch("/api/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json() as { error?: string };
      if (!res.ok) {
        setError(data.error ?? "Failed to change password");
        return;
      }
      setSuccess(true);
      setCurrentPassword("");
      setNewPassword("");
      setConfirm("");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsPending(false);
    }
  };

  const inputClass =
    "w-full rounded-lg border border-medium/60 bg-dark/60 px-4 py-2.5 font-mono text-sm text-soft-white placeholder:text-muted/40 transition duration-200 focus:border-green/60 focus:ring-1 focus:ring-green/20 focus:outline-none";

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="mb-1 text-xl font-extrabold tracking-tight text-soft-white">Security</h2>
        <p className="font-mono text-xs text-muted">Change your password</p>
      </div>

      <div className="h-px bg-medium/40" />

      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        <div className="flex flex-col gap-1.5">
          <label className="font-mono text-[10px] tracking-[0.2em] text-muted uppercase">
            Current password
          </label>
          <input
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            required
            className={inputClass}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="font-mono text-[10px] tracking-[0.2em] text-muted uppercase">
            New password
          </label>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            className={inputClass}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="font-mono text-[10px] tracking-[0.2em] text-muted uppercase">
            Confirm new password
          </label>
          <input
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            required
            className={inputClass}
          />
        </div>

        {error && <p className="font-mono text-xs text-danger">{error}</p>}
        {success && <p className="font-mono text-xs text-green">Password updated successfully.</p>}

        <Button
          variant="submit"
          size="md"
          type="submit"
          className="mt-1 rounded-xl font-mono tracking-wider"
          disabled={isPending}
        >
          {isPending ? "Updating..." : "Update password"}
        </Button>
      </form>
    </div>
  );
}
