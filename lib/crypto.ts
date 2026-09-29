import { createHmac, randomBytes, scryptSync, timingSafeEqual } from "crypto";

export function sha256(value: string): string {
  return createHmac("sha256", "avaliacao-ip").update(value).digest("hex");
}

export function hashIp(ip: string): string {
  return sha256(ip);
}

export function randomId(): string {
  return randomBytes(16).toString("hex");
}

export function protocolCode(date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  const rand = randomBytes(3).toString("hex").toUpperCase();
  return `NA-${y}${m}${d}-${rand}`;
}

export function hashPassword(password: string, salt: string): Buffer {
  return scryptSync(password, salt, 32);
}

export function verifyPassword(password: string, stored: string): boolean {
  if (stored.startsWith("scrypt:")) {
    const [, salt, hex] = stored.split(":");
    const actual = hashPassword(password, salt);
    const expected = Buffer.from(hex, "hex");
    if (actual.length !== expected.length) return false;
    return timingSafeEqual(actual, expected);
  }
  const a = Buffer.from(password);
  const b = Buffer.from(stored);
  if (a.length !== b.length) {
    timingSafeEqual(a, a);
    return false;
  }
  return timingSafeEqual(a, b);
}

export function makePasswordHash(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = hashPassword(password, salt).toString("hex");
  return `scrypt:${salt}:${hash}`;
}

export function timingSafeStringEqual(a: string, b: string): boolean {
  const aa = Buffer.from(a);
  const bb = Buffer.from(b);
  if (aa.length !== bb.length) {
    timingSafeEqual(aa, aa);
    return false;
  }
  return timingSafeEqual(aa, bb);
}
