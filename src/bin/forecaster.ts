import chalk from "chalk";
import { fixtureByCode, WC26_OPENERS } from "../registry/schedule.js";
import { MockAnalyst } from "../providers/MockAnalyst.js";
import { OpenAiAnalyst } from "../providers/OpenAiAnalyst.js";
import { ForecastPipeline } from "../pipeline/ForecastPipeline.js";
import { AI_SETTINGS } from "../config/aiSettings.js";
import { cacheFlushNamespace } from "../utils/redisCache.js";
import { closeRedisClient, isRedisEnabled, pingRedis } from "../utils/redis.js";

async function main() {
  const argv = process.argv.slice(2);
  const useCache = !argv.includes("--no-cache");
  const [cmd, code] = argv.filter((a) => a !== "--no-cache");

  if (cmd === "redis" && code === "ping") {
    if (!isRedisEnabled()) {
      console.log(chalk.yellow("Redis disabled. Set REDIS_URL or REDIS_HOST."));
      return;
    }
    console.log((await pingRedis()) ? chalk.green("Redis PONG") : chalk.red("Redis unreachable"));
    return;
  }
  if (cmd === "redis" && code === "flush") {
    const n = await cacheFlushNamespace();
    console.log(chalk.green(`Flushed ${n} Redis key(s)`));
    return;
  }

  const provider = AI_SETTINGS.useMock || !AI_SETTINGS.apiKey
    ? new MockAnalyst()
    : new OpenAiAnalyst(AI_SETTINGS.apiKey, AI_SETTINGS.model);

  const pipeline = new ForecastPipeline(provider, AI_SETTINGS.blendWeight);

  if (cmd === "ask" && code) {
    const f = fixtureByCode(code);
    if (!f) { console.log(chalk.red("Unknown fixture")); return; }
    const r = await pipeline.run(f, useCache);
    console.log(chalk.cyan(`\n${f.homeCode} vs ${f.awayCode} (${r.provider})`));
    console.log(`  Home ${(r.homePct * 100).toFixed(1)}%  Draw ${(r.drawPct * 100).toFixed(1)}%  Away ${(r.awayPct * 100).toFixed(1)}%`);
    console.log(chalk.gray(`  ${r.narrative}`));
    return;
  }
  if (cmd === "batch") {
    const results = await pipeline.runBatch(WC26_OPENERS, useCache);
    for (const r of results) console.log(`${r.provider}: ${(r.homePct * 100).toFixed(0)}% home`);
    return;
  }
  console.log("WC2026 AI Hybrid Forecaster");
  console.log("  ask <code>    Blend AI + statistical prior for fixture");
  console.log("  batch         Run all opening fixtures");
  console.log("  redis ping    Check Redis connection");
  console.log("  redis flush   Clear wc2026-forecaster:* cache keys");
  console.log("  --no-cache    Bypass Redis/memory cache");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await closeRedisClient(); });
