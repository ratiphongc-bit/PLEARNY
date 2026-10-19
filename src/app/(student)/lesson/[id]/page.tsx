"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowRight, BookOpen, Target, X, Lock } from "lucide-react";
import { usePlayer } from "@/components/player/PlayerProvider";

export default function LessonPage() {
  const params = useParams<{ id: string }>();
  const stageId = Number(params.id);
  const { data } = usePlayer();
  const stage = data!.levels.find((level) => level.id === stageId);
  const isUnlocked = stage ? stage.id <= data!.profile.unlockedStage : false;

  if (!stage) return <div className="w-full h-full grid place-items-center bg-sky-50"><div className="text-center"><div className="text-5xl mb-3">🗺️</div><p className="font-black text-slate-700">ไม่พบด่านนี้</p><Link href="/map" className="text-primary font-bold underline mt-3 inline-block">กลับไปแผนที่</Link></div></div>;

  return (
    <div className="w-full h-full flex relative overflow-hidden bg-sky-50">
      <div className="absolute inset-0 z-0"><div className="absolute inset-0 bg-gradient-to-b from-sky-200 via-sky-100 to-emerald-50" /><div className="absolute top-[10%] left-1/2 -translate-x-1/2 w-64 h-64 bg-yellow-100/50 blur-[80px] rounded-full" /><div className="absolute bottom-0 left-0 right-0 h-[40%] bg-gradient-to-t from-emerald-500/20 to-transparent" /><div className="absolute bottom-[20%] left-[-10%] w-[50%] h-[30%] bg-emerald-200/50 rounded-[100%] blur-[2px]" /><div className="absolute bottom-[15%] right-[-10%] w-[60%] h-[35%] bg-emerald-300/40 rounded-[100%] blur-[2px]" /></div>
      <div className="absolute top-4 left-4 z-30"><Link href="/map" aria-label="กลับแผนที่" className="w-10 h-10 bg-white/70 hover:bg-white border border-slate-200 rounded-full flex items-center justify-center shadow-sm"><X className="w-5 h-5 text-slate-700" /></Link></div>
      <div className="absolute top-4 right-4 z-30 bg-white/80 border border-slate-200 px-3 py-1.5 rounded-full text-[10px] font-black text-slate-500 uppercase tracking-widest shadow-sm">ด่าน {stage.id} / 12</div>
      <div className="relative z-10 w-full h-full flex items-center justify-center px-6 py-16 overflow-y-auto">
        <div className="w-full max-w-4xl flex flex-col lg:flex-row items-center gap-8 lg:gap-10">
          <div className="flex flex-col items-center gap-4 flex-shrink-0"><motion.div initial={{ opacity: 0, scale: 0.8, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ duration: 0.6 }}><motion.div animate={{ y: [0, -12, 0] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }} className="text-[100px] md:text-[130px] drop-shadow-xl select-none">{stage.emoji}</motion.div><div className="w-32 h-6 bg-emerald-900/10 blur-xl rounded-full mx-auto -mt-2" /></motion.div><div className="flex gap-3"><span className="bg-white/80 border border-slate-200 px-3 py-1.5 rounded-full shadow-sm text-[11px] font-bold text-slate-600">🌍 {stage.zone}</span><span className="bg-white/80 border border-slate-200 px-3 py-1.5 rounded-full shadow-sm text-[11px] font-bold text-slate-600">⭐ {stage.skill}</span></div></div>
          <div className="flex-1 flex flex-col gap-5 w-full">
            <motion.div initial={{ opacity: 0, x: 25 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="relative bg-white/90 backdrop-blur-xl border border-slate-200 rounded-[2rem] p-6 shadow-xl"><div className="absolute -top-3.5 left-6 flex items-center gap-2 bg-white border border-sky-200 px-3 py-1 rounded-full shadow-sm"><span>🤖</span><span className="text-[10px] font-black text-sky-600 uppercase tracking-widest">LUMI</span></div><h1 className="text-slate-800 text-2xl md:text-3xl font-black mt-2">{stage.title}</h1><p className="text-slate-600 text-base md:text-lg font-medium leading-relaxed mt-3">{stage.story} เรามาฝึกเรื่อง<span className="text-primary font-black">{stage.skill}</span>ไปด้วยกัน!</p></motion.div>
            <motion.div initial={{ opacity: 0, x: 25 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.35 }} className="bg-white/70 border border-slate-200 rounded-[2rem] p-5 shadow-sm"><div className="flex items-center gap-2 mb-4"><Target className="w-4 h-4 text-slate-400" /><span className="text-xs font-black text-slate-500 uppercase tracking-widest">ภารกิจของด่านนี้</span></div><div className="space-y-3"><div className="flex items-center gap-3"><span className="w-6 h-6 rounded-full bg-emerald-100 border border-emerald-300 text-emerald-700 text-xs font-black grid place-items-center">1</span><span className="text-sm font-bold text-slate-700">ตอบคำถาม {stage.question_count} ข้อ</span></div><div className="flex items-center gap-3"><span className="w-6 h-6 rounded-full bg-emerald-100 border border-emerald-300 text-emerald-700 text-xs font-black grid place-items-center">2</span><span className="text-sm font-bold text-slate-700">ตอบถูกอย่างน้อย {stage.pass_score} ข้อเพื่อผ่านด่าน</span></div><div className="flex items-center gap-3"><BookOpen className="w-5 h-5 text-sky-500 ml-0.5" /><span className="text-sm font-bold text-slate-700">ผ่านแล้วปลดล็อกด่านถัดไปและรับไอเทม</span></div></div></motion.div>
            {isUnlocked ? <Link href={`/play/${stage.id}`}><motion.span whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="w-full h-14 md:h-16 rounded-[2rem] bg-gradient-to-r from-primary-light to-primary text-white font-black text-lg shadow-[0_6px_0_0_#4c1d95] active:shadow-none active:translate-y-1 transition-all flex items-center justify-center gap-2">เริ่มภารกิจ <ArrowRight className="w-5 h-5" /></motion.span></Link> : <div className="w-full h-14 rounded-[2rem] bg-slate-200 text-slate-500 font-black flex items-center justify-center gap-2"><Lock className="w-4 h-4" />ผ่านด่านก่อนหน้าเพื่อปลดล็อก</div>}
          </div>
        </div>
      </div>
    </div>
  );
}
