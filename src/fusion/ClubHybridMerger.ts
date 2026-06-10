import type { ClubBlendedForecast, ClubContext, ClubLlmForecast } from "../interfaces/clubMatch.js";
import { clubStatisticalPrior } from "./ClubStatisticalPrior.js";

export function mergeClubForecast(
  context: ClubContext,
  ai: ClubLlmForecast,
  aiWeight = 0.35,
): ClubBlendedForecast {
  const stat = clubStatisticalPrior(context);
  const sw = 1 - aiWeight;
  const homeWin = sw * stat.homeWin + aiWeight * ai.homeWin;
  const draw = sw * stat.draw + aiWeight * ai.draw;
  const awayWin = sw * stat.awayWin + aiWeight * ai.awayWin;
  const confidence = sw * stat.confidence + aiWeight * ai.confidence;

  return {
    homeWin,
    draw,
    awayWin,
    confidence,
    reasoning: ai.reasoning,
    provider: `blend(${ai.provider})`,
    statisticalWeight: sw,
    aiWeight,
  };
}
