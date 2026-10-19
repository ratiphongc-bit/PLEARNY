import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import ts from "typescript";

const require = createRequire(import.meta.url);
const sourcePath = fileURLToPath(new URL("../src/lib/player/rules.ts", import.meta.url));
const source = readFileSync(sourcePath, "utf8");
const compiled = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText;
const compiledModule = { exports: {} };
new Function("exports", "require", "module", compiled)(compiledModule.exports, require, compiledModule);
const { MAX_HEARTS, HEART_REGEN_INTERVAL_MS, regenerateHearts, applyHeartLoss, recordDailyActivity, bangkokDate, appendAttemptAnswer } = compiledModule.exports;

const now = Date.UTC(2026, 9, 20, 0, 0, 0);
assert.deepEqual(regenerateHearts(MAX_HEARTS, null, now), { hearts: 5, heartRegenAtMs: null });
assert.deepEqual(applyHeartLoss(5, null, 1, now), { hearts: 4, heartRegenAtMs: now + HEART_REGEN_INTERVAL_MS });
assert.deepEqual(regenerateHearts(4, now + HEART_REGEN_INTERVAL_MS, now + HEART_REGEN_INTERVAL_MS), { hearts: 5, heartRegenAtMs: null });
assert.deepEqual(regenerateHearts(1, now, now + HEART_REGEN_INTERVAL_MS * 2), { hearts: 4, heartRegenAtMs: now + HEART_REGEN_INTERVAL_MS * 3 });
assert.deepEqual(applyHeartLoss(1, now + HEART_REGEN_INTERVAL_MS, 4, now), { hearts: 0, heartRegenAtMs: now + HEART_REGEN_INTERVAL_MS });
assert.deepEqual(recordDailyActivity(3, 5, "2026-10-20", "2026-10-20"), { streakDays: 3, longestStreak: 5, lastActiveDate: "2026-10-20" });
assert.deepEqual(recordDailyActivity(3, 5, "2026-10-19", "2026-10-20"), { streakDays: 4, longestStreak: 5, lastActiveDate: "2026-10-20" });
assert.deepEqual(recordDailyActivity(3, 5, "2026-10-18", "2026-10-20"), { streakDays: 1, longestStreak: 5, lastActiveDate: "2026-10-20" });
assert.deepEqual(recordDailyActivity(0, 0, null, "2026-10-20"), { streakDays: 1, longestStreak: 1, lastActiveDate: "2026-10-20" });
assert.equal(bangkokDate(Date.UTC(2026, 9, 19, 17, 0, 0)), "2026-10-20");
const firstAnswer = { questionId: "s1-q1", value: "4" };
const once = appendAttemptAnswer([], firstAnswer);
assert.deepEqual(once, { answers: [firstAnswer], alreadyAnswered: false });
assert.deepEqual(appendAttemptAnswer(once.answers, firstAnswer), { answers: [firstAnswer], alreadyAnswered: true });
assert.throws(() => appendAttemptAnswer(once.answers, { questionId: "s1-q1", value: "5" }), /answer_locked/);
console.log("Player rule tests passed (heart regeneration/loss and Bangkok daily streak).");
