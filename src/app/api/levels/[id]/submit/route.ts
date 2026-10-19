import { NextRequest, NextResponse } from "next/server";
import { getRequestUser } from "@/lib/auth/session";
import { gradeGameAttempt } from "@/lib/player/python-service";
import { applyStageResult } from "@/lib/player/store";

export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ id: string }> };
type AnswerInput = { question_id: string; answer: string };

export async function POST(request: NextRequest, context: RouteContext) {
  const user = getRequestUser(request);
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { id } = await context.params;
  const stageId = Number(id);
  if (!Number.isInteger(stageId) || stageId < 1 || stageId > 12) return NextResponse.json({ error: "ไม่พบด่านนี้" }, { status: 404 });

  try {
    const body = await request.json() as { attemptId?: unknown; answers?: unknown };
    if (typeof body.attemptId !== "string" || !Array.isArray(body.answers) || body.answers.length > 5) {
      return NextResponse.json({ error: "ข้อมูลคำตอบไม่ถูกต้อง" }, { status: 400 });
    }
    const answers: AnswerInput[] = [];
    for (const answer of body.answers) {
      if (!answer || typeof answer !== "object" || typeof answer.questionId !== "string" || typeof answer.value !== "string") {
        return NextResponse.json({ error: "ข้อมูลคำตอบไม่ถูกต้อง" }, { status: 400 });
      }
      answers.push({ question_id: answer.questionId, answer: answer.value });
    }

    const grade = await gradeGameAttempt(stageId, body.attemptId, answers);
    const applied = await applyStageResult(user.openId, stageId, {
      score: grade.score,
      passed: grade.passed,
      xp: grade.xp,
      coins: grade.coins,
      rewardItemId: grade.reward_item_id,
    });
    return NextResponse.json({
      result: grade,
      profile: applied.profile,
      firstClear: applied.firstClear,
      rewardItemId: applied.rewardItemId,
    }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    if (error instanceof Error && error.message === "stage_locked") {
      return NextResponse.json({ error: "ด่านนี้ยังล็อกอยู่" }, { status: 403 });
    }
    return NextResponse.json({ error: "ส่งคำตอบไม่สำเร็จ กรุณาลองใหม่" }, { status: 503 });
  }
}
