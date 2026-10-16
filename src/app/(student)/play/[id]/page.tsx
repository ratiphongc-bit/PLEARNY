"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, X, Lightbulb, Sparkles, Zap } from "lucide-react";
import { STUDENT_USER } from "@/mock/data";
import { InteractiveObject } from "@/components/ui/interactive-object";

const ANSWERS = [
  { value: "6",  correct: false, desc: "24 ÷ 4 = 6" },
  { value: "7",  correct: false, desc: "ลองคิดใหม่" },
  { value: "8",  correct: true,  desc: "24 ÷ 3 = 8 ✓" },
  { value: "9",  correct: false, desc: "มากไปหน่อย" },
];

// Floating particles (fixed positions to avoid hydration mismatch)
const PARTICLES = [
  { id: 0, x: 10, y: 15, duration: 7, delay: 0, emoji: "✨" },
  { id: 1, x: 25, y: 35, duration: 9, delay: 1, emoji: "⭐" },
  { id: 2, x: 45, y: 20, duration: 6, delay: 2, emoji: "🌟" },
  { id: 3, x: 60, y: 45, duration: 8, delay: 3, emoji: "💫" },
  { id: 4, x: 80, y: 12, duration: 7, delay: 0.5, emoji: "✨" },
  { id: 5, x: 15, y: 55, duration: 10, delay: 4, emoji: "⭐" },
  { id: 6, x: 70, y: 30, duration: 6, delay: 1.5, emoji: "🌟" },
  { id: 7, x: 35, y: 50, duration: 8, delay: 2.5, emoji: "💫" },
  { id: 8, x: 90, y: 40, duration: 9, delay: 3.5, emoji: "✨" },
  { id: 9, x: 50, y: 60, duration: 7, delay: 0.8, emoji: "⭐" },
  { id: 10, x: 5, y: 42, duration: 8, delay: 1.2, emoji: "🌟" },
  { id: 11, x: 85, y: 25, duration: 6, delay: 2.8, emoji: "💫" },
];

