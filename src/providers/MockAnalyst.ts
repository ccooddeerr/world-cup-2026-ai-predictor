import type { LlmProvider } from "./LlmProvider.js";
import type { LlmForecast } from "../interfaces/forecast.js";
import type { WcFixture } from "../interfaces/fixture.js";
import { ELO_TABLE } from "../registry/nationElo.js";

export class MockAnalyst implements LlmProvider {
  readonly name = "mock-analyst";

  async analyze(fixture: WcFixture): Promise<LlmForecast> {
    const h = ELO_TABLE[fixture.homeCode] ?? 1700;
    const a = ELO_TABLE[fixture.awayCode] ?? 1700;
    const homePct = 0.35 + (h - a) / 5000;
    const drawPct = 0.27;
    const awayPct = 1 - homePct - drawPct;
    return {
      homePct: Math.round(homePct * 1000) / 1000,
      drawPct,
      awayPct: Math.round(awayPct * 1000) / 1000,
      narrative: `Mock analyst: ${fixture.homeCode} ${fixture.context}`,
      provider: this.name,
    };
  }
}
