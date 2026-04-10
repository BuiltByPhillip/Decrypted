"use client";

import { useState } from "react";
import Button from "~/components/Button";

export default function DangerSection() {
  const [confirming, setConfirming] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    setIsPending(true);
    try {
      const res = await fetch("/api/delete-account", { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json() as { error?: string };
        setError(data.error ?? "Failed to delete account");
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
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="mb-1 text-xl font-extrabold tracking-tight text-soft-white">Danger zone</h2>
        <p className="font-mono text-xs text-muted">Irreversible actions</p>
      </div>

      <div className="h-px bg-medium/40" />

      <div className="flex flex-col gap-4 rounded-lg border border-danger/30 bg-danger/5 p-5">
        <div>
          <p className="mb-1 font-mono text-sm font-bold text-soft-white">Delete account</p>
          <p className="font-mono text-xs text-muted">
            Permanently deletes your account and all associated data. This cannot be undone.
          </p>
        </div>

        {!confirming ? (
          <Button
            variant="outline"
            size="sm"
            className="w-fit rounded-xl border-danger/50 font-mono text-danger hover:bg-danger/10 hover:scale-100"
            onClick={() => setConfirming(true)}
          >
            Delete account
          </Button>
        ) : (
          <div className="flex flex-col gap-3">
            <p className="font-mono text-xs text-danger">
              Are you sure? This cannot be undone.
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="rounded-xl font-mono hover:scale-100"
                onClick={() => setConfirming(false)}
                disabled={isPending}
              >
                Cancel
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="rounded-xl border-danger/50 font-mono text-danger hover:bg-danger/10 hover:scale-100"
                onClick={handleDelete}
                disabled={isPending}
              >
                {isPending ? "Deleting..." : "Yes, delete my account"}
              </Button>
            </div>
          </div>
        )}

        {error && <p className="font-mono text-xs text-danger">{error}</p>}
      </div>
    </div>
  );
}
