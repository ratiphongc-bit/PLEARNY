"use client";

import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Play, Sparkles } from "lucide-react";
import { Canvas } from "@react-three/fiber";
import { ContactShadows } from "@react-three/drei";
import { Suspense, useState } from "react";
import { CuteCharacter } from "@/components/3d/CuteCharacter";
import { CutePet } from "@/components/3d/CutePet";
import { usePlayer } from "@/components/player/PlayerProvider";

const CLOUDS = [
  { x: "10%", y: "15%", w: 120, o: 0.8, d: 40, delay: 0 },
  { x: "40%", y: "8%", w: 180, o: 0.6, d: 55, delay: 5 },
  { x: "70%", y: "20%", w: 140, o: 0.7, d: 45, delay: 2 },
  { x: "85%", y: "10%", w: 100, o: 0.5, d: 35, delay: 8 },
  { x: "25%", y: "25%", w: 160, o: 0.9, d: 50, delay: 12 },
];

export default function StudentHome() {
  const { data } = usePlayer();
  const [showDragonTalk, setShowDragonTalk] = useState(false);
  const [showHeroTalk, setShowHeroTalk] = useState(false);
  const profile = data!.profile;
  const stage = data!.levels.find((item) => item.id === profile.unlockedStage) ?? data!.levels[0];
  const campaignComplete = profile.completedStages.length === data!.levels.length;
  const equipped = data!.items.filter((item) => profile.equippedItems[item.slot] === item.id);
  const companion = equipped.find((item) => item.slot === "pet");
  const outfit = equipped.find((item) => item.slot === "outfit");
  const effect = equipped.find((item) => item.slot === "effect");
  const target = campaignComplete ? "/map" : `/lesson/${stage.id}`;

  return (
    <div className="w-full h-full flex flex-col relative overflow-hidden bg-sky-100">
      <div className="absolute inset-0 z-0 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-sky-300 via-sky-200 to-sky-100" />
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 100, repeat: Infinity, ease: "linear" }} className="absolute top-[10%] right-[15%] w-32 h-32 bg-yellow-100 rounded-full blur-[10px]" />
        <div className="absolute top-[12%] right-[17%] w-24 h-24 bg-yellow-300 rounded-full shadow-[0_0_80px_rgba(253,224,71,0.8)]" />
        {CLOUDS.map((cloud, index) => <motion.div key={index} className="absolute bg-white rounded-full blur-[2px]" style={{ width: cloud.w, height: cloud.w * 0.4, left: cloud.x, top: cloud.y, opacity: cloud.o }} animate={{ x: [0, 50, 0] }} transition={{ duration: cloud.d, repeat: Infinity, delay: cloud.delay, ease: "easeInOut" }}><div className="absolute -top-[40%] left-[20%] w-[40%] h-[120%] bg-white rounded-full" /><div className="absolute -top-[20%] left-[50%] w-[30%] h-[100%] bg-white rounded-full" /></motion.div>)}
        <div className="absolute bottom-[20%] left-0 right-0 h-[30%] opacity-40"><div className="absolute bottom-0 left-[-10%] w-[40%] h-[80%] bg-sky-500 rounded-[100%] blur-[2px]" /><div className="absolute bottom-0 left-[20%] w-[50%] h-[100%] bg-sky-400 rounded-[100%] blur-[2px]" /><div className="absolute bottom-0 right-[-10%] w-[45%] h-[90%] bg-sky-500 rounded-[100%] blur-[2px]" /></div>
        <div className="absolute bottom-[10%] left-[-20%] right-[-20%] h-[25%] bg-gradient-to-t from-emerald-500 to-emerald-400 rounded-[100%_100%_0_0]" /><div className="absolute bottom-0 left-0 right-0 h-[15%] bg-gradient-to-t from-emerald-600 to-emerald-500" />
      </div>

      <div className="absolute inset-0 z-10 pointer-events-none">
        <Canvas camera={{ position: [0, 1, 8], fov: 35 }}><ambientLight intensity={0.8} /><directionalLight position={[5, 10, 5]} intensity={1.5} castShadow /><directionalLight position={[-5, 5, -5]} intensity={0.5} /><hemisphereLight intensity={0.6} groundColor="#064e3b" /><Suspense fallback={null}><group position={[0, -0.8, 0]}><group position={[-0.5, 0, 0]} rotation={[0, 0.4, 0]} onClick={() => { setShowHeroTalk(true); window.setTimeout(() => setShowHeroTalk(false), 2500); }}><CuteCharacter scale={1.3} /></group><group position={[0.7, 0, -0.2]} rotation={[0, -0.6, 0]} onClick={() => { setShowDragonTalk(true); window.setTimeout(() => setShowDragonTalk(false), 2500); }}><CutePet scale={0.7} /></group><ContactShadows resolution={512} scale={10} blur={2} opacity={0.4} far={10} color="#064e3b" /></group></Suspense></Canvas>
      </div>

      <div className="relative z-20 flex-1 flex flex-col items-center justify-start pt-20 pb-24 md:pt-16 md:pb-12 pointer-events-none">
        <motion.div initial={{ opacity: 0, y: -15 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-2 bg-white/80 backdrop-blur-md border border-white/70 px-4 py-1.5 rounded-full mb-3 shadow-sm pointer-events-auto"><span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /><span className="text-xs font-black text-slate-700 uppercase tracking-widest">{campaignComplete ? "แคมเปญสำเร็จ" : `ด่าน ${stage.id} · ${stage.zone}`}</span></motion.div>
        <motion.h1 initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-2xl md:text-4xl lg:text-5xl font-black text-slate-800 text-center mb-4 px-4 drop-shadow-sm pointer-events-auto">{campaignComplete ? "ยอดเยี่ยม! ปกป้อง Numeria สำเร็จ" : stage.title}</motion.h1>
        {!campaignComplete && <p className="max-w-xl px-6 text-center text-sm md:text-base font-bold text-slate-700/90 pointer-events-auto">{stage.story} · ทักษะวันนี้: {stage.skill}</p>}
        <div className="mt-3 flex gap-2 pointer-events-auto">{[outfit, companion, effect].filter(Boolean).map((item) => <span key={item!.id} title={item!.name} className="bg-white/80 backdrop-blur border border-white/70 px-3 py-1 rounded-full text-xs font-black text-slate-600 shadow-sm">{item!.icon} {item!.name}</span>)}</div>
        <div className="absolute top-[38%] left-[28%] w-64 h-64 flex justify-between pointer-events-none"><AnimatePresence>{showHeroTalk && <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }} className="absolute top-10 left-0 whitespace-nowrap bg-white text-slate-800 text-xs font-black px-3 py-1.5 rounded-full shadow-xl">ไปเลย! 💪</motion.div>}</AnimatePresence><AnimatePresence>{showDragonTalk && <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }} className="absolute top-0 right-[-80%] whitespace-nowrap bg-emerald-500 text-white text-xs font-black px-3 py-1.5 rounded-full shadow-xl">Rawr! ✨</motion.div>}</AnimatePresence></div>
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="mt-auto w-full max-w-md px-6 pointer-events-auto"><div className="mb-3 flex justify-center gap-3"><span className="bg-white/85 border border-white rounded-full px-3 py-1.5 text-xs font-black text-slate-600 shadow-sm"><Sparkles className="inline w-3.5 h-3.5 text-amber-500 mr-1" />ผ่านแล้ว {profile.completedStages.length}/{data!.levels.length} ด่าน</span><span className="bg-white/85 border border-white rounded-full px-3 py-1.5 text-xs font-black text-slate-600 shadow-sm">{profile.xp.toLocaleString()} XP</span></div><Link href={target} className="w-full flex items-center justify-center gap-3 h-14 rounded-[2rem] bg-gradient-to-b from-primary-light to-primary border border-primary-light text-lg font-black text-white shadow-[0_6px_0_0_#5b21b6] active:shadow-none active:translate-y-1 transition-all"><Play className="w-5 h-5 fill-white" />{campaignComplete ? "ดูแผนที่ Numeria" : "เล่นต่อ"}<ArrowRight className="w-5 h-5" /></Link></motion.div>
      </div>
    </div>
  );
}
