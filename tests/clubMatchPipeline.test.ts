import { describe, expect, it } from "vitest";
import { buildClubContext, MOCK_MATCH_ROWS } from "../src/data/clubHistory.js";
import { clubStatisticalPrior } from "../src/fusion/ClubStatisticalPrior.js";
import { mergeClubForecast } from "../src/fusion/ClubHybridMerger.js";
import { MockClubAnalyst } from "../src/providers/MockClubAnalyst.js";
import { ClubMatchPipeline } from "../src/pipeline/ClubMatchPipeline.js";
import { parseClubLlmJson } from "../src/prompts/clubPrompts.js";

describe("ClubMatchPipeline", () => {
  it("predicts outcome rates for two teams via mock history path", async () => {
    const pipeline = new ClubMatchPipeline(new MockClubAnalyst(), 0.35, { mock: true });
    const result = await pipeline.run({ homeTeam: "Arsenal", awayTeam: "Chelsea" });

    expect(result.homeWin + result.draw + result.awayWin).toBeCloseTo(1, 2);
    expect(result.confidence).toBeGreaterThan(0);
    expect(result.confidence).toBeLessThanOrEqual(1);
    expect(result.reasoning).toContain("Arsenal");
    expect(result.provider).toContain("mock-club-analyst");
  });

  it("builds club context from mock rows", () => {
    const context = buildClubContext("Arsenal", "Chelsea", MOCK_MATCH_ROWS);
    expect(context.resolvedHome).toBe("Arsenal");
    expect(context.resolvedAway).toBe("Chelsea");
    expect(context.headToHead.played).toBeGreaterThan(0);
  });

  it("merges statistical prior with mock AI forecast", () => {
    const context = buildClubContext("Arsenal", "Chelsea", MOCK_MATCH_ROWS);
    const stat = clubStatisticalPrior(context);
    const ai = {
      homeWin: 0.5,
      draw: 0.25,
      awayWin: 0.25,
      confidence: 0.7,
      reasoning: "test",
      provider: "mock",
    };
    const blended = mergeClubForecast(context, ai, 0.4);
    expect(blended.homeWin + blended.draw + blended.awayWin).toBeCloseTo(1, 2);
    expect(blended.statisticalWeight).toBeCloseTo(0.6);
    expect(stat.homeWin).toBeGreaterThan(0);
  });

  it("rejects malformed LLM JSON for live (--no-mock) parsing path", () => {
    expect(() => parseClubLlmJson("not json")).toThrow(/No JSON/);
  });
});