export default function PlayScene() {
  const [hearts,   setHearts]   = useState(STUDENT_USER.hearts);
  const [feedback, setFeedback] = useState<"idle"|"wrong"|"correct">("idle");
  const [showHint, setShowHint] = useState(false);
  const [wrongAnim, setWrongAnim] = useState(false);
  const [selected, setSelected] = useState<number | null>(null);

  const handleWrong = (idx: number) => {
    setSelected(idx);
    setHearts(h => Math.max(0, h - 1));
    setWrongAnim(true);
    setTimeout(() => { setWrongAnim(false); setSelected(null); }, 600);
  };

  const progress = feedback === "correct" ? 40 : 20;

  return (
    <div className="w-full h-full flex flex-col relative overflow-hidden">

      {/* ═══ BACKGROUND ═══ */}
      <motion.div
        animate={wrongAnim ? { x: [-8, 8, -5, 5, 0] } : {}}
        transition={{ duration: 0.4 }}
        className="absolute inset-0 z-0"
      >
        {/* Vibrant sky */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#4FC3F7] via-[#81D4FA] to-[#B3E5FC]" />
        
        {/* Sun with glow */}
        <div className="absolute top-[8%] right-[12%]">
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="w-24 h-24 bg-yellow-200 rounded-full blur-xl absolute -inset-4"
          />
          <div className="w-16 h-16 bg-gradient-to-br from-yellow-300 to-orange-400 rounded-full shadow-[0_0_60px_rgba(253,224,71,0.6)]" />
        </div>

        {/* Animated clouds */}
        {[
          { top: "12%", left: "-10%", w: 140, dur: 25 },
          { top: "22%", left: "30%", w: 100, dur: 35 },
          { top: "8%", left: "60%", w: 120, dur: 30 },
        ].map((c, i) => (
          <motion.div
            key={i}
            animate={{ x: [0, 800] }}
            transition={{ duration: c.dur, repeat: Infinity, ease: "linear", delay: i * 8 }}
            className="absolute"
            style={{ top: c.top, left: c.left }}
          >
            <div className="relative" style={{ width: c.w, height: c.w * 0.4 }}>
              <div className="absolute inset-0 bg-white/90 rounded-full" />
              <div className="absolute -top-[35%] left-[15%] w-[45%] h-[120%] bg-white/90 rounded-full" />
              <div className="absolute -top-[20%] left-[50%] w-[35%] h-[100%] bg-white/90 rounded-full" />
            </div>
          </motion.div>
        ))}

        {/* Magical floating particles */}
        {PARTICLES.map((p) => (
          <motion.div
            key={p.id}
            className="absolute text-sm select-none pointer-events-none"
            style={{ left: `${p.x}%`, top: `${p.y}%` }}
            animate={{ y: [-10, 10, -10], opacity: [0.3, 0.8, 0.3] }}
            transition={{ duration: p.duration, repeat: Infinity, delay: p.delay }}
          >
            {p.emoji}
          </motion.div>
        ))}

        {/* Mountains – vibrant green layered */}
        <div className="absolute bottom-[28%] left-0 right-0 h-[35%] overflow-hidden pointer-events-none">
          <div className="absolute bottom-0 left-[-5%] w-[45%] h-[100%] bg-gradient-to-t from-emerald-600 to-emerald-400 opacity-60" style={{ clipPath: "polygon(50% 0%, 0% 100%, 100% 100%)" }} />
          <div className="absolute bottom-0 left-[15%] w-[50%] h-[80%] bg-gradient-to-t from-green-600 to-green-400 opacity-70" style={{ clipPath: "polygon(50% 0%, 0% 100%, 100% 100%)" }} />
          <div className="absolute bottom-0 left-[50%] w-[40%] h-[90%] bg-gradient-to-t from-emerald-600 to-emerald-400 opacity-60" style={{ clipPath: "polygon(50% 0%, 0% 100%, 100% 100%)" }} />
          <div className="absolute bottom-0 left-[65%] w-[45%] h-[70%] bg-gradient-to-t from-green-600 to-green-400 opacity-70" style={{ clipPath: "polygon(50% 0%, 0% 100%, 100% 100%)" }} />
        </div>
        
        {/* River with shimmer */}
        <div className="absolute bottom-0 left-0 right-0 h-[30%] bg-gradient-to-t from-cyan-500 via-cyan-300 to-transparent" />
        <motion.div
          animate={{ opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 3, repeat: Infinity }}
          className="absolute bottom-[5%] left-0 right-0 h-[8%] bg-gradient-to-r from-transparent via-white/30 to-transparent blur-sm"
        />
        
        {/* Bridge */}
        <div className="absolute bottom-[27%] left-1/2 -translate-x-1/2">
          <div className="w-56 h-6 bg-gradient-to-r from-amber-700 via-amber-600 to-amber-700 border-t-2 border-amber-400 rounded shadow-lg" />
          <div className="w-6 h-10 bg-amber-800 absolute -bottom-10 left-4 rounded-b" />
          <div className="w-6 h-10 bg-amber-800 absolute -bottom-10 right-4 rounded-b" />
        </div>
        
        {/* Ground */}
        <div className="absolute bottom-[-5%] left-[-10%] right-[-10%] h-[8%] bg-emerald-600 rounded-[100%_100%_0_0]" />
      </motion.div>

      {/* ═══ CONTENT ═══ */}
      <div className="relative z-10 flex-1 flex flex-col">

        {/* ─── Top HUD ─── */}
        <div className="flex justify-between items-center p-4">
          <div className="flex items-center gap-3">
            <Link href="/lesson/q_1">
              <button className="w-11 h-11 bg-white/95 backdrop-blur-xl border-2 border-slate-200 rounded-full flex items-center justify-center hover:bg-white transition-all shadow-[0_4px_0_0_#e2e8f0] active:shadow-none active:translate-y-1">
                <X className="w-5 h-5 text-slate-600" />
              </button>
            </Link>
            {/* Progress bar */}
            <div className="bg-white/95 backdrop-blur-xl border-2 border-slate-200 rounded-full px-4 py-2.5 shadow-[0_4px_0_0_#e2e8f0]">
              <div className="flex items-center gap-2.5">
                <span className="text-[11px] font-black text-slate-500">Q1/5</span>
                <div className="w-28 h-3 bg-slate-200 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-full shadow-[inset_0_-1px_0_rgba(0,0,0,0.1)]"
                    initial={{ width: "0%" }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.8, type: "spring" }}
                  />
                </div>
              </div>
            </div>
          </div>
          <motion.div
            animate={wrongAnim ? { scale: [1, 1.5, 0.9, 1.1, 1], rotate: [0, -10, 10, -5, 0] } : {}}
            transition={{ duration: 0.5 }}
            className="flex items-center gap-2 bg-white/95 backdrop-blur-xl border-2 border-rose-200 rounded-full px-4 py-2.5 shadow-[0_4px_0_0_#fecdd3]"
          >
            <Heart className="w-5 h-5 fill-rose-500 text-rose-500" />
            <span className="text-rose-600 font-black text-lg">{hearts}</span>
          </motion.div>
        </div>

        {/* ─── Mission Badge ─── */}
        <div className="flex justify-center mt-1 mb-3">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-amber-100 to-orange-100 border-2 border-amber-300 text-amber-800 text-xs font-black px-6 py-2 rounded-full tracking-wider shadow-[0_3px_0_0_#d97706] flex items-center gap-2"
          >
            <Zap className="w-4 h-4 fill-amber-500 text-amber-500" />
            สร้างสะพานมังกร
          </motion.div>
        </div>

        {/* ─── Info Cards ─── */}
        <div className="flex justify-center gap-3 mb-3 px-4">
          {[
            { emoji: "🌉", value: "24 เมตร", label: "ความยาวสะพาน" },
            { emoji: "🪵", value: "3 เมตร",  label: "ความยาวต่อท่อน" },
          ].map((item, i) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1, y: [0, -4, 0] }}
              transition={{ delay: 0.2 + i * 0.15, duration: 3, repeat: Infinity, repeatDelay: 0.5 }}
              className="bg-white/95 backdrop-blur-xl border-2 border-slate-200 rounded-2xl px-5 py-3 flex flex-col items-center gap-1.5 shadow-[0_6px_0_0_#e2e8f0]"
            >
              <span className="text-2xl drop-shadow">{item.emoji}</span>
              <span className="text-slate-800 font-black text-base">{item.value}</span>
              <span className="text-slate-400 text-[10px] font-black uppercase tracking-wider">{item.label}</span>
            </motion.div>
          ))}
        </div>

        {/* ─── Character / Mascot ─── */}
        <div className="flex-1 flex items-center justify-center relative">
          <motion.div
            animate={{ y: [0, -12, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            className="text-[80px] md:text-[110px] drop-shadow-2xl select-none relative"
          >
            🐉
            {/* Speech bubble */}
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1, type: "spring" }}
              className="absolute -top-8 -right-16 bg-white border-2 border-emerald-300 text-emerald-700 text-xs font-black px-3 py-1.5 rounded-full shadow-lg whitespace-nowrap"
            >
              ช่วยด้วย! 🆘
              <div className="absolute -bottom-1.5 left-4 w-3 h-3 bg-white border-b-2 border-r-2 border-emerald-300 rotate-45" />
            </motion.div>
          </motion.div>
        </div>

        {/* ─── Question Card ─── */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
          className="mx-4 mb-3"
        >
          <div className="bg-white/95 backdrop-blur-xl border-2 border-slate-200 rounded-[2rem] px-6 py-5 text-center shadow-[0_8px_0_0_#e2e8f0]">
            <p className="text-slate-800 font-black text-lg md:text-xl leading-relaxed">
              ต้องใช้ไม้กี่ท่อนในการสร้างสะพาน?
            </p>
          </div>
        </motion.div>

        {/* ─── Hint Button ─── */}
        <div className="flex justify-center mb-3">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowHint(true)}
            className="flex items-center gap-2 text-slate-500 hover:text-amber-600 bg-white/80 hover:bg-amber-50 border-2 border-slate-200 hover:border-amber-300 px-5 py-2.5 rounded-full text-sm font-black transition-all shadow-sm"
          >
            <Lightbulb className="w-4 h-4" /> ขอคำใบ้
          </motion.button>
        </div>

        {/* ─── Answer Grid ─── */}
        <div className="px-4 pb-6">
          <div className="grid grid-cols-2 gap-3 max-w-md mx-auto">
            {ANSWERS.map((ans, i) => (
              <motion.div
                key={ans.value}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + 0.08 * i, type: "spring", stiffness: 200 }}
              >
                {ans.correct ? (
                  <Link href="/result" className="block">
                    <InteractiveObject
                      withParticles
                      onClick={() => setFeedback("correct")}
                      className="w-full h-[72px] rounded-[1.5rem] bg-white hover:bg-emerald-50 border-[3px] border-slate-200 hover:border-emerald-400 flex items-center justify-center cursor-pointer transition-all group shadow-[0_6px_0_0_#e2e8f0] hover:shadow-[0_6px_0_0_#6ee7b7] active:shadow-none active:translate-y-1.5"
                    >
                      <span className="text-3xl font-black text-slate-700 group-hover:text-emerald-600 transition-colors drop-shadow-sm">{ans.value}</span>
                    </InteractiveObject>
                  </Link>
                ) : (
                  <InteractiveObject
                    onClick={() => handleWrong(i)}
                    className={`w-full h-[72px] rounded-[1.5rem] bg-white border-[3px] flex items-center justify-center cursor-pointer transition-all group
                      ${selected === i 
                        ? "border-rose-400 bg-rose-50 shadow-[0_6px_0_0_#fda4af] animate-[shake_0.3s_ease-in-out]"
                        : "border-slate-200 hover:border-rose-300 hover:bg-rose-50 shadow-[0_6px_0_0_#e2e8f0] hover:shadow-[0_6px_0_0_#fda4af]"
                      } active:shadow-none active:translate-y-1.5`}
                  >
                    <span className={`text-3xl font-black transition-colors drop-shadow-sm ${selected === i ? "text-rose-500" : "text-slate-700 group-hover:text-rose-500"}`}>{ans.value}</span>
                  </InteractiveObject>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* ═══ Hint Modal ═══ */}
      <AnimatePresence>
        {showHint && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowHint(false)}
              className="absolute inset-0 z-40 bg-black/30 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, y: 40, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 40, scale: 0.9 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="absolute bottom-24 inset-x-4 z-50"
            >
              <div className="bg-white border-2 border-amber-300 rounded-[2rem] p-6 shadow-[0_10px_0_0_#d97706,0_20px_60px_rgba(0,0,0,0.15)]">
                <div className="flex gap-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-amber-100 to-amber-200 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0 border-2 border-amber-300 shadow-inner">
                    💡
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Sparkles className="w-4 h-4 text-amber-500" />
                      <span className="text-amber-600 text-xs font-black uppercase tracking-widest">คำใบ้จากลูมี่</span>
                    </div>
                    <p className="text-slate-700 font-bold leading-relaxed text-sm">
                      สะพานยาว <span className="text-orange-500 font-black text-base">24 เมตร</span> และไม้แต่ละท่อนยาว <span className="text-orange-500 font-black text-base">3 เมตร</span> — ลองหาร 24 ÷ 3 นะ!
                    </p>
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setShowHint(false)}
                      className="mt-4 w-full bg-gradient-to-b from-amber-400 to-amber-500 text-white font-black text-sm py-3 rounded-2xl shadow-[0_4px_0_0_#b45309] active:shadow-none active:translate-y-1 transition-all"
                    >
                      เข้าใจแล้ว! 👍
                    </motion.button>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
