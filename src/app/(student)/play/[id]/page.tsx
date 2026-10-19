"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Lightbulb, LoaderCircle, X } from "lucide-react";
import type { GameQuestion, GameStage } from "@/lib/player/python-service";
import type { PlayerProfile } from "@/lib/player/store";
import { playerResultStorageKey } from "@/lib/player/client-storage";
import { HeartStreakHud } from "@/components/player/HeartStreakHud";
import { usePlayer } from "@/components/player/PlayerProvider";
import { appendAttemptAnswer } from "@/lib/player/rules";

type Attempt = { attempt_id: string; stage: GameStage; questions: GameQuestion[] };
type SelectedAnswer = { questionId: string; value: string };

const PARTICLES = ["✨", "⭐", "🌟", "💫", "✨", "⭐", "🌟", "💫", "✨", "⭐"];

export default function PlayScene() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const stageId = Number(params.id);
  const { data, refresh, updateProfile } = usePlayer();
  const [attempt, setAttempt] = useState<Attempt | null>(null);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<SelectedAnswer[]>([]);
  const [attemptNonce, setAttemptNonce] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    if (!data?.user.openId) return () => { active = false; };
    if (!Number.isInteger(stageId) || stageId < 1 || stageId > 12) return () => { active = false; };
    void fetch(`/api/levels/${stageId}/attempt`, { method: "POST", cache: "no-store" })
      .then(async (response) => {
        const body = await response.json() as Attempt & { error?: string };
        if (!response.ok) throw new Error(body.error || "เริ่มด่านไม่สำเร็จ");
        if (active) setAttempt(body);
      })
      .catch((loadError: unknown) => { if (active) setError(loadError instanceof Error ? loadError.message : "โหลดคำถามไม่สำเร็จ"); });
    return () => { active = false; };
  }, [stageId, data?.user.openId, attemptNonce]);

  const question = attempt?.questions[questionIndex];
  const progress = useMemo(() => attempt ? Math.round((questionIndex / attempt.questions.length) * 100) : 0, [attempt, questionIndex]);

  async function submit(finalAnswers: SelectedAnswer[]) {
    if (!attempt || !data?.user.openId) return;
    setSubmitting(true);
    setError(null);
    try {
      const response = await fetch(`/api/levels/${stageId}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ attemptId: attempt.attempt_id, answers: finalAnswers }),
      });
      const body = await response.json() as { result?: unknown; profile?: unknown; firstClear?: boolean; rewardItemId?: string | null; error?: string };
      if (!response.ok || !body.result) throw new Error(body.error || "ส่งคำตอบไม่สำเร็จ");
      sessionStorage.setItem(playerResultStorageKey(data.user.openId), JSON.stringify({ ...body, stageTitle: attempt.stage.title, stageId }));
      await refresh();
      router.push("/result");
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "ส่งคำตอบไม่สำเร็จ กรุณาลองใหม่");
      setSubmitting(false);
    }
  }

  async function nextQuestion() {
    if (!question || selected === null || !attempt || submitting) return;
    setSubmitting(true);
    setError(null);
    setFeedback(null);
    try {
      const recordedAnswer = answers.find((entry) => entry.questionId === question.id);
      const chosen = recordedAnswer?.value ?? selected;
      const response = await fetch(`/api/levels/${stageId}/answer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ attemptId: attempt.attempt_id, questionId: question.id, answer: chosen }),
      });
      const body = await response.json() as { correct?: boolean; profile?: PlayerProfile; error?: string };
      if (!response.ok || typeof body.correct !== "boolean" || !body.profile) throw new Error(body.error || "ตรวจคำตอบไม่สำเร็จ");
      updateProfile(body.profile);
      const updated = appendAttemptAnswer(answers, { questionId: question.id, value: chosen }).answers;
      setAnswers(updated);
      setFeedback(body.correct);
      await new Promise((resolve) => window.setTimeout(resolve, 550));
      if (questionIndex === attempt.questions.length - 1) {
        await submit(updated);
        return;
      }
      setQuestionIndex((index) => index + 1);
      setSelected(null);
      setShowHint(false);
      setFeedback(null);
    } catch (answerError) {
      setError(answerError instanceof Error ? answerError.message : "ตรวจคำตอบไม่สำเร็จ กรุณาลองใหม่");
    } finally {
      setSubmitting(false);
    }
  }

  if (error && !attempt) {
    return (
      <div className="w-full h-full grid place-items-center bg-sky-100 p-6">
        <div className="max-w-sm rounded-3xl bg-white p-7 text-center shadow-xl">
          <div className="mb-3 text-4xl">{error.includes("หัวใจหมด") ? "❤️" : "🗺️"}</div>
          <p className="font-black text-slate-800">{error}</p>
          {data?.profile && <HeartStreakHud profile={data.profile} className="mt-4" />}
          {error.includes("หัวใจหมด") && data?.profile && data.profile.hearts > 0 && <button onClick={() => { setError(null); setAttemptNonce((nonce) => nonce + 1); }} className="mt-4 rounded-xl bg-primary px-5 py-3 font-black text-white">เริ่มด่านอีกครั้ง</button>}
          <Link href="/map" className="mt-5 inline-flex rounded-xl bg-primary px-5 py-3 font-black text-white">กลับไปแผนที่</Link>
        </div>
      </div>
    );
  }
  if (!attempt || !question) return <div className="grid h-full w-full place-items-center bg-sky-100"><div className="text-center"><LoaderCircle className="mx-auto h-8 w-8 animate-spin text-primary" /><p className="mt-3 font-black text-slate-600">กำลังเตรียมคำถาม…</p></div></div>;

  return (
    <div className="relative flex h-full w-full flex-col overflow-hidden bg-sky-100">
      <div className="absolute inset-0 z-0"><div className="absolute inset-0 bg-gradient-to-b from-sky-300 via-sky-200 to-emerald-100" />{PARTICLES.map((particle, index) => <motion.span key={index} className="absolute text-lg opacity-60" style={{ left: `${8 + index * 9}%`, top: `${12 + (index % 4) * 13}%` }} animate={{ y: [-8, 8, -8], opacity: [0.25, 0.75, 0.25] }} transition={{ duration: 4 + index % 3, repeat: Infinity, delay: index * 0.2 }}>{particle}</motion.span>)}<div className="absolute bottom-[24%] left-0 right-0 h-[28%] rounded-[100%_100%_0_0] bg-gradient-to-t from-emerald-500/70 to-emerald-300/10" /><div className="absolute bottom-0 left-0 right-0 h-[14%] bg-emerald-600" /></div>
      <div className="relative z-10 flex min-h-0 flex-1 flex-col">
        <div className="flex items-center justify-between p-4 pt-5">
          <div className="flex items-center gap-3">
            <Link href="/map" aria-label="ออกจากด่าน" className="flex h-11 w-11 items-center justify-center rounded-full border-2 border-slate-200 bg-white/95 shadow-[0_4px_0_0_#e2e8f0]"><X className="h-5 w-5 text-slate-600" /></Link>
            <div className="rounded-full border-2 border-slate-200 bg-white/95 px-4 py-2.5 shadow-[0_4px_0_0_#e2e8f0]"><div className="flex items-center gap-2.5"><span className="text-[11px] font-black text-slate-500">{questionIndex + 1}/{attempt.questions.length}</span><div className="h-3 w-24 overflow-hidden rounded-full bg-slate-200 md:w-36"><motion.div className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-emerald-500" animate={{ width: `${progress}%` }} transition={{ duration: 0.35 }} /></div></div></div>
          </div>
          <div className="rounded-full border border-slate-200 bg-white/90 px-3 py-2 text-[11px] font-black text-slate-600">ด่าน {stageId}/12</div>
        </div>
        <div className="mb-2 mt-1 flex flex-wrap items-center justify-center gap-2 px-3">
          <div className="rounded-full border-2 border-amber-300 bg-gradient-to-r from-amber-100 to-orange-100 px-5 py-2 text-xs font-black text-amber-800 shadow-[0_3px_0_0_#d97706]">{attempt.stage.emoji} {attempt.stage.title} · {attempt.stage.skill}</div>
          {data?.profile && <HeartStreakHud profile={data.profile} compact showTimer />}
        </div>
        <div className="relative flex min-h-20 flex-1 items-center justify-center"><motion.div key={question.id} initial={{ opacity: 0, y: 12, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} className="select-none text-[82px] drop-shadow-xl md:text-[110px]">{attempt.stage.emoji}</motion.div><div className="absolute left-1/2 top-1/2 -translate-x-[-4rem] -translate-y-14 whitespace-nowrap rounded-full border-2 border-sky-300 bg-white px-3 py-1.5 text-[11px] font-black text-sky-700 shadow-lg">คิดให้ดีนะ! 🧠</div></div>
        <div className="mx-4 mb-3"><motion.div key={`prompt-${question.id}`} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="rounded-[2rem] border-2 border-slate-200 bg-white/95 px-5 py-5 text-center shadow-[0_8px_0_0_#e2e8f0]"><p className="text-lg font-black leading-relaxed text-slate-800 md:text-2xl">{question.prompt}</p>{showHint && <p className="mt-3 text-sm font-bold text-amber-700 md:text-base">คำใบ้: {question.hint}</p>}</motion.div></div>
        <div className="mb-3 flex justify-center"><button onClick={() => setShowHint((value) => !value)} disabled={submitting} className="flex items-center gap-2 rounded-full border-2 border-slate-200 bg-white/90 px-4 py-2 text-xs font-black text-slate-600 shadow-sm transition-all hover:border-amber-300 hover:bg-amber-50 hover:text-amber-700"><Lightbulb className="h-4 w-4" />{showHint ? "ซ่อนคำใบ้" : "ขอคำใบ้"}</button></div>
        <div className="px-4 pb-5">
          <div className="mx-auto grid max-w-xl grid-cols-2 gap-3">{question.choices.map((choice, index) => <motion.button key={`${question.id}-${choice}`} disabled={submitting || answers.some((saved) => saved.questionId === question.id)} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }} whileTap={{ scale: 0.97 }} onClick={() => setSelected(choice)} className={`flex h-14 items-center justify-center rounded-[1.4rem] border-[3px] bg-white shadow-[0_5px_0_0_#e2e8f0] transition-all active:translate-y-1 active:shadow-none disabled:opacity-70 md:h-16 ${selected === choice ? "border-primary bg-purple-50 shadow-[0_5px_0_0_#c4b5fd]" : "border-slate-200 hover:border-sky-300"}`}><span className={`text-xl font-black md:text-2xl ${selected === choice ? "text-primary" : "text-slate-700"}`}>{choice}</span></motion.button>)}</div>
          {feedback !== null && <p role="status" className={`mt-3 text-center text-sm font-black ${feedback ? "text-emerald-700" : "text-rose-700"}`}>{feedback ? "ถูกต้อง เก่งมาก! ✨" : "ยังไม่ถูก หัวใจลด 1 ดวง ❤️"}</p>}
          {error && <p role="alert" className="mt-3 text-center text-sm font-bold text-rose-700">{error}</p>}
          <button disabled={selected === null || submitting} onClick={() => void nextQuestion()} className="mx-auto mt-4 flex h-12 w-full max-w-xl items-center justify-center gap-2 rounded-[1.5rem] bg-gradient-to-b from-primary-light to-primary font-black text-white shadow-[0_5px_0_0_#4c1d95] disabled:opacity-50 disabled:shadow-none">{submitting ? <><LoaderCircle className="h-4 w-4 animate-spin" />กำลังตรวจคำตอบ…</> : questionIndex === attempt.questions.length - 1 ? "ส่งคำตอบ" : <>ข้อถัดไป <ArrowRight className="h-4 w-4" /></>}</button>
        </div>
      </div>
    </div>
  );
}
