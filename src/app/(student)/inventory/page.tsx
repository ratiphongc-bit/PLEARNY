"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Check, Lock, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { usePlayer } from "@/components/player/PlayerProvider";

const TABS = [
  { key: "pet", label: "สัตว์เลี้ยง", icon: "🐉" },
  { key: "outfit", label: "ชุด", icon: "👗" },
  { key: "accessory", label: "อุปกรณ์", icon: "🎒" },
  { key: "effect", label: "เอฟเฟกต์", icon: "✨" },
] as const;

const RARITY_GLOW: Record<string, string> = {
  legendary: "shadow-[0_8px_30px_rgba(251,191,36,0.25)] border-amber-300 bg-gradient-to-b from-amber-50 to-white",
  epic: "shadow-[0_8px_30px_rgba(168,85,247,0.2)] border-purple-300 bg-gradient-to-b from-purple-50 to-white",
  rare: "shadow-[0_8px_30px_rgba(96,165,250,0.2)] border-blue-300 bg-gradient-to-b from-blue-50 to-white",
  common: "border-slate-200 bg-white shadow-md",
};

export default function InventoryPage() {
  const { data, equipItem } = usePlayer();
  const [activeTab, setActiveTab] = useState<(typeof TABS)[number]["key"]>("pet");
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const profile = data!.profile;
  const items = useMemo(() => data!.items.filter((item) => item.slot === activeTab), [data, activeTab]);
  const unlocked = new Set(profile.unlockedItems);

  async function toggle(itemId: string, slot: string, isEquipped: boolean) {
    setPendingId(itemId);
    setMessage(null);
    try {
      await equipItem(isEquipped ? null : itemId, slot);
      setMessage(isEquipped ? "ถอดอุปกรณ์เรียบร้อย" : "สวมใส่ไอเทมเรียบร้อย!");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "เปลี่ยนไอเทมไม่สำเร็จ");
    } finally {
      setPendingId(null);
    }
  }

  return (
    <div className="w-full h-full relative overflow-hidden bg-slate-50 flex flex-col">
      <div className="absolute inset-0 z-0 pointer-events-none"><div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-sky-100 via-slate-50 to-slate-50" /><div className="absolute top-[10%] left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-white blur-[120px] rounded-full opacity-60" /></div>
      <div className="relative z-10 flex flex-col h-full overflow-y-auto pb-32 pt-16 md:pt-24 px-6">
        <div className="max-w-6xl mx-auto w-full">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-7">
            <h1 className="text-4xl md:text-5xl font-black text-slate-800 tracking-tight">คลังอุปกรณ์</h1>
            <p className="text-slate-500 font-bold mt-2 text-sm md:text-base">ไอเทมที่ปลดล็อกแล้วสวมใส่ได้ทันที; ของใหม่รับได้จากการผ่านด่าน</p>
          </motion.div>
          <div className="flex gap-3 overflow-x-auto pb-4 mb-4 scrollbar-none">
            {TABS.map((tab) => <button key={tab.key} onClick={() => setActiveTab(tab.key)} className={cn("flex items-center gap-2.5 px-5 py-3 rounded-[1.5rem] font-black text-sm whitespace-nowrap transition-all flex-shrink-0", activeTab === tab.key ? "bg-primary text-white shadow-[0_6px_0_0_#4c1d95] -translate-y-1" : "bg-white text-slate-500 border-2 border-slate-200 hover:bg-slate-100 shadow-sm")}><span className="text-xl">{tab.icon}</span>{tab.label}</button>)}
          </div>
          {message && <div role="status" className="mb-5 rounded-2xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm font-bold text-sky-800">{message}</div>}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5 md:gap-6">
            {items.map((item, index) => {
              const isUnlocked = unlocked.has(item.id);
              const isEquipped = profile.equippedItems[item.slot] === item.id;
              return <motion.article key={item.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.04 }} className={cn("rounded-[2rem] p-4 md:p-5 border-2 relative overflow-hidden flex flex-col group transition-transform duration-300", isUnlocked && "hover:-translate-y-1", RARITY_GLOW[item.rarity], !isUnlocked && "opacity-75 grayscale-[0.35]")}>
                {item.rarity === "legendary" && <Sparkles className="absolute top-4 right-4 w-5 h-5 text-amber-500" />}
                <div className="relative z-10 flex flex-col items-center gap-4 flex-1">
                  <div className={cn("w-24 h-24 md:w-32 md:h-32 rounded-3xl flex items-center justify-center text-5xl md:text-7xl shadow-inner relative", item.rarity === "legendary" ? "bg-gradient-to-b from-amber-100 to-amber-200/50 border border-amber-300" : item.rarity === "epic" ? "bg-gradient-to-b from-purple-100 to-purple-200/50 border border-purple-300" : item.rarity === "rare" ? "bg-gradient-to-b from-blue-100 to-blue-200/50 border border-blue-300" : "bg-slate-100 border border-slate-200")}>
                    {isUnlocked ? item.icon : <Lock className="w-9 h-9 text-slate-400" />}
                  </div>
                  <div className="text-center w-full"><div className="text-sm md:text-base font-black text-slate-800 line-clamp-1">{item.name}</div><div className="text-[10px] uppercase tracking-widest font-black mt-1 text-slate-500">{item.rarity}</div><div className="text-[11px] font-bold text-slate-400 mt-1">{item.category}</div></div>
                </div>
                <div className="mt-5 relative z-10">
                  {!isUnlocked ? <div className="w-full text-center text-xs font-black text-slate-500 bg-slate-100 border border-slate-200 py-2.5 rounded-xl">ปลดล็อกเมื่อผ่านด่าน {item.unlock_stage}</div> : <button disabled={pendingId === item.id} onClick={() => void toggle(item.id, item.slot, isEquipped)} className={cn("w-full text-center text-sm font-black border-2 py-2.5 rounded-[1.2rem] transition-all disabled:opacity-60", isEquipped ? "bg-emerald-100 text-emerald-700 border-emerald-200" : "bg-white hover:bg-slate-800 text-slate-700 hover:text-white border-slate-200 hover:border-slate-800")}>
                    {pendingId === item.id ? "กำลังบันทึก…" : isEquipped ? <span className="inline-flex items-center gap-1"><Check className="w-4 h-4" />สวมใส่อยู่ · ถอดออก</span> : "สวมใส่"}
                  </button>}
                </div>
              </motion.article>;
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
