"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Map, Backpack, User, LogOut, Coins } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { PlayerProvider, usePlayer } from "@/components/player/PlayerProvider";

const NAV_ITEMS = [
  { name: "หน้าหลัก", href: "/home", icon: Home },
  { name: "แผนที่", href: "/map", icon: Map },
  { name: "กระเป๋า", href: "/inventory", icon: Backpack },
  { name: "โปรไฟล์", href: "/profile", icon: User },
];
const IMMERSIVE = ["/play", "/result"];

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  return <PlayerProvider><StudentShell>{children}</StudentShell></PlayerProvider>;
}

function StudentShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { data, isLoading, error, refresh, logout } = usePlayer();
  const isImmersive = IMMERSIVE.some((path) => pathname.startsWith(path));
  const profile = data?.profile;
  const user = data?.user;
  const xpPct = profile ? Math.round((profile.xpInLevel / profile.xpForNextLevel) * 100) : 0;

  if (isLoading || !data || !profile || !user) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-sky-50 p-6">
        <div className="text-center">
          <div className="text-4xl mb-3">🐉</div>
          <p className="font-black text-slate-700">{error || "กำลังเตรียมโลกผจญภัยของคุณ…"}</p>
          {error && <button onClick={() => void refresh()} className="mt-4 rounded-xl bg-primary px-4 py-2 text-sm font-black text-white">ลองอีกครั้ง</button>}
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 overflow-hidden bg-slate-50 text-slate-900 font-sans flex">
      <AnimatePresence>
        {!isImmersive && (
          <motion.aside
            key="sidebar"
            initial={{ x: -80, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -80, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="hidden md:flex flex-col flex-shrink-0 w-20 lg:w-56 h-full bg-white/90 backdrop-blur-xl border-r border-slate-200/80 z-50 relative shadow-sm"
          >
            <div className="flex items-center gap-3 px-4 pt-6 pb-7">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-light to-primary flex items-center justify-center text-base font-black shadow-lg shadow-primary/20 flex-shrink-0 text-white">P</div>
              <span className="hidden lg:block text-slate-800 font-black text-lg tracking-widest">PLEARNY</span>
            </div>
            <div className="px-3 mb-5 hidden lg:block">
              <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-200 to-amber-400 flex items-center justify-center text-sm font-black text-amber-900 shadow-sm">{profile.playerLevel}</div>
                  <div className="min-w-0"><div className="text-xs font-black text-slate-800 truncate">{user.name}</div><div className="text-[9px] text-slate-500 font-bold">นักผจญภัย · Lv.{profile.playerLevel}</div></div>
                </div>
                <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden"><div className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full transition-all" style={{ width: `${xpPct}%` }} /></div>
                <div className="flex justify-between mt-1"><span className="text-[9px] text-slate-500 font-bold">{profile.xp.toLocaleString()} XP</span><span className="text-[9px] text-cyan-600 font-black">ด่าน {profile.unlockedStage}/12</span></div>
              </div>
            </div>
            <nav className="flex flex-col gap-1 px-2 flex-1">
              {NAV_ITEMS.map((item) => {
                const active = pathname.startsWith(item.href);
                return <Link key={item.href} href={item.href}><div className={cn("flex items-center gap-3 rounded-2xl px-3 py-3 transition-all duration-200 group", active ? "bg-primary text-white shadow-[0_8px_16px_rgba(124,58,237,0.2)]" : "text-slate-500 hover:bg-slate-100 hover:text-slate-800")}><item.icon className={cn("w-5 h-5 flex-shrink-0", active ? "text-white" : "group-hover:text-primary")} /><span className="hidden lg:block text-sm font-bold">{item.name}</span></div></Link>;
              })}
            </nav>
            <div className="p-3 pb-5">
              <div className="flex items-center gap-3 px-3 py-2 rounded-xl bg-amber-50 mb-2"><Coins className="w-4 h-4 text-amber-500" /><span className="text-slate-800 font-black text-sm">{profile.coins.toLocaleString()}</span><span className="hidden lg:block text-slate-500 text-xs font-bold ml-auto">เหรียญ</span></div>
              <button onClick={() => void logout()} className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-slate-500 hover:bg-rose-50 hover:text-rose-600 transition-colors"><LogOut className="w-4 h-4" /><span className="hidden lg:block text-xs font-bold">ออกจากระบบ</span></button>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      <main className="relative flex-1 h-full overflow-hidden min-w-0 bg-slate-50">
        {children}
        <AnimatePresence>
          {!isImmersive && <motion.header key="mobile-hud" initial={{ y: -60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -60, opacity: 0 }} className="absolute top-0 left-0 right-0 z-50 px-4 pt-3 pb-2 flex justify-between items-center pointer-events-none md:hidden">
            <div className="flex items-center gap-2 bg-white/90 backdrop-blur-xl border border-slate-200/80 rounded-full p-1.5 pr-4 shadow-sm pointer-events-auto"><div className="w-9 h-9 rounded-full bg-gradient-to-b from-amber-200 to-amber-400 flex items-center justify-center text-sm font-black text-amber-900">{profile.playerLevel}</div><div className="flex flex-col gap-0.5"><span className="text-[10px] font-black uppercase tracking-widest text-slate-700 leading-none">{user.name}</span><div className="w-20 h-1.5 bg-slate-200 rounded-full overflow-hidden"><div className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full" style={{ width: `${xpPct}%` }} /></div></div></div>
            <div className="flex gap-2 pointer-events-auto"><div className="flex items-center gap-1.5 bg-white/90 border border-amber-200 rounded-full px-3 py-2 shadow-sm"><Coins className="w-4 h-4 text-amber-500" /><span className="text-slate-800 font-black text-sm">{profile.coins}</span></div><button onClick={() => void logout()} aria-label="ออกจากระบบ" className="w-10 h-10 bg-white/90 border border-slate-200 rounded-full flex items-center justify-center text-slate-500"><LogOut className="w-4 h-4" /></button></div>
          </motion.header>}
        </AnimatePresence>
        <AnimatePresence>
          {!isImmersive && <motion.nav key="mobile-nav" initial={{ y: 80, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 80, opacity: 0 }} className="absolute bottom-0 left-0 right-0 z-50 flex justify-center pb-3 px-4 pointer-events-none md:hidden"><div className="flex items-center gap-1 bg-white/95 backdrop-blur-2xl border border-slate-200/80 rounded-full p-1.5 shadow-xl pointer-events-auto">{NAV_ITEMS.map((item) => { const active = pathname.startsWith(item.href); return <Link key={item.href} href={item.href}><div className={cn("flex flex-col items-center justify-center w-14 h-12 rounded-full transition-all", active ? "bg-primary" : "hover:bg-slate-100")}><item.icon className={cn("w-4 h-4", active ? "text-white" : "text-slate-400")} /><span className={cn("text-[8px] font-black mt-0.5", active ? "text-white" : "text-slate-500")}>{item.name}</span></div></Link>; })}</div></motion.nav>}
        </AnimatePresence>
      </main>
    </div>
  );
}
