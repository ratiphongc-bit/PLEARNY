import "server-only";
import mysql, { type Pool, type RowDataPacket } from "mysql2/promise";

export type PlayerProfile = {
  openId: string;
  displayName: string;
  unlockedStage: number;
  xp: number;
  coins: number;
  completedStages: number[];
  unlockedItems: string[];
  equippedItems: Record<string, string>;
  playerLevel: number;
  xpInLevel: number;
  xpForNextLevel: number;
};

type ProfileRow = RowDataPacket & {
  open_id: string;
  display_name: string;
  unlocked_stage: number;
  xp: number;
  coins: number;
  completed_stages: unknown;
  unlocked_items: unknown;
  equipped_items: unknown;
};

let pool: Pool | undefined;
let schemaPromise: Promise<void> | undefined;
const STARTER_ITEMS = ["pet_sparky", "outfit_scout"];
const MAX_STAGE = 12;
const XP_PER_LEVEL = 250;
const PLAYER_TABLE_SQL = `
  CREATE TABLE IF NOT EXISTS player_profiles (
    open_id VARCHAR(191) NOT NULL PRIMARY KEY,
    display_name VARCHAR(255) NOT NULL,
    unlocked_stage TINYINT UNSIGNED NOT NULL DEFAULT 1,
    xp INT UNSIGNED NOT NULL DEFAULT 0,
    coins INT UNSIGNED NOT NULL DEFAULT 0,
    completed_stages JSON NOT NULL,
    unlocked_items JSON NOT NULL,
    equipped_items JSON NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
`;

