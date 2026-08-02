import { SignJWT, jwtVerify } from "jose";

const COOKIE_NAME = "aiwrapped_admin";
const MAX_AGE = 60 * 60 * 24 * 7;

function secretKey(): Uint8Array {
  const secret = process.env.SESSION_SECRET || "aiwrapped-dev-secret-change-me";
  return new TextEncoder().encode(secret);
}

export async function createSessionToken(): Promise<string> {
  return new SignJWT({ role: "admin" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secretKey());
}

export async function verifySessionToken(token: string | undefined): Promise<boolean> {
  if (!token) return false;
  try {
    const { payload } = await jwtVerify(token, secretKey());
    return payload.role === "admin";
  } catch {
    return false;
  }
}

export const SESSION_COOKIE = COOKIE_NAME;
export const SESSION_MAX_AGE = MAX_AGE;

export function adminPasswordIsSet(): boolean {
  const pw = process.env.ADMIN_PASSWORD;
  return typeof pw === "string" && pw.length > 0;
}

export function verifyAdminPassword(password: string): boolean {
  if (!adminPasswordIsSet()) return false;
  return password === process.env.ADMIN_PASSWORD;
}
