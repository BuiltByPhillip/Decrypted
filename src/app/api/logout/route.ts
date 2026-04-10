import { cookies } from "next/headers";
import { COOKIE_NAME } from "~/server/session";

export async function POST() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
  return new Response(null, { status: 200 });
}
