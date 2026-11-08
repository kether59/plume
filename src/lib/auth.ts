import { createHmac, timingSafeEqual } from "node:crypto";

export const SESSION_COOKIE = "plume_session";
export const SESSION_DURATION_SECONDS = 60 * 60 * 12;

export function authConfigurationError(): string | null {
  if (!process.env.APP_EMAIL || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(process.env.APP_EMAIL)) {
    return "APP_EMAIL doit contenir une adresse e-mail valide dans .env.";
  }
  if (!process.env.APP_PASSWORD) {
    return "APP_PASSWORD doit être défini dans le fichier .env.";
  }
  if (process.env.APP_PASSWORD.length < 12) {
    return "APP_PASSWORD doit contenir au moins 12 caractères dans .env.";
  }
  if (!process.env.AUTH_SECRET || Buffer.byteLength(process.env.AUTH_SECRET) < 32) {
    return "AUTH_SECRET doit contenir au moins 32 caractères dans .env.";
  }
  return null;
}

function signature(expiresAt: string): string {
  const secret = process.env.AUTH_SECRET;
  if (!secret) throw new Error("AUTH_SECRET is not configured");
  return createHmac("sha256", secret).update(expiresAt).digest("base64url");
}

export function verifyPassword(candidate: string): boolean {
  const configuredPassword = process.env.APP_PASSWORD;
  if (!configuredPassword) return false;
  const expected = createHmac("sha256", "password-comparison").update(configuredPassword).digest();
  const actual = createHmac("sha256", "password-comparison").update(candidate).digest();
  return timingSafeEqual(expected, actual);
}

export function verifyEmail(candidate: string): boolean {
  const configuredEmail = process.env.APP_EMAIL;
  if (!configuredEmail) return false;
  return candidate.trim().toLowerCase() === configuredEmail.trim().toLowerCase();
}

export function createSessionToken(): string {
  const expiresAt = String(Math.floor(Date.now() / 1000) + SESSION_DURATION_SECONDS);
  return `${expiresAt}.${signature(expiresAt)}`;
}

export function verifySessionToken(token: string | undefined): boolean {
  if (!token || authConfigurationError()) return false;
  const separator = token.indexOf(".");
  if (separator < 1) return false;

  const expiresAt = token.slice(0, separator);
  const suppliedSignature = token.slice(separator + 1);
  if (!/^\d+$/.test(expiresAt) || Number(expiresAt) <= Math.floor(Date.now() / 1000)) {
    return false;
  }

  const expected = Buffer.from(signature(expiresAt));
  const supplied = Buffer.from(suppliedSignature);
  return expected.length === supplied.length && timingSafeEqual(expected, supplied);
}
