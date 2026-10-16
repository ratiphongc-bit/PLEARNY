"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Sparkles, Crown } from "lucide-react";

const TABS = [
  { key: "Pets", label: "สัตว์เลี้ยง", icon: "🐉" },
  { key: "Outfits", label: "ชุด", icon: "👗" },
  { key: "Accessories", label: "อุปกรณ์", icon: "🎒" },
  { key: "Effects", label: "เอฟเฟค", icon: "✨" },
];

const INVENTORY = [
  { id: 1, name: "Baby Dragon", type: "Pets", rarity: "epic", equipped: true, icon: "🐉" },
  { id: 2, name: "Wizard Hat", type: "Accessories", rarity: "rare", equipped: false, icon: "🧙‍♂️" },
  { id: 3, name: "Explorer Backpack", type: "Accessories", rarity: "common", equipped: true, icon: "🎒" },
  { id: 4, name: "Royal Cape", type: "Outfits", rarity: "legendary", equipped: false, icon: "👑" },
  { id: 5, name: "Magic Boots", type: "Outfits", rarity: "rare", equipped: true, icon: "👢" },
  { id: 6, name: "Sparkle Trail", type: "Effects", rarity: "epic", equipped: true, icon: "✨" },
];

const RARITY_GLOW: Record<string, string> = {
  legendary: "shadow-[0_8px_30px_rgba(251,191,36,0.25)] border-amber-300 bg-gradient-to-b from-amber-50 to-white",
  epic: "shadow-[0_8px_30px_rgba(168,85,247,0.2)] border-purple-300 bg-gradient-to-b from-purple-50 to-white",
  rare: "shadow-[0_8px_30px_rgba(96,165,250,0.2)] border-blue-300 bg-gradient-to-b from-blue-50 to-white",
  common: "border-slate-200 bg-white shadow-md",
};

