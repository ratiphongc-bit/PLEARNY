"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { STUDENT_USER } from "@/mock/data";
import { cn } from "@/lib/utils";
import { Flame, Heart, Award, BookOpen, TrendingUp } from "lucide-react";

type ProfileTab = "skills" | "achievements";

const ACHIEVEMENTS = [
  { icon: "🔥", title: "7 Day Streak", desc: "บันทึกการเรียน 7 วันต่อเนื่อง", unlocked: true, rarity: "epic" },
  { icon: "⚡", title: "Speed Solver", desc: "ตอบคำถาม 10 ข้อภายใน 2 นาที", unlocked: true, rarity: "rare" },
  { icon: "🧠", title: "Problem Solver", desc: "แก้ปัญหาคณิตศาสตร์ 100 ข้อ", unlocked: true, rarity: "common" },
  { icon: "🎯", title: "Perfect Quest", desc: "ทำภารกิจได้ 100% โดยไม่ผิด", unlocked: false, rarity: "legendary" },
  { icon: "🐉", title: "Dragon Saver", desc: "ช่วยมังกรได้ในภารกิจแรก", unlocked: true, rarity: "rare" },
  { icon: "🏆", title: "Math Explorer", desc: "สำรวจทุกพื้นที่ในแผนที่", unlocked: false, rarity: "epic" },
];

const SKILL_DATA = [
  { name: "การบวก", key: "addition", value: 95, color: "from-green-400 to-emerald-500" },
  { name: "การลบ", key: "subtraction", value: 91, color: "from-blue-400 to-cyan-500" },
  { name: "การคูณ", key: "multiplication", value: 87, color: "from-purple-400 to-violet-500" },
  { name: "การหาร", key: "division", value: 74, color: "from-orange-400 to-amber-500" },
  { name: "เศษส่วน", key: "fractions", value: 68, color: "from-rose-400 to-pink-500" },
];

