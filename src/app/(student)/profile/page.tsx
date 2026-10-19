"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Award, BookOpen, Lock, Package, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { usePlayer } from "@/components/player/PlayerProvider";
import { HeartStreakHud } from "@/components/player/HeartStreakHud";

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
    { icon: "🔥", title: "ไฟไม่ดับ", desc: "เล่นต่อเนื่องครบ 7 วัน", unlocked: profile.longestStreak >= 7, rarity: "epic" },
  ], [completed, profile.completedStages.length, profile.unlockedItems.length, profile.xp, profile.longestStreak]);

  return (
    <div className="relative flex h-full w-full flex-col overflow-hidden bg-slate-50">
      <div className="pointer-events-none absolute inset-0 z-0"><div className="absolute inset-0 bg-sky-50" /><div className="absolute left-1/2 top-0 h-80 w-[80%] -translate-x-1/2 rounded-full bg-white blur-[100px]" /></div>
      <div className="relative z-10 flex h-full flex-col overflow-y-auto pb-32 pt-24 md:pt-10">
        <div className="mx-auto w-full max-w-4xl px-5">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6 overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
            <div className="relative h-28 bg-gradient-to-br from-sky-300 via-blue-200 to-emerald-200">{["✨", "☁️", "💫"].map((particle, index) => <motion.span key={index} className="absolute text-lg opacity-60" style={{ left: `${20 + index * 30}%`, top: `${20 + index * 15}%` }} animate={{ y: [-4, 4, -4], opacity: [0.4, 0.8, 0.4] }} transition={{ duration: 3 + index, repeat: Infinity, delay: index * 0.5 }}>{particle}</motion.span>)}</div>
            <div className="relative bg-white/90 px-6 pb-6">
              <motion.div animate={{ y: [0, -3, 0] }} transition={{ duration: 3, repeat: Infinity }} className="absolute -top-12 left-6 flex h-24 w-24 items-center justify-center rounded-[1.5rem] border-4 border-white bg-gradient-to-br from-blue-300 to-indigo-400 text-5xl shadow-xl">🧒</motion.div>
              <div className="flex items-start justify-between gap-3 pt-16"><div><h1 className="text-2xl font-black text-slate-800">{data!.user.name}</h1><p className="text-sm font-bold text-primary">นักผจญภัยแห่ง Numeria · ด่าน {profile.unlockedStage}/12</p></div><div className="flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5"><span>🪙</span><span className="text-sm font-black text-amber-700">{profile.coins.toLocaleString()}</span></div></div>
              <div className="mt-4"><div className="mb-1.5 flex items-center justify-between"><div className="flex items-center gap-2"><div className="grid h-8 w-8 place-items-center rounded-full bg-gradient-to-br from-amber-200 to-amber-400 text-sm font-black text-amber-900">{profile.playerLevel}</div><span className="text-sm font-black text-slate-800">นักผจญภัย Lv.{profile.playerLevel}</span></div><span className="text-xs font-bold text-slate-500">{profile.xpInLevel} / {profile.xpForNextLevel} XP</span></div><div className="h-3 w-full overflow-hidden rounded-full border border-slate-200 bg-slate-100"><motion.div className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-blue-500" initial={{ width: 0 }} animate={{ width: `${(profile.xpInLevel / profile.xpForNextLevel) * 100}%` }} transition={{ duration: 0.8 }} /></div></div>
            </div>
          </motion.div>

          <div className="mb-6 grid grid-cols-3 gap-3">{[{ label: "ด่านที่ผ่าน", value: `${profile.completedStages.length}/12`, icon: "⚔️" }, { label: "XP", value: profile.xp.toLocaleString(), icon: "⭐" }, { label: "ไอเทม", value: profile.unlockedItems.length.toString(), icon: "🎒" }].map((stat, index) => <motion.div key={stat.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.08 }} className="flex flex-col items-center gap-1 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm md:p-4"><span className="text-2xl">{stat.icon}</span><span className="text-lg font-black text-slate-800">{stat.value}</span><span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 md:text-xs">{stat.label}</span></motion.div>)}</div>

          <div className="mb-6 grid gap-3 sm:grid-cols-2">
            <div className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"><div className="text-sm font-black text-slate-700">หัวใจและสตรีควันนี้</div><HeartStreakHud profile={profile} showTimer /></div>
            <div className="flex flex-col justify-center rounded-2xl border border-orange-200 bg-orange-50 p-4 shadow-sm"><div className="text-sm font-black text-orange-800">สถิติการเล่นต่อเนื่อง</div><div className="mt-2 flex items-end gap-2"><span className="text-3xl font-black text-orange-700">{profile.streakDays}</span><span className="pb-1 text-sm font-bold text-orange-700">วันปัจจุบัน</span></div><div className="mt-1 text-xs font-bold text-slate-600">สถิติสูงสุด {profile.longestStreak} วัน</div><div className="mt-2 text-[10px] font-bold text-slate-500">นับวันตามเวลา Asia/Bangkok</div></div>
          </div>

          <div className="mb-5 flex rounded-2xl border border-slate-200 bg-white p-1 shadow-sm">{[{ key: "progress", label: "ความคืบหน้า", icon: BookOpen }, { key: "achievements", label: "ความสำเร็จ", icon: Award }].map((tab) => <button key={tab.key} onClick={() => setActiveTab(tab.key as ProfileTab)} className={cn("flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-bold transition-all", activeTab === tab.key ? "bg-primary text-white shadow-md" : "text-slate-500 hover:bg-slate-50")}><tab.icon className="h-4 w-4" />{tab.label}</button>)}</div>
          <AnimatePresence mode="wait">{activeTab === "progress" ? <motion.div key="progress" initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 12 }} className="space-y-3">{data!.levels.map((level) => { const isDone = completed.has(level.id); const isOpen = level.id <= profile.unlockedStage; return <div key={level.id} className={cn("flex items-center gap-3 rounded-2xl border bg-white p-4 shadow-sm", isDone ? "border-emerald-200" : isOpen ? "border-sky-200" : "border-slate-200 opacity-70")}><div className="grid h-11 w-11 place-items-center rounded-xl bg-sky-50 text-2xl">{isDone ? "✅" : isOpen ? level.emoji : <Lock className="h-4 w-4 text-slate-400" />}</div><div className="min-w-0 flex-1"><div className="text-sm font-black text-slate-800">ด่าน {level.id}: {level.title}</div><div className="text-xs font-bold text-slate-500">{level.zone} · {level.skill}</div></div><span className={cn("text-[10px] font-black uppercase", isDone ? "text-emerald-600" : isOpen ? "text-sky-600" : "text-slate-400")}>{isDone ? "ผ่านแล้ว" : isOpen ? "เปิดแล้ว" : "ล็อก"}</span></div>; })}</motion.div> : <motion.div key="achievements" initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }} className="grid grid-cols-2 gap-3">{achievements.map((achievement, index) => <motion.div key={achievement.title} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: index * 0.04 }} className={cn("relative overflow-hidden rounded-2xl border p-4 shadow-sm", achievement.unlocked ? achievement.rarity === "legendary" ? "border-amber-200 bg-amber-50" : achievement.rarity === "epic" ? "border-purple-200 bg-purple-50" : achievement.rarity === "rare" ? "border-blue-200 bg-blue-50" : "border-slate-200 bg-slate-50" : "border-slate-200 bg-slate-50 opacity-65 grayscale")}><div className="mb-2 text-3xl">{achievement.unlocked ? achievement.icon : "🔒"}</div><div className="text-sm font-black text-slate-800">{achievement.title}</div><div className="mt-1 text-[11px] text-slate-500">{achievement.desc}</div><div className={cn("mt-2 text-[10px] font-black uppercase tracking-widest", achievement.unlocked ? "text-emerald-600" : "text-slate-400")}>{achievement.unlocked ? "ปลดล็อกแล้ว" : "ยังไม่ปลดล็อก"}</div></motion.div>)}</motion.div>}</AnimatePresence>
          <div className="mt-6 flex gap-3"><Link href="/map" className="flex-1 rounded-2xl bg-primary px-4 py-3 text-center text-sm font-black text-white">ดูแผนที่</Link><Link href="/inventory" className="flex-1 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-center text-sm font-black text-slate-700"><Package className="mr-1 inline h-4 w-4" />คลังอุปกรณ์</Link></div>
          <div className="mt-5 text-center text-xs font-bold text-slate-400"><Sparkles className="mr-1 inline h-3 w-3" />ความคืบหน้าบันทึกไว้กับบัญชี Manus ของคุณ</div>
        </div>
      </div>
    </div>
  );
}
