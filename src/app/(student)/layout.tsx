"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Map, Backpack, User, LogOut, Coins } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { PlayerProvider, usePlayer } from "@/components/player/PlayerProvider";
import { HeartStreakHud } from "@/components/player/HeartStreakHud";

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
          <div className="mb-3 text-4xl">🐉</div>
          <p className="font-black text-slate-700">{error || "กำลังเตรียมโลกผจญภัยของคุณ…"}</p>
          {error && <button onClick={() => void refresh()} className="mt-4 rounded-xl bg-primary px-4 py-2 text-sm font-black text-white">ลองอีกครั้ง</button>}
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 flex overflow-hidden bg-slate-50 font-sans text-slate-900">
      <AnimatePresence>
        {!isImmersive && (
          <motion.aside
            key="sidebar"
            initial={{ x: -80, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -80, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="relative z-50 hidden h-full w-20 flex-shrink-0 flex-col border-r border-slate-200/80 bg-white/90 shadow-sm backdrop-blur-xl md:flex lg:w-56"
          >
            <div className="flex items-center gap-3 px-4 pb-7 pt-6">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary-light to-primary text-base font-black text-white shadow-lg shadow-primary/20">P</div>
              <span className="hidden text-lg font-black tracking-widest text-slate-800 lg:block">PLEARNY</span>
            </div>
            <div className="mb-5 hidden px-3 lg:block">
              <div className="rounded-2xl border border-slate-200/80 bg-slate-50 p-3 shadow-sm">
                <div className="mb-2 flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-amber-200 to-amber-400 text-sm font-black text-amber-900 shadow-sm">{profile.playerLevel}</div>
                  <div className="min-w-0"><div className="truncate text-xs font-black text-slate-800">{user.name}</div><div className="text-[9px] font-bold text-slate-500">นักผจญภัย · Lv.{profile.playerLevel}</div></div>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-200"><div className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 transition-all" style={{ width: `${xpPct}%` }} /></div>
                <div className="mt-1 flex justify-between"><span className="text-[9px] font-bold text-slate-500">{profile.xp.toLocaleString()} XP</span><span className="text-[9px] font-black text-cyan-600">ด่าน {profile.unlockedStage}/12</span></div>
              </div>
            </div>
            <nav className="flex flex-1 flex-col gap-1 px-2">
              {NAV_ITEMS.map((item) => {
                const active = pathname.startsWith(item.href);
                return <Link key={item.href} href={item.href}><div className={cn("group flex items-center gap-3 rounded-2xl px-3 py-3 transition-all duration-200", active ? "bg-primary text-white shadow-[0_8px_16px_rgba(124,58,237,0.2)]" : "text-slate-500 hover:bg-slate-100 hover:text-slate-800")}><item.icon className={cn("h-5 w-5 flex-shrink-0", active ? "text-white" : "group-hover:text-primary")} /><span className="hidden text-sm font-bold lg:block">{item.name}</span></div></Link>;
              })}
            </nav>
            <div className="hidden px-3 pb-2 lg:block"><HeartStreakHud profile={profile} compact showTimer className="w-full" /></div>
            <div className="p-3 pb-5">
              <div className="mb-2 flex items-center gap-3 rounded-xl bg-amber-50 px-3 py-2"><Coins className="h-4 w-4 text-amber-500" /><span className="text-sm font-black text-slate-800">{profile.coins.toLocaleString()}</span><span className="ml-auto hidden text-xs font-bold text-slate-500 lg:block">เหรียญ</span></div>
              <button onClick={() => void logout()} className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-slate-500 transition-colors hover:bg-rose-50 hover:text-rose-600"><LogOut className="h-4 w-4" /><span className="hidden text-xs font-bold lg:block">ออกจากระบบ</span></button>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      <main className="relative h-full min-w-0 flex-1 overflow-hidden bg-slate-50">
        {children}
        <AnimatePresence>
          {!isImmersive && <motion.header key="mobile-hud" initial={{ y: -60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -60, opacity: 0 }} className="pointer-events-none absolute left-0 right-0 top-0 z-50 flex flex-col gap-1 px-4 pb-2 pt-3 md:hidden">
            <div className="flex items-center justify-between">
              <div className="pointer-events-auto flex items-center gap-2 rounded-full border border-slate-200/80 bg-white/90 p-1.5 pr-4 shadow-sm backdrop-blur-xl"><div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-b from-amber-200 to-amber-400 text-sm font-black text-amber-900">{profile.playerLevel}</div><div className="flex flex-col gap-0.5"><span className="text-[10px] font-black uppercase leading-none tracking-widest text-slate-700">{user.name}</span><div className="h-1.5 w-20 overflow-hidden rounded-full bg-slate-200"><div className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-blue-500" style={{ width: `${xpPct}%` }} /></div></div></div>
              <div className="pointer-events-auto flex gap-2"><div className="flex items-center gap-1.5 rounded-full border border-amber-200 bg-white/90 px-3 py-2 shadow-sm"><Coins className="h-4 w-4 text-amber-500" /><span className="text-sm font-black text-slate-800">{profile.coins}</span></div><button onClick={() => void logout()} aria-label="ออกจากระบบ" className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white/90 text-slate-500"><LogOut className="h-4 w-4" /></button></div>
            </div>
            <div className="flex justify-center"><HeartStreakHud profile={profile} compact showTimer /></div>
          </motion.header>}
        </AnimatePresence>
        <AnimatePresence>
          {!isImmersive && <motion.nav key="mobile-nav" initial={{ y: 80, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 80, opacity: 0 }} className="pointer-events-none absolute bottom-0 left-0 right-0 z-50 flex justify-center px-4 pb-3 md:hidden"><div className="pointer-events-auto flex items-center gap-1 rounded-full border border-slate-200/80 bg-white/95 p-1.5 shadow-xl backdrop-blur-2xl">{NAV_ITEMS.map((item) => { const active = pathname.startsWith(item.href); return <Link key={item.href} href={item.href}><div className={cn("flex h-12 w-14 flex-col items-center justify-center rounded-full transition-all", active ? "bg-primary" : "hover:bg-slate-100")}><item.icon className={cn("h-4 w-4", active ? "text-white" : "text-slate-400")} /><span className={cn("mt-0.5 text-[8px] font-black", active ? "text-white" : "text-slate-500")}>{item.name}</span></div></Link>; })}</div></motion.nav>}
        </AnimatePresence>
      </main>
    </div>
  );
}
