import type { ClubLlmProvider } from "../providers/ClubLlmProvider.js";
import type { ClubBlendedForecast, ClubMatchInput } from "../interfaces/clubMatch.js";
import {
  buildClubContext,
  loadClubHistory,
  type ClubHistoryOptions,
} from "../data/clubHistory.js";
import { mergeClubForecast } from "../fusion/ClubHybridMerger.js";

export interface ClubMatchPipelineOptions extends ClubHistoryOptions {
  useCache?: boolean;
}

export class ClubMatchPipeline {
  private historyPromise: ReturnType<typeof loadClubHistory> | null = null;

  constructor(
    private provider: ClubLlmProvider,
    private aiWeight = 0.35,
    private historyOptions: ClubHistoryOptions = {},
  ) {}

  private async history() {
    if (!this.historyPromise) {
      this.historyPromise = loadClubHistory(this.historyOptions);
    }
    return this.historyPromise;
  }

  async run(input: ClubMatchInput, _useCache = true): Promise<ClubBlendedForecast> {
    const rows = await this.history();
    const context = buildClubContext(input.homeTeam, input.awayTeam, rows, this.historyOptions);
    const ai = await this.provider.analyze(context);
    return mergeClubForecast(context, ai, this.aiWeight);
  }
}
