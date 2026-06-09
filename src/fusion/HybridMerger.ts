import type { LlmForecast, BlendedForecast } from "../interfaces/forecast.js";
import { statisticalPrior } from "./StatisticalPrior.js";
import type { WcFixture } from "../interfaces/fixture.js";

export function mergeForecast(fixture: WcFixture, ai: LlmForecast, aiWeight = 0.35): BlendedForecast {
  const stat = statisticalPrior(fixture);
  const sw = 1 - aiWeight;
  return {
    homePct: sw * stat.homePct + aiWeight * ai.homePct,
    drawPct: sw * stat.drawPct + aiWeight * ai.drawPct,
    awayPct: sw * stat.awayPct + aiWeight * ai.awayPct,
    narrative: ai.narrative,
    provider: `blend(${ai.provider})`,
    statisticalWeight: sw,
    aiWeight,
  };
}
