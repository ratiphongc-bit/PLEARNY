import { spawnSync } from "node:child_process";
import { ensurePython } from "./ensure-python.mjs";

const result = spawnSync(ensurePython(), ["-m", "unittest", "backend.test_main", "-v"], {
  stdio: "inherit",
  env: process.env,
});
if (result.error) throw result.error;
process.exitCode = result.status ?? 1;
