import { connectRedis } from "./src/server/persistence/redis/client";
async function run() {
  try {
    const r = await connectRedis();
    console.log("Redis connected!");
    process.exit(0);
  } catch (e) {
    console.error("Redis failed:", e);
    process.exit(1);
  }
}
run();
