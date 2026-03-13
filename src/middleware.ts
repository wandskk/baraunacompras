import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getSessionFromCookie, verifySessionToken } from "@/lib/jwt";

const PUBLIC_PATHS = ["/login", "/register", "/loja"];
const PUBLIC_API_PREFIXES = ["/api/auth", "/api/public"];

function isPublicPath(pathname: string): boolean {
  return PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

function isPublicApi(pathname: string): boolean {
  if (PUBLIC_API_PREFIXES.some((p) => pathname.startsWith(p))) return true;
  if (pathname === "/api/tenants" && pathname.split("/").length <= 4) return true;
  return false;
}

function requiresAuth(pathname: string): boolean {
  if (pathname.startsWith("/dashboard")) return true;
  if (pathname === "/api/tenants") return false;
  if (pathname.startsWith("/api/tenants/")) return true;
  return false;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

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
  matcher: ["/dashboard/:path*", "/api/tenants/:path*"],
};
