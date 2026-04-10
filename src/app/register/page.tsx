import ButtonLink from "~/components/ButtonLink";
import RegisterForm from "./RegisterForm";

export default function RegisterPage() {
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
            // new identity
          </p>

          {/* Heading */}
          <h1 className="mb-1 text-2xl font-extrabold tracking-tight text-soft-white">
            Create account
          </h1>
          <p className="mb-8 font-mono text-xs text-muted">
            Register to get started
          </p>

          <RegisterForm />

          {/* Divider */}
          <div className="my-6 flex items-center gap-3">
            <span className="h-px flex-1 bg-medium/40" />
            <span className="font-mono text-[10px] tracking-widest text-muted/50 uppercase">or</span>
            <span className="h-px flex-1 bg-medium/40" />
          </div>

          {/* Login link */}
          <p className="text-center font-mono text-xs text-muted">
            Already have an account?{" "}
            <ButtonLink variant="ghostMuted" size="none" href="/login" className="text-green text-xs font-mono hover:text-green/80">
              Log in
            </ButtonLink>
          </p>
        </div>
      </div>
    </main>
  );
}
