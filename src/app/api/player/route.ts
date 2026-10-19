import { NextRequest, NextResponse } from "next/server";
import { getRequestUser } from "@/lib/auth/session";
import { getPlayerProfile } from "@/lib/player/store";
import { getGameCatalog } from "@/lib/player/python-service";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const user = getRequestUser(request);
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401, headers: { "Cache-Control": "no-store" } });
  try {
    const [profile, catalog] = await Promise.all([
      getPlayerProfile(user.openId, user.name),
      getGameCatalog(),
    ]);
    return NextResponse.json({ user, profile, ...catalog }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ error: "โหลดข้อมูลนักผจญภัยไม่สำเร็จ กรุณาลองใหม่" }, { status: 503, headers: { "Cache-Control": "no-store" } });
  }
}
