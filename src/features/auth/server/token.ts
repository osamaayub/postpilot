import { SignJWT, jwtVerify } from "jose";

// Pure JWT helpers shared by proxy.ts (edge-safe) and the server. No Next.js imports.
export const SESSION_COOKIE = "postpilot_session";
export const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7;
export type SessionPayload = { userId: string };

const key = (secret: string) => new TextEncoder().encode(secret);

export function signSessionToken(payload: SessionPayload, secret: string) {
  return new SignJWT(payload).setProtectedHeader({ alg: "HS256" }).setIssuedAt().setExpirationTime(`${SESSION_TTL_SECONDS}s`).sign(key(secret));
}

export async function verifySessionToken(token: string | undefined, secret: string): Promise<SessionPayload | null> {
  if (!token || !secret) return null;
  try {
    const { payload } = await jwtVerify(token, key(secret), { algorithms: ["HS256"] });
    return typeof payload.userId === "string" ? { userId: payload.userId } : null;
  } catch {
    return null;
  }
}
