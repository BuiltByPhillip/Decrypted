import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "~/server/db";
import { users } from "~/server/db/schema";
import { eq } from "drizzle-orm";
import { verifyToken, COOKIE_NAME } from "~/server/session";

export async function DELETE() {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  const session = token ? await verifyToken(token) : null;

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await db.delete(users).where(eq(users.id, session.userId));

  const response = NextResponse.json({ ok: true });
  response.cookies.delete(COOKIE_NAME);
  return response;
}
