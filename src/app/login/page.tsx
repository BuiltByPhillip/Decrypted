import Button from "~/components/Button";
import ButtonLink from "~/components/ButtonLink";

export default function LoginPage() {
  return (
    <main
      className="flex min-h-screen flex-col items-center justify-center"
      style={{
        backgroundColor: "#1a1f26",
        backgroundImage: "radial-gradient(rgba(34,197,94,0.12) 1px, transparent 1px)",
        backgroundSize: "28px 28px",
      }}
    >
      <div className="w-full max-w-lg px-6 opacity-0 [animation:fade-up_0.55s_ease_forwards] [animation-delay:0.1s]">
        <div className="relative rounded-2xl border border-medium/50 bg-[#141820] px-8 py-10">
          {/* Corner brackets */}
          <span aria-hidden="true" className="absolute -top-3 -left-3 h-6 w-6 rounded-tl border-t border-l border-green/40" />
          <span aria-hidden="true" className="absolute -top-3 -right-3 h-6 w-6 rounded-tr border-t border-r border-green/40" />
          <span aria-hidden="true" className="absolute -bottom-3 -left-3 h-6 w-6 rounded-bl border-b border-l border-green/40" />
          <span aria-hidden="true" className="absolute -right-3 -bottom-3 h-6 w-6 rounded-br border-b border-r border-green/40" />
          {/* Eyebrow */}
          <p className="mb-6 font-mono text-[10px] tracking-[0.32em] text-green uppercase">
            // secure access
          </p>

          {/* Heading */}
          <h1 className="mb-1 text-2xl font-extrabold tracking-tight text-soft-white">
            Welcome back
          </h1>
          <p className="mb-8 font-mono text-xs text-muted">
            Authenticate to continue
          </p>

          {/* Form */}
          <form className="flex flex-col gap-5">
            <div className="flex flex-col gap-1.5">
              <label className="font-mono text-[10px] tracking-[0.2em] text-muted uppercase">
                Email
              </label>
              <input
                type="email"
                placeholder="you@example.com"
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
                className="w-full rounded-lg border border-medium/60 bg-dark/60 px-4 py-2.5 font-mono text-sm text-soft-white placeholder:text-muted/40 transition duration-200 focus:border-green/60 focus:ring-1 focus:ring-green/20 focus:outline-none"
              />
            </div>

            <Button variant="submit" size="md" className="mt-2 w-full rounded-xl font-mono tracking-wider">
              Access system
            </Button>
          </form>

          {/* Divider */}
          <div className="my-6 flex items-center gap-3">
            <span className="h-px flex-1 bg-medium/40" />
            <span className="font-mono text-[10px] tracking-widest text-muted/50 uppercase">or</span>
            <span className="h-px flex-1 bg-medium/40" />
          </div>

          {/* Register link */}
          <p className="text-center font-mono text-xs text-muted">
            No account?{" "}
            <ButtonLink variant="ghostMuted" size="none" href="/register" className="text-green text-xs font-mono hover:text-green/80">
              Create one
            </ButtonLink>
          </p>
        </div>
      </div>
    </main>
  );
}
