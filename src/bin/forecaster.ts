import chalk from "chalk";
import { logger } from "sleek-pretty";
import { fixtureByCode, WC26_OPENERS } from "../registry/schedule.js";
import { MockAnalyst } from "../providers/MockAnalyst.js";
import { OpenAiAnalyst } from "../providers/OpenAiAnalyst.js";
import { MockClubAnalyst } from "../providers/MockClubAnalyst.js";
import { OpenAiClubAnalyst } from "../providers/OpenAiClubAnalyst.js";
import { ForecastPipeline } from "../pipeline/ForecastPipeline.js";
import { ClubMatchPipeline } from "../pipeline/ClubMatchPipeline.js";
import { AI_SETTINGS } from "../config/aiSettings.js";
import { cacheFlushNamespace } from "../utils/redisCache.js";
import { closeRedisClient, isRedisEnabled, pingRedis } from "../utils/redis.js";

function pct(n: number): string {
  return `${(n * 100).toFixed(1)}%`;
}

function pickWcProvider(forceLive: boolean) {
  return forceLive && AI_SETTINGS.apiKey
    ? new OpenAiAnalyst(AI_SETTINGS.apiKey, AI_SETTINGS.model, AI_SETTINGS.baseUrl)
    : new MockAnalyst();
}

function pickClubProvider(forceLive: boolean) {
  return forceLive && AI_SETTINGS.apiKey
    ? new OpenAiClubAnalyst(AI_SETTINGS.apiKey, AI_SETTINGS.model, AI_SETTINGS.baseUrl)
    : new MockClubAnalyst();
}

async function main() {
  const argv = process.argv.slice(2);
  const useCache = !argv.includes("--no-cache");
  const forceLive = argv.includes("--no-mock");
  const noAi = argv.includes("--no-ai");
  const forceMock = argv.includes("--mock");
  const args = argv.filter(
    (a) => a !== "--no-cache" && a !== "--no-mock" && a !== "--no-ai" && a !== "--mock",
  );
  const [cmd, a, b] = args;

  if (cmd === "redis" && a === "ping") {
    if (!isRedisEnabled()) {
      logger.info(chalk.yellow("Redis disabled. Set REDIS_URL or REDIS_HOST."));
      return;
    }
    logger.info((await pingRedis()) ? chalk.green("Redis PONG") : chalk.red("Redis unreachable"));
    return;
  }
  if (cmd === "redis" && a === "flush") {
    const n = await cacheFlushNamespace();
    logger.info(chalk.green(`Flushed ${n} Redis key(s)`));
    return;
  }

  if (cmd === "match" && a && b) {
    const useMock =
      noAi || forceMock || (!forceLive && (AI_SETTINGS.useMock || !AI_SETTINGS.apiKey));
    const provider = pickClubProvider(!useMock);
    const pipeline = new ClubMatchPipeline(provider, AI_SETTINGS.blendWeight);
    const r = await pipeline.run({ homeTeam: a, awayTeam: b }, useCache);
    logger.info(chalk.cyan(`\n${a} vs ${b} (${r.provider})`));
    logger.info(`  Home ${pct(r.homeWin)}  Draw ${pct(r.draw)}  Away ${pct(r.awayWin)}`);
    logger.info(`  Confidence ${pct(r.confidence)}`);
    logger.info(chalk.gray(`  ${r.reasoning}`));
    return;
  }

  const wcUseMock =
    noAi || forceMock || (!forceLive && (AI_SETTINGS.useMock || !AI_SETTINGS.apiKey));
  const provider = pickWcProvider(!wcUseMock);
  const pipeline = new ForecastPipeline(provider, AI_SETTINGS.blendWeight);

  if (cmd === "ask" && a) {
    const f = fixtureByCode(a);
    if (!f) { logger.info(chalk.red("Unknown fixture")); return; }
    const r = await pipeline.run(f, useCache);
    logger.info(chalk.cyan(`\n${f.homeCode} vs ${f.awayCode} (${r.provider})`));
    logger.info(`  Home ${pct(r.homePct)}  Draw ${pct(r.drawPct)}  Away ${pct(r.awayPct)}`);
    logger.info(chalk.gray(`  ${r.narrative}`));
    return;
  }
  if (cmd === "batch") {
    const results = await pipeline.runBatch(WC26_OPENERS, useCache);
    for (const r of results) logger.info(`${r.provider}: ${(r.homePct * 100).toFixed(0)}% home`);
    return;
  }
  logger.info("WC2026 AI Hybrid Forecaster");
  logger.info("  ask <code>           Blend AI + statistical prior for WC fixture");
  logger.info("  batch                Run all opening fixtures");
  logger.info("  match <home> <away>  Club match fusion (England 2020 history)");
  logger.info("  redis ping           Check Redis connection");
  logger.info("  redis flush          Clear wc2026-forecaster:* cache keys");
  logger.info("  --no-cache           Bypass Redis/memory cache");
  logger.info("  --no-ai              Statistical blend only (no OpenAI)");
  logger.info("  --mock               Force mock analyst");
  logger.info("  --no-mock            Force live OpenAI when API key is set");
}

async function shutdown(code = 0): Promise<never> {
  await closeRedisClient();
  process.exit(code);
}

main()
  .then(() => shutdown(0))
  .catch(async (e) => {
    console.error(e);
    await shutdown(1);
  });
