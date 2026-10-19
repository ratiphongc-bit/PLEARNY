import "server-only";
import mysql, { type Pool, type PoolConnection, type RowDataPacket } from "mysql2/promise";
import { applyHeartLoss, bangkokDate, regenerateHearts, recordDailyActivity } from "./rules";

export type PlayerProfile = {
  openId: string;
  displayName: string;
  unlockedStage: number;
  xp: number;
  coins: number;
  hearts: number;
  heartRegenAtMs: number | null;
  streakDays: number;
  longestStreak: number;
  lastActiveDate: string | null;
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
  hearts: number;
  heart_regen_at_ms: number | string | null;
  streak_days: number;
  longest_streak: number;
  last_active_date: string | null;
  completed_stages: unknown;
  unlocked_items: unknown;
  equipped_items: unknown;
};

type PlayerAttemptRow = RowDataPacket & {
  attempt_id: string;
  open_id: string;
  stage_id: number;
  answers: unknown;
  completed_at_ms: number | string | null;
  result_json: unknown;
};

type StoredAnswer = { answer: string; correct: boolean };
type StoredAnswers = Record<string, StoredAnswer>;
type SubmittedAnswer = { questionId: string; value: string };
type GradeResultForStore = {
  stage_id: number;
  score: number;
  total: number;
  passed: boolean;
  xp: number;
  coins: number;
  reward_item_id: string | null;
  answers: { question_id: string; correct: boolean; correct_answer: string }[];
};
type PersistedCompletion = { result: GradeResultForStore; firstClear: boolean; rewardItemId: string | null };

function submittedAnswersMatch(recorded: StoredAnswers, submittedAnswers: SubmittedAnswer[]): boolean {
  if (Object.keys(recorded).length !== 5 || submittedAnswers.length !== 5) return false;
  const submitted = new Map(submittedAnswers.map((entry) => [entry.questionId, entry.value]));
  return submitted.size === 5 && Object.entries(recorded).every(([questionId, entry]) => submitted.get(questionId) === entry.answer);
}

