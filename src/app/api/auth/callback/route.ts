import { NextRequest, NextResponse } from "next/server";
import { parseOAuthState, oauthStateCookieName, oauthStateCookieOptions } from "@/lib/auth/oauth";
import { createSessionToken, setSessionCookie } from "@/lib/auth/session";

const EXCHANGE_PATH = "/webdev.v1.WebDevAuthPublicService/ExchangeToken";
const USER_INFO_PATH = "/webdev.v1.WebDevAuthPublicService/GetUserInfo";

type ExchangeResponse = { accessToken?: string; tokenType?: string };
type IdentityResponse = { openId?: string; name?: string; email?: string };

function redirectToLogin(origin: string, error: string) {
  return NextResponse.redirect(new URL(`/login?error=${encodeURIComponent(error)}`, origin));
}

export async function GET(request: NextRequest) {
  const authError = request.nextUrl.searchParams.get("error");
  const state = parseOAuthState(request);
  if (!state || state.redirectUri !== new URL("/api/auth/callback", state.origin).toString()) {
    return new NextResponse("Invalid or expired sign-in state. Return to PLEARNY and try again.", { status: 400 });
  }

  const code = request.nextUrl.searchParams.get("code");
  if (authError || !code) return redirectToLogin(state.origin, "sign_in_cancelled");

  const projectId = process.env.MANUS_PROJECT_ID;
  const oauthApi = process.env.MANUS_OAUTH_API_URL;
  if (!projectId || !oauthApi) return redirectToLogin(state.origin, "sign_in_unavailable");

  try {
    const exchangeResponse = await fetch(new URL(EXCHANGE_PATH, oauthApi), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ clientId: projectId, grantType: "authorization_code", code, redirectUri: state.redirectUri }),
      cache: "no-store",
      signal: AbortSignal.timeout(12_000),
    });
    if (!exchangeResponse.ok) return redirectToLogin(state.origin, "sign_in_failed");
    const exchange = await exchangeResponse.json() as ExchangeResponse;
    if (!exchange.accessToken) return redirectToLogin(state.origin, "sign_in_failed");

    const identityResponse = await fetch(new URL(USER_INFO_PATH, oauthApi), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ accessToken: exchange.accessToken }),
      cache: "no-store",
      signal: AbortSignal.timeout(12_000),
    });
    if (!identityResponse.ok) return redirectToLogin(state.origin, "identity_lookup_failed");
    const identity = await identityResponse.json() as IdentityResponse;
    if (!identity.openId || typeof identity.openId !== "string" || identity.openId.length > 191) {
      return redirectToLogin(state.origin, "identity_lookup_failed");
    }

    const token = createSessionToken({
      openId: identity.openId,
      name: typeof identity.name === "string" && identity.name.trim() ? identity.name.trim() : "นักผจญภัย",
      ...(typeof identity.email === "string" ? { email: identity.email } : {}),
    });
    const response = NextResponse.redirect(new URL("/home", state.origin));
    setSessionCookie(response, token, state.origin.startsWith("https://"));
    response.cookies.set(oauthStateCookieName(), "", {
      ...oauthStateCookieOptions(state.origin.startsWith("https://")),
      maxAge: 0,
    });
    return response;
  } catch {
    return redirectToLogin(state.origin, "sign_in_unavailable");
  }
}
