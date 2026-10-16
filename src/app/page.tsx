import Link from "next/link";
import { Play, Compass } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-sky-50 text-slate-900 overflow-hidden relative">

      {/* Background (Daytime) */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-sky-200 via-sky-100 to-sky-50" />
        
        {/* Sun */}
        <div className="absolute top-[10%] right-[20%] w-64 h-64 bg-yellow-100/50 blur-[80px] rounded-full" />
        
        {/* Soft clouds */}
        {[
          { w: "40%", t: "15%", l: "-10%", opacity: 0.6 },
          { w: "30%", t: "25%", l: "70%", opacity: 0.4 },
        ].map((c, i) => (
          <div key={i} className="absolute bg-white rounded-full blur-[20px]" style={{ width: c.w, height: "100px", top: c.t, left: c.l, opacity: c.opacity }} />
        ))}
      </div>

      {/* Navigation */}
      <nav className="relative z-10 w-full max-w-6xl mx-auto px-6 py-6 flex justify-between items-center">
        <div className="text-2xl font-black tracking-widest text-primary">
          PLEARNY
        </div>
        <div className="flex gap-3">
          <Link href="/login">
            <button className="px-5 py-2.5 text-sm font-bold text-slate-500 hover:text-slate-800 bg-white/50 hover:bg-white border border-slate-200 rounded-full transition-all shadow-sm">
              เข้าสู่ระบบ
            </button>
          </Link>
            <Link href="/login">
              <button className="h-16 px-10 rounded-full bg-gradient-to-b from-primary-light to-primary text-xl font-black text-white shadow-[0_8px_0_0_#5b21b6,0_15px_20px_rgba(124,58,237,0.3)] active:shadow-none active:translate-y-2 transition-all flex items-center gap-3">
                สำรวจ Plearny
              </button>
            </Link>
        </div>
      </nav>

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center text-center px-6 relative z-10 py-20">

        <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-md border border-primary/20 text-primary text-xs font-black px-4 py-1.5 rounded-full mb-8 tracking-widest uppercase shadow-sm">
          ✨ PREMIUM EDUCATIONAL ADVENTURE
        </div>

        <h1 className="text-5xl md:text-8xl font-black tracking-tight mb-6 leading-[1.05]">
          <span className="text-slate-800">เปลี่ยนการเรียนรู้</span>
          <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-emerald-500 drop-shadow-sm">
            ให้เป็นการผจญภัย
          </span>
        </h1>

          <p className="text-xl text-slate-500 mb-8 max-w-lg mx-auto">
            Plearny เป็นเกมผจญภัยสำหรับนักเรียนประถม ป.1–6<br />ที่เปลี่ยนแบบฝึกหัดคณิตศาสตร์ให้เป็นการเดินทางที่สนุกสนาน
          </p>

        <div className="flex flex-col sm:flex-row gap-4 mb-20">
          <Link href="/login">
            <button className="flex items-center gap-3 px-8 py-4 text-lg font-black text-white bg-gradient-to-b from-primary-light to-primary rounded-[2rem] shadow-[0_8px_0_0_#5b21b6,0_15px_30px_rgba(124,58,237,0.3)] hover:shadow-[0_4px_0_0_#5b21b6,0_15px_30px_rgba(124,58,237,0.4)] transition-all active:translate-y-1 active:shadow-none border border-primary-light">
              <Play className="w-5 h-5 fill-white" />
              เริ่มการผจญภัย
            </button>
          </Link>
          <Link href="#explore">
            <button className="flex items-center gap-3 px-8 py-4 text-lg font-bold text-slate-600 hover:text-slate-900 bg-white/80 hover:bg-white border border-slate-200 rounded-[2rem] transition-all shadow-sm hover:shadow-md">
              <Compass className="w-5 h-5" />
              สำรวจ Numeria
            </button>
          </Link>
        </div>

        {/* Mock game preview */}
        <div className="w-full max-w-4xl rounded-[2.5rem] border border-slate-200 bg-white/80 backdrop-blur-xl shadow-2xl overflow-hidden aspect-video relative">
          {/* Header bar */}
          <div className="absolute top-4 left-4 right-4 flex justify-between items-center z-20">
            <div className="bg-white/90 backdrop-blur-md border border-slate-200 px-4 py-2 rounded-full flex items-center gap-2 shadow-sm">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gold-light to-gold flex items-center justify-center text-sm font-black text-yellow-900">18</div>
              <div>
                <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Nina</div>
                <div className="w-16 h-1.5 bg-slate-200 rounded-full overflow-hidden mt-0.5">
                  <div className="w-[82%] h-full bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full" />
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              {[
                { icon: "🔥", val: "12" }, 
                { icon: "❤️", val: "5" }, 
                { icon: "🪙", val: "1,280" }
              ].map(s => (
                <div key={s.val} className="bg-white/90 backdrop-blur-md border border-slate-200 px-3 py-2 rounded-full text-xs font-black text-slate-700 shadow-sm flex items-center gap-1.5">
                  {s.icon} {s.val}
                </div>
              ))}
            </div>
          </div>

          {/* Scene background */}
          <div className="absolute inset-0 bg-gradient-to-br from-sky-200 via-sky-100 to-emerald-100">
            <div className="absolute bottom-0 w-full h-[40%] bg-gradient-to-t from-emerald-500/20 to-transparent opacity-60" />
            <div className="absolute top-[15%] left-[10%] text-[80px] opacity-70 drop-shadow-xl">🏔️</div>
            <div className="absolute top-[20%] right-[15%] text-[60px] opacity-80 drop-shadow-xl">🐉</div>
            <div className="absolute bottom-[25%] left-1/2 -translate-x-1/2 text-center text-slate-500 text-sm font-bold tracking-widest uppercase">
              [ Daytime World Environment ]
            </div>
          </div>

          {/* Bottom action bar preview */}
          <div className="absolute bottom-4 left-4 right-4 z-20 flex justify-center">
            <div className="bg-white/90 backdrop-blur-md border border-slate-200 px-8 py-4 rounded-[2rem] flex items-center gap-4 shadow-lg">
              <Play className="w-6 h-6 fill-primary text-primary" />
              <span className="text-slate-800 font-black text-base tracking-widest">CONTINUE ADVENTURE</span>
            </div>
          </div>
        </div>

      </main>
    </div>
  );
}
