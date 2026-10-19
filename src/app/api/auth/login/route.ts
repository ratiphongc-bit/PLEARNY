import { NextRequest, NextResponse } from "next/server";
import { createOAuthStart, oauthStateCookieName, oauthStateCookieOptions } from "@/lib/auth/oauth";

export async function POST(request: NextRequest) {
  try {
    const { authorizationUrl, cookieValue, origin } = createOAuthStart(request);
    const response = NextResponse.json({ authorizationUrl }, { headers: { "Cache-Control": "no-store" } });
    response.cookies.set(oauthStateCookieName(), cookieValue, oauthStateCookieOptions(origin.startsWith("https://")));
    return response;
  } catch {
    return NextResponse.json({ error: "ยังเริ่มระบบเข้าสู่ระบบไม่ได้ กรุณาลองใหม่อีกครั้ง" }, { status: 503 });
  }
}
