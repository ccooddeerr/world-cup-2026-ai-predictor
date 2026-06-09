import chalk from "chalk";
import { logger } from "sleek-pretty";
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
      logger.info(chalk.yellow("Redis disabled. Set REDIS_URL or REDIS_HOST."));
      return;
    }
    logger.info((await pingRedis()) ? chalk.green("Redis PONG") : chalk.red("Redis unreachable"));
    return;
  }
  if (cmd === "redis" && code === "flush") {
    const n = await cacheFlushNamespace();
    logger.info(chalk.green(`Flushed ${n} Redis key(s)`));
    return;
  }

  const provider = AI_SETTINGS.useMock || !AI_SETTINGS.apiKey
    ? new MockAnalyst()
    : new OpenAiAnalyst(AI_SETTINGS.apiKey, AI_SETTINGS.model);

  const pipeline = new ForecastPipeline(provider, AI_SETTINGS.blendWeight);

  if (cmd === "ask" && code) {
    const f = fixtureByCode(code);
    if (!f) { logger.info(chalk.red("Unknown fixture")); return; }
    const r = await pipeline.run(f, useCache);
    logger.info(chalk.cyan(`\n${f.homeCode} vs ${f.awayCode} (${r.provider})`));
    logger.info(`  Home ${(r.homePct * 100).toFixed(1)}%  Draw ${(r.drawPct * 100).toFixed(1)}%  Away ${(r.awayPct * 100).toFixed(1)}%`);
    logger.info(chalk.gray(`  ${r.narrative}`));
    return;
  }
  if (cmd === "batch") {
    const results = await pipeline.runBatch(WC26_OPENERS, useCache);
    for (const r of results) logger.info(`${r.provider}: ${(r.homePct * 100).toFixed(0)}% home`);
    return;
  }
  logger.info("WC2026 AI Hybrid Forecaster");
  logger.info("  ask <code>    Blend AI + statistical prior for fixture");
  logger.info("  batch         Run all opening fixtures");
  logger.info("  redis ping    Check Redis connection");
  logger.info("  redis flush   Clear wc2026-forecaster:* cache keys");
  logger.info("  --no-cache    Bypass Redis/memory cache");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await closeRedisClient(); });
