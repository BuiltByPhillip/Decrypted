import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifyToken } from "~/server/session";
import { db } from "~/server/db";
import { users } from "~/server/db/schema";
import { eq } from "drizzle-orm";
import AccountContent from "./AccountContent";

export default async function AccountPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("session")?.value;
  const session = token ? await verifyToken(token) : null;

  if (!session) redirect("/login");

  const user = await db.query.users.findFirst({
    where: eq(users.id, session.userId),
  });

  if (!user) redirect("/login");

  return (
    <main className="flex h-screen overflow-hidden bg-[#141820]">
      <AccountContent user={user} />
    </main>
  );
}