function getPool(): Pool {
  if (pool) return pool;
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error("Player database is not configured");
  const url = new URL(connectionString);
  const sslValue = url.searchParams.get("ssl");
  const ssl = sslValue ? JSON.parse(sslValue) : undefined;
  pool = mysql.createPool({
    host: url.hostname,
    port: Number(url.port || 3306),
    user: decodeURIComponent(url.username),
    password: decodeURIComponent(url.password),
    database: decodeURIComponent(url.pathname.replace(/^\//, "")),
    ...(ssl ? { ssl } : {}),
    waitForConnections: true,
    connectionLimit: 8,
    queueLimit: 0,
    enableKeepAlive: true,
  });
  return pool;
}

async function ensureSchema(): Promise<void> {
  if (!schemaPromise) {
    schemaPromise = (async () => {
      await getPool().query(`CREATE TABLE IF NOT EXISTS plearny_schema_migrations (version VARCHAR(64) NOT NULL PRIMARY KEY, applied_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`);
      const [rows] = await getPool().query<RowDataPacket[]>("SELECT version FROM plearny_schema_migrations WHERE version = '001_player_profiles'");
      if (rows.length === 0) {
        await getPool().query(PLAYER_TABLE_SQL);
        await getPool().execute("INSERT IGNORE INTO plearny_schema_migrations (version) VALUES (?)", ["001_player_profiles"]);
      }
    })().catch((error) => {
      schemaPromise = undefined;
      throw error;
    });
  }
  await schemaPromise;
}

function parseJson<T>(value: unknown, fallback: T): T {
  if (typeof value === "string") {
    try { return JSON.parse(value) as T; } catch { return fallback; }
  }
  return value === null || value === undefined ? fallback : value as T;
}

function toProfile(row: ProfileRow): PlayerProfile {
  const xp = Number(row.xp) || 0;
  return {
    openId: row.open_id,
    displayName: row.display_name,
    unlockedStage: Math.max(1, Math.min(MAX_STAGE, Number(row.unlocked_stage) || 1)),
    xp,
    coins: Number(row.coins) || 0,
    completedStages: parseJson<number[]>(row.completed_stages, []),
    unlockedItems: parseJson<string[]>(row.unlocked_items, STARTER_ITEMS),
    equippedItems: parseJson<Record<string, string>>(row.equipped_items, { pet: "pet_sparky", outfit: "outfit_scout" }),
    playerLevel: Math.floor(xp / XP_PER_LEVEL) + 1,
    xpInLevel: xp % XP_PER_LEVEL,
    xpForNextLevel: XP_PER_LEVEL,
  };
}

async function findProfile(openId: string, lock = false): Promise<PlayerProfile | null> {
  const suffix = lock ? " FOR UPDATE" : "";
  const [rows] = await getPool().execute<ProfileRow[]>(
    `SELECT open_id, display_name, unlocked_stage, xp, coins, completed_stages, unlocked_items, equipped_items FROM player_profiles WHERE open_id = ?${suffix}`,
    [openId],
  );
  return rows[0] ? toProfile(rows[0]) : null;
}

export async function getPlayerProfile(openId: string, displayName: string): Promise<PlayerProfile> {
  await ensureSchema();
  const safeName = displayName.trim().slice(0, 100) || "นักผจญภัย";
  await getPool().execute(
    `INSERT INTO player_profiles (open_id, display_name, unlocked_stage, xp, coins, completed_stages, unlocked_items, equipped_items)
     VALUES (?, ?, 1, 0, 0, JSON_ARRAY(), JSON_ARRAY('pet_sparky','outfit_scout'), JSON_OBJECT('pet','pet_sparky','outfit','outfit_scout'))
     ON DUPLICATE KEY UPDATE display_name = VALUES(display_name)`,
    [openId, safeName],
  );
  const profile = await findProfile(openId);
  if (!profile) throw new Error("Unable to load player profile");
  return profile;
}

export async function equipPlayerItem(openId: string, itemId: string | null, slot: string): Promise<PlayerProfile> {
  await ensureSchema();
  const connection = await getPool().getConnection();
  try {
    await connection.beginTransaction();
    const [rows] = await connection.execute<ProfileRow[]>(
      `SELECT open_id, display_name, unlocked_stage, xp, coins, completed_stages, unlocked_items, equipped_items FROM player_profiles WHERE open_id = ? FOR UPDATE`,
      [openId],
    );
    if (!rows[0]) throw new Error("Player profile not found");
    const profile = toProfile(rows[0]);
    if (itemId && !profile.unlockedItems.includes(itemId)) throw new Error("item_locked");
    const equipped = { ...profile.equippedItems };
    if (itemId) equipped[slot] = itemId;
    else delete equipped[slot];
    await connection.execute("UPDATE player_profiles SET equipped_items = CAST(? AS JSON) WHERE open_id = ?", [JSON.stringify(equipped), openId]);
    await connection.commit();
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
  const updated = await findProfile(openId);
  if (!updated) throw new Error("Unable to reload player profile");
  return updated;
}

export async function applyStageResult(
  openId: string,
  stageId: number,
  result: { score: number; passed: boolean; xp: number; coins: number; rewardItemId: string | null },
): Promise<{ profile: PlayerProfile; firstClear: boolean; rewardItemId: string | null }> {
  await ensureSchema();
  const connection = await getPool().getConnection();
  let firstClear = false;
  let awardedItem: string | null = null;
  try {
    await connection.beginTransaction();
    const [rows] = await connection.execute<ProfileRow[]>(
      `SELECT open_id, display_name, unlocked_stage, xp, coins, completed_stages, unlocked_items, equipped_items FROM player_profiles WHERE open_id = ? FOR UPDATE`,
      [openId],
    );
    if (!rows[0]) throw new Error("Player profile not found");
    const profile = toProfile(rows[0]);
    if (stageId > profile.unlockedStage) throw new Error("stage_locked");

    const completed = new Set(profile.completedStages);
    firstClear = result.passed && !completed.has(stageId);
    if (firstClear) {
      completed.add(stageId);
      const unlockedItems = new Set(profile.unlockedItems);
      if (result.rewardItemId) {
        unlockedItems.add(result.rewardItemId);
        awardedItem = result.rewardItemId;
      }
      const nextStage = Math.min(MAX_STAGE, Math.max(profile.unlockedStage, stageId + 1));
      await connection.execute(
        `UPDATE player_profiles SET unlocked_stage = ?, xp = xp + ?, coins = coins + ?, completed_stages = CAST(? AS JSON), unlocked_items = CAST(? AS JSON) WHERE open_id = ?`,
        [nextStage, Math.max(0, Math.min(result.xp, 500)), Math.max(0, Math.min(result.coins, 250)), JSON.stringify([...completed].sort((a, b) => a - b)), JSON.stringify([...unlockedItems]), openId],
      );
    } else if (result.passed && profile.completedStages.includes(stageId)) {
      // Replays do not grant duplicate first-clear rewards.
    }
    await connection.commit();
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
  const updated = await findProfile(openId);
  if (!updated) throw new Error("Unable to reload player profile");
  return { profile: updated, firstClear, rewardItemId: awardedItem };
}

export async function checkDatabase(): Promise<void> {
  await ensureSchema();
  await getPool().query("SELECT 1");
}
