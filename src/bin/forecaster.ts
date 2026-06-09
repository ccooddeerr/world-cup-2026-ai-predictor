import chalk from "chalk";
import { fixtureByCode, WC26_OPENERS } from "../registry/schedule.js";
import { MockAnalyst } from "../providers/MockAnalyst.js";
import { OpenAiAnalyst } from "../providers/OpenAiAnalyst.js";
import { ForecastPipeline } from "../pipeline/ForecastPipeline.js";
import { AI_SETTINGS } from "../config/aiSettings.js";

async function main() {
  const [cmd, code] = process.argv.slice(2);
  const provider = AI_SETTINGS.useMock || !AI_SETTINGS.apiKey
    ? new MockAnalyst()
    : new OpenAiAnalyst(AI_SETTINGS.apiKey, AI_SETTINGS.model);

  const pipeline = new ForecastPipeline(provider, AI_SETTINGS.blendWeight);

  if (cmd === "ask" && code) {
    const f = fixtureByCode(code);
    if (!f) { console.log(chalk.red("Unknown fixture")); return; }
    const r = await pipeline.run(f);
    console.log(chalk.cyan(`
${f.homeCode} vs ${f.awayCode} (${r.provider})`));
    console.log(`  Home ${(r.homePct * 100).toFixed(1)}%  Draw ${(r.drawPct * 100).toFixed(1)}%  Away ${(r.awayPct * 100).toFixed(1)}%`);
    console.log(chalk.gray(`  ${r.narrative}`));
    return;
  }
  if (cmd === "batch") {
    const results = await pipeline.runBatch(WC26_OPENERS);
    for (const r of results) console.log(`${r.provider}: ${(r.homePct * 100).toFixed(0)}% home`);
    return;
  }
  console.log("WC2026 AI Hybrid Forecaster");
  console.log("  ask <code>    Blend AI + statistical prior for fixture");
  console.log("  batch         Run all opening fixtures");
}

main().catch((e) => { console.error(e); process.exit(1); });
