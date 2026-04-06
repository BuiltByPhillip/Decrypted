"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";

export default function CodeBlock({ children, label }: { children: string; label?: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(children);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="my-6">
      {label && (
        <p className="text-soft-white mb-2 pl-4 text-xs font-semibold tracking-widest uppercase">{label}</p>
      )}
    <div className="border-medium overflow-hidden rounded-xl border bg-[#0d1117]">
      <div className="border-medium flex items-center justify-between border-b px-4 py-2.5">
        <div className="flex items-center gap-2">
          <span className="bg-mac-red h-2.5 w-2.5 rounded-full opacity-70" />
          <span className="bg-mac-yellow h-2.5 w-2.5 rounded-full opacity-70" />
          <span className="bg-mac-green h-2.5 w-2.5 rounded-full opacity-70" />
        </div>
        <button
          onClick={handleCopy}
          className="text-muted hover:text-soft-white flex items-center gap-1.5 transition-colors duration-150"
          aria-label="Copy code"
        >
          {copied ? (
            <>
              <Check size={13} className="text-green" />
              <span className="text-green font-mono text-[11px]">Copied</span>
            </>
          ) : (
            <>
              <Copy size={13} />
              <span className="font-mono text-[11px]">Copy</span>
            </>
          )}
        </button>
      </div>
      <pre className="text-muted overflow-x-auto px-5 py-4 font-mono text-[13px] leading-relaxed">
        <code>{children}</code>
      </pre>
    </div>
    </div>
  );
}
