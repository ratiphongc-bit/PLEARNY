import { spawn } from "node:child_process";
import { ensurePython } from "./ensure-python.mjs";

const python = ensurePython();
const port = process.env.PORT || "3000";
const children = [];
let stopping = false;

function start(command, args, label) {
  const child = spawn(command, args, { stdio: "inherit", env: process.env });
  children.push(child);
  child.on("exit", (code, signal) => {
    if (stopping) return;
    stopping = true;
    console.error(`[${label}] exited (${signal || code}); stopping companion service`);
    for (const running of children) if (running !== child && !running.killed) running.kill("SIGTERM");
    process.exitCode = code ?? 1;
  });
  return child;
}

function stop(signal = "SIGTERM") {
  if (stopping) return;
  stopping = true;
  for (const child of children) if (!child.killed) child.kill(signal);
}

process.on("SIGINT", () => stop("SIGINT"));
process.on("SIGTERM", () => stop("SIGTERM"));

start(python, ["-m", "uvicorn", "backend.main:app", "--host", "127.0.0.1", "--port", "8000", "--no-access-log"], "python");
start(process.execPath, ["node_modules/next/dist/bin/next", "dev", "--hostname", "0.0.0.0", "--port", port], "next");
