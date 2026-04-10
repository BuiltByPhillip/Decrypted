"use client";

import Link from "next/link";

const tabs = [
  { id: "profile", label: "Profile" },
  { id: "security", label: "Security" },
  { id: "danger", label: "Danger zone" },
];

export default function AccountSidebar({ activeTab }: { activeTab: string }) {
  return (
    <nav className="flex flex-col gap-1">
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
    </nav>
  );
}
