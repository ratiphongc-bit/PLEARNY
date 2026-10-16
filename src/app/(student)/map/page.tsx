"use client";

import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Star, Lock } from "lucide-react";

const MAP_NODES = [
  { id: "q_6", type: "boss",      title: "ต่อสู้กับมังกร",  status: "locked",    emoji: "👹", color: "bg-rose-100 text-rose-600",    border: "border-rose-300",    zone: "ปราสาท" },
  { id: "q_5", type: "challenge", title: "คิดเลขเร็ว",     status: "locked",    emoji: "⚡", color: "bg-violet-100 text-violet-600",  border: "border-violet-300",  zone: "ปราสาท" },
  { id: "q_4", type: "quest",     title: "ชิ้นส่วนสะพาน",   status: "locked",    emoji: "🪵", color: "bg-amber-100 text-amber-600",   border: "border-amber-300",   zone: "ภูเขา" },
  { id: "q_3", type: "lesson",    title: "การคูณ", status: "current",   emoji: "📖", color: "bg-blue-100 text-blue-600",    border: "border-blue-400",    zone: "ป่า", desc: "การคูณเพื่อสร้างสะพาน" },
  { id: "q_2", type: "quest",     title: "รวบรวมไม้",    status: "completed", emoji: "🌲", color: "bg-emerald-100 text-emerald-600", border: "border-emerald-300", zone: "ป่า", stars: 3 },
  { id: "q_1", type: "camp",      title: "จุดตั้งแคมป์",           status: "completed", emoji: "🏕️", color: "bg-slate-100 text-slate-600",   border: "border-slate-300",   zone: "หมู่บ้าน", stars: 3 },
];

const ZONE_META: Record<string, { color: string; bg: string; emoji: string; desc: string }> = {
  "หมู่บ้าน":  { color: "text-amber-700", bg: "bg-amber-50 border-amber-200",  emoji: "🏘️", desc: "หมู่บ้านเริ่มต้น" },
  "ป่า":   { color: "text-emerald-700", bg: "bg-emerald-50 border-emerald-200", emoji: "🌲", desc: "ป่าไม้มหัศจรรย์" },
  "ภูเขา": { color: "text-slate-700", bg: "bg-slate-100 border-slate-300",  emoji: "🏔️", desc: "ภูเขาสูงชัน" },
  "ปราสาท":   { color: "text-purple-700", bg: "bg-purple-50 border-purple-200", emoji: "🏰", desc: "ปราสาทมังกร" },
};

