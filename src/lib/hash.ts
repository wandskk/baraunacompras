import { hash as bcryptHash, compare as bcryptCompare } from "bcryptjs";

const SALT_ROUNDS = 12;

export async function hashPassword(password: string): Promise<string> {
  return bcryptHash(password, SALT_ROUNDS);
}

export async function verifyPassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  if (hashedPassword.startsWith("$2")) {
    return bcryptCompare(password, hashedPassword);
  }
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const legacyHash = hashArray
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return legacyHash === hashedPassword;
}

export function isLegacyHash(hashedPassword: string): boolean {
  return !hashedPassword.startsWith("$2");
}
