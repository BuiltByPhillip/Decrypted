"use client";

import { useState } from "react";
import AccountSidebar from "./AccountSidebar";
import ProfileSection from "./ProfileSection";
import SecuritySection from "./SecuritySection";
import DangerSection from "./DangerSection";

type User = { email: string; createdAt: Date };

export default function AccountContent({ user }: { user: User }) {
  const [activeTab, setActiveTab] = useState("profile");

  return (
    <>
      <div className="flex w-64 shrink-0 flex-col border-r border-medium/40 px-6 pb-10 pt-24">
        <p className="mb-8 font-mono text-[10px] tracking-[0.32em] text-green uppercase">
          // account
        </p>
        <AccountSidebar activeTab={activeTab} onTabChange={setActiveTab} />
      </div>

      <div className="flex-1 overflow-y-auto px-12 pb-12 pt-24">
        <div className="mx-auto max-w-2xl">
          {activeTab === "profile" && <ProfileSection user={user} />}
          {activeTab === "security" && <SecuritySection />}
          {activeTab === "danger" && <DangerSection />}
        </div>
      </div>
    </>
  );
}
