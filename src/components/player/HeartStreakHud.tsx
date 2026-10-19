"use client";

import { useEffect, useState } from "react";
import { Heart } from "lucide-react";
import type { PlayerProfile } from "@/lib/player/store";
import { usePlayer } from "@/components/player/PlayerProvider";

type HeartStreakHudProps = {
  profile: Pick<PlayerProfile, "hearts" | "heartRegenAtMs" | "streakDays" | "longestStreak">;
  compact?: boolean;
  showTimer?: boolean;
  className?: string;
};

function formatRemaining(milliseconds: number): string {
  const totalSeconds = Math.max(0, Math.ceil(milliseconds / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  if (hours > 0) return `${hours}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

export function HeartStreakHud({ profile, compact = false, showTimer = true, className = "" }: HeartStreakHudProps) {
  const { refresh } = usePlayer();
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    if (!showTimer || profile.hearts >= 5 || !profile.heartRegenAtMs) return;
    const ticker = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(ticker);
  }, [showTimer, profile.hearts, profile.heartRegenAtMs]);

  useEffect(() => {
    if (!showTimer || profile.hearts >= 5 || !profile.heartRegenAtMs) return;
    const timeout = window.setTimeout(() => { void refresh(); }, Math.max(0, profile.heartRegenAtMs - Date.now()) + 250);
    return () => window.clearTimeout(timeout);
  }, [showTimer, profile.hearts, profile.heartRegenAtMs, refresh]);

  const remaining = now !== null && profile.heartRegenAtMs !== null
    ? Math.max(0, profile.heartRegenAtMs - now)
    : null;

  return (
    <div aria-label={`หัวใจ ${profile.hearts} จาก 5 สตรีค ${profile.streakDays} วัน สถิติสูงสุด ${profile.longestStreak} วัน`} className={`inline-flex flex-wrap items-center justify-center gap-x-2 gap-y-1 rounded-full border border-slate-200 bg-white/95 px-3 py-1.5 shadow-sm ${className}`}>
      <span className="inline-flex items-center gap-1" aria-label={`หัวใจ ${profile.hearts} จาก 5`}>
        {Array.from({ length: 5 }, (_, index) => (
          <Heart key={index} className={`${compact ? "h-3.5 w-3.5" : "h-4 w-4"} ${index < profile.hearts ? "fill-rose-500 text-rose-500" : "text-slate-300"}`} />
        ))}
        <span className="ml-0.5 text-[11px] font-black text-slate-700">{profile.hearts}/5</span>
      </span>
      <span className="text-[11px] font-black text-orange-600">🔥 {profile.streakDays} วัน</span>
      <span className="text-[10px] font-bold text-orange-500">สูงสุด {profile.longestStreak}</span>
      {showTimer && profile.hearts < 5 && (
        <span className="w-full text-center text-[10px] font-bold text-slate-500">
          +1 หัวใจใน {remaining === null ? "กำลังคำนวณ…" : formatRemaining(remaining)}
        </span>
      )}
    </div>
  );
}
