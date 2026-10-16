"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Map, Backpack, User, Flame, Heart } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { STUDENT_USER } from "@/mock/data";

const NAV_ITEMS = [
  { name: "หน้าหลัก",      href: "/home",      icon: Home },
  { name: "แผนที่",       href: "/map",       icon: Map },
  { name: "กระเป๋า", href: "/inventory", icon: Backpack },
  { name: "โปรไฟล์",   href: "/profile",   icon: User },
];

const IMMERSIVE = ["/play", "/result"];

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isImmersive = IMMERSIVE.some((p) => pathname.startsWith(p));
  const xpPct = Math.round((STUDENT_USER.xp / STUDENT_USER.maxXp) * 100);

  return (
    <div className="fixed inset-0 overflow-hidden bg-slate-50 text-slate-900 font-sans flex">

      {/* ═══════════════════════════════
          DESKTOP LEFT SIDEBAR
          Hidden on mobile, visible md+
      ═══════════════════════════════ */}
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
            {/* Logo */}
            <div className="flex items-center gap-3 px-4 pt-6 pb-8">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-light to-primary flex items-center justify-center text-base font-black shadow-lg shadow-primary/20 flex-shrink-0 text-white">
                N
              </div>
              <span className="hidden lg:block text-slate-800 font-black text-lg tracking-widest">PLEARNY</span>
            </div>

            {/* Player info (desktop sidebar) */}
            <div className="px-3 mb-6 hidden lg:block">
              <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gold-light to-gold flex items-center justify-center text-sm font-black text-yellow-900 shadow-sm">
                    {STUDENT_USER.level}
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-black text-slate-800 truncate">{STUDENT_USER.name}</div>
                    <div className="text-[9px] text-slate-500 font-bold">Level {STUDENT_USER.level}</div>
                  </div>
                </div>
                <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full transition-all duration-1000"
                    style={{ width: `${xpPct}%` }}
                  />
                </div>
                <div className="flex justify-between mt-1">
                  <span className="text-[9px] text-slate-500 font-bold">{STUDENT_USER.xp.toLocaleString()} XP</span>
                  <span className="text-[9px] text-cyan-600 font-black">{xpPct}%</span>
                </div>
              </div>
            </div>

            {/* Nav items */}
            <nav className="flex flex-col gap-1 px-2 flex-1">
              {NAV_ITEMS.map((item) => {
                const isActive = pathname.startsWith(item.href);
                return (
                  <Link key={item.name} href={item.href}>
                    <div className={cn(
                      "flex items-center gap-3 rounded-2xl px-3 py-3 transition-all duration-200 group",
                      isActive
                        ? "bg-primary text-white shadow-[0_8px_16px_rgba(124,58,237,0.2)]"
                        : "text-slate-500 hover:bg-slate-100 hover:text-slate-800"
                    )}>
                      <item.icon className={cn(
                        "w-5 h-5 flex-shrink-0 transition-all",
                        isActive ? "text-white" : "group-hover:scale-110 group-hover:text-primary"
                      )} />
                      <span className={cn(
                        "hidden lg:block text-sm font-bold",
                        isActive ? "text-white" : ""
                      )}>
                        {item.name}
                      </span>
                    </div>
                  </Link>
                );
              })}
            </nav>

            {/* Bottom stats */}
            <div className="p-3 pb-6 space-y-2">
              {[
                { icon: Flame, value: STUDENT_USER.streak, color: "text-orange-500", fill: "fill-orange-500", label: "สตรีค", bg: "bg-orange-50" },
                { icon: Heart, value: STUDENT_USER.hearts,  color: "text-rose-500",   fill: "fill-rose-500",   label: "หัวใจ", bg: "bg-rose-50" },
              ].map((stat) => (
                <div key={stat.label} className={cn("flex items-center gap-3 px-3 py-2 rounded-xl border border-transparent hover:border-slate-200 transition-colors cursor-default", stat.bg)}>
                  <stat.icon className={cn("w-4 h-4 flex-shrink-0", stat.color, stat.fill)} />
                  <span className="text-slate-800 font-black text-sm">{stat.value}</span>
                  <span className="hidden lg:block text-slate-500 text-xs font-bold ml-auto">{stat.label}</span>
                </div>
              ))}
              <div className="flex items-center gap-3 px-3 py-2 rounded-xl bg-amber-50 border border-transparent hover:border-amber-200 transition-colors cursor-default">
                <div className="w-4 h-4 rounded-full bg-gradient-to-br from-yellow-300 to-amber-500 flex items-center justify-center text-[8px] font-black text-amber-900 flex-shrink-0 shadow-sm">N</div>
                <span className="text-slate-800 font-black text-sm">{STUDENT_USER.coins.toLocaleString()}</span>
                <span className="hidden lg:block text-slate-500 text-xs font-bold ml-auto">เหรียญ</span>
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* ═══ MAIN CONTENT ═══ */}
      <main className="relative flex-1 h-full overflow-hidden min-w-0 bg-slate-50">
        {children}

        {/* ─── MOBILE TOP HUD (hidden md+) ─── */}
        <AnimatePresence>
          {!isImmersive && (
            <motion.header
              key="mobile-hud"
              initial={{ y: -60, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -60, opacity: 0 }}
              className="absolute top-0 left-0 right-0 z-50 px-4 pt-3 pb-2 flex justify-between items-center pointer-events-none md:hidden"
            >
              <div className="flex items-center gap-2 bg-white/90 backdrop-blur-xl border border-slate-200/80 rounded-full p-1.5 pr-4 shadow-sm pointer-events-auto">
                <div className="w-9 h-9 rounded-full bg-gradient-to-b from-gold-light to-gold flex items-center justify-center text-sm font-black text-yellow-900 shadow-sm">
                  {STUDENT_USER.level}
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-700 leading-none mt-0.5">{STUDENT_USER.name}</span>
                  <div className="w-20 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full" style={{ width: `${xpPct}%` }} />
                  </div>
                </div>
              </div>
              <div className="flex gap-2 pointer-events-auto">
                {[
                  { icon: Flame, v: STUDENT_USER.streak, c: "text-orange-500 fill-orange-500" },
                  { icon: Heart, v: STUDENT_USER.hearts,  c: "text-rose-500 fill-rose-500" },
                ].map((s, i) => (
                  <div key={i} className="flex items-center gap-1.5 bg-white/90 backdrop-blur-xl border border-slate-200/80 rounded-full px-3 py-2 shadow-sm">
                    <s.icon className={cn("w-4 h-4", s.c)} />
                    <span className="text-slate-800 font-black text-sm">{s.v}</span>
                  </div>
                ))}
              </div>
            </motion.header>
          )}
        </AnimatePresence>

        {/* ─── MOBILE BOTTOM NAV (hidden md+) ─── */}
        <AnimatePresence>
          {!isImmersive && (
            <motion.nav
              key="mobile-nav"
              initial={{ y: 80, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 80, opacity: 0 }}
              className="absolute bottom-0 left-0 right-0 z-50 flex justify-center pb-3 px-4 pointer-events-none md:hidden"
            >
              <div className="flex items-center gap-1 bg-white/95 backdrop-blur-2xl border border-slate-200/80 rounded-full p-1.5 shadow-xl pointer-events-auto">
                {NAV_ITEMS.map((item) => {
                  const isActive = pathname.startsWith(item.href);
                  return (
                    <Link key={item.name} href={item.href}>
                      <div className={cn(
                        "flex flex-col items-center justify-center w-14 h-12 rounded-full transition-all duration-300",
                        isActive ? "bg-primary shadow-[0_4px_12px_rgba(124,58,237,0.3)]" : "hover:bg-slate-100"
                      )}>
                        <item.icon className={cn("w-4 h-4", isActive ? "text-white" : "text-slate-400")} />
                        <span className={cn("text-[8px] font-black mt-0.5", isActive ? "text-white" : "text-slate-500")}>
                          {item.name}
                        </span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </motion.nav>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
