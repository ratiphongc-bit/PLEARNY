"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowLeft, LoaderCircle, Sparkles } from "lucide-react";

const ERROR_MESSAGES: Record<string, string> = {
  sign_in_cancelled: "ยกเลิกการเข้าสู่ระบบแล้ว หากต้องการลองใหม่ให้กดปุ่มด้านล่าง",
  sign_in_failed: "เข้าสู่ระบบไม่สำเร็จ กรุณาลองอีกครั้ง",
  identity_lookup_failed: "ตรวจสอบบัญชี Manus ไม่สำเร็จ กรุณาลองใหม่",
  sign_in_unavailable: "ระบบเข้าสู่ระบบยังไม่พร้อม กรุณาลองใหม่ภายหลัง",
};

export default function LoginPage() {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const code = new URLSearchParams(window.location.search).get("error");
      if (code) setError(ERROR_MESSAGES[code] || "เกิดข้อผิดพลาดในการเข้าสู่ระบบ กรุณาลองใหม่");
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  async function signIn() {
    setBusy(true);
    setError(null);
    try {
      const response = await fetch("/api/auth/login", { method: "POST", cache: "no-store" });
      const body = await response.json() as { authorizationUrl?: string; error?: string };
      if (!response.ok || !body.authorizationUrl) throw new Error(body.error || "เริ่มเข้าสู่ระบบไม่สำเร็จ");
      window.location.assign(body.authorizationUrl);
    } catch (signInError) {
      setError(signInError instanceof Error ? signInError.message : "เชื่อมต่อระบบเข้าสู่ระบบไม่สำเร็จ");
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-sky-50 relative overflow-hidden p-4">
      <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[80%] h-80 bg-white/60 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] left-1/4 w-64 h-64 bg-sky-200/40 blur-[100px] rounded-full pointer-events-none" />
      <div className="w-full max-w-sm relative z-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-light to-primary text-white shadow-lg shadow-primary/20 mb-4">
            <Sparkles className="w-7 h-7" />
          </div>
          <div className="text-3xl font-black tracking-widest text-primary">PLEARNY</div>
          <p className="text-slate-500 font-medium mt-1">เปลี่ยนการเรียนรู้ให้เป็นการผจญภัย</p>
        </div>

        <div className="bg-white/90 backdrop-blur-2xl rounded-[2.5rem] p-8 border border-slate-200 shadow-xl">
          <h1 className="text-2xl font-black text-slate-800 text-center">พร้อมออกผจญภัยหรือยัง?</h1>
          <p className="text-slate-500 text-sm text-center mt-2 mb-7">เข้าสู่ระบบเพื่อบันทึกด่านและไอเทมไว้กับบัญชีของคุณ</p>
          {error && <div role="alert" className="mb-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700">{error}</div>}
          <button
            type="button"
            disabled={busy}
            onClick={signIn}
            className="w-full h-14 rounded-2xl font-black text-white text-base bg-gradient-to-b from-primary-light to-primary border border-primary shadow-[0_4px_15px_rgba(124,58,237,0.25)] hover:shadow-[0_6px_20px_rgba(124,58,237,0.35)] disabled:opacity-70 transition-all flex items-center justify-center gap-3"
          >
            {busy ? <LoaderCircle className="w-5 h-5 animate-spin" /> : <span className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center font-black">M</span>}
            {busy ? "กำลังเชื่อมต่อ…" : "เข้าสู่ระบบด้วยบัญชี Manus"}
          </button>
          <p className="text-xs text-slate-400 text-center mt-4 leading-relaxed">แต่ละบัญชีมีความคืบหน้าของเกมแยกจากกัน<br />ผู้เล่นใหม่จะเริ่มจากด่านแรก</p>
          <div className="mt-7 pt-5 border-t border-slate-100 text-center">
            <Link href="/" className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-primary transition-colors"><ArrowLeft className="w-4 h-4" />กลับหน้าหลัก</Link>
          </div>
        </div>
        <p className="text-[11px] text-center text-slate-400 mt-5">หากต้องการใช้ Manus account อื่น ให้เปลี่ยนบัญชีที่ Manus ก่อนเข้าสู่ระบบ</p>
      </div>
    </div>
  );
}
