"use client";

import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { Star, Lock, Check } from "lucide-react";
import { usePlayer } from "@/components/player/PlayerProvider";

const ZONE_META: Record<string, { color: string; bg: string; emoji: string }> = {
  "หมู่บ้าน": { color: "text-amber-700", bg: "bg-amber-50 border-amber-200", emoji: "🏘️" },
  "ป่า": { color: "text-emerald-700", bg: "bg-emerald-50 border-emerald-200", emoji: "🌲" },
  "ภูเขา": { color: "text-slate-700", bg: "bg-slate-100 border-slate-300", emoji: "🏔️" },
  "เมืองเมฆ": { color: "text-sky-700", bg: "bg-sky-50 border-sky-200", emoji: "☁️" },
  "ถ้ำคริสตัล": { color: "text-violet-700", bg: "bg-violet-50 border-violet-200", emoji: "💎" },
  "หอคอย": { color: "text-indigo-700", bg: "bg-indigo-50 border-indigo-200", emoji: "🗼" },
  "ปราสาท": { color: "text-purple-700", bg: "bg-purple-50 border-purple-200", emoji: "🏰" },
};

export default function AdventureMap() {
  const { data } = usePlayer();
  const [selectedNode, setSelectedNode] = useState<number | null>(null);
  const [linePoints, setLinePoints] = useState<{ x: number; y: number }[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const nodeRefs = useRef<(HTMLDivElement | null)[]>([]);
  const profile = data!.profile;
  const nodes = [...data!.levels].reverse();
  const completed = new Set(profile.completedStages);

  useEffect(() => {
    const updatePath = () => {
      if (!containerRef.current) return;
      const containerRect = containerRef.current.getBoundingClientRect();
      const points = nodeRefs.current.filter((ref): ref is HTMLDivElement => ref !== null).map((ref) => {
        const rect = ref.getBoundingClientRect();
        return { x: rect.left - containerRect.left + rect.width / 2, y: rect.top - containerRect.top + rect.height / 2 };
      });
      setLinePoints(points);
    };
    const timer = window.setTimeout(updatePath, 120);
    window.addEventListener("resize", updatePath);
    return () => { window.clearTimeout(timer); window.removeEventListener("resize", updatePath); };
  }, [nodes.length]);

  function createCurvedPath(points: { x: number; y: number }[]) {
    if (points.length < 2) return "";
    let path = `M ${points[0].x} ${points[0].y}`;
    for (let index = 0; index < points.length - 1; index += 1) {
      const current = points[index];
      const next = points[index + 1];
      const middleY = current.y + (next.y - current.y) / 2;
      path += ` C ${current.x} ${middleY}, ${next.x} ${middleY}, ${next.x} ${next.y}`;
    }
    return path;
  }

  return (
    <div className="w-full h-full flex relative overflow-hidden bg-white">
      <div className="absolute inset-0 z-0 pointer-events-none"><div className="absolute inset-0 opacity-[0.04] bg-[linear-gradient(to_right,#808080_1.5px,transparent_1.5px),linear-gradient(to_bottom,#808080_1.5px,transparent_1.5px)] bg-[size:60px_60px]" /><div className="absolute top-0 left-0 right-0 h-64 bg-gradient-to-b from-sky-50 to-transparent" /></div>
      <div className="relative z-10 flex-1 flex flex-col min-w-0 overflow-hidden">
        <div className="lg:hidden pt-4 pb-4 px-6 text-center z-20 bg-white/90 backdrop-blur-md border-b border-slate-200" style={{ marginTop: "76px" }}><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">แผนที่ผจญภัย · 12 ด่าน</p><h1 className="text-xl font-black text-slate-800 mt-0.5">ดินแดน Numeria</h1></div>
        <div className="flex-1 overflow-y-auto overflow-x-hidden pb-32 pt-8 scrollbar-none relative">
          <div ref={containerRef} className="max-w-md mx-auto relative flex flex-col items-center px-2">
            {linePoints.length > 1 && <svg className="absolute top-0 left-0 w-full h-full pointer-events-none z-0" style={{ minHeight: "100%" }}><path d={createCurvedPath(linePoints)} fill="none" stroke="#f1f5f9" strokeWidth="20" strokeLinecap="round" /><path d={createCurvedPath(linePoints)} fill="none" stroke="#e2e8f0" strokeWidth="12" strokeLinecap="round" /></svg>}
            {nodes.map((node, index) => {
              const isCompleted = completed.has(node.id);
              const isUnlocked = node.id <= profile.unlockedStage;
              const isCurrent = isUnlocked && !isCompleted;
              const isLocked = !isUnlocked;
              const selected = selectedNode === node.id;
              const showZone = index === 0 || nodes[index - 1].zone !== node.zone;
              const offset = Math.sin((index / Math.max(nodes.length - 1, 1)) * Math.PI * 3) * 72;
              const alignment = offset > 20 ? "right" : offset < -20 ? "left" : "center";
              return <div key={node.id} className="w-full flex flex-col items-center relative z-10 mt-7">
                {showZone && <div className={cn("mb-5 px-5 py-2 rounded-2xl flex items-center gap-2 border shadow-sm", (ZONE_META[node.zone] || ZONE_META["หมู่บ้าน"]).bg)}><span className="text-xl">{(ZONE_META[node.zone] || ZONE_META["หมู่บ้าน"]).emoji}</span><span className={cn("text-sm font-black uppercase tracking-widest", (ZONE_META[node.zone] || ZONE_META["หมู่บ้าน"]).color)}>{node.zone}</span></div>}
                <div ref={(element) => { nodeRefs.current[index] = element; }} className="relative" style={{ transform: `translateX(${offset}px)` }}>
                  {isCurrent && <motion.div animate={{ scale: [1, 1.4, 1], opacity: [0.3, 0, 0.3] }} transition={{ duration: 2, repeat: Infinity }} className="absolute inset-0 bg-blue-400 rounded-full -z-10" />}
                  <motion.button onClick={() => !isLocked && setSelectedNode(selected ? null : node.id)} whileTap={!isLocked ? { scale: 0.9 } : {}} whileHover={!isLocked ? { y: -2 } : {}} aria-label={`${node.title}, ${isLocked ? "ล็อก" : isCompleted ? "ผ่านแล้ว" : "เปิดแล้ว"}`} className={cn("relative w-20 h-20 rounded-full flex items-center justify-center text-4xl border-b-[6px] transition-all z-20 shadow-md", isLocked ? "bg-slate-200 border-slate-300 text-slate-400 grayscale" : isCurrent ? "bg-white border-blue-400 ring-4 ring-blue-100 ring-offset-2" : "bg-white border-emerald-400")}>
                    <div className={cn("absolute inset-1 rounded-full flex items-center justify-center", isLocked ? "bg-slate-100" : isCompleted ? "bg-emerald-50" : "bg-blue-50")}>{isLocked ? <Lock className="w-8 h-8 text-slate-300" /> : isCompleted ? <span className="relative">{node.emoji}<Check className="absolute -right-3 -bottom-2 w-4 h-4 text-emerald-600 bg-white rounded-full" /></span> : node.emoji}</div>
                    {isCompleted && <div className="absolute -bottom-3 bg-white border-2 border-emerald-400 px-2 py-0.5 rounded-full flex gap-0.5 shadow-sm"><Star className="w-3 h-3 fill-yellow-400 text-yellow-500" /><Star className="w-3 h-3 fill-yellow-400 text-yellow-500" /><Star className="w-3 h-3 fill-yellow-400 text-yellow-500" /></div>}
                  </motion.button>
                  <div className={cn("absolute top-1/2 -translate-y-1/2 whitespace-nowrap z-0 transition-all duration-300 pointer-events-none", alignment === "right" ? "left-full ml-4" : alignment === "left" ? "right-full mr-4" : "top-full mt-4 left-1/2 -translate-x-1/2 -translate-y-0")}><div className="bg-white border border-slate-200 px-3 py-1.5 rounded-xl shadow-sm"><div className={cn("text-xs font-black", isLocked ? "text-slate-400" : "text-slate-700")}>ด่าน {node.id}: {node.title}</div></div></div>
                  <AnimatePresence>{selected && <motion.div initial={{ opacity: 0, y: 10, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10, scale: 0.9 }} className="absolute z-50 w-64 bg-white rounded-3xl border-2 border-slate-200 shadow-xl overflow-hidden" style={{ top: "110%", left: "50%", marginLeft: "-8rem" }}><div className="h-3 w-full bg-primary/20" /><div className="p-4 flex flex-col items-center text-center"><div className="text-xs font-black text-slate-400 uppercase tracking-wider">{node.zone} · {node.skill}</div><h3 className="font-black text-slate-800 text-lg mt-1">{node.title}</h3><p className="text-slate-500 text-sm font-medium mt-1 mb-4">{node.story}</p><Link href={`/lesson/${node.id}`} className="w-full"><span className="block w-full bg-gradient-to-b from-primary-light to-primary text-white font-black py-3 rounded-xl shadow-[0_4px_0_0_#4c1d95]">{isCurrent ? "เริ่มด่าน" : "เล่นด่านนี้อีกครั้ง"}</span></Link></div></motion.div>}</AnimatePresence>
                </div>
              </div>;
            })}
            <div className="mt-8 text-center text-slate-400 font-bold uppercase tracking-widest text-xs flex flex-col items-center gap-2"><div className="w-16 h-4 bg-slate-200 rounded-full blur-[2px]" />จุดเริ่มต้น · ด่าน 1</div>
          </div>
        </div>
      </div>
    </div>
  );
}
