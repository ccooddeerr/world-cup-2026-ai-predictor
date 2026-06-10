import type { ClubContext, ClubLlmForecast } from "../interfaces/clubMatch.js";

export interface ClubLlmProvider {
  readonly name: string;
  analyze(context: ClubContext): Promise<ClubLlmForecast>;
}
