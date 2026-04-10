"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "~/trpc/react";
import Button from "~/components/Button";

export default function RegisterForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [clientError, setClientError] = useState<string | null>(null);

  const register = api.user.register.useMutation({
    onSuccess: () => router.push("/login"),
    onError: (e) => {
      const zodMessage = e.data?.zodError?.fieldErrors;
      if (zodMessage) {
        const first = Object.values(zodMessage).flat()[0];
        setClientError(first ?? e.message);
      } else {
        setClientError(e.message);
      }
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setClientError(null);
    if (password !== confirmPassword) {
      setClientError("Passwords do not match");
      return;
    }
    register.mutate({ email, password });
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

      <div className="flex flex-col gap-1.5">
        <label className="font-mono text-[10px] tracking-[0.2em] text-muted uppercase">
          Confirm password
        </label>
        <input
          type="password"
          placeholder="••••••••"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          className="w-full rounded-lg border border-medium/60 bg-dark/60 px-4 py-2.5 font-mono text-sm text-soft-white placeholder:text-muted/40 transition duration-200 focus:border-green/60 focus:ring-1 focus:ring-green/20 focus:outline-none"
        />
      </div>

      {clientError && (
        <p className="font-mono text-xs text-danger">{clientError}</p>
      )}

      <Button
        variant="submit"
        size="md"
        type="submit"
        className="mt-2 w-full rounded-xl font-mono tracking-wider"
        disabled={register.isPending}
      >
        {register.isPending ? "Creating account..." : "Create account"}
      </Button>
    </form>
  );
}
