"use client"

import { useEffect, useState } from "react";

export default function DocsScrollLogo() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 80);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div
      className={`fixed top-0 left-0 z-50 flex items-center px-8 py-5 transition-all duration-500 ${
        scrolled
          ? "translate-y-0 opacity-100"
          : "-translate-y-2 pointer-events-none opacity-0"
      }`}
    >
      <a href="/" className="logo-shimmer text-xl font-extrabold tracking-wide uppercase">
        decrypted
      </a>
    </div>
  );
}
