"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Button from "~/components/Button";
import Footer from "~/app/_components/Footer";

// ─── Feature data ─────────────────────────────────────────────────────────────

const FEATURES = [
  {
    num: "01",
    title: "Define",
    body: "Describe your protocol in a simple DSL - roles, variables, steps. No config files, no boilerplate. Just write what you mean.",
    tag: "Write once.",
  },
  {
    num: "02",
    title: "Teach",
    body: "Your DSL becomes an interactive exercise - drag-and-drop expression building, multiple choice, and more. Students engage with the material rather than just reading it.",
    tag: "Scaffold learning.",
  },
  {
    num: "03",
    title: "Verify",
    body: "Students get immediate feedback on every attempt. Right or wrong, they know straight away - no waiting, no guessing.",
    tag: "Close the loop.",
  },
];

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function LandingPage() {
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);
  const cardsRef = useRef<HTMLDivElement>(null);
  const [cardsVisible, setCardsVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(true);
    window.addEventListener("scroll", onScroll, { once: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const el = cardsRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setCardsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      style={{
        backgroundColor: "#1a1f26",
        backgroundImage: "radial-gradient(rgba(34,197,94,0.12) 1px, transparent 1px)",
        backgroundSize: "28px 28px",
      }}
    >
      {/* ── Hero ── */}
      <section className="bg-pattern relative flex min-h-screen flex-col items-center justify-center rounded-b-3xl">
        

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
              Educational · Cryptographic · Interactive
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
            Write a protocol once. Decrypted turns it into an exercise
            students can actually work through - including drag-and-drop,
            multiple choice, and more.
          </p>

          {/* CTAs */}
          <div
            className="flex flex-wrap justify-center gap-3 opacity-0"
            style={{
              animation: "fade-up 0.55s ease forwards",
              animationDelay: "0.52s",
            }}
          >
            <Button
              variant="submit"
              size="lg"
              onClick={() => router.push("/editor")}
            >
              Create exercise
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => router.push("/documentation")}
            >
              Documentation
            </Button>
          </div>
        </div>

        {/* scroll cue */}
        <div
          aria-hidden="true"
          className="absolute bottom-10 left-1/2 -translate-x-1/2 opacity-0"
          style={{
            animation: "fade-up 0.5s ease forwards",
            animationDelay: "0.8s",
          }}
        >
          <div
            className={`flex flex-col items-center gap-2 ${scrolled ? "" : "animate-bounce"}`}
            style={{ animationDelay: "1.4s" }}
          >
            <span className="text-medium font-mono text-[9px] tracking-[0.3em] uppercase">
              scroll
            </span>
            <div className="from-medium h-8 w-px bg-gradient-to-b to-transparent" />
          </div>
        </div>
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

          {/* cards */}
          <div ref={cardsRef} className="grid gap-5 sm:grid-cols-3">
            {FEATURES.map((f, i) => (
              <div
                key={f.num}
                className="group border-medium bg-dark/60 hover:border-muted relative flex flex-col gap-4 overflow-hidden rounded-2xl border p-8 transition-all duration-300"
                style={{
                  opacity: cardsVisible ? 1 : 0,
                  transform: cardsVisible ? "translateY(0)" : "translateY(32px)",
                  transitionProperty: "opacity, transform",
                  transitionDuration: "0.6s",
                  transitionTimingFunction: "ease",
                  transitionDelay: `${i * 150}ms`,
                }}
              >
                {/* green accent bar - grows on group hover via CSS */}
                <div
                  className="bg-green absolute top-8 left-0 w-0.5 rounded-r-full opacity-40 transition-all duration-500 group-hover:h-12 group-hover:opacity-100"
                  style={{ height: "1.5rem" }}
                />

                <span className="text-medium absolute top-6 right-7 font-mono text-3xl font-bold tracking-widest">
                  {f.num}
                </span>
                <h3 className="text-soft-white text-xl font-extrabold">
                  {f.title}
                </h3>
                <p className="text-muted flex-1 text-sm leading-relaxed">
                  {f.body}
                </p>
                <span className="text-green font-mono text-[11px] tracking-wider">
                  {f.tag}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA strip ── */}
      <section
        className="relative mx-4 mb-4 overflow-hidden rounded-3xl lg:mx-8 xl:mx-16"
        style={{ backgroundColor: "#141820" }}
      >
        {/* corner brackets */}
        <span aria-hidden="true" className="border-green/20 absolute top-5 left-5 h-7 w-7 rounded-tl-sm border-t border-l" />
        <span aria-hidden="true" className="border-green/20 absolute top-5 right-5 h-7 w-7 rounded-tr-sm border-t border-r" />
        <span aria-hidden="true" className="border-green/20 absolute bottom-5 left-5 h-7 w-7 rounded-bl-sm border-b border-l" />
        <span aria-hidden="true" className="border-green/20 absolute right-5 bottom-5 h-7 w-7 rounded-br-sm border-r border-b" />

        <div className="mx-auto flex max-w-6xl flex-col items-center gap-6 px-8 py-20 text-center">
          <span className="text-green font-mono text-[10px] tracking-[0.32em] uppercase">
            Get started
          </span>
          <h2 className="text-soft-white max-w-md text-3xl font-extrabold tracking-tight">
            Ready to build your first exercise?
          </h2>
          <p className="text-muted max-w-sm text-sm leading-relaxed">
            Open the editor and start writing. Your first exercise is closer than you think.
          </p>
          <Button
            variant="submit"
            size="lg"
            onClick={() => router.push("/editor")}
          >
            Open the editor
          </Button>
        </div>
      </section>

      <Footer />
    </div>
  );
}
