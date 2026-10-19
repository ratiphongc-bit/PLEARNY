import { NextRequest, NextResponse } from "next/server";
import { getRequestUser } from "@/lib/auth/session";
import { getGameCatalog } from "@/lib/player/python-service";
import { equipPlayerItem } from "@/lib/player/store";

const ALLOWED_SLOTS = new Set(["pet", "outfit", "accessory", "effect"]);

export async function POST(request: NextRequest) {
  const user = getRequestUser(request);
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  try {
    const body = await request.json() as { itemId?: unknown; slot?: unknown };
    if ((body.itemId !== null && typeof body.itemId !== "string") || typeof body.slot !== "string" || !ALLOWED_SLOTS.has(body.slot)) {
      return NextResponse.json({ error: "ข้อมูลไอเทมไม่ถูกต้อง" }, { status: 400 });
    }
    if (typeof body.itemId === "string") {
      const { items } = await getGameCatalog();
      const item = items.find((candidate) => candidate.id === body.itemId);
      if (!item || item.slot !== body.slot) return NextResponse.json({ error: "ไม่พบไอเทมในช่องนี้" }, { status: 400 });
    }
    const profile = await equipPlayerItem(user.openId, body.itemId as string | null, body.slot);
    return NextResponse.json({ profile }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    if (error instanceof Error && error.message === "item_locked") {
      return NextResponse.json({ error: "ไอเทมนี้ยังล็อกอยู่ ต้องปลดล็อกก่อน" }, { status: 409 });
    }
    return NextResponse.json({ error: "บันทึกการสวมใส่ไม่สำเร็จ กรุณาลองใหม่" }, { status: 503 });
  }
}
