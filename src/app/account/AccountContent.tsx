"use client";

import { useState, lazy, Suspense } from "react";
import AccountSidebar from "./AccountSidebar";

const ProfileSection = lazy(() => import("./ProfileSection"));
const SecuritySection = lazy(() => import("./SecuritySection"));
const DangerSection = lazy(() => import("./DangerSection"));

type User = { email: string; createdAt: Date };

function TabSkeleton() {
  return (
    <div className="flex flex-col gap-6 animate-pulse">
      <div className="flex flex-col gap-2">
        <div className="h-6 w-48 rounded bg-medium/40" />
        <div className="h-3 w-32 rounded bg-medium/30" />
      </div>
      <div className="h-px bg-medium/40" />
      <div className="flex flex-col gap-4">
        <div className="h-10 w-full rounded-lg bg-medium/30" />
        <div className="h-10 w-full rounded-lg bg-medium/30" />
        <div className="h-10 w-3/4 rounded-lg bg-medium/20" />
      </div>
    </div>
  );
}

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

      <div className="flex-1 overflow-y-auto px-12 pb-12 pt-24 opacity-0 [animation:fade-up_0.4s_ease_forwards] [animation-delay:0.05s]">
        <div className="mx-auto max-w-2xl">
          <Suspense fallback={<TabSkeleton />}>
            {activeTab === "profile" && <ProfileSection user={user} />}
            {activeTab === "security" && <SecuritySection />}
            {activeTab === "danger" && <DangerSection />}
          </Suspense>
        </div>
      </div>
    </>
  );
}
