"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";

export default function CodeBlock({ children, label, preview }: { children: string; label?: string; preview?: React.ReactNode }) {
  const [copied, setCopied] = useState(false);
  const [tab, setTab] = useState<"code" | "preview">("code");

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
          {preview && (
            <div className="flex items-center gap-3">
              <button
                onClick={() => setTab("code")}
                className={`cursor-pointer font-mono text-[11px] transition-colors duration-150 ${tab === "code" ? "text-soft-white" : "text-muted hover:text-soft-white"}`}
              >
                Code
              </button>
              <button
                onClick={() => setTab("preview")}
                className={`cursor-pointer font-mono text-[11px] transition-colors duration-150 ${tab === "preview" ? "text-soft-white" : "text-muted hover:text-soft-white"}`}
              >
                Preview
              </button>
            </div>
          )}
        </div>
        {tab === "code" ? (
          <div className="relative">
            <pre className="text-muted overflow-auto px-5 py-4 font-mono text-[13px] leading-relaxed [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-white/10 [&::-webkit-scrollbar-thumb:hover]:bg-white/20">
              <code>{children}</code>
            </pre>
            <button
              onClick={handleCopy}
              className="cursor-pointer text-muted hover:text-soft-white absolute top-3 right-3 flex items-center gap-1.5 transition-colors duration-150"
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
        ) : (
          <div className="bg-[#0a0f16] pb-6">
            {preview}
          </div>
        )}
      </div>
    </div>
  );
}
