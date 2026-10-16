"use client";

import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Play } from "lucide-react";
import { useState, Suspense } from "react";
import { CURRENT_QUEST } from "@/mock/data";

// 3D Imports
import { Canvas } from "@react-three/fiber";
import { ContactShadows } from "@react-three/drei";
import { CuteCharacter } from "@/components/3d/CuteCharacter";
import { CutePet } from "@/components/3d/CutePet";

// Static cloud positions
const CLOUDS = [
  { x:"10%", y:"15%", w:120, o:0.8, d:40, delay:0 },
  { x:"40%", y:"8%",  w:180, o:0.6, d:55, delay:5 },
  { x:"70%", y:"20%", w:140, o:0.7, d:45, delay:2 },
  { x:"85%", y:"10%", w:100, o:0.5, d:35, delay:8 },
  { x:"25%", y:"25%", w:160, o:0.9, d:50, delay:12 },
];

export default function StudentHome() {
  const [showDragonTalk, setShowDragonTalk] = useState(false);
  const [showHeroTalk,   setShowHeroTalk]   = useState(false);

  return (
    <div className="w-full h-full flex flex-col md:flex-row relative overflow-hidden bg-sky-100">

      {/* ═══ BACKGROUND (Daytime) ═══ */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        {/* Sky gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-sky-300 via-sky-200 to-sky-100" />
        
        {/* Sun */}
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 100, repeat: Infinity, ease: "linear" }}
          className="absolute top-[10%] right-[15%] w-32 h-32 bg-yellow-100 rounded-full blur-[10px]"
        />
        <div className="absolute top-[12%] right-[17%] w-24 h-24 bg-yellow-300 rounded-full shadow-[0_0_80px_rgba(253,224,71,0.8)]" />

        {/* Clouds */}
        {CLOUDS.map((cloud, i) => (
          <motion.div
            key={i}
            className="absolute bg-white rounded-full blur-[2px]"
            style={{ width: cloud.w, height: cloud.w * 0.4, left: cloud.x, top: cloud.y, opacity: cloud.o }}
            animate={{ x: [0, 50, 0] }}
            transition={{ duration: cloud.d, repeat: Infinity, delay: cloud.delay, ease: "easeInOut" }}
          >
            {/* Cloud bumps */}
            <div className="absolute -top-[40%] left-[20%] w-[40%] h-[120%] bg-white rounded-full" />
            <div className="absolute -top-[20%] left-[50%] w-[30%] h-[100%] bg-white rounded-full" />
          </motion.div>
        ))}

        {/* Distant Mountains */}
        <div className="absolute bottom-[20%] left-0 right-0 h-[30%] opacity-40">
          <div className="absolute bottom-0 left-[-10%] w-[40%] h-[80%] bg-sky-500 rounded-[100%] blur-[2px]" />
          <div className="absolute bottom-0 left-[20%] w-[50%] h-[100%] bg-sky-400 rounded-[100%] blur-[2px]" />
          <div className="absolute bottom-0 right-[-10%] w-[45%] h-[90%] bg-sky-500 rounded-[100%] blur-[2px]" />
        </div>

        {/* Ground layers (Bright Green) */}
        <div className="absolute bottom-[10%] left-[-20%] right-[-20%] h-[25%] bg-gradient-to-t from-emerald-500 to-emerald-400 rounded-[100%_100%_0_0]" />
        <div className="absolute bottom-0 left-0 right-0 h-[15%] bg-gradient-to-t from-emerald-600 to-emerald-500" />
      </div>

      {/* ═══ 3D CANVAS LAYER ═══ */}
      <div className="absolute inset-0 z-10 pointer-events-none">
        <Canvas camera={{ position: [0, 1, 8], fov: 35 }}>
          <ambientLight intensity={0.8} />
          <directionalLight position={[5, 10, 5]} intensity={1.5} castShadow />
          <directionalLight position={[-5, 5, -5]} intensity={0.5} />
          <hemisphereLight intensity={0.6} groundColor="#064e3b" />
          
          <Suspense fallback={null}>

            {/* Interactive Characters Group */}
            <group position={[0, -0.8, 0]}>
              
              {/* Hero */}
              <group position={[-0.5, 0, 0]} rotation={[0, 0.4, 0]} onClick={() => { setShowHeroTalk(true); setTimeout(() => setShowHeroTalk(false), 2500); }}>
                <CuteCharacter scale={1.3} />
              </group>

              {/* Pet Dragon */}
              <group position={[0.7, 0, -0.2]} rotation={[0, -0.6, 0]} onClick={() => { setShowDragonTalk(true); setTimeout(() => setShowDragonTalk(false), 2500); }}>
                <CutePet scale={0.7} />
              </group>

              {/* Soft shadow on the ground */}
              <ContactShadows resolution={512} scale={10} blur={2} opacity={0.4} far={10} color="#064e3b" />
            </group>
          </Suspense>
        </Canvas>
      </div>

      {/* ═══ LEFT / CENTER: Character Stage Overlay (UI ONLY) ═══ */}
      <div className="relative z-20 flex-1 flex flex-col items-center justify-start pt-16 pb-8 md:pt-16 md:pb-0 pointer-events-none">
        
        {/* Quest label */}
        <motion.div
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex items-center gap-2 bg-white/70 backdrop-blur-md border border-white/50 px-4 py-1.5 rounded-full mb-3 shadow-sm pointer-events-auto"
        >
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_#10b981]" />
          <span className="text-xs font-black text-slate-700 uppercase tracking-widest">เควสต์ปัจจุบัน</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-2xl md:text-4xl lg:text-5xl font-black text-slate-800 text-center mb-8 md:mb-12 px-4 drop-shadow-sm pointer-events-auto"
        >
          {CURRENT_QUEST.title}
        </motion.h1>

        {/* Invisible Hitboxes for chat bubbles (since 3D objects are on canvas) */}
        <div className="absolute top-[40%] left-[30%] w-64 h-64 flex justify-between">
            <AnimatePresence>
              {showHeroTalk && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8, y: 5 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.8, y: 5 }}
                  className="absolute top-10 left-0 whitespace-nowrap bg-white text-slate-800 text-xs font-black px-3 py-1.5 rounded-full shadow-xl"
                >
                  ไปเลย! 💪
                  <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-white rotate-45" />
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence>
              {showDragonTalk && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="absolute top-0 right-[-80%] whitespace-nowrap bg-emerald-500 text-white text-xs font-black px-3 py-1.5 rounded-full shadow-xl"
                >
                  Rawr! ✨
                  <div className="absolute -bottom-1 left-3 w-2 h-2 bg-emerald-500 rotate-45" />
                </motion.div>
              )}
            </AnimatePresence>
        </div>

        {/* Mobile-only CTA */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="md:hidden w-full max-w-sm px-6 mt-auto mb-20 pointer-events-auto"
        >
          <Link href={`/lesson/${CURRENT_QUEST.id}`}>
            <button className="w-full flex items-center justify-center gap-3 h-14 rounded-[2rem] bg-gradient-to-b from-primary-light to-primary border border-primary-light text-lg font-black text-white shadow-[0_6px_0_0_#5b21b6] active:shadow-none active:translate-y-1 transition-all">
              <Play className="w-5 h-5 fill-white" /> เล่นต่อ
            </button>
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
