import { spawn } from "child_process";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const agents = ["wernicke", "norm", "engram", "broca", "glia"] as const;

console.log("Starting Cortex Band workers…");

for (const agent of agents) {
  const child = spawn("npx", ["tsx", join(__dirname, "agents", `${agent}.ts`)], {
    stdio: "inherit",
    env: process.env,
  });
  child.on("exit", (code) => {
    console.error(`[${agent}] worker exited with code ${code ?? 0}`);
  });
}
