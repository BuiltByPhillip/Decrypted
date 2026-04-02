import { Github } from "lucide-react";

const CIPHER = "01000100 01000101 01000011 01010010 01011001 01010000 01010100 01000101 01000100";

export default function Footer() {
  return (
    <footer className="w-full border-t border-medium bg-dark/70">
      <div className="mx-auto max-w-6xl px-8 py-10">

        {/* Top row */}
        <div className="flex flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">

          {/* Brand + tagline */}
          <div className="flex flex-col gap-2">
            <span className="text-dark-foreground text-sm font-extrabold uppercase tracking-[0.25em]">
              Decrypted
            </span>
            <p className="text-muted max-w-xs text-xs leading-relaxed">
              An open educational framework for building interactive
              cryptographic protocol exercises.
            </p>
          </div>

          {/* Links */}
          <div className="flex flex-col gap-3">
            <span className="text-dark-foreground text-xs font-semibold uppercase tracking-widest">
              Project
            </span>
            <a
              href="https://github.com/BuiltByPhillip/Decrypted"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted hover:text-dark-foreground flex items-center gap-2 text-xs transition-colors duration-200"
            >
              <Github size={13} />
              Source code
            </a>
            <a
              href="/editor"
              className="text-muted hover:text-dark-foreground text-xs transition-colors duration-200"
            >
              Create exercise
            </a>
          </div>
        </div>

        {/* Divider + bottom row */}
        <div className="border-medium mt-8 flex flex-col items-start gap-3 border-t pt-6 sm:flex-row sm:items-center sm:justify-between">
          <span className="text-medium font-mono text-[10px] tracking-wider select-none">
            {CIPHER}
          </span>
          <span className="text-medium text-xs">
            © {new Date().getFullYear()} Decrypted
          </span>
        </div>

      </div>
    </footer>
  );
}
