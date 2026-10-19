"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, CheckCircle2, RotateCcw, Trophy } from "lucide-react";
import confetti from "canvas-confetti";
import type { GradeResult } from "@/lib/player/python-service";
import { playerResultStorageKey } from "@/lib/player/client-storage";
import { usePlayer } from "@/components/player/PlayerProvider";

type ResultSummary = {
  result: GradeResult;
  stageTitle: string;
  stageId: number;
  firstClear: boolean;
  rewardItemId: string | null;
};

export default function ResultPage() {
  const [summary, setSummary] = useState<ResultSummary | null>(null);
  const { data } = usePlayer();

  useEffect(() => {
    const openId = data?.user.openId;
    const timer = window.setTimeout(() => {
      setSummary(null);
      if (!openId) return;
      const storageKey = playerResultStorageKey(openId);
      try {
        const raw = sessionStorage.getItem(storageKey);
        if (!raw) return;
        const parsed = JSON.parse(raw) as ResultSummary;
        if (!parsed?.result || typeof parsed.stageId !== "number") {
          sessionStorage.removeItem(storageKey);
          return;
        }
        setSummary(parsed);
        if (parsed.result.passed && parsed.firstClear) {
          const end = Date.now() + 1800;
          const frame = () => {
            if (Date.now() > end) return;
            confetti({ particleCount: 18, spread: 100, startVelocity: 24, ticks: 50, zIndex: 100, origin: { x: Math.random(), y: 0.25 } });
            requestAnimationFrame(frame);
          };
          frame();
        }
        sessionStorage.removeItem(storageKey);
      } catch {
        sessionStorage.removeItem(storageKey);
      }
    }, 0);
    return () => window.clearTimeout(timer);
  }, [data?.user.openId]);

  if (!summary) return <div className="w-full h-full grid place-items-center bg-sky-50 p-6"><div className="text-center bg-white rounded-3xl shadow-xl p-8"><div className="text-5xl mb-3">🗺️</div><h1 className="text-xl font-black text-slate-800">ยังไม่มีผลการเล่นล่าสุด</h1><Link href="/map" className="inline-flex mt-5 rounded-xl bg-primary px-5 py-3 font-black text-white">กลับไปแผนที่</Link></div></div>;

  const { result, stageTitle, stageId, firstClear, rewardItemId } = summary;
  const rewardItem = rewardItemId ? data?.items.find((item) => item.id === rewardItemId) : null;
  const passed = result.passed;
  const nextStage = Math.min(12, data?.profile.unlockedStage ?? stageId + 1);
  const ctaHref = passed && stageId < 12 ? `/lesson/${nextStage}` : passed ? "/map" : `/lesson/${stageId}`;
  const xpAwarded = firstClear && passed ? result.xp : 0;
  const coinsAwarded = firstClear && passed ? result.coins : 0;

  return (
    <div className="w-full h-full flex flex-col items-center justify-center relative overflow-y-auto bg-sky-50 text-slate-800 p-6">
      <div className="absolute inset-0 bg-gradient-to-b from-sky-200 via-sky-100 to-sky-50 z-0" /><motion.div animate={{ scale: [1, 1.12, 1], opacity: [0.35, 0.6, 0.35] }} transition={{ duration: 4, repeat: Infinity }} className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] aspect-square bg-white blur-[120px] rounded-full pointer-events-none z-0" />
      <div className="relative z-10 w-full max-w-sm flex flex-col items-center text-center py-8">
        <motion.div initial={{ scale: 0, rotate: -25 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: "spring", stiffness: 280, damping: 16 }} className="text-7xl mb-3">{passed ? "🎉" : "💪"}</motion.div>
        <motion.h1 initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="text-3xl md:text-4xl font-black tracking-tight text-primary">{passed ? "ผ่านด่านแล้ว!" : "อีกนิดเดียว!"}</motion.h1>
        <p className="text-slate-600 font-bold mt-2 mb-6">{stageTitle} · ด่าน {stageId}</p>
        <div className="w-full bg-white/90 border border-slate-200 rounded-3xl p-5 shadow-lg mb-4"><div className="text-sm text-slate-500 font-bold">คะแนนของคุณ</div><div className="text-4xl font-black text-slate-800 mt-1">{result.score}<span className="text-xl text-slate-400"> / {result.total}</span></div><div className="mt-3 flex justify-center gap-1">{Array.from({ length: result.total }, (_, index) => <span key={index} className={`w-5 h-5 rounded-full ${index < result.score ? "bg-emerald-400" : "bg-slate-200"}`} />)}</div><p className="text-xs text-slate-500 font-bold mt-3">ต้องถูกอย่างน้อย 3 ข้อเพื่อผ่าน</p></div>
        <div className="grid grid-cols-2 gap-3 w-full mb-4"><div className="bg-white/90 border border-amber-200 rounded-2xl p-4 shadow-sm"><div className="text-2xl">⭐</div><div className="text-xl font-black text-amber-500">+{xpAwarded}</div><div className="text-[10px] font-black uppercase tracking-widest text-slate-400">XP {firstClear ? "ได้รับ" : "ซ้ำไม่ได้"}</div></div><div className="bg-white/90 border border-amber-200 rounded-2xl p-4 shadow-sm"><div className="text-2xl">🪙</div><div className="text-xl font-black text-amber-600">+{coinsAwarded}</div><div className="text-[10px] font-black uppercase tracking-widest text-slate-400">เหรียญ</div></div></div>
        {passed && firstClear && rewardItem && <div className="w-full flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-5 text-left"><div className="text-3xl">{rewardItem.icon}</div><div><div className="text-xs text-amber-700 font-black uppercase tracking-widest">ปลดล็อกไอเทมใหม่</div><div className="text-sm font-black text-slate-800">{rewardItem.name}</div><div className="text-xs text-slate-500">ไปสวมใส่ได้ที่คลังอุปกรณ์</div></div><Trophy className="w-5 h-5 ml-auto text-amber-500" /></div>}
        {passed && !firstClear && <div className="w-full bg-emerald-50 border border-emerald-200 rounded-2xl px-4 py-3 mb-5 text-sm font-bold text-emerald-700"><CheckCircle2 className="inline w-4 h-4 mr-1" />ผ่านด่านนี้แล้ว — ความคืบหน้าเดิมยังอยู่</div>}
        {!passed && <div className="w-full bg-sky-50 border border-sky-200 rounded-2xl px-4 py-3 mb-5 text-sm font-bold text-sky-800">ด่านยังล็อกอยู่ที่เดิม ลองอีกครั้งได้เลย ความคืบหน้าของคุณปลอดภัย</div>}
        <Link href={ctaHref} className="w-full"><motion.span whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} className="w-full h-14 rounded-[2rem] bg-gradient-to-b from-primary-light to-primary text-lg font-black text-white shadow-[0_5px_0_0_#4c1d95] flex items-center justify-center gap-2">{passed ? stageId < 12 ? "ไปด่านถัดไป" : "กลับไปแผนที่" : "ลองด่านนี้อีกครั้ง"}{passed ? <ArrowRight className="w-5 h-5" /> : <RotateCcw className="w-4 h-4" />}</motion.span></Link>
      </div>
    </div>
  );
}
