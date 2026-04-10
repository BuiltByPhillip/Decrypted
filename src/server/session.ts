import { SignJWT, jwtVerify } from "jose";
import { env } from "~/env";

const secret = new TextEncoder().encode(env.JWT_SECRET);
const COOKIE_NAME = "session";
const EXPIRES_IN = 60 * 60 * 24 * 7; // 7 days in seconds

export async function signToken(userId: string): Promise<string> {
  return new SignJWT({ userId })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime(`${EXPIRES_IN}s`)
    .sign(secret);
}

export async function verifyToken(token: string): Promise<{ userId: string } | null> {
  try {
    const { payload } = await jwtVerify(token, secret);
    return { userId: payload.userId as string };
  } catch {
    return null;
  }
}

export { COOKIE_NAME, EXPIRES_IN };
