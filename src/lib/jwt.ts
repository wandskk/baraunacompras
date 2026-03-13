const ALG = "HS256";
const SESSION_COOKIE = "barauna_session";
const DEFAULT_TTL = 60 * 60 * 24 * 7; // 7 dias

export type JwtPayload = {
  userId: string;
  tenantId: string;
  email: string;
  exp?: number;
};

function getSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET;
  const str = !secret
    ? process.env.NODE_ENV === "production"
      ? (() => {
          throw new Error("JWT_SECRET is required in production");
        })()
      : "dev-secret-change-in-production"
    : secret;
  return new TextEncoder().encode(str);
}

function base64UrlEncode(data: ArrayBuffer | Uint8Array): string {
  const bytes = data instanceof Uint8Array ? data : new Uint8Array(data);
  let binary = "";
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function base64UrlDecode(str: string): Uint8Array {
  str = str.replace(/-/g, "+").replace(/_/g, "/");
  const pad = str.length % 4;
  if (pad) str += "=".repeat(4 - pad);
  const binary = atob(str);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

export async function createSessionToken(payload: Omit<JwtPayload, "exp">): Promise<string> {
  const exp = Math.floor(Date.now() / 1000) + DEFAULT_TTL;
  const fullPayload = { ...payload, exp };
  const header = { alg: ALG, typ: "JWT" };
  const headerB64 = base64UrlEncode(new TextEncoder().encode(JSON.stringify(header)));
  const payloadB64 = base64UrlEncode(new TextEncoder().encode(JSON.stringify(fullPayload)));
  const signatureInput = `${headerB64}.${payloadB64}`;
  const key = await crypto.subtle.importKey(
    "raw",
    getSecret() as BufferSource,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(signatureInput)
  );
  const sigB64 = base64UrlEncode(sig);
  return `${signatureInput}.${sigB64}`;
}

export async function verifySessionToken(token: string): Promise<JwtPayload | null> {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const [headerB64, payloadB64, sigB64] = parts;
    const key = await crypto.subtle.importKey(
      "raw",
      getSecret() as BufferSource,
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["verify"]
    );
    const signatureInput = `${headerB64}.${payloadB64}`;
    const sigBytes = base64UrlDecode(sigB64);
    const valid = await crypto.subtle.verify(
      "HMAC",
      key,
      sigBytes as BufferSource,
      new TextEncoder().encode(signatureInput)
    );
    if (!valid) return null;
    const payloadStr = new TextDecoder().decode(base64UrlDecode(payloadB64));
    const payload = JSON.parse(payloadStr) as JwtPayload;
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) return null;
    return payload;
  } catch {
    return null;
  }
}

export function getSessionCookie(): string {
  return SESSION_COOKIE;
}

export function getSessionFromCookie(cookieHeader: string | null): string | null {
  if (!cookieHeader) return null;
  const match = cookieHeader.match(new RegExp(`${SESSION_COOKIE.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}=([^;]+)`));
  return match ? match[1] : null;
}