let pool: Pool | undefined;
let schemaPromise: Promise<void> | undefined;
const STARTER_ITEMS = ["pet_sparky", "outfit_scout"];
const MAX_STAGE = 12;
const XP_PER_LEVEL = 250;
const MIGRATION_LOCK = "plearny_player_schema_v2";
const PROFILE_SELECT = `SELECT open_id, display_name, unlocked_stage, xp, coins, hearts, heart_regen_at_ms, streak_days, longest_streak, last_active_date, completed_stages, unlocked_items, equipped_items FROM player_profiles WHERE open_id = ?`;
const PLAYER_TABLE_SQL = `
  CREATE TABLE IF NOT EXISTS player_profiles (
    open_id VARCHAR(191) NOT NULL PRIMARY KEY,
    display_name VARCHAR(255) NOT NULL,
    unlocked_stage TINYINT UNSIGNED NOT NULL DEFAULT 1,
    xp INT UNSIGNED NOT NULL DEFAULT 0,
    coins INT UNSIGNED NOT NULL DEFAULT 0,
    hearts TINYINT UNSIGNED NOT NULL DEFAULT 5,
    heart_regen_at_ms BIGINT UNSIGNED NULL,
    streak_days SMALLINT UNSIGNED NOT NULL DEFAULT 0,
    longest_streak SMALLINT UNSIGNED NOT NULL DEFAULT 0,
    last_active_date CHAR(10) NULL,
    completed_stages JSON NOT NULL,
    unlocked_items JSON NOT NULL,
    equipped_items JSON NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
`;
const ATTEMPTS_TABLE_SQL = `
  CREATE TABLE IF NOT EXISTS player_game_attempts (
    attempt_id VARCHAR(80) NOT NULL PRIMARY KEY,
    open_id VARCHAR(191) NOT NULL,
    stage_id TINYINT UNSIGNED NOT NULL,
    answers JSON NOT NULL,
    created_at_ms BIGINT UNSIGNED NOT NULL,
    completed_at_ms BIGINT UNSIGNED NULL,
    result_json JSON NULL,
    KEY idx_player_game_attempts_owner (open_id, created_at_ms)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
`;
const ADDITIONAL_COLUMNS = [
  { name: "hearts", definition: "TINYINT UNSIGNED NOT NULL DEFAULT 5" },
  { name: "heart_regen_at_ms", definition: "BIGINT UNSIGNED NULL" },
  { name: "streak_days", definition: "SMALLINT UNSIGNED NOT NULL DEFAULT 0" },
  { name: "longest_streak", definition: "SMALLINT UNSIGNED NOT NULL DEFAULT 0" },
  { name: "last_active_date", definition: "CHAR(10) NULL" },
] as const;

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
      const connection = await getPool().getConnection();
      let lockAcquired = false;
      try {
        const [lockRows] = await connection.query<RowDataPacket[]>("SELECT GET_LOCK(?, 15) AS acquired", [MIGRATION_LOCK]);
        lockAcquired = Number(lockRows[0]?.acquired) === 1;
        if (!lockAcquired) throw new Error("Unable to acquire player schema migration lock");

        await connection.query("CREATE TABLE IF NOT EXISTS plearny_schema_migrations (version VARCHAR(64) NOT NULL PRIMARY KEY, applied_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci");
        await connection.query(PLAYER_TABLE_SQL);
        for (const column of ADDITIONAL_COLUMNS) {
          const [rows] = await connection.execute<RowDataPacket[]>(
            "SELECT 1 FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND COLUMN_NAME = ? LIMIT 1",
            ["player_profiles", column.name],
          );
          if (rows.length === 0) await connection.query(`ALTER TABLE player_profiles ADD COLUMN ${column.name} ${column.definition}`);
        }
        await connection.query(ATTEMPTS_TABLE_SQL);
        const [resultColumns] = await connection.execute<RowDataPacket[]>(
          "SELECT 1 FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND COLUMN_NAME = ? LIMIT 1",
          ["player_game_attempts", "result_json"],
        );
        if (resultColumns.length === 0) await connection.query("ALTER TABLE player_game_attempts ADD COLUMN result_json JSON NULL");
        await connection.execute("INSERT IGNORE INTO plearny_schema_migrations (version) VALUES (?)", ["001_player_profiles"]);
        await connection.execute("INSERT IGNORE INTO plearny_schema_migrations (version) VALUES (?)", ["002_player_hearts_streak_attempts"]);
        await connection.execute("INSERT IGNORE INTO plearny_schema_migrations (version) VALUES (?)", ["003_player_attempt_result_replay"]);
      } finally {
        if (lockAcquired) await connection.query("SELECT RELEASE_LOCK(?)", [MIGRATION_LOCK]).catch(() => undefined);
        connection.release();
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
  const regenAt = row.heart_regen_at_ms === null ? null : Number(row.heart_regen_at_ms);
  return {
    openId: row.open_id,
    displayName: row.display_name,
    unlockedStage: Math.max(1, Math.min(MAX_STAGE, Number(row.unlocked_stage) || 1)),
    xp,
    coins: Number(row.coins) || 0,
    hearts: Math.max(0, Math.min(5, Number(row.hearts) || 0)),
    heartRegenAtMs: regenAt !== null && Number.isFinite(regenAt) ? regenAt : null,
    streakDays: Math.max(0, Number(row.streak_days) || 0),
    longestStreak: Math.max(0, Number(row.longest_streak) || 0),
    lastActiveDate: row.last_active_date ? String(row.last_active_date).slice(0, 10) : null,
    completedStages: parseJson<number[]>(row.completed_stages, []),
    unlockedItems: parseJson<string[]>(row.unlocked_items, STARTER_ITEMS),
    equippedItems: parseJson<Record<string, string>>(row.equipped_items, { pet: "pet_sparky", outfit: "outfit_scout" }),
    playerLevel: Math.floor(xp / XP_PER_LEVEL) + 1,
    xpInLevel: xp % XP_PER_LEVEL,
    xpForNextLevel: XP_PER_LEVEL,
  };
}

async function findProfile(openId: string, lock = false): Promise<PlayerProfile | null> {
  const [rows] = await getPool().execute<ProfileRow[]>(`${PROFILE_SELECT}${lock ? " FOR UPDATE" : ""}`, [openId]);
  return rows[0] ? toProfile(rows[0]) : null;
}

async function findProfileInTransaction(connection: PoolConnection, openId: string): Promise<PlayerProfile | null> {
  const [rows] = await connection.execute<ProfileRow[]>(`${PROFILE_SELECT} FOR UPDATE`, [openId]);
  return rows[0] ? toProfile(rows[0]) : null;
}

async function updateHeartState(connection: PoolConnection, openId: string, hearts: number, heartRegenAtMs: number | null): Promise<void> {
  await connection.execute("UPDATE player_profiles SET hearts = ?, heart_regen_at_ms = ? WHERE open_id = ?", [hearts, heartRegenAtMs, openId]);
}

