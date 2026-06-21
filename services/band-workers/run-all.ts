import { spawn } from "child_process";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { config as loadEnv } from "dotenv";

const __dirname = dirname(fileURLToPath(import.meta.url));
const agents = ["wernicke", "norm", "engram", "broca", "glia"] as const;
const children = new Set<ReturnType<typeof spawn>>();

loadEnv({ path: join(__dirname, "../../.env.local") });
loadEnv({ path: join(__dirname, "../../.env") });

const required = [
  "NEXT_PUBLIC_APP_URL",
  "BAND_SYNC_SECRET",
  "BAND_AGENT_HANDLE_PREFIX",
  ...agents.flatMap((agent) => [
    `BAND_${agent.toUpperCase()}_AGENT_ID`,
    `BAND_${agent.toUpperCase()}_API_KEY`,
  ]),
];
const missing = required.filter((key) => !process.env[key]?.trim());
if (missing.length > 0) {
  console.error(`Missing Band worker variables: ${missing.join(", ")}`);
  process.exit(1);
}

console.log("Starting Cortex Band workers…");
for (const agent of agents) {
  const child = spawn("npx", ["tsx", join(__dirname, "agents", `${agent}.ts`)], {
    stdio: "inherit",
    env: process.env,
  });
  children.add(child);
  child.on("exit", (code) => {
    console.error(`[${agent}] worker exited with code ${code ?? 0}`);
    for (const running of children) running.kill("SIGTERM");
    process.exit(code ?? 1);
  });
}

function shutdown(signal: NodeJS.Signals) {
  console.log(`Received ${signal}; stopping Band workers`);
  for (const child of children) child.kill(signal);
}

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