export default function AdventureMap() {
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [linePoints, setLinePoints] = useState<{ x: number; y: number }[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // We need a stable ref array for the nodes
  const nodeRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const updatePath = () => {
      if (!containerRef.current) return;
      const containerRect = containerRef.current.getBoundingClientRect();

      const points = nodeRefs.current
        .filter((ref) => ref !== null)
        .map((ref) => {
          const rect = ref!.getBoundingClientRect();
          return {
            x: rect.left - containerRect.left + rect.width / 2,
            y: rect.top - containerRect.top + rect.height / 2,
          };
        });
      setLinePoints(points);
    };

    // Delay calculation slightly to ensure layout is done
    const timer = setTimeout(updatePath, 50);
    window.addEventListener("resize", updatePath);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", updatePath);
    };
  }, []);

  const createCurvedPath = (points: { x: number; y: number }[]) => {
    if (points.length < 2) return "";
    let d = `M ${points[0].x} ${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
      const curr = points[i];
      const next = points[i + 1];
      // Cubic Bezier to make an S-curve or smooth vertical curve
      const cp1x = curr.x;
      const cp1y = curr.y + (next.y - curr.y) / 2;
      const cp2x = next.x;
      const cp2y = curr.y + (next.y - curr.y) / 2;
      d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${next.x} ${next.y}`;
    }
    return d;
  };

  return (
    <div className="w-full h-full flex relative overflow-hidden bg-white">
      {/* Decorative Background */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 opacity-[0.04] bg-[linear-gradient(to_right,#808080_1.5px,transparent_1.5px),linear-gradient(to_bottom,#808080_1.5px,transparent_1.5px)] bg-[size:60px_60px]" />
        <div className="absolute top-0 left-0 right-0 h-64 bg-gradient-to-b from-sky-50 to-transparent" />
      </div>

      {/* ═══ MAP COLUMN ═══ */}
      <div className="relative z-10 flex-1 flex flex-col min-w-0 overflow-hidden">
        <div 
          className="lg:hidden pt-4 pb-4 px-6 text-center z-20 bg-white/90 backdrop-blur-md border-b border-slate-200"
          style={{ marginTop: '76px' }}
        >
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">แผนที่ผจญภัย</p>
          <h1 className="text-xl font-black text-slate-800 mt-0.5">ดินแดนเวทมนตร์</h1>
        </div>

        <div className="flex-1 overflow-y-auto overflow-x-hidden pb-32 pt-8 scrollbar-none relative">
          <div ref={containerRef} className="max-w-md mx-auto relative flex flex-col items-center">
            
            {/* The SVG Curved Path Line */}
            {linePoints.length > 0 && (
              <svg className="absolute top-0 left-0 w-full h-full pointer-events-none z-0" style={{ minHeight: '100%' }}>
                <path
                  d={createCurvedPath(linePoints)}
                  fill="none"
                  stroke="#f1f5f9"
                  strokeWidth="20"
                  strokeLinecap="round"
                />
                {/* Inner active path (optional, currently just static) */}
                <path
                  d={createCurvedPath(linePoints)}
                  fill="none"
                  stroke="#e2e8f0"
                  strokeWidth="12"
                  strokeLinecap="round"
                />
              </svg>
            )}

            {MAP_NODES.map((node, i) => {
              const isCompleted = node.status === "completed";
              const isCurrent = node.status === "current";
              const isLocked = node.status === "locked";
              const isSelected = selectedNode === node.id;
              const showZone = i === 0 || MAP_NODES[i - 1].zone !== node.zone;

              const offset = Math.sin((i / (MAP_NODES.length - 1)) * Math.PI * 3) * 80;
              const alignment = offset > 20 ? "right" : offset < -20 ? "left" : "center";

              return (
                <div key={node.id} className="w-full flex flex-col items-center relative z-10 mt-6">
                  {showZone && (
                    <div className={cn("mb-6 px-5 py-2 rounded-2xl flex items-center gap-2 border shadow-sm", ZONE_META[node.zone].bg)}>
                      <span className="text-xl">{ZONE_META[node.zone].emoji}</span>
                      <span className={cn("text-sm font-black uppercase tracking-widest", ZONE_META[node.zone].color)}>{node.zone}</span>
                    </div>
                  )}

                  <div
                    ref={(el) => {
                      if (el) nodeRefs.current[i] = el;
                    }}
                    className="relative"
                    style={{ transform: `translateX(${offset}px)` }}
                  >
                    {isCurrent && (
                      <motion.div
                        animate={{ scale: [1, 1.4, 1], opacity: [0.3, 0, 0.3] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="absolute inset-0 bg-blue-400 rounded-full -z-10"
                      />
                    )}

                    <motion.button
                      onClick={() => !isLocked && setSelectedNode(isSelected ? null : node.id)}
                      whileTap={!isLocked ? { scale: 0.9 } : {}}
                      whileHover={!isLocked ? { y: -2 } : {}}
                      className={cn(
                        "relative w-20 h-20 rounded-full flex items-center justify-center text-4xl border-b-[6px] transition-all z-20 shadow-md",
                        isLocked
                          ? "bg-slate-200 border-slate-300 text-slate-400 grayscale"
                          : isCurrent
                          ? "bg-white border-blue-400 ring-4 ring-blue-100 ring-offset-2"
                          : cn("bg-white", isCompleted ? "border-emerald-400" : "border-slate-300")
                      )}
                    >
                      <div className={cn("absolute inset-1 rounded-full flex items-center justify-center", isLocked ? "bg-slate-100" : node.color.split(" ")[0])}>
                        {isLocked ? <Lock className="w-8 h-8 text-slate-300" /> : node.emoji}
                      </div>

                      {isCompleted && node.stars && (
                        <div className="absolute -bottom-3 bg-white border-2 border-emerald-400 px-2 py-0.5 rounded-full flex gap-0.5 shadow-sm">
                          {[...Array(node.stars)].map((_, s) => (
                            <Star key={s} className="w-3 h-3 fill-gold text-yellow-500" />
                          ))}
                        </div>
                      )}
                    </motion.button>

                    <div className={cn(
                      "absolute top-1/2 -translate-y-1/2 whitespace-nowrap z-0 transition-all duration-300 pointer-events-none",
                      alignment === "right" ? "left-full ml-4" : alignment === "left" ? "right-full mr-4" : "top-full mt-4 left-1/2 -translate-x-1/2 -translate-y-0"
                    )}>
                      <div className="bg-white border border-slate-200 px-3 py-1.5 rounded-xl shadow-sm">
                        <div className={cn("text-xs font-black", isLocked ? "text-slate-400" : "text-slate-700")}>{node.title}</div>
                      </div>
                    </div>

                    <AnimatePresence>
                      {isSelected && (
                        <motion.div
                          initial={{ opacity: 0, y: 10, scale: 0.9 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 10, scale: 0.9 }}
                          className="absolute z-50 w-64 bg-white rounded-3xl border-2 border-slate-200 shadow-xl overflow-hidden"
                          style={{ top: "110%", left: "50%", marginLeft: "-8rem" }}
                        >
                          <div className={cn("h-3 w-full", node.color.split(" ")[0])} />
                          <div className="p-4 flex flex-col items-center text-center">
                            <h3 className="font-black text-slate-800 text-lg">{node.title}</h3>
                            <p className="text-slate-500 text-sm font-medium mt-1 mb-4">{node.desc || "ทบทวนบทเรียน"}</p>
                            <Link href={`/lesson/${node.id}`} className="w-full">
                              <button className="w-full bg-gradient-to-b from-primary-light to-primary text-white font-black py-3 rounded-xl shadow-[0_4px_0_0_#4c1d95] active:shadow-none active:translate-y-1 transition-all">
                                {isCurrent ? "เริ่มเลย" : "เล่นซ้ำ"}
                              </button>
                            </Link>
                          </div>
                          <div className="absolute -top-2 left-1/2 -ml-2 w-4 h-4 bg-white border-l-2 border-t-2 border-slate-200 rotate-45" />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              );
            })}

            <div className="mt-8 text-center text-slate-400 font-bold uppercase tracking-widest text-xs flex flex-col items-center gap-2">
              <div className="w-16 h-4 bg-slate-200 rounded-full blur-[2px]" />
              เริ่มต้นที่นี่
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