const RARITY_COLORS: Record<string, string> = {
  common: "border-slate-200 bg-slate-50",
  rare: "border-blue-200 bg-blue-50",
  epic: "border-purple-200 bg-purple-50",
  legendary: "border-amber-200 bg-amber-50",
};

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState<ProfileTab>("skills");

  return (
    <div className="w-full h-full relative overflow-hidden bg-slate-50 flex flex-col">

      {/* Background */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-sky-50" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[80%] h-80 bg-white blur-[100px] rounded-full" />
      </div>

      {/* Scrollable content */}
      <div className="relative z-10 flex flex-col h-full overflow-y-auto pb-32 pt-28">

        {/* Hero Card */}
        <div className="px-5 mb-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="rounded-[2rem] overflow-hidden relative border border-slate-200 shadow-sm bg-white"
          >
            {/* Banner */}
            <div className="h-28 bg-gradient-to-br from-sky-300 via-blue-200 to-emerald-200 relative">
              {/* Floating particles */}
              {["✨","☁️","💫"].map((p, i) => (
                <motion.span
                  key={i}
                  className="absolute text-lg opacity-60"
                  style={{ left: `${20 + i * 30}%`, top: `${20 + i * 15}%` }}
                  animate={{ y: [-4, 4, -4], opacity: [0.4, 0.8, 0.4] }}
                  transition={{ duration: 3 + i, repeat: Infinity, delay: i * 0.5 }}
                >
                  {p}
                </motion.span>
              ))}
            </div>

            {/* Avatar & Info */}
            <div className="bg-white/80 backdrop-blur-xl px-6 pb-6 relative">
              {/* Avatar */}
              <motion.div
                animate={{ y: [0, -3, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -top-12 left-6 w-24 h-24 bg-gradient-to-br from-blue-300 to-indigo-400 rounded-[1.5rem] border-4 border-white shadow-xl flex items-center justify-center text-5xl"
              >
                👦
              </motion.div>

              <div className="pt-16 flex items-start justify-between">
                <div>
                  <h1 className="text-2xl font-black text-slate-800">{STUDENT_USER.name}</h1>
                  <p className="text-primary font-bold text-sm">ผู้ฝึกหัดมังกร · ป.{STUDENT_USER.grade}</p>
                </div>
                <div className="flex gap-2 mt-1">
                  <div className="flex items-center gap-1.5 bg-orange-50 border border-orange-200 px-3 py-1.5 rounded-full">
                    <Flame className="w-4 h-4 text-orange-500 fill-orange-500" />
                    <span className="text-orange-600 font-black text-sm">{STUDENT_USER.streak}</span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-rose-50 border border-rose-200 px-3 py-1.5 rounded-full">
                    <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
                    <span className="text-rose-600 font-black text-sm">{STUDENT_USER.hearts}</span>
                  </div>
                </div>
              </div>

              {/* Level / XP */}
              <div className="mt-4">
                <div className="flex justify-between items-center mb-1.5">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-gold-light to-gold flex items-center justify-center text-sm font-black text-yellow-900 shadow-sm">
                      {STUDENT_USER.level}
                    </div>
                    <span className="text-slate-800 font-black text-sm">Level {STUDENT_USER.level}</span>
                  </div>
                  <span className="text-slate-500 text-xs font-bold">
                    {STUDENT_USER.xp.toLocaleString()} / {STUDENT_USER.maxXp.toLocaleString()} XP
                  </span>
                </div>
                <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                  <motion.div
                    className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${(STUDENT_USER.xp / STUDENT_USER.maxXp) * 100}%` }}
                    transition={{ duration: 1.2, ease: "easeOut", delay: 0.3 }}
                  />
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Stats Row */}
        <div className="px-5 mb-6">
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "เหรียญ", value: STUDENT_USER.coins.toLocaleString(), icon: "🪙" },
              { label: "ภารกิจ", value: "23", icon: "⚔️" },
              { label: "รางวัล", value: "8", icon: "🏆" },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + i * 0.1 }}
                className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col items-center gap-1 shadow-sm"
              >
                <span className="text-2xl">{stat.icon}</span>
                <span className="text-slate-800 font-black text-lg">{stat.value}</span>
                <span className="text-slate-400 text-xs font-bold uppercase tracking-widest">{stat.label}</span>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="px-5 mb-5">
          <div className="flex bg-white rounded-2xl p-1 border border-slate-200 shadow-sm">
            {[
              { key: "skills", label: "ทักษะ", icon: TrendingUp },
              { key: "achievements", label: "ความสำเร็จ", icon: Award },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as ProfileTab)}
                className={cn(
                  "flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all duration-300",
                  activeTab === tab.key
                    ? "bg-primary text-white shadow-md shadow-primary/20"
                    : "text-slate-500 hover:text-slate-800 hover:bg-slate-50"
                )}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="px-5">
          <AnimatePresence mode="wait">
            {activeTab === "skills" ? (
              <motion.div
                key="skills"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-4"
              >
                {SKILL_DATA.map((skill, i) => (
                  <motion.div
                    key={skill.key}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.07 }}
                    className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm"
                  >
                    <div className="flex justify-between items-center mb-3">
                      <div className="flex items-center gap-2">
                        <BookOpen className="w-4 h-4 text-slate-400" />
                        <span className="font-black text-slate-700">{skill.name}</span>
                      </div>
                      <span className={cn(
                        "text-sm font-black",
                        skill.value >= 90 ? "text-emerald-500" : skill.value >= 75 ? "text-amber-500" : "text-orange-500"
                      )}>
                        {skill.value}%
                      </span>
                    </div>
                    <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                      <motion.div
                        className={cn("h-full rounded-full bg-gradient-to-r", skill.color)}
                        initial={{ width: 0 }}
                        animate={{ width: `${skill.value}%` }}
                        transition={{ duration: 1, ease: "easeOut", delay: 0.4 + i * 0.1 }}
                      />
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <motion.div
                key="achievements"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="grid grid-cols-2 gap-3"
              >
                {ACHIEVEMENTS.map((ach, i) => (
                  <motion.div
                    key={ach.title}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.06 }}
                    className={cn(
                      "rounded-2xl p-4 border relative overflow-hidden shadow-sm",
                      ach.unlocked ? RARITY_COLORS[ach.rarity] : "border-slate-200 bg-slate-50",
                      !ach.unlocked && "opacity-60 grayscale"
                    )}
                  >
                    {ach.unlocked && ach.rarity === "legendary" && (
                      <div className="absolute inset-0 bg-gradient-to-br from-yellow-100 to-amber-100 opacity-50 animate-pulse" />
                    )}
                    <div className="text-3xl mb-2">{ach.unlocked ? ach.icon : "🔒"}</div>
                    <div className="text-slate-800 font-black text-sm leading-tight relative z-10">{ach.title}</div>
                    <div className="text-slate-500 text-[11px] mt-1 leading-snug relative z-10">{ach.desc}</div>
                    {ach.unlocked && (
                      <div className={cn(
                        "mt-2 text-[10px] font-black uppercase tracking-widest relative z-10",
                        ach.rarity === "legendary" ? "text-amber-600" :
                        ach.rarity === "epic" ? "text-purple-600" :
                        ach.rarity === "rare" ? "text-blue-600" : "text-slate-500"
                      )}>
                        {ach.rarity}
                      </div>
                    )}
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </div>
    </div>
  );
}
