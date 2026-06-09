import type { MatchPrediction } from "../types/prediction.js";
import type { AiMatchInsight } from "./types.js";

export function blendWithAi(
  statistical: MatchPrediction,
  ai: AiMatchInsight,
  aiWeight = 0.3
): MatchPrediction {
  const s = 1 - aiWeight;
  return {
    ...statistical,
    homeWinProb: s * statistical.homeWinProb + aiWeight * ai.homeWinProb,
    drawProb: s * statistical.drawProb + aiWeight * ai.drawProb,
    awayWinProb: s * statistical.awayWinProb + aiWeight * ai.awayWinProb,
    model: `hybrid-${statistical.model}`,
  };
}
