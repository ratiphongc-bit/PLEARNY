"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Flame } from "lucide-react";
import confetti from "canvas-confetti";
import { useEffect, useState } from "react";

export default function ResultPage() {
  const [chestOpen, setChestOpen] = useState(false);

  useEffect(() => {
    const duration = 3000;
    const end = Date.now() + duration;
    const frame = () => {
      if (Date.now() > end) return;
      const t = (end - Date.now()) / duration;
      confetti({ particleCount: Math.round(t * 60), spread: 360, startVelocity: 25, ticks: 60, zIndex: 100, origin: { x: Math.random(), y: 0.2 } });
      requestAnimationFrame(frame);
    };
    frame();
  }, []);

  return (
    <div className="w-full h-full flex flex-col items-center justify-center relative overflow-hidden bg-sky-50 text-slate-800">

      {/* Light background glow */}
      <div className="absolute inset-0 bg-gradient-to-b from-sky-200 via-sky-100 to-sky-50 z-0" />
      <motion.div
        animate={{ scale: [1, 1.2, 1], opacity: [0.4, 0.7, 0.4] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] aspect-square bg-white blur-[120px] rounded-full pointer-events-none z-0"
      />
      {/* Sun glow */}
      <div className="absolute top-[10%] left-1/2 -translate-x-1/2 w-64 h-64 bg-yellow-100/60 blur-[80px] rounded-full pointer-events-none z-0" />

      {/* Content */}
      <div className="relative z-10 w-full max-w-sm px-6 flex flex-col items-center text-center">

        {/* Icon burst */}
        <motion.div
          initial={{ scale: 0, rotate: -30 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 15 }}
          className="text-7xl mb-4 drop-shadow-xl"
        >
          🎉
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-4xl font-black tracking-tight mb-1 text-transparent bg-clip-text bg-gradient-to-b from-primary to-indigo-600 drop-shadow-sm"
        >
          QUEST COMPLETE!
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-slate-500 font-bold mb-8"
        >
          Build the Dragon Bridge
        </motion.p>

        {/* Rewards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="grid grid-cols-2 gap-3 w-full mb-6"
        >
          {[
            { emoji: "⭐", value: "+250", label: "XP Earned", color: "text-amber-500" },
            { emoji: "🪙", value: "+120", label: "Coins", color: "text-amber-600" },
          ].map((r) => (
            <div key={r.label} className="bg-white/80 backdrop-blur-md border border-slate-200 rounded-3xl p-5 flex flex-col items-center shadow-sm">
              <span className="text-3xl mb-1">{r.emoji}</span>
              <span className={`text-2xl font-black ${r.color}`}>{r.value}</span>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-0.5">{r.label}</span>
            </div>
          ))}
        </motion.div>

        {/* Stats panel */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.65 }}
          className="w-full bg-white/90 backdrop-blur-md border border-slate-200 rounded-3xl p-5 mb-6 relative shadow-lg"
        >
          <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-orange-400 to-amber-500 text-white font-black text-xs px-4 py-1.5 rounded-full flex items-center gap-1.5 shadow-md whitespace-nowrap">
            <Flame className="w-3.5 h-3.5 fill-white" /> Streak Maintained!
          </div>

          <div className="space-y-4 mt-2">
            {[
              { label: "ความแม่นยำ", pct: 87, color: "from-green-400 to-emerald-500" },
              { label: "ทักษะ: การคูณ", pct: 60, color: "from-primary-light to-primary", suffix: "+4%" },
            ].map((stat) => (
              <div key={stat.label}>
                <div className="flex justify-between text-sm font-bold text-slate-500 mb-1.5">
                  <span>{stat.label}</span>
                  <span className="text-emerald-500">{stat.suffix ?? `${stat.pct}%`}</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                  <motion.div
                    className={`h-full bg-gradient-to-r ${stat.color} rounded-full`}
                    initial={{ width: 0 }}
                    animate={{ width: `${stat.pct}%` }}
                    transition={{ duration: 1, ease: "easeOut", delay: 0.8 }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Mystery Chest */}
          <div className="mt-5 pt-5 border-t border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <motion.div
                animate={chestOpen ? { rotate: [0, -10, 10, -5, 0], scale: [1, 1.2, 1] } : { y: [0, -3, 0] }}
                transition={chestOpen ? { duration: 0.5 } : { duration: 2, repeat: Infinity }}
                className="w-12 h-12 bg-amber-50 border border-amber-200 rounded-2xl flex items-center justify-center text-2xl cursor-pointer shadow-sm"
                onClick={() => setChestOpen(true)}
              >
                {chestOpen ? "🎊" : "🎁"}
              </motion.div>
              <div>
                <div className="text-sm font-black text-slate-800 text-left">Mystery Chest</div>
                <div className="text-xs font-bold text-primary-light text-left">{chestOpen ? "Moonlight Cape unlocked!" : "แตะเพื่อเปิด"}</div>
              </div>
            </div>
            {!chestOpen && (
              <button
                onClick={() => setChestOpen(true)}
                className="bg-amber-100 hover:bg-amber-200 text-amber-700 border border-amber-300 font-black text-xs px-3 py-1.5 rounded-full transition-all shadow-sm"
              >
                เปิด
              </button>
            )}
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="w-full"
        >
          <Link href="/home">
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              className="w-full h-16 rounded-[2rem] bg-gradient-to-b from-primary-light to-primary border border-primary text-xl font-black text-white shadow-[0_4px_15px_rgba(124,58,237,0.3)] hover:shadow-[0_6px_20px_rgba(124,58,237,0.4)] transition-all"
            >
              CONTINUE ADVENTURE
            </motion.button>
          </Link>
        </motion.div>

      </div>
    </div>
  );
}
