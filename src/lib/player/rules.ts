export const MAX_HEARTS = 5;
export const HEART_REGEN_INTERVAL_MS = 30 * 60 * 1000;

export type HeartState = {
  hearts: number;
  heartRegenAtMs: number | null;
};

export function regenerateHearts(hearts: number, heartRegenAtMs: number | null, nowMs: number): HeartState {
  const current = Math.max(0, Math.min(MAX_HEARTS, Math.trunc(hearts)));
  if (current >= MAX_HEARTS) return { hearts: MAX_HEARTS, heartRegenAtMs: null };
  const nextAt = heartRegenAtMs ?? nowMs + HEART_REGEN_INTERVAL_MS;
  if (nowMs < nextAt) return { hearts: current, heartRegenAtMs: nextAt };

  const restored = 1 + Math.floor((nowMs - nextAt) / HEART_REGEN_INTERVAL_MS);
  const nextHearts = Math.min(MAX_HEARTS, current + restored);
  const nextRegenAt = nextHearts >= MAX_HEARTS ? null : nextAt + restored * HEART_REGEN_INTERVAL_MS;
  return { hearts: nextHearts, heartRegenAtMs: nextRegenAt };
}

export function applyHeartLoss(hearts: number, heartRegenAtMs: number | null, wrongAnswers: number, nowMs: number): HeartState {
  const regenerated = regenerateHearts(hearts, heartRegenAtMs, nowMs);
  const loss = Math.max(0, Math.min(regenerated.hearts, Math.trunc(wrongAnswers)));
  const nextHearts = regenerated.hearts - loss;
  const nextRegenAt = nextHearts >= MAX_HEARTS
    ? null
    : regenerated.heartRegenAtMs ?? nowMs + HEART_REGEN_INTERVAL_MS;
  return { hearts: nextHearts, heartRegenAtMs: nextRegenAt };
}

export type StreakState = {
  streakDays: number;
  longestStreak: number;
  lastActiveDate: string;
};

function previousDate(day: string): string {
  const [year, month, date] = day.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, date - 1)).toISOString().slice(0, 10);
}

export function recordDailyActivity(
  streakDays: number,
  longestStreak: number,
  lastActiveDate: string | null,
  today: string,
): StreakState {
  if (lastActiveDate === today) {
    return { streakDays, longestStreak: Math.max(longestStreak, streakDays), lastActiveDate: today };
  }
  const nextStreak = lastActiveDate === previousDate(today) ? streakDays + 1 : 1;
  return {
    streakDays: nextStreak,
    longestStreak: Math.max(longestStreak, nextStreak),
    lastActiveDate: today,
  };
}

export function bangkokDate(nowMs: number): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Bangkok",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date(nowMs));
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${values.year}-${values.month}-${values.day}`;
}

export type AttemptAnswer = { questionId: string; value: string };

export function appendAttemptAnswer(answers: AttemptAnswer[], next: AttemptAnswer): { answers: AttemptAnswer[]; alreadyAnswered: boolean } {
  const existing = answers.find((answer) => answer.questionId === next.questionId);
  if (existing) {
    if (existing.value !== next.value) throw new Error("answer_locked");
    return { answers, alreadyAnswered: true };
  }
  return { answers: [...answers, next], alreadyAnswered: false };
}
