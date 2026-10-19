import type { AuthUser } from "@/lib/auth/session";
import type { GameItem, GameStage } from "@/lib/player/python-service";
import type { PlayerProfile } from "@/lib/player/store";

export type PlayerPayload = {
  user: AuthUser;
  profile: PlayerProfile;
  levels: GameStage[];
  items: GameItem[];
};
