import type { AiMatchInsight } from "./types.js";

export function mockAiPredict(home: string, away: string): AiMatchInsight {
  const isHost = ["usa", "mex", "can"].some((h) => home.toLowerCase().includes(h));
  const homeBoost = isHost ? 0.08 : 0;
  return {
    homeWinProb: 0.38 + homeBoost,
    drawProb: 0.28,
    awayWinProb: 0.34 - homeBoost,
    reasoning: `Heuristic analysis: ${home} vs ${away}`,
    source: "mock",
  };
}
