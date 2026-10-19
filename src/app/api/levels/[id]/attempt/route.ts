import { randomUUID } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { getRequestUser } from "@/lib/auth/session";
import { createGameAttempt } from "@/lib/player/python-service";
import { createPlayerAttempt, getPlayerProfile } from "@/lib/player/store";

export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(request: NextRequest, context: RouteContext) {
  const user = getRequestUser(request);
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { id } = await context.params;
  const stageId = Number(id);
  if (!Number.isInteger(stageId) || stageId < 1 || stageId > 12) return NextResponse.json({ error: "ไม่พบด่านนี้" }, { status: 404 });

  try {
    const profile = await getPlayerProfile(user.openId, user.name);
    if (stageId > profile.unlockedStage) return NextResponse.json({ error: "ด่านนี้ยังล็อกอยู่" }, { status: 403 });
    if (profile.hearts < 1) return NextResponse.json({ error: "หัวใจหมดแล้ว" , heartRegenAtMs: profile.heartRegenAtMs }, { status: 429 });

    const attemptId = randomUUID().replaceAll("-", "");
    const attempt = await createGameAttempt(stageId, attemptId);
    await createPlayerAttempt(user.openId, stageId, attemptId);
    return NextResponse.json(attempt, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    if (error instanceof Error && error.message === "no_hearts") {
      return NextResponse.json({ error: "หัวใจหมดแล้ว" }, { status: 429 });
    }
    if (error instanceof Error && error.message === "stage_locked") {
      return NextResponse.json({ error: "ด่านนี้ยังล็อกอยู่" }, { status: 403 });
    }
    return NextResponse.json({ error: "เริ่มด่านไม่สำเร็จ กรุณาลองใหม่" }, { status: 503 });
  }
}
