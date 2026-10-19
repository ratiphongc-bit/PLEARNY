import { NextRequest, NextResponse } from "next/server";
import { getRequestUser } from "@/lib/auth/session";
import { gradeGameAttempt } from "@/lib/player/python-service";
import { applyStageResult, getCompletedAttemptResult } from "@/lib/player/store";

export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ id: string }> };
type AnswerInput = { questionId: string; value: string };

export async function POST(request: NextRequest, context: RouteContext) {
  const user = getRequestUser(request);
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { id } = await context.params;
  const stageId = Number(id);
  if (!Number.isInteger(stageId) || stageId < 1 || stageId > 12) return NextResponse.json({ error: "ไม่พบด่านนี้" }, { status: 404 });

  try {
    const body = await request.json() as { attemptId?: unknown; answers?: unknown };
    if (typeof body.attemptId !== "string" || body.attemptId.length < 8 || body.attemptId.length > 80 || !Array.isArray(body.answers) || body.answers.length !== 5) {
      return NextResponse.json({ error: "ข้อมูลคำตอบไม่ครบหรือไม่ถูกต้อง" }, { status: 400 });
    }
    const answers: AnswerInput[] = [];
    for (const answer of body.answers) {
      if (!answer || typeof answer !== "object" || typeof answer.questionId !== "string" || !answer.questionId || typeof answer.value !== "string" || answer.value.length > 128) {
        return NextResponse.json({ error: "ข้อมูลคำตอบไม่ถูกต้อง" }, { status: 400 });
      }
      answers.push({ questionId: answer.questionId, value: answer.value });
    }
    if (new Set(answers.map((answer) => answer.questionId)).size !== 5) {
      return NextResponse.json({ error: "มีคำตอบซ้ำหรือข้อไม่ครบ" }, { status: 400 });
    }

    const replay = await getCompletedAttemptResult(user.openId, user.name, stageId, body.attemptId, answers);
    if (replay) return NextResponse.json({ result: replay.result, profile: replay.profile, firstClear: replay.firstClear, rewardItemId: replay.rewardItemId }, { headers: { "Cache-Control": "no-store" } });

    const grade = await gradeGameAttempt(stageId, body.attemptId, answers.map((answer) => ({ question_id: answer.questionId, answer: answer.value })));
    const applied = await applyStageResult(user.openId, stageId, body.attemptId, answers, grade);
    return NextResponse.json({
      result: applied.result,
      profile: applied.profile,
      firstClear: applied.firstClear,
      rewardItemId: applied.rewardItemId,
    }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    if (error instanceof Error && error.message === "stage_locked") {
      return NextResponse.json({ error: "ด่านนี้ยังล็อกอยู่" }, { status: 403 });
    }
    if (error instanceof Error && ["attempt_not_found", "attempt_completed", "incomplete_attempt", "answers_mismatch"].includes(error.message)) {
      return NextResponse.json({ error: "ไม่พบข้อมูลการเล่นที่ถูกต้อง กรุณาเริ่มด่านใหม่" }, { status: 409 });
    }
    return NextResponse.json({ error: "ส่งคำตอบไม่สำเร็จ กรุณาลองใหม่" }, { status: 503 });
  }
}
