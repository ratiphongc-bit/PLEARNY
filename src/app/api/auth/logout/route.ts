import { NextRequest, NextResponse } from "next/server";
import { clearSessionCookie } from "@/lib/auth/session";

export async function POST(request: NextRequest) {
  const response = NextResponse.json({ ok: true }, { headers: { "Cache-Control": "no-store" } });
  const forwarded = request.headers.get("x-forwarded-proto")?.split(",")[0]?.trim();
  const origin = request.headers.get("origin") || request.headers.get("referer") || "";
  const secure = forwarded === "https" || origin.startsWith("https://");
  clearSessionCookie(response, secure);
  return response;
}
