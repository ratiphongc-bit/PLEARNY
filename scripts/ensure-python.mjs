import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");

function run(command, args) {
  const result = spawnSync(command, args, {
    cwd: projectRoot,
    env: process.env,
    stdio: "inherit",
  });
  if (result.error) throw result.error;
  if (result.status !== 0) throw new Error(`Python setup command failed (${command})`);
}

function canImport(command) {
  const result = spawnSync(command, ["-c", "import fastapi, uvicorn"], {
    cwd: projectRoot,
    env: process.env,
    stdio: "ignore",
  });
  return result.status === 0;
}

export function ensurePython() {
  const systemPython = process.env.PYTHON || "python3";
  if (canImport(systemPython)) return systemPython;

  const venvDirectory = resolve(projectRoot, ".venv");
  const venvPython = process.platform === "win32"
    ? resolve(venvDirectory, "Scripts", "python.exe")
    : resolve(venvDirectory, "bin", "python");

  if (!existsSync(venvPython)) run(systemPython, ["-m", "venv", ".venv"]);
  if (!canImport(venvPython)) {
    run(venvPython, ["-m", "pip", "install", "--disable-pip-version-check", "-r", "requirements.txt"]);
  }
  if (!canImport(venvPython)) throw new Error("FastAPI/Uvicorn are unavailable after installing requirements.txt");
  return venvPython;
}
