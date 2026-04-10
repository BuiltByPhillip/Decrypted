"use client";

import { LogOut } from "lucide-react";

export default function LogoutIcon() {
  const handleLogout = async () => {
    await fetch("/api/logout", { method: "POST" });
    window.location.href = "/";
  };

  return (
    <button
      onClick={handleLogout}
      className="flex flex-col items-center gap-0.5 text-muted hover:text-danger transition-colors duration-200 cursor-pointer"
      aria-label="Log out"
    >
      <LogOut size={24} strokeWidth={1.5} />
      <span className="font-mono text-[9px] tracking-widest uppercase">Log out</span>
    </button>
  );
}
