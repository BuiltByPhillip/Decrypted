"use client";

const tabs = [
  { id: "profile", label: "Profile" },
  { id: "security", label: "Security" },
  { id: "danger", label: "Danger zone" },
];

type Props = {
  activeTab: string;
  onTabChange: (tab: string) => void;
};

export default function AccountSidebar({ activeTab, onTabChange }: Props) {
  const handleLogout = async () => {
    await fetch("/api/logout", { method: "POST" });
    window.location.href = "/";
  };

  return (
    <nav className="flex h-full flex-col gap-1">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`cursor-pointer rounded-lg px-3 py-2 text-left font-mono text-xs transition-colors duration-150 ${
            activeTab === tab.id
              ? tab.id === "danger"
                ? "bg-danger/10 text-danger"
                : "bg-green/10 text-green"
              : tab.id === "danger"
                ? "text-muted hover:bg-medium/30 hover:text-danger/70"
                : "text-muted hover:bg-medium/30 hover:text-soft-white"
          }`}
        >
          {tab.label}
        </button>
      ))}

      <div className="mt-auto border-t border-medium/40 pt-4">
        <button
          onClick={handleLogout}
          className="w-full cursor-pointer rounded-lg px-3 py-2 text-left font-mono text-xs text-muted transition-colors duration-150 hover:bg-danger/10 hover:text-danger"
        >
          Log out
        </button>
      </div>
    </nav>
  );
}
