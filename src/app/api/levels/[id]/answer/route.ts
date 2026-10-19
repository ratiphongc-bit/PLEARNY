import { NextRequest, NextResponse } from "next/server";
import { getRequestUser } from "@/lib/auth/session";
import { checkGameAnswer } from "@/lib/player/python-service";
import { recordPlayerAnswer } from "@/lib/player/store";

export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(request: NextRequest, context: RouteContext) {
  const user = getRequestUser(request);
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { id } = await context.params;
  const stageId = Number(id);
  if (!Number.isInteger(stageId) || stageId < 1 || stageId > 12) return NextResponse.json({ error: "ไม่พบด่านนี้" }, { status: 404 });

  try {
    const body = await request.json() as { attemptId?: unknown; questionId?: unknown; answer?: unknown };
    if (typeof body.attemptId !== "string" || body.attemptId.length < 8 || body.attemptId.length > 80 ||
        typeof body.questionId !== "string" || !body.questionId || body.questionId.length > 64 ||
        typeof body.answer !== "string" || body.answer.length > 128) {
      return NextResponse.json({ error: "ข้อมูลคำตอบไม่ถูกต้อง" }, { status: 400 });
    }
    const checked = await checkGameAnswer(stageId, body.attemptId, body.questionId, body.answer);
    const recorded = await recordPlayerAnswer(user.openId, user.name, stageId, body.attemptId, body.questionId, body.answer, checked.correct);
    return NextResponse.json({ correct: recorded.correct, alreadyAnswered: recorded.alreadyAnswered, profile: recorded.profile }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    if (error instanceof Error && error.message === "stage_locked") {
      return NextResponse.json({ error: "ด่านนี้ยังล็อกอยู่" }, { status: 403 });
    }
    if (error instanceof Error && ["attempt_not_found", "attempt_completed", "answer_locked"].includes(error.message)) {
      return NextResponse.json({ error: "ไม่พบการเล่นนี้ หรือคำตอบข้อนี้ถูกบันทึกแล้ว" }, { status: 409 });
    }
    if (error instanceof Error && error.message.includes("unknown question")) {
      return NextResponse.json({ error: "ไม่พบคำถามนี้ในด่าน" }, { status: 400 });
    }
    return NextResponse.json({ error: "ตรวจคำตอบไม่สำเร็จ กรุณาลองใหม่" }, { status: 503 });
  }
}
