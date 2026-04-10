import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifyToken } from "~/server/session";
import { db } from "~/server/db";
import { users } from "~/server/db/schema";
import { eq } from "drizzle-orm";
import AccountSidebar from "./AccountSidebar";
import ProfileSection from "./ProfileSection";
import SecuritySection from "./SecuritySection";
import DangerSection from "./DangerSection";

export default async function AccountPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const cookieStore = await cookies();
  const token = cookieStore.get("session")?.value;
  const session = token ? await verifyToken(token) : null;

  if (!session) redirect("/login");

  const user = await db.query.users.findFirst({
    where: eq(users.id, session.userId),
  });

  if (!user) redirect("/login");

  const { tab = "profile" } = await searchParams;

  return (
    <main
      className="flex h-screen overflow-hidden bg-[#1a1f26]"
    >
      {/* Sidebar */}
      <div className="flex w-64 shrink-0 flex-col border-r border-medium/40 bg-[#141820] px-6 pb-10 pt-24">
        <p className="mb-8 font-mono text-[10px] tracking-[0.32em] text-green uppercase">
          // account
        </p>
        <AccountSidebar activeTab={tab} />
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-12 pb-12 pt-24 opacity-0 [animation:fade-up_0.55s_ease_forwards] [animation-delay:0.1s]">
        <div className="mx-auto max-w-2xl">
          {tab === "profile" && <ProfileSection user={user} />}
          {tab === "security" && <SecuritySection />}
          {tab === "danger" && <DangerSection />}
        </div>
      </div>
    </main>
  );
}
