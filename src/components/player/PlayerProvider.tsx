"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { PlayerPayload } from "@/lib/player/types";
import type { PlayerProfile } from "@/lib/player/store";
import { playerResultStorageKey } from "@/lib/player/client-storage";

type PlayerContextValue = {
  data: PlayerPayload | null;
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  equipItem: (itemId: string | null, slot: string) => Promise<void>;
  updateProfile: (profile: PlayerProfile) => void;
  logout: () => Promise<void>;
};

const PlayerContext = createContext<PlayerContextValue | null>(null);

export function PlayerProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const loaded = useRef(false);
  const [data, setData] = useState<PlayerPayload | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      const response = await fetch("/api/player", { cache: "no-store" });
      if (response.status === 401) {
        loaded.current = true;
        setData(null);
        router.replace("/login");
        return;
      }
      const payload = await response.json() as PlayerPayload & { error?: string };
      if (!response.ok) throw new Error(payload.error || "โหลดข้อมูลผู้เล่นไม่สำเร็จ");
      loaded.current = true;
      setError(null);
      setData(payload);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "เชื่อมต่อระบบผู้เล่นไม่สำเร็จ");
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  useEffect(() => {
    const timer = window.setTimeout(() => { void refresh(); }, 0);
    return () => window.clearTimeout(timer);
  }, [refresh]);

  const equipItem = useCallback(async (itemId: string | null, slot: string) => {
    const response = await fetch("/api/player/equip", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ itemId, slot }),
    });
    const body = await response.json() as { profile?: PlayerProfile; error?: string };
    if (!response.ok || !body.profile) throw new Error(body.error || "เปลี่ยนการสวมใส่ไม่สำเร็จ");
    setData((current) => current ? { ...current, profile: body.profile! } : current);
  }, []);

  const updateProfile = useCallback((profile: PlayerProfile) => {
    setData((current) => current ? { ...current, profile } : current);
  }, []);

  const logout = useCallback(async () => {
    if (data?.user.openId) sessionStorage.removeItem(playerResultStorageKey(data.user.openId));
    await fetch("/api/auth/logout", { method: "POST" });
    loaded.current = true;
    setData(null);
    router.replace("/login");
  }, [data, router]);

  const value = useMemo(() => ({ data, isLoading, error, refresh, equipItem, updateProfile, logout }), [data, isLoading, error, refresh, equipItem, updateProfile, logout]);
  return <PlayerContext.Provider value={value}>{children}</PlayerContext.Provider>;
}

export function usePlayer(): PlayerContextValue {
  const context = useContext(PlayerContext);
  if (!context) throw new Error("usePlayer must be used inside PlayerProvider");
  return context;
}
