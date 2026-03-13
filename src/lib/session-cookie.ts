import { createSessionToken, getSessionCookie } from "./jwt";
import type { AuthSession } from "@/modules/auth/types";

const MAX_AGE = 60 * 60 * 24 * 7; // 7 dias

export function getSessionCookieOptions() {
  const isProd = process.env.NODE_ENV === "production";
  return {
    httpOnly: true,
    secure: isProd,
    sameSite: "lax" as const,
    maxAge: MAX_AGE,
    path: "/",
  };
}

export async function setSessionCookie(session: AuthSession): Promise<string> {
  const token = await createSessionToken({
    userId: session.userId,
    tenantId: session.tenantId,
    email: session.email,
  });
  return `${getSessionCookie()}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${MAX_AGE}${process.env.NODE_ENV === "production" ? "; Secure" : ""}`;
}

export function clearSessionCookie(): string {
  return `${getSessionCookie()}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`;
}
