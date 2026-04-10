"use client";

import Link from "next/link";

const tabs = [
  { id: "profile", label: "Profile" },
  { id: "security", label: "Security" },
  { id: "danger", label: "Danger zone" },
];

export default function AccountSidebar({ activeTab }: { activeTab: string }) {
  const handleLogout = async () => {
    await fetch("/api/logout", { method: "POST" });
    window.location.href = "/";
  };

  return (
    <nav className="flex flex-col gap-1 h-full">
      {tabs.map((tab) => (
        <Link
          key={tab.id}
          href={`/account?tab=${tab.id}`}
          className={`rounded-lg px-3 py-2 font-mono text-xs transition-colors duration-150 ${
            activeTab === tab.id
              ? "bg-green/10 text-green"
              : "text-muted hover:bg-medium/30 hover:text-soft-white"
          } ${tab.id === "danger" && activeTab !== "danger" ? "hover:text-danger/70" : ""} ${
            tab.id === "danger" && activeTab === "danger" ? "bg-danger/10 text-danger" : ""
          }`}
        >
          {tab.label}
        </Link>
      ))}

      <div className="mt-auto pt-4 border-t border-medium/40">
        <button
          onClick={handleLogout}
          className="w-full rounded-lg px-3 py-2 font-mono text-xs text-muted transition-colors duration-150 hover:bg-danger/10 hover:text-danger text-left cursor-pointer"
        >
          Log out
        </button>
      </div>
    </nav>
  );
}
