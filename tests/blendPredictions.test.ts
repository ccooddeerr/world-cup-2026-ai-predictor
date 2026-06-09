import { describe, it, expect } from "vitest";
import { blendWithAi } from "../src/ai/blendPredictions.js";

describe("AI blend", () => {
  it("blends statistical and AI probabilities", () => {
    const stat = { matchId: "A1", homeWinProb: 0.5, drawProb: 0.25, awayWinProb: 0.25, expectedHomeGoals: 1.5, expectedAwayGoals: 1, confidence: 0.7, model: "ensemble" };
    const ai = { homeWinProb: 0.6, drawProb: 0.2, awayWinProb: 0.2, reasoning: "test", source: "mock" as const };
    const blended = blendWithAi(stat, ai, 0.5);
    expect(blended.homeWinProb).toBeCloseTo(0.55);
  });
});
