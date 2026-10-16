"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, BookOpen, BrainCircuit, Library, FileText, Database, ShieldCheck, Image, Map as MapIcon, BarChart3, Users } from "lucide-react";
import { cn } from "@/lib/utils";

const ADMIN_NAV = [
  { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { name: "Curriculum", href: "/admin/curriculum", icon: BookOpen },
  { name: "Skills", href: "/admin/skills", icon: BrainCircuit },
  { name: "Knowledge Base", href: "/admin/kb", icon: Library },
  { name: "Books / PDF", href: "/admin/books", icon: FileText },
  { name: "Question Bank", href: "/admin/questions", icon: Database },
  { name: "AI Generator", href: "/admin/ai-generator", icon: BrainCircuit },
  { name: "Validation", href: "/admin/validation", icon: ShieldCheck },
  { name: "Assets", href: "/admin/assets", icon: Image },
  { name: "Adventure", href: "/admin/adventure", icon: MapIcon },
  { name: "Analytics", href: "/admin/analytics", icon: BarChart3 },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans">
      {/* Admin Sidebar */}
      <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col h-screen sticky top-0">
        <div className="p-6">
          <div className="text-xl font-black text-white tracking-widest uppercase">
            PLEARNY
            <span className="block text-xs text-primary font-bold mt-1">Admin Panel</span>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto px-4 space-y-1 pb-8">
          {ADMIN_NAV.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link key={item.name} href={item.href}>
                <div className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-sm font-medium",
                  isActive ? "bg-primary text-white" : "hover:bg-slate-800 hover:text-white"
                )}>
                  <item.icon className="w-4 h-4" />
                  {item.name}
                </div>
              </Link>
            )
          })}
        </nav>
        
        <div className="p-4 mt-auto border-t border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center">
              <Users className="w-4 h-4 text-slate-400" />
            </div>
            <div className="text-sm">
              <div className="text-white font-medium">Admin User</div>
              <div className="text-xs text-slate-500">Super Admin</div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 h-screen overflow-y-auto bg-slate-50">
        <header className="bg-white border-b border-slate-200 h-16 flex items-center px-8 sticky top-0 z-10">
          <div className="flex-1"></div>
          <Link href="/login" className="text-sm text-slate-500 hover:text-slate-700 font-medium">
            Exit to Prototypes
          </Link>
        </header>
        <div className="p-8 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
