import "server-only";
import { randomBytes } from "node:crypto";
import type { NextRequest } from "next/server";
import { getPublicOrigin } from "@/lib/auth/public-origin";
import { OAUTH_STATE_COOKIE, signStateCookie, verifyStateCookie } from "@/lib/auth/session";

export type OAuthState = {
  nonce: string;
  origin: string;
  redirectUri: string;
  createdAt: number;
};

export function createOAuthStart(request: NextRequest): { authorizationUrl: string; cookieValue: string; origin: string } {
  const projectId = process.env.MANUS_PROJECT_ID;
  const portalUrl = process.env.MANUS_OAUTH_PORTAL_URL;
  if (!projectId || !portalUrl) throw new Error("Manus OAuth is not configured");

  const origin = getPublicOrigin(request);
  const redirectUri = new URL("/api/auth/callback", origin).toString();
  const nonce = randomBytes(32).toString("base64url");
  const state = Buffer.from(JSON.stringify({ redirectUri, nonce })).toString("base64url");
  const authorization = new URL("/app-auth", portalUrl);
  authorization.searchParams.set("appId", projectId);
  authorization.searchParams.set("redirectUri", redirectUri);
  authorization.searchParams.set("state", state);
  authorization.searchParams.set("responseType", "code");
  const cookieValue = signStateCookie({ nonce, origin, redirectUri, createdAt: Date.now() });
  return { authorizationUrl: authorization.toString(), cookieValue, origin };
}

export function oauthStateCookieOptions(secure: boolean) {
  return {
    httpOnly: true,
    secure,
    sameSite: "lax" as const,
    path: "/",
    maxAge: 300,
  };
}

export function oauthStateCookieName(): string {
  return OAUTH_STATE_COOKIE;
}

export function parseOAuthState(request: NextRequest): { nonce: string; redirectUri: string; origin: string } | null {
  const stateValue = request.nextUrl.searchParams.get("state");
  const cookie = request.cookies.get(OAUTH_STATE_COOKIE)?.value;
  if (!stateValue || !cookie) return null;
  try {
    const decoded = JSON.parse(Buffer.from(stateValue, "base64url").toString("utf8")) as { nonce?: unknown; redirectUri?: unknown };
    const verified = verifyStateCookie(cookie);
    if (!verified || typeof decoded.nonce !== "string" || typeof decoded.redirectUri !== "string") return null;
    if (verified.nonce !== decoded.nonce || verified.redirectUri !== decoded.redirectUri || typeof verified.origin !== "string") return null;
    if (typeof verified.createdAt !== "number" || Date.now() - verified.createdAt > 5 * 60_000) return null;
    return { nonce: decoded.nonce, redirectUri: decoded.redirectUri, origin: verified.origin };
  } catch {
    return null;
  }
}
