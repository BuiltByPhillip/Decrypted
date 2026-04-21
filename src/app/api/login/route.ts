import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "~/server/db";
import { users } from "~/server/db/schema";
import { eq } from "drizzle-orm";
import { signToken, COOKIE_NAME, EXPIRES_IN } from "~/server/session";

// Fallback hash used when no user is found, so bcrypt.compare always runs
// and both code paths take the same amount of time (prevents email enumeration).
const DUMMY_HASH =
  "$2b$12$invalidhashthatisonlyusedfortimingpurposes00000000000";

// Artificial delay added to every failed attempt.
// Makes brute force attacks impractically slow without requiring external state.
const FAILURE_DELAY_MS = 1500;

export async function POST(req: NextRequest) {
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
    await new Promise((resolve) => setTimeout(resolve, FAILURE_DELAY_MS));
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
