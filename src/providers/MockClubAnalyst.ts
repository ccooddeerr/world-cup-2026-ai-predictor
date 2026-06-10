import type { ClubLlmProvider } from "./ClubLlmProvider.js";
import type { ClubContext, ClubLlmForecast } from "../interfaces/clubMatch.js";
import { clubStatisticalPrior } from "../fusion/ClubStatisticalPrior.js";

export class MockClubAnalyst implements ClubLlmProvider {
  readonly name = "mock-club-analyst";

  async analyze(context: ClubContext): Promise<ClubLlmForecast> {
    const stat = clubStatisticalPrior(context);
    const bump = context.resolvedHome && context.resolvedAway ? 0.04 : 0;
    return {
      homeWin: Math.min(0.85, stat.homeWin + bump),
      draw: stat.draw,
      awayWin: Math.max(0.05, stat.awayWin - bump),
      confidence: Math.min(0.9, stat.confidence + 0.05),
      reasoning: `Mock club analyst: ${context.homeTeam} vs ${context.awayTeam} using ${context.league} ${context.year} form.`,
      provider: this.name,
    };
  }
}
