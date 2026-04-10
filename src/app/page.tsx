import Footer from "~/app/_components/Footer";
import HeroButtons from "~/app/_components/landing/HeroButtons";
import ScrollCue from "~/app/_components/landing/ScrollCue";
import FeatureCards from "~/app/_components/landing/FeatureCards";
import CTAButton from "~/app/_components/landing/CTAButton";
import ButtonLink from "~/components/ButtonLink";
import { cookies } from "next/headers";
import { verifyToken } from "~/server/session";
import { UserCircle } from "lucide-react";
import LogoutIcon from "~/app/_components/landing/LogoutIcon";

export const dynamic = "force-dynamic";

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function LandingPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("session")?.value;
  const session = token ? await verifyToken(token) : null;
  const isLoggedIn = !!session;

  return (
    <div
      style={{
        backgroundColor: "#1a1f26",
        backgroundImage:
          "radial-gradient(rgba(34,197,94,0.12) 1px, transparent 1px)",
        backgroundSize: "28px 28px",
      }}
    >
      {/* ── Hero ── */}
      <section className="bg-pattern relative flex min-h-screen flex-col items-center justify-center rounded-b-3xl">
        <div className="absolute top-6 right-8 z-20 flex items-center gap-3">
          {isLoggedIn ? (
            <>
              <a href="/account" className="flex flex-col items-center gap-0.5 text-muted hover:text-green transition-colors duration-200">
                <UserCircle size={24} strokeWidth={1.5} />
                <span className="font-mono text-[9px] tracking-widest uppercase">Account</span>
              </a>
              <LogoutIcon />
            </>
          ) : (
            <>
              <ButtonLink variant="submit" size="sm" className="rounded-xl" href="/login">Log in</ButtonLink>
              <ButtonLink variant="outline" size="sm" className="rounded-xl" href="/register">Create account</ButtonLink>
            </>
          )}
        </div>
        {/* ambient glow */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute top-1/2 left-1/2 h-120 w-160 -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{
            background:
              "radial-gradient(ellipse at center, rgba(34,197,94,0.07) 0%, transparent 68%)",
          }}
        />

        <div className="relative z-10 flex max-w-2xl flex-col items-center gap-7 px-6 text-center">
          {/* eyebrow */}
          <div
            className="flex items-center gap-3 opacity-0"
            style={{
              animation: "fade-up 0.55s ease forwards",
              animationDelay: "0.1s",
            }}
          >
            <span className="bg-green h-px w-6 opacity-70" />
            <span className="text-muted font-mono text-[10px] tracking-[0.32em] uppercase">
              Educational · Interactive · Learning
            </span>
            <span className="bg-green h-px w-6 opacity-70" />
          </div>

          {/* headline */}
          <h1
            className="text-soft-white text-5xl leading-[1.08] font-extrabold tracking-tight opacity-0 sm:text-6xl lg:text-7xl"
            style={{
              animation: "fade-up 0.55s ease forwards",
              animationDelay: "0.22s",
            }}
          >
            <span className="green-shimmer">Protocol exercises,</span>
            <br />
            <span className="logo-shimmer">built to be solved.</span>
          </h1>

          {/* sub */}
          <p
            className="text-muted max-w-lg text-base leading-relaxed opacity-0 sm:text-lg"
            style={{
              animation: "fade-up 0.55s ease forwards",
              animationDelay: "0.38s",
            }}
          >
            Write a protocol once. Decrypted turns it into an exercise students
            can actually work through - including drag-and-drop, multiple
            choice, and more.
          </p>

          {/* CTAs */}
          <div
            className="flex flex-wrap justify-center gap-3 opacity-0"
            style={{
              animation: "fade-up 0.55s ease forwards",
              animationDelay: "0.52s",
            }}
          >
            <HeroButtons />
          </div>
        </div>
        <ScrollCue />
      </section>

      {/* ── Features ── */}
      <section>
        <div className="mx-auto max-w-6xl px-8 py-24">
          {/* header */}
          <div className="mb-16 max-w-lg">
            <span className="text-green mb-3 block font-mono text-[10px] tracking-[0.32em] uppercase">
              How it works
            </span>
            <h2 className="text-soft-white mb-3 text-3xl font-extrabold tracking-tight">
              From definition to interaction
            </h2>
            <p className="text-muted text-sm leading-relaxed">
              Write it, render it, let students solve it.
            </p>
          </div>

          {/* Cards */}
          <FeatureCards />
        </div>
      </section>

      {/* ── CTA strip ── */}
      <section
        className="group relative mx-4 mb-4 overflow-hidden rounded-3xl lg:mx-8 xl:mx-16"
        style={{ backgroundColor: "#141820" }}
      >
        {/* corner brackets */}
        <span
          aria-hidden="true"
          className="border-green/20 group-hover:border-green/80 absolute top-5 left-5 h-7 w-7 rounded-tl-sm border-t border-l transition-colors duration-300"
        />
        <span
          aria-hidden="true"
          className="border-green/20 group-hover:border-green/80 absolute top-5 right-5 h-7 w-7 rounded-tr-sm border-t border-r transition-colors duration-300"
        />
        <span
          aria-hidden="true"
          className="border-green/20 group-hover:border-green/80 absolute bottom-5 left-5 h-7 w-7 rounded-bl-sm border-b border-l transition-colors duration-300"
        />
        <span
          aria-hidden="true"
          className="border-green/20 group-hover:border-green/80 absolute right-5 bottom-5 h-7 w-7 rounded-br-sm border-r border-b transition-colors duration-300"
        />


        <div className="mx-auto flex max-w-6xl flex-col items-center gap-6 px-8 py-20 text-center">
          <span className="text-green font-mono text-[10px] tracking-[0.32em] uppercase">
            Get started
          </span>
          <h2 className="text-soft-white max-w-md text-3xl font-extrabold tracking-tight">
            Ready to build your first exercise?
          </h2>
          <p className="text-muted max-w-sm text-sm leading-relaxed">
            Open the editor and start writing. Your first exercise is closer
            than you think.
          </p>
          <CTAButton />
        </div>
      </section>

      <Footer />
    </div>
  );
}
