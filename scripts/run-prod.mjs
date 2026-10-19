import { spawn } from "node:child_process";
import { ensurePython } from "./ensure-python.mjs";

const python = ensurePython();
const port = process.env.PORT || "3000";
const children = [];
let stopping = false;

function stopAll(signal = "SIGTERM") {
  if (stopping) return;
  stopping = true;
  for (const child of children) if (!child.killed) child.kill(signal);
}

function start(command, args, label) {
  const child = spawn(command, args, { stdio: "inherit", env: process.env });
  children.push(child);
  child.on("exit", (code, signal) => {
    if (stopping) return;
    console.error(`[${label}] exited (${signal || code}); stopping companion service`);
    process.exitCode = code ?? 1;
    stopAll();
  });
  return child;
}

process.on("SIGINT", () => stopAll("SIGINT"));
process.on("SIGTERM", () => stopAll("SIGTERM"));

start(python, ["-m", "uvicorn", "backend.main:app", "--host", "127.0.0.1", "--port", "8000", "--no-access-log", "--log-level", "warning"], "python");
const deadline = Date.now() + 15_000;
let ready = false;
while (Date.now() < deadline && !stopping) {
  try {
    const response = await fetch("http://127.0.0.1:8000/health", { signal: AbortSignal.timeout(500) });
    if (response.ok) { ready = true; break; }
  } catch {
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
}
if (!ready) {
  console.error("Python game service did not become ready within 15 seconds");
  stopAll();
  process.exit(1);
}
start(process.execPath, ["node_modules/next/dist/bin/next", "start", "--hostname", "0.0.0.0", "--port", port], "next");
