import type { LlmForecast } from "../interfaces/forecast.js";
import type { WcFixture } from "../interfaces/fixture.js";

export interface LlmProvider {
  readonly name: string;
  analyze(fixture: WcFixture): Promise<LlmForecast>;
}
