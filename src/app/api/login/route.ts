import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "~/server/db";
import { users } from "~/server/db/schema";
import { eq } from "drizzle-orm";
import { signToken, COOKIE_NAME, EXPIRES_IN } from "~/server/session";
import { rateLimit, getIp } from "~/server/rateLimit";

// Fallback hash used when no user is found, so bcrypt.compare always runs
// and both code paths take the same amount of time (prevents email enumeration).
const DUMMY_HASH =
  "$2b$12$invalidhashthatisonlyusedfortimingpurposes00000000000";

const LOGIN_MAX_ATTEMPTS = 10;
const LOGIN_WINDOW_MS = 15 * 60 * 1000; // 15 minutes

export async function POST(req: NextRequest) {
  const ip = getIp(req);
  const { allowed, retryAfterMs } = rateLimit(
    `login:${ip}`,
    LOGIN_MAX_ATTEMPTS,
    LOGIN_WINDOW_MS,
  );

  if (!allowed) {
    const retryAfterSecs = Math.ceil(retryAfterMs / 1000);
    return NextResponse.json(
      { error: "Too many login attempts. Please try again later." },
      {
        status: 429,
        headers: { "Retry-After": String(retryAfterSecs) },
      },
    );
  }

  const body = (await req.json()) as { email?: string; password?: string };
  const { email, password } = body;

  if (!email || !password) {
    return NextResponse.json(
      { error: "Missing email or password" },
      { status: 400 },
    );
  }

  const user = await db.query.users.findFirst({
    where: eq(users.email, email),
  });

  // Always run bcrypt.compare regardless of whether the user exists.
  // This ensures both paths take the same time, preventing email enumeration
  // via timing differences.
  const hash = user?.passwordHash ?? DUMMY_HASH;
  const valid = await bcrypt.compare(password, hash);

  if (!user || !valid) {
    return NextResponse.json(
      { error: "Invalid email or password" },
      { status: 401 },
    );
  }

  const token = await signToken(user.id, user.email, user.createdAt);

  const response = NextResponse.json({ ok: true });
  response.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: EXPIRES_IN,
    path: "/",
  });

  return response;
}
