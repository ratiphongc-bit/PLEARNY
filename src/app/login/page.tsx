import Link from "next/link";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-sky-50 relative overflow-hidden p-4">

      {/* Background orbs (Daytime soft glows) */}
      <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[80%] h-80 bg-white/60 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] left-1/4 w-64 h-64 bg-sky-200/40 blur-[100px] rounded-full pointer-events-none" />

      <div className="w-full max-w-sm relative z-10">

        {/* Logo */}
        <div className="text-center mb-10">
          <div className="text-3xl font-black tracking-widest text-primary">
            PLEARNY
          </div>
          <p className="text-slate-500 font-medium">Turn Learning Into Adventure</p>
        </div>

        {/* Card */}
        <div className="bg-white/80 backdrop-blur-2xl rounded-[2.5rem] p-8 border border-slate-200 shadow-xl">
          <h2 className="text-2xl font-black text-slate-800 text-center mb-8">ยินดีต้อนรับ! 👋</h2>

          <div className="space-y-3 mb-8">
            <Link href="/home" className="block">
              <button className="w-full flex items-center gap-4 h-14 px-5 bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-2xl font-bold text-slate-700 transition-all shadow-sm">
                <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center text-sm font-black text-slate-600">G</div>
                Continue with Google
              </button>
            </Link>
            <Link href="/home" className="block">
              <button className="w-full flex items-center gap-4 h-14 px-5 bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-2xl font-bold text-slate-700 transition-all shadow-sm">
                <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center text-base">📱</div>
                Continue with Phone
              </button>
            </Link>
          </div>

          <div className="relative mb-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-white px-4 text-slate-400 font-medium rounded-full">Prototype Access</span>
            </div>
          </div>

          <div className="space-y-3">
            <Link href="/home" className="block">
              <button className="w-full h-14 rounded-2xl font-black text-white text-base bg-gradient-to-b from-primary-light to-primary border border-primary shadow-[0_4px_15px_rgba(124,58,237,0.25)] hover:shadow-[0_6px_20px_rgba(124,58,237,0.35)] transition-all hover:scale-[1.02]">
                เข้าในฐานะนักเรียน
              </button>
            </Link>
            <Link href="/admin" className="block">
              <button className="w-full h-14 rounded-2xl font-black text-slate-600 text-base bg-slate-50 hover:bg-slate-100 border border-slate-200 hover:border-slate-300 transition-all">
                เข้าในฐานะผู้ดูแลระบบ
              </button>
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
