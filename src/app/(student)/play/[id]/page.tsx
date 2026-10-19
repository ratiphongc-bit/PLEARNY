"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Lightbulb, LoaderCircle, X } from "lucide-react";
import type { GameQuestion, GameStage } from "@/lib/player/python-service";
import { playerResultStorageKey } from "@/lib/player/client-storage";
import { usePlayer } from "@/components/player/PlayerProvider";

type Attempt = { attempt_id: string; stage: GameStage; questions: GameQuestion[] };
type SelectedAnswer = { questionId: string; value: string };

const PARTICLES = ["✨", "⭐", "🌟", "💫", "✨", "⭐", "🌟", "💫", "✨", "⭐"];

export default function PlayScene() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const stageId = Number(params.id);
  const { data, refresh } = usePlayer();
  const [attempt, setAttempt] = useState<Attempt | null>(null);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<SelectedAnswer[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [submitting, setSubmitting] = useState(false);
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
  }, [stageId, data?.user.openId]);

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

  function nextQuestion() {
    if (!question || selected === null || !attempt) return;
    const updated = [...answers, { questionId: question.id, value: selected }];
    if (questionIndex === attempt.questions.length - 1) {
      void submit(updated);
      return;
    }
    setAnswers(updated);
    setQuestionIndex((index) => index + 1);
    setSelected(null);
    setShowHint(false);
  }

  if (error && !attempt) return <div className="w-full h-full grid place-items-center bg-sky-100 p-6"><div className="bg-white rounded-3xl p-7 shadow-xl text-center max-w-sm"><div className="text-4xl mb-3">🗺️</div><p className="font-black text-slate-800">{error}</p><Link href="/map" className="mt-5 inline-flex rounded-xl bg-primary px-5 py-3 font-black text-white">กลับไปแผนที่</Link></div></div>;
  if (!attempt || !question) return <div className="w-full h-full grid place-items-center bg-sky-100"><div className="text-center"><LoaderCircle className="w-8 h-8 animate-spin text-primary mx-auto" /><p className="font-black text-slate-600 mt-3">กำลังเตรียมคำถาม…</p></div></div>;

  return (
    <div className="w-full h-full flex flex-col relative overflow-hidden bg-sky-100">
      <div className="absolute inset-0 z-0"><div className="absolute inset-0 bg-gradient-to-b from-sky-300 via-sky-200 to-emerald-100" />{PARTICLES.map((particle, index) => <motion.span key={index} className="absolute text-lg opacity-60" style={{ left: `${8 + index * 9}%`, top: `${12 + (index % 4) * 13}%` }} animate={{ y: [-8, 8, -8], opacity: [0.25, 0.75, 0.25] }} transition={{ duration: 4 + index % 3, repeat: Infinity, delay: index * 0.2 }}>{particle}</motion.span>)}<div className="absolute bottom-[24%] left-0 right-0 h-[28%] bg-gradient-to-t from-emerald-500/70 to-emerald-300/10 rounded-[100%_100%_0_0]" /><div className="absolute bottom-0 left-0 right-0 h-[14%] bg-emerald-600" /></div>
      <div className="relative z-10 flex-1 flex flex-col min-h-0">
        <div className="flex justify-between items-center p-4 pt-5"><div className="flex items-center gap-3"><Link href="/map" aria-label="ออกจากด่าน" className="w-11 h-11 bg-white/95 border-2 border-slate-200 rounded-full flex items-center justify-center shadow-[0_4px_0_0_#e2e8f0]"><X className="w-5 h-5 text-slate-600" /></Link><div className="bg-white/95 border-2 border-slate-200 rounded-full px-4 py-2.5 shadow-[0_4px_0_0_#e2e8f0]"><div className="flex items-center gap-2.5"><span className="text-[11px] font-black text-slate-500">{questionIndex + 1}/{attempt.questions.length}</span><div className="w-24 md:w-36 h-3 bg-slate-200 rounded-full overflow-hidden"><motion.div className="h-full bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-full" animate={{ width: `${progress}%` }} transition={{ duration: 0.35 }} /></div></div></div></div><div className="bg-white/90 border border-slate-200 rounded-full px-3 py-2 text-[11px] font-black text-slate-600">ด่าน {stageId}/12</div></div>
        <div className="flex justify-center mt-1 mb-3 px-4"><div className="bg-gradient-to-r from-amber-100 to-orange-100 border-2 border-amber-300 text-amber-800 text-xs font-black px-5 py-2 rounded-full shadow-[0_3px_0_0_#d97706]">{attempt.stage.emoji} {attempt.stage.title} · {attempt.stage.skill}</div></div>
        <div className="flex-1 flex items-center justify-center relative min-h-20"><motion.div key={question.id} initial={{ opacity: 0, y: 12, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} className="text-[82px] md:text-[110px] drop-shadow-xl select-none">{attempt.stage.emoji}</motion.div><div className="absolute top-1/2 left-1/2 translate-x-16 -translate-y-14 bg-white border-2 border-sky-300 text-sky-700 text-[11px] font-black px-3 py-1.5 rounded-full shadow-lg whitespace-nowrap">คิดให้ดีนะ! 🧠</div></div>
        <div className="mx-4 mb-3"><motion.div key={`prompt-${question.id}`} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="bg-white/95 border-2 border-slate-200 rounded-[2rem] px-5 py-5 text-center shadow-[0_8px_0_0_#e2e8f0]"><p className="text-slate-800 font-black text-lg md:text-2xl leading-relaxed">{question.prompt}</p>{showHint && <p className="mt-3 text-sm md:text-base text-amber-700 font-bold">คำใบ้: {question.hint}</p>}</motion.div></div>
        <div className="flex justify-center mb-3"><button onClick={() => setShowHint((value) => !value)} className="flex items-center gap-2 text-slate-600 hover:text-amber-700 bg-white/90 hover:bg-amber-50 border-2 border-slate-200 hover:border-amber-300 px-4 py-2 rounded-full text-xs font-black transition-all shadow-sm"><Lightbulb className="w-4 h-4" />{showHint ? "ซ่อนคำใบ้" : "ขอคำใบ้"}</button></div>
        <div className="px-4 pb-5"><div className="grid grid-cols-2 gap-3 max-w-xl mx-auto">{question.choices.map((choice, index) => <motion.button key={`${question.id}-${choice}`} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }} whileTap={{ scale: 0.97 }} onClick={() => setSelected(choice)} className={`h-14 md:h-16 rounded-[1.4rem] bg-white border-[3px] flex items-center justify-center transition-all shadow-[0_5px_0_0_#e2e8f0] active:shadow-none active:translate-y-1 ${selected === choice ? "border-primary bg-purple-50 shadow-[0_5px_0_0_#c4b5fd]" : "border-slate-200 hover:border-sky-300"}`}><span className={`text-xl md:text-2xl font-black ${selected === choice ? "text-primary" : "text-slate-700"}`}>{choice}</span></motion.button>)}</div>
          {error && <p role="alert" className="text-center text-sm font-bold text-rose-700 mt-3">{error}</p>}
          <button disabled={selected === null || submitting} onClick={nextQuestion} className="w-full max-w-xl mx-auto mt-4 h-12 rounded-[1.5rem] bg-gradient-to-b from-primary-light to-primary text-white font-black shadow-[0_5px_0_0_#4c1d95] disabled:opacity-50 disabled:shadow-none flex items-center justify-center gap-2">{submitting ? <><LoaderCircle className="w-4 h-4 animate-spin" />กำลังตรวจคำตอบ…</> : questionIndex === attempt.questions.length - 1 ? "ส่งคำตอบ" : <>ข้อถัดไป <ArrowRight className="w-4 h-4" /></>}</button>
        </div>
      </div>
    </div>
  );
}
