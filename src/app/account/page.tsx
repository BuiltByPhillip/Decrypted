import { cookies } from "next/headers";
import { verifyToken } from "~/server/session";
import AccountContent from "./AccountContent";

export default async function AccountPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("session")!.value;
  const session = (await verifyToken(token))!;

  return (
    <main className="flex h-screen overflow-hidden bg-[#141820]">
      <AccountContent user={{ email: session.email, createdAt: session.createdAt }} />
    </main>
  );
}
