import { NextRequest, NextResponse } from "next/server";
import { getRequestUser } from "@/lib/auth/session";
import { getGameCatalog } from "@/lib/player/python-service";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  if (!getRequestUser(request)) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  try {
    return NextResponse.json(await getGameCatalog(), { headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ error: "โหลดด่านไม่สำเร็จ" }, { status: 503 });
  }
}
