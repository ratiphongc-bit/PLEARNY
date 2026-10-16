"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, X, BookOpen, Target } from "lucide-react";

export default function LessonPage() {
  return (
    <div className="w-full h-full flex relative overflow-hidden bg-sky-50">

      {/* Background (Daytime) */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-sky-200 via-sky-100 to-emerald-50" />
        
        {/* Sun */}
        <div className="absolute top-[10%] left-1/2 -translate-x-1/2 w-64 h-64 bg-yellow-100/50 blur-[80px] rounded-full" />
        
        {/* Soft clouds */}
        {[
          { w: "40%", t: "15%", l: "10%", opacity: 0.6 },
          { w: "30%", t: "25%", l: "60%", opacity: 0.4 },
        ].map((c, i) => (
          <div key={i} className="absolute bg-white rounded-full blur-[20px]" style={{ width: c.w, height: "100px", top: c.t, left: c.l, opacity: c.opacity }} />
        ))}

        {/* Distant Hills */}
        <div className="absolute bottom-0 left-0 right-0 h-[40%] bg-gradient-to-t from-emerald-500/20 to-transparent" />
        <div className="absolute bottom-[20%] left-[-10%] w-[50%] h-[30%] bg-emerald-200/50 rounded-[100%] blur-[2px]" />
        <div className="absolute bottom-[15%] right-[-10%] w-[60%] h-[35%] bg-emerald-300/40 rounded-[100%] blur-[2px]" />
      </div>

      {/* Close */}
      <div className="absolute top-4 left-4 z-30">
        <Link href="/map">
          <button className="w-10 h-10 bg-white/50 hover:bg-white/80 border border-slate-200 rounded-full flex items-center justify-center transition-all shadow-sm">
            <X className="w-5 h-5 text-slate-700" />
          </button>
        </Link>
      </div>
      <div className="absolute top-4 right-4 z-30">
        <div className="bg-white/80 border border-slate-200 px-3 py-1.5 rounded-full text-[10px] font-black text-slate-500 uppercase tracking-widest shadow-sm">
          Story Event
        </div>
      </div>

      {/* ═══ Content — single centered column ═══ */}
      <div className="relative z-10 w-full h-full flex items-center justify-center px-6 py-16">
        <div className="w-full max-w-4xl flex flex-col lg:flex-row items-center gap-10">

          {/* Dragon + scene (left) */}
          <div className="flex flex-col items-center gap-4 flex-shrink-0">
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.7 }}
            >
              <motion.div
                animate={{ y: [0, -15, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="text-[100px] md:text-[130px] drop-shadow-xl select-none"
              >
                🐉
              </motion.div>
              {/* Soft shadow under dragon */}
              <div className="w-32 h-6 bg-emerald-900/10 blur-xl rounded-full mx-auto -mt-2" />
            </motion.div>

            {/* Context chips */}
            <div className="flex gap-3">
              {[{ label: "Forest Zone", emoji: "🌲" }, { label: "Level 18", emoji: "⭐" }].map((c) => (
                <div key={c.label} className="flex items-center gap-1.5 bg-white/80 border border-slate-200 px-3 py-1.5 rounded-full shadow-sm">
                  <span className="text-sm">{c.emoji}</span>
                  <span className="text-[11px] font-bold text-slate-600">{c.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Dialogue + objectives (right) */}
          <div className="flex-1 flex flex-col gap-5 w-full">
            {/* Lumi Card */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="relative bg-white/90 backdrop-blur-xl border border-slate-200 rounded-[2rem] p-6 shadow-xl"
            >
              <div className="absolute -top-3.5 left-6 flex items-center gap-2 bg-white border border-sky-200 px-3 py-1 rounded-full shadow-sm">
                <span className="text-sm">🤖</span>
                <span className="text-[10px] font-black text-sky-600 uppercase tracking-widest">LUMI</span>
              </div>
              <p className="text-slate-700 text-base md:text-lg font-medium leading-relaxed mt-1">
                เราต้องสร้างสะพานให้เสร็จก่อนที่ดวงอาทิตย์จะตก! มาฝึก{" "}
                <span className="text-orange-500 font-black">การคูณ</span>{" "}
                กันก่อนนะ — ถ้าเราเข้าใจแล้ว เราจะรู้ว่าต้องใช้ไม้กี่ท่อน!
              </p>
            </motion.div>

            {/* Objectives */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-white/50 border border-slate-200 rounded-[2rem] p-5 shadow-sm"
            >
              <div className="flex items-center gap-2 mb-4">
                <Target className="w-4 h-4 text-slate-400" />
                <span className="text-xs font-black text-slate-500 uppercase tracking-widest">Learning Objectives</span>
              </div>
              <div className="space-y-3">
                {[
                  { icon: BookOpen, text: "เข้าใจการคูณในฐานะการบวกซ้ำๆ", done: true },
                  { icon: BookOpen, text: "คำนวณจำนวนวัสดุที่ต้องใช้สำหรับสะพาน", done: false },
                  { icon: BookOpen, text: "ฝึกทักษะการหารเบื้องต้น", done: false },
                ].map((obj, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${obj.done ? "bg-emerald-100 border border-emerald-300" : "bg-white border border-slate-300"}`}>
                      {obj.done && <div className="w-2 h-2 rounded-full bg-emerald-500" />}
                    </div>
                    <span className={`text-sm font-medium ${obj.done ? "text-slate-400 line-through" : "text-slate-700"}`}>
                      {obj.text}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* CTA */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
            >
              <Link href="/play/1">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full h-14 md:h-16 rounded-[2rem] bg-gradient-to-r from-primary-light to-primary text-white font-black text-lg shadow-[0_6px_0_0_#4c1d95] hover:shadow-[0_3px_0_0_#4c1d95] active:shadow-none active:translate-y-1 transition-all flex items-center justify-center gap-2"
                >
                  ไปเลย! เริ่มภารกิจ <ArrowRight className="w-5 h-5" />
                </motion.button>
              </Link>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
