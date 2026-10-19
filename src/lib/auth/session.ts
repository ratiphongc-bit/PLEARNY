import { createHmac, timingSafeEqual } from "node:crypto";
import type { NextRequest, NextResponse } from "next/server";

export const SESSION_COOKIE = "webdev_app_session";
export const OAUTH_STATE_COOKIE = "plearny_oauth_state";
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 30;

export type AuthUser = {
  openId: string;
  name: string;
  email?: string;
};

type SessionClaims = AuthUser & {
  appId: string;
  iat: number;
  exp: number;
};

function secret(): string {
  const value = process.env.MANUS_JWT_SECRET;
  if (!value) throw new Error("Authentication is not configured");
  return value;
}

function appId(): string {
  const value = process.env.MANUS_PROJECT_ID;
  if (!value) throw new Error("Authentication is not configured");
  return value;
}

function sign(value: string): string {
  return createHmac("sha256", secret()).update(value).digest("base64url");
}

function equalSignatures(left: string, right: string): boolean {
  const a = Buffer.from(left);
  const b = Buffer.from(right);
  return a.length === b.length && timingSafeEqual(a, b);
}

export function signStateCookie(payload: Record<string, string | number>): string {
  const encoded = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${encoded}.${sign(encoded)}`;
}

export function verifyStateCookie(token: string): Record<string, string | number> | null {
  const [encoded, signature, extra] = token.split(".");
  if (!encoded || !signature || extra) return null;
  if (!equalSignatures(sign(encoded), signature)) return null;
  try {
    const parsed: unknown = JSON.parse(Buffer.from(encoded, "base64url").toString("utf8"));
    return parsed && typeof parsed === "object" && !Array.isArray(parsed)
      ? (parsed as Record<string, string | number>)
      : null;
  } catch {
    return null;
  }
}

export function createSessionToken(user: AuthUser, now = Math.floor(Date.now() / 1000)): string {
  const header = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString("base64url");
  const claims: SessionClaims = {
    openId: user.openId,
    name: user.name,
    ...(user.email ? { email: user.email } : {}),
    appId: appId(),
    iat: now,
    exp: now + SESSION_TTL_SECONDS,
  };
  const payload = Buffer.from(JSON.stringify(claims)).toString("base64url");
  const input = `${header}.${payload}`;
  return `${input}.${sign(input)}`;
}

export function verifySessionToken(token: string, now = Math.floor(Date.now() / 1000)): AuthUser | null {
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  const [headerPart, payloadPart, signature] = parts;
  if (!headerPart || !payloadPart || !signature) return null;

  try {
    const header = JSON.parse(Buffer.from(headerPart, "base64url").toString("utf8")) as { alg?: string };
    if (header.alg !== "HS256") return null;
    const expected = sign(`${headerPart}.${payloadPart}`);
    if (!equalSignatures(expected, signature)) return null;

    const claims = JSON.parse(Buffer.from(payloadPart, "base64url").toString("utf8")) as Partial<SessionClaims>;
    if (claims.appId !== appId() || typeof claims.exp !== "number" || claims.exp <= now) return null;
    if (typeof claims.openId !== "string" || !claims.openId.trim()) return null;
    return {
      openId: claims.openId,
      name: typeof claims.name === "string" && claims.name.trim() ? claims.name.trim() : "นักผจญภัย",
      ...(typeof claims.email === "string" ? { email: claims.email } : {}),
    };
  } catch {
    return null;
  }
}

export function getRequestUser(request: NextRequest): AuthUser | null {
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  try {
    return verifySessionToken(token);
  } catch {
    return null;
  }
}

export function setSessionCookie(response: NextResponse, token: string, secure: boolean): void {
  response.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure,
    sameSite: secure ? "none" : "lax",
    path: "/",
    maxAge: SESSION_TTL_SECONDS,
  });
}

export function clearSessionCookie(response: NextResponse, secure: boolean): void {
  response.cookies.set(SESSION_COOKIE, "", {
    httpOnly: true,
    secure,
    sameSite: secure ? "none" : "lax",
    path: "/",
    maxAge: 0,
  });
}
