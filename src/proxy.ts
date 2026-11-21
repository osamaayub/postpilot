import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, verifySessionToken } from "@/features/auth/server/token";

const APP = ["/write", "/history", "/settings"];
const AUTH = ["/login", "/signup"];

/** Fast, optimistic redirect only (no database). The real check is getCurrentUser() on the server. */
export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const session = await verifySessionToken(req.cookies.get(SESSION_COOKIE)?.value, process.env.SESSION_SECRET ?? "");
  if (!session && APP.some((p) => pathname.startsWith(p))) return NextResponse.redirect(new URL("/login", req.url));
  if (session && AUTH.includes(pathname)) return NextResponse.redirect(new URL("/write", req.url));
  return NextResponse.next();
}

export const config = { matcher: ["/write/:path*", "/history/:path*", "/settings/:path*", "/login", "/signup"] };
