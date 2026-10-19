"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Award, BookOpen, Lock, Package, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { usePlayer } from "@/components/player/PlayerProvider";

type ProfileTab = "progress" | "achievements";

export default function ProfilePage() {
  const { data } = usePlayer();
  const [activeTab, setActiveTab] = useState<ProfileTab>("progress");
  const profile = data!.profile;
  const completed = useMemo(() => new Set(profile.completedStages), [profile.completedStages]);
  const achievements = useMemo(() => [
    { icon: "🥚", title: "ก้าวแรกของนักผจญภัย", desc: "ผ่านด่านแรกของ Numeria", unlocked: completed.has(1), rarity: "common" },
    { icon: "🧭", title: "นักสำรวจมือใหม่", desc: "ผ่านอย่างน้อย 3 ด่าน", unlocked: profile.completedStages.length >= 3, rarity: "rare" },
    { icon: "🏔️", title: "พิชิตขุนเขา", desc: "ผ่านด่านที่ 6", unlocked: completed.has(6), rarity: "epic" },
    { icon: "🐉", title: "ผู้พิทักษ์ Numeria", desc: "ผ่านด่านสุดท้าย", unlocked: completed.has(12), rarity: "legendary" },
    { icon: "🎒", title: "นักสะสมไอเทม", desc: "มีไอเทมอย่างน้อย 8 ชิ้น", unlocked: profile.unlockedItems.length >= 8, rarity: "epic" },
    { icon: "⭐", title: "ดาวรุ่งแห่ง Numeria", desc: "สะสม 1,000 XP", unlocked: profile.xp >= 1000, rarity: "rare" },
  ], [completed, profile.completedStages.length, profile.unlockedItems.length, profile.xp]);

  return (
    <div className="w-full h-full relative overflow-hidden bg-slate-50 flex flex-col">
      <div className="absolute inset-0 z-0 pointer-events-none"><div className="absolute inset-0 bg-sky-50" /><div className="absolute top-0 left-1/2 -translate-x-1/2 w-[80%] h-80 bg-white blur-[100px] rounded-full" /></div>
      <div className="relative z-10 flex flex-col h-full overflow-y-auto pb-32 pt-24 md:pt-10">
        <div className="px-5 max-w-4xl mx-auto w-full">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="rounded-[2rem] overflow-hidden border border-slate-200 shadow-sm bg-white mb-6">
            <div className="h-28 bg-gradient-to-br from-sky-300 via-blue-200 to-emerald-200 relative">{["✨", "☁️", "💫"].map((particle, index) => <motion.span key={index} className="absolute text-lg opacity-60" style={{ left: `${20 + index * 30}%`, top: `${20 + index * 15}%` }} animate={{ y: [-4, 4, -4], opacity: [0.4, 0.8, 0.4] }} transition={{ duration: 3 + index, repeat: Infinity, delay: index * 0.5 }}>{particle}</motion.span>)}</div>
            <div className="bg-white/90 px-6 pb-6 relative"><motion.div animate={{ y: [0, -3, 0] }} transition={{ duration: 3, repeat: Infinity }} className="absolute -top-12 left-6 w-24 h-24 bg-gradient-to-br from-blue-300 to-indigo-400 rounded-[1.5rem] border-4 border-white shadow-xl flex items-center justify-center text-5xl">🧒</motion.div>
              <div className="pt-16 flex items-start justify-between gap-3"><div><h1 className="text-2xl font-black text-slate-800">{data!.user.name}</h1><p className="text-primary font-bold text-sm">นักผจญภัยแห่ง Numeria · ด่าน {profile.unlockedStage}/12</p></div><div className="flex items-center gap-2 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-full"><span>🪙</span><span className="text-amber-700 font-black text-sm">{profile.coins.toLocaleString()}</span></div></div>
              <div className="mt-4"><div className="flex justify-between items-center mb-1.5"><div className="flex items-center gap-2"><div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-200 to-amber-400 grid place-items-center text-sm font-black text-amber-900">{profile.playerLevel}</div><span className="text-slate-800 font-black text-sm">นักผจญภัย Lv.{profile.playerLevel}</span></div><span className="text-slate-500 text-xs font-bold">{profile.xpInLevel} / {profile.xpForNextLevel} XP</span></div><div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden border border-slate-200"><motion.div className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full" initial={{ width: 0 }} animate={{ width: `${(profile.xpInLevel / profile.xpForNextLevel) * 100}%` }} transition={{ duration: 0.8 }} /></div></div>
            </div>
          </motion.div>

          <div className="grid grid-cols-3 gap-3 mb-6">{[{ label: "ด่านที่ผ่าน", value: `${profile.completedStages.length}/12`, icon: "⚔️" }, { label: "XP", value: profile.xp.toLocaleString(), icon: "⭐" }, { label: "ไอเทม", value: profile.unlockedItems.length.toString(), icon: "🎒" }].map((stat, index) => <motion.div key={stat.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.08 }} className="bg-white border border-slate-200 rounded-2xl p-3 md:p-4 flex flex-col items-center gap-1 shadow-sm"><span className="text-2xl">{stat.icon}</span><span className="text-slate-800 font-black text-lg">{stat.value}</span><span className="text-slate-400 text-[10px] md:text-xs font-bold uppercase tracking-widest">{stat.label}</span></motion.div>)}</div>

          <div className="flex bg-white rounded-2xl p-1 border border-slate-200 shadow-sm mb-5">{[{ key: "progress", label: "ความคืบหน้า", icon: BookOpen }, { key: "achievements", label: "ความสำเร็จ", icon: Award }].map((tab) => <button key={tab.key} onClick={() => setActiveTab(tab.key as ProfileTab)} className={cn("flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all", activeTab === tab.key ? "bg-primary text-white shadow-md" : "text-slate-500 hover:bg-slate-50")}><tab.icon className="w-4 h-4" />{tab.label}</button>)}</div>
          <AnimatePresence mode="wait">{activeTab === "progress" ? <motion.div key="progress" initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 12 }} className="space-y-3">{data!.levels.map((level) => { const isDone = completed.has(level.id); const isOpen = level.id <= profile.unlockedStage; return <div key={level.id} className={cn("flex items-center gap-3 bg-white border rounded-2xl p-4 shadow-sm", isDone ? "border-emerald-200" : isOpen ? "border-sky-200" : "border-slate-200 opacity-70")}><div className="w-11 h-11 rounded-xl bg-sky-50 grid place-items-center text-2xl">{isDone ? "✅" : isOpen ? level.emoji : <Lock className="w-4 h-4 text-slate-400" />}</div><div className="flex-1 min-w-0"><div className="font-black text-slate-800 text-sm">ด่าน {level.id}: {level.title}</div><div className="text-xs text-slate-500 font-bold">{level.zone} · {level.skill}</div></div><span className={cn("text-[10px] font-black uppercase", isDone ? "text-emerald-600" : isOpen ? "text-sky-600" : "text-slate-400")}>{isDone ? "ผ่านแล้ว" : isOpen ? "เปิดแล้ว" : "ล็อก"}</span></div>; })}</motion.div> : <motion.div key="achievements" initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }} className="grid grid-cols-2 gap-3">{achievements.map((achievement, index) => <motion.div key={achievement.title} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: index * 0.04 }} className={cn("rounded-2xl p-4 border relative overflow-hidden shadow-sm", achievement.unlocked ? achievement.rarity === "legendary" ? "border-amber-200 bg-amber-50" : achievement.rarity === "epic" ? "border-purple-200 bg-purple-50" : achievement.rarity === "rare" ? "border-blue-200 bg-blue-50" : "border-slate-200 bg-slate-50" : "border-slate-200 bg-slate-50 opacity-65 grayscale")}><div className="text-3xl mb-2">{achievement.unlocked ? achievement.icon : "🔒"}</div><div className="text-slate-800 font-black text-sm">{achievement.title}</div><div className="text-slate-500 text-[11px] mt-1">{achievement.desc}</div><div className={cn("mt-2 text-[10px] font-black uppercase tracking-widest", achievement.unlocked ? "text-emerald-600" : "text-slate-400")}>{achievement.unlocked ? "ปลดล็อกแล้ว" : "ยังไม่ปลดล็อก"}</div></motion.div>)}</motion.div>}</AnimatePresence>
          <div className="mt-6 flex gap-3"><Link href="/map" className="flex-1 rounded-2xl bg-primary px-4 py-3 text-center text-sm font-black text-white">ดูแผนที่</Link><Link href="/inventory" className="flex-1 rounded-2xl bg-white border border-slate-200 px-4 py-3 text-center text-sm font-black text-slate-700"><Package className="inline w-4 h-4 mr-1" />คลังอุปกรณ์</Link></div>
          <div className="mt-5 text-center text-xs font-bold text-slate-400"><Sparkles className="inline w-3 h-3 mr-1" />ความคืบหน้าบันทึกไว้กับบัญชี Manus ของคุณ</div>
        </div>
      </div>
    </div>
  );
}
