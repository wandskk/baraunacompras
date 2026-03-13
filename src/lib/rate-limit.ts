const store = new Map<string, { count: number; resetAt: number }>();

const WINDOW_MS = 60 * 1000;
const AUTH_LIMIT = 10;
const PUBLIC_LIMIT = 60;

function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]?.trim() ?? "unknown";
  const realIp = request.headers.get("x-real-ip");
  return realIp ?? "unknown";
}

function getLimit(pathname: string): number {
  if (pathname.startsWith("/api/auth/login") || pathname.startsWith("/api/auth/register")) {
    return AUTH_LIMIT;
  }
  return PUBLIC_LIMIT;
}

export function checkRateLimit(request: Request): { ok: boolean; remaining: number } {
  const ip = getClientIp(request);
  const pathname = new URL(request.url).pathname;
  if (!pathname.startsWith("/api/auth") && !pathname.startsWith("/api/public")) {
    return { ok: true, remaining: 999 };
  }
  const limit = getLimit(pathname);
  const now = Date.now();
  let entry = store.get(ip);
  if (!entry) {
    entry = { count: 1, resetAt: now + WINDOW_MS };
    store.set(ip, entry);
    return { ok: true, remaining: limit - 1 };
  }
  if (now > entry.resetAt) {
    entry = { count: 1, resetAt: now + WINDOW_MS };
    store.set(ip, entry);
    return { ok: true, remaining: limit - 1 };
  }
  entry.count++;
  const remaining = Math.max(0, limit - entry.count);
  if (entry.count > limit) {
    return { ok: false, remaining: 0 };
  }
  return { ok: true, remaining };
}

export function rateLimitResponse(): Response {
  return new Response(
    JSON.stringify({
      code: "RATE_LIMIT_EXCEEDED",
      error: "Muitas requisições. Tente novamente em alguns minutos.",
    }),
    {
      status: 429,
      headers: {
        "Content-Type": "application/json",
        "Retry-After": "60",
      },
    }
  );
}