export default function InventoryPage() {
  const [activeTab, setActiveTab] = useState("Pets");

  const items = INVENTORY.filter((item) => item.type === activeTab);

  return (
    <div className="w-full h-full relative overflow-hidden bg-slate-50 flex flex-col">

      {/* ═══ Background Effects ═══ */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-sky-100 via-slate-50 to-slate-50" />
        <div className="absolute top-[10%] left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-white blur-[120px] rounded-full opacity-60" />
      </div>

      {/* ═══ Main Content ═══ */}
      <div className="relative z-10 flex flex-col h-full overflow-y-auto pb-32 pt-16 md:pt-24 px-6">
        <div className="max-w-6xl mx-auto w-full">
          
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-4xl md:text-5xl font-black text-slate-800 tracking-tight">กระเป๋า</h1>
            <p className="text-slate-500 font-bold mt-2 text-sm md:text-base">จัดการไอเทมและสัตว์เลี้ยงของคุณ</p>
          </motion.div>

          {/* Tabs */}
          <div className="flex gap-3 overflow-x-auto pb-4 mb-8 scrollbar-none">
            {TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={cn(
                  "flex items-center gap-2.5 px-6 py-3.5 rounded-[1.5rem] font-black text-sm md:text-base whitespace-nowrap transition-all duration-300 flex-shrink-0",
                  activeTab === tab.key
                    ? "bg-primary text-white shadow-[0_6px_0_0_#4c1d95,0_10px_20px_rgba(124,58,237,0.3)] -translate-y-1"
                    : "bg-white text-slate-500 border-2 border-slate-200 hover:bg-slate-100 hover:text-slate-800 hover:-translate-y-0.5 shadow-sm"
                )}
              >
                <span className="text-xl">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>

          {/* Grid Layout (Responsive) */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5 md:gap-6"
            >
              {items.map((item, i) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.05, type: "spring", stiffness: 200, damping: 20 }}
                  className={cn(
                    "rounded-[2rem] p-4 md:p-5 border-2 relative overflow-hidden flex flex-col group hover:-translate-y-2 transition-transform duration-300",
                    RARITY_GLOW[item.rarity]
                  )}
                >
                  {/* Visual effects based on rarity */}
                  {item.rarity === "legendary" && (
                    <>
                      <div className="absolute inset-0 bg-gradient-to-br from-yellow-200/50 via-transparent to-orange-200/50 animate-pulse" />
                      <Crown className="absolute top-4 right-4 w-5 h-5 text-amber-500 animate-bounce" />
                    </>
                  )}
                  {item.rarity === "epic" && (
                    <>
                      <div className="absolute inset-0 bg-gradient-to-br from-purple-200/50 via-transparent to-pink-200/50" />
                      <Sparkles className="absolute top-4 right-4 w-5 h-5 text-purple-400 animate-pulse" />
                    </>
                  )}

                  {/* Item Icon / Model Placeholder */}
                  <div className="relative z-10 flex flex-col items-center gap-4 flex-1">
                    <div className={cn(
                      "w-24 h-24 md:w-32 md:h-32 rounded-3xl flex items-center justify-center text-5xl md:text-7xl shadow-inner relative",
                      item.rarity === "legendary" ? "bg-gradient-to-b from-amber-100 to-amber-200/50 border border-amber-300" :
                      item.rarity === "epic" ? "bg-gradient-to-b from-purple-100 to-purple-200/50 border border-purple-300" :
                      item.rarity === "rare" ? "bg-gradient-to-b from-blue-100 to-blue-200/50 border border-blue-300" : 
                      "bg-slate-100 border border-slate-200"
                    )}>
                      <span className="drop-shadow-lg group-hover:scale-110 transition-transform duration-300">{item.icon}</span>
                      
                      {/* Pedestal shadow */}
                      <div className="absolute bottom-2 w-16 md:w-20 h-3 bg-black/10 blur-[4px] rounded-full -z-10" />
                    </div>

                    {/* Info */}
                    <div className="text-center w-full">
                      <div className="text-sm md:text-base font-black text-slate-800 line-clamp-1">{item.name}</div>
                      <div className={cn(
                        "text-[10px] md:text-xs uppercase tracking-widest font-black mt-1",
                        item.rarity === "legendary" ? "text-amber-600 bg-amber-100 px-2 py-0.5 rounded-full inline-block" :
                        item.rarity === "epic" ? "text-purple-600 bg-purple-100 px-2 py-0.5 rounded-full inline-block" :
                        item.rarity === "rare" ? "text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full inline-block" : 
                        "text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full inline-block"
                      )}>
                        {item.rarity}
                      </div>
                    </div>
                  </div>

                  {/* Action Button */}
                  <div className="mt-5 relative z-10">
                    {item.equipped ? (
                      <div className="w-full flex items-center justify-center gap-1.5 text-sm md:text-base font-black bg-emerald-100 text-emerald-600 border-2 border-emerald-200 py-2.5 rounded-[1.2rem] shadow-sm">
                        <span className="text-lg leading-none">✓</span> สวมใส่อยู่
                      </div>
                    ) : (
                      <button className="w-full text-center text-sm md:text-base font-black bg-white hover:bg-slate-800 text-slate-700 hover:text-white border-2 border-slate-200 hover:border-slate-800 py-2.5 rounded-[1.2rem] transition-all shadow-[0_4px_0_0_#e2e8f0] hover:shadow-[0_4px_0_0_#1e293b] active:shadow-none active:translate-y-1">
                        สวมใส่
                      </button>
                    )}
                  </div>
                </motion.div>
              ))}

              {/* Empty State */}
              {items.length === 0 && (
                <div className="col-span-full flex flex-col items-center justify-center py-20 bg-white/50 backdrop-blur-sm rounded-[2rem] border-2 border-dashed border-slate-300">
                  <div className="text-6xl mb-4 opacity-50 grayscale">📦</div>
                  <div className="text-xl font-black text-slate-600">ยังไม่มีไอเทมหมวดนี้</div>
                  <div className="text-sm font-bold text-slate-400 mt-2">เล่นมินิเกมและทำเควสต์เพื่อปลดล็อก!</div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

        </div>
      </div>
    </div>
  );
}
