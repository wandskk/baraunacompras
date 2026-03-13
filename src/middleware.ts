import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getSessionFromCookie, verifySessionToken } from "@/lib/jwt";
import { checkRateLimit, rateLimitResponse } from "@/lib/rate-limit";

function requiresAuth(pathname: string): boolean {
  if (pathname.startsWith("/dashboard")) return true;
  if (pathname === "/api/tenants") return false;
  if (/^\/api\/tenants\/[^/]+\/stores\/[^/]+\/checkout$/.test(pathname)) return false;
  if (pathname.startsWith("/api/tenants/")) return true;
  return false;
}

function requiresRateLimit(pathname: string): boolean {
  return (
    pathname.startsWith("/api/auth/login") ||
    pathname.startsWith("/api/auth/register") ||
    pathname.startsWith("/api/public")
  );
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (requiresRateLimit(pathname)) {
    const { ok } = checkRateLimit(request);
    if (!ok) return rateLimitResponse();
  }

  if (!requiresAuth(pathname)) {
    return NextResponse.next();
  }

  const token = getSessionFromCookie(request.headers.get("cookie"));
  if (!token) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  const payload = await verifySessionToken(token);
  if (!payload) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Invalid session" }, { status: 401 });
    }
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/api/tenants/:path*",
    "/api/auth/login",
    "/api/auth/register",
    "/api/public/:path*",
  ],
};