export async function getPlayerProfile(openId: string, displayName: string): Promise<PlayerProfile> {
  await ensureSchema();
  const safeName = displayName.trim().slice(0, 100) || "นักผจญภัย";
  await getPool().execute(
    `INSERT INTO player_profiles (open_id, display_name, unlocked_stage, xp, coins, hearts, heart_regen_at_ms, streak_days, longest_streak, last_active_date, completed_stages, unlocked_items, equipped_items)
     VALUES (?, ?, 1, 0, 0, 5, NULL, 0, 0, NULL, JSON_ARRAY(), JSON_ARRAY('pet_sparky','outfit_scout'), JSON_OBJECT('pet','pet_sparky','outfit','outfit_scout'))
     ON DUPLICATE KEY UPDATE display_name = VALUES(display_name)`,
    [openId, safeName],
  );

  const connection = await getPool().getConnection();
  try {
    await connection.beginTransaction();
    const profile = await findProfileInTransaction(connection, openId);
    if (!profile) throw new Error("Unable to load player profile");
    const heartState = regenerateHearts(profile.hearts, profile.heartRegenAtMs, Date.now());
    if (heartState.hearts !== profile.hearts || heartState.heartRegenAtMs !== profile.heartRegenAtMs) {
      await updateHeartState(connection, openId, heartState.hearts, heartState.heartRegenAtMs);
    }
    await connection.commit();
    return { ...profile, ...heartState };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

export async function equipPlayerItem(openId: string, itemId: string | null, slot: string): Promise<PlayerProfile> {
  await ensureSchema();
  const connection = await getPool().getConnection();
  let displayName = "นักผจญภัย";
  try {
    await connection.beginTransaction();
    const profile = await findProfileInTransaction(connection, openId);
    if (!profile) throw new Error("Player profile not found");
    displayName = profile.displayName;
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
  return getPlayerProfile(openId, displayName);
}

export async function createPlayerAttempt(openId: string, stageId: number, attemptId: string): Promise<void> {
  await ensureSchema();
  const connection = await getPool().getConnection();
  try {
    await connection.beginTransaction();
    const profile = await findProfileInTransaction(connection, openId);
    if (!profile) throw new Error("Player profile not found");
    if (stageId > profile.unlockedStage) throw new Error("stage_locked");
    const heartState = regenerateHearts(profile.hearts, profile.heartRegenAtMs, Date.now());
    if (heartState.hearts !== profile.hearts || heartState.heartRegenAtMs !== profile.heartRegenAtMs) {
      await updateHeartState(connection, openId, heartState.hearts, heartState.heartRegenAtMs);
    }
    if (heartState.hearts < 1) throw new Error("no_hearts");
    await connection.execute(
      "INSERT INTO player_game_attempts (attempt_id, open_id, stage_id, answers, created_at_ms, completed_at_ms) VALUES (?, ?, ?, CAST(? AS JSON), ?, NULL)",
      [attemptId, openId, stageId, "{}", Date.now()],
    );
    await connection.commit();
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

export async function recordPlayerAnswer(
  openId: string,
  displayName: string,
  stageId: number,
  attemptId: string,
  questionId: string,
  answer: string,
  correct: boolean,
): Promise<{ profile: PlayerProfile; correct: boolean; alreadyAnswered: boolean }> {
  await ensureSchema();
  const connection = await getPool().getConnection();
  let recordedCorrect = correct;
  let alreadyAnswered = false;
  try {
    await connection.beginTransaction();
    const [attemptRows] = await connection.execute<PlayerAttemptRow[]>(
      "SELECT attempt_id, open_id, stage_id, answers, completed_at_ms FROM player_game_attempts WHERE attempt_id = ? AND open_id = ? AND stage_id = ? FOR UPDATE",
      [attemptId, openId, stageId],
    );
    const attempt = attemptRows[0];
    if (!attempt) throw new Error("attempt_not_found");
    if (attempt.completed_at_ms !== null) throw new Error("attempt_completed");

    const answers = parseJson<StoredAnswers>(attempt.answers, {});
    const existing = answers[questionId];
    const profile = await findProfileInTransaction(connection, openId);
    if (!profile) throw new Error("Player profile not found");
    const now = Date.now();
    const heartState = existing
      ? regenerateHearts(profile.hearts, profile.heartRegenAtMs, now)
      : applyHeartLoss(profile.hearts, profile.heartRegenAtMs, correct ? 0 : 1, now);

    if (existing) {
      if (existing.answer !== answer) throw new Error("answer_locked");
      recordedCorrect = existing.correct;
      alreadyAnswered = true;
    } else {
      answers[questionId] = { answer, correct };
      await connection.execute("UPDATE player_game_attempts SET answers = CAST(? AS JSON) WHERE attempt_id = ?", [JSON.stringify(answers), attemptId]);
    }

    if (heartState.hearts !== profile.hearts || heartState.heartRegenAtMs !== profile.heartRegenAtMs) {
      await updateHeartState(connection, openId, heartState.hearts, heartState.heartRegenAtMs);
    }
    await connection.commit();
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }

  return {
    profile: await getPlayerProfile(openId, displayName),
    correct: recordedCorrect,
    alreadyAnswered,
  };
}

export async function getCompletedAttemptResult(
  openId: string,
  displayName: string,
  stageId: number,
  attemptId: string,
  submittedAnswers: SubmittedAnswer[],
): Promise<(PersistedCompletion & { profile: PlayerProfile }) | null> {
  await ensureSchema();
  const [rows] = await getPool().execute<PlayerAttemptRow[]>(
    "SELECT attempt_id, open_id, stage_id, answers, completed_at_ms, result_json FROM player_game_attempts WHERE attempt_id = ? AND open_id = ? AND stage_id = ?",
    [attemptId, openId, stageId],
  );
  const attempt = rows[0];
  if (!attempt || attempt.completed_at_ms === null) return null;
  const recorded = parseJson<StoredAnswers>(attempt.answers, {});
  if (!submittedAnswersMatch(recorded, submittedAnswers)) throw new Error("answers_mismatch");
  const completion = parseJson<PersistedCompletion | null>(attempt.result_json, null);
  if (!completion) return null;
  return { ...completion, profile: await getPlayerProfile(openId, displayName) };
}

export async function applyStageResult(
  openId: string,
  stageId: number,
  attemptId: string,
  submittedAnswers: SubmittedAnswer[],
  result: GradeResultForStore,
): Promise<{ profile: PlayerProfile; firstClear: boolean; rewardItemId: string | null; result: GradeResultForStore }> {
  await ensureSchema();
  const connection = await getPool().getConnection();
  let firstClear = false;
  let awardedItem: string | null = null;
  try {
    await connection.beginTransaction();
    const [attemptRows] = await connection.execute<PlayerAttemptRow[]>(
      "SELECT attempt_id, open_id, stage_id, answers, completed_at_ms, result_json FROM player_game_attempts WHERE attempt_id = ? AND open_id = ? AND stage_id = ? FOR UPDATE",
      [attemptId, openId, stageId],
    );
    const attempt = attemptRows[0];
    if (!attempt) throw new Error("attempt_not_found");
    const recorded = parseJson<StoredAnswers>(attempt.answers, {});
    if (result.total !== 5 || !submittedAnswersMatch(recorded, submittedAnswers)) throw new Error("incomplete_attempt");
    if (attempt.completed_at_ms !== null) {
      const replay = parseJson<PersistedCompletion | null>(attempt.result_json, null);
      if (!replay) throw new Error("attempt_completed");
      const replayProfile = await findProfileInTransaction(connection, openId);
      if (!replayProfile) throw new Error("Player profile not found");
      await connection.commit();
      return { ...replay, profile: replayProfile };
    }

    const profile = await findProfileInTransaction(connection, openId);
    if (!profile) throw new Error("Player profile not found");
    if (stageId > profile.unlockedStage) throw new Error("stage_locked");

    const now = Date.now();
    const heartState = regenerateHearts(profile.hearts, profile.heartRegenAtMs, now);
    const streak = recordDailyActivity(profile.streakDays, profile.longestStreak, profile.lastActiveDate, bangkokDate(now));
    const completed = new Set(profile.completedStages);
    firstClear = result.passed && !completed.has(stageId);
    if (firstClear) completed.add(stageId);
    const unlockedItems = new Set(profile.unlockedItems);
    if (firstClear && result.reward_item_id) {
      unlockedItems.add(result.reward_item_id);
      awardedItem = result.reward_item_id;
    }
    const nextStage = firstClear ? Math.min(MAX_STAGE, Math.max(profile.unlockedStage, stageId + 1)) : profile.unlockedStage;
    const xp = firstClear ? Math.max(0, Math.min(result.xp, 500)) : 0;
    const coins = firstClear ? Math.max(0, Math.min(result.coins, 250)) : 0;

    await connection.execute(
      `UPDATE player_profiles SET hearts = ?, heart_regen_at_ms = ?, streak_days = ?, longest_streak = ?, last_active_date = ?, unlocked_stage = ?, xp = xp + ?, coins = coins + ?, completed_stages = CAST(? AS JSON), unlocked_items = CAST(? AS JSON) WHERE open_id = ?`,
      [heartState.hearts, heartState.heartRegenAtMs, streak.streakDays, streak.longestStreak, streak.lastActiveDate, nextStage, xp, coins, JSON.stringify([...completed].sort((a, b) => a - b)), JSON.stringify([...unlockedItems]), openId],
    );
    const completion: PersistedCompletion = { result, firstClear, rewardItemId: awardedItem };
    await connection.execute("UPDATE player_game_attempts SET completed_at_ms = ?, result_json = CAST(? AS JSON) WHERE attempt_id = ?", [now, JSON.stringify(completion), attemptId]);
    await connection.commit();
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
  const updated = await findProfile(openId);
  if (!updated) throw new Error("Unable to reload player profile");
  return { profile: updated, firstClear, rewardItemId: awardedItem, result };
}

export async function checkDatabase(): Promise<void> {
  await ensureSchema();
  await getPool().query("SELECT 1");
}
