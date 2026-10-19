import "server-only";

const BASE_URL = process.env.PLEARNY_PYTHON_URL || "http://127.0.0.1:8000";

type JsonObject = Record<string, unknown>;

async function requestJson<T extends JsonObject>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${BASE_URL}${path}`, {
    ...init,
    cache: "no-store",
    signal: AbortSignal.timeout(8_000),
    headers: { "Content-Type": "application/json", ...init?.headers },
  });
  const body = await response.json().catch(() => ({})) as T & { error?: string };
  if (!response.ok) throw new Error(body.error || `Python service returned ${response.status}`);
  return body;
}

export type GameStage = {
  id: number;
  title: string;
  zone: string;
  emoji: string;
  skill: string;
  operation: string;
  story: string;
  reward_item_id: string;
  question_count: number;
  pass_score: number;
};

export type GameItem = {
  id: string;
  name: string;
  slot: "pet" | "outfit" | "accessory" | "effect";
  category: string;
  icon: string;
  rarity: "common" | "rare" | "epic" | "legendary";
  unlock_stage: number;
  starter: boolean;
};

export type GameQuestion = { id: string; prompt: string; hint: string; choices: string[] };
export type GradeResult = {
  stage_id: number;
  score: number;
  total: number;
  passed: boolean;
  xp: number;
  coins: number;
  reward_item_id: string | null;
  answers: { question_id: string; correct: boolean; correct_answer: string }[];
};

export async function getGameCatalog(): Promise<{ levels: GameStage[]; items: GameItem[] }> {
  const [levels, items] = await Promise.all([
    requestJson<{ levels: GameStage[] }>("/levels"),
    requestJson<{ items: GameItem[] }>("/items"),
  ]);
  return { levels: levels.levels, items: items.items };
}

export async function createGameAttempt(stageId: number, attemptId: string): Promise<{ attempt_id: string; stage: GameStage; questions: GameQuestion[] }> {
  return requestJson(`/levels/${stageId}/attempt?attempt_id=${encodeURIComponent(attemptId)}`);
}

export async function gradeGameAttempt(stageId: number, attemptId: string, answers: { question_id: string; answer: string }[]): Promise<GradeResult> {
  return requestJson(`/levels/${stageId}/grade`, {
    method: "POST",
    body: JSON.stringify({ attempt_id: attemptId, answers }),
  });
}

export async function pingPythonService(): Promise<void> {
  await requestJson<{ status: string }>("/health");
}
