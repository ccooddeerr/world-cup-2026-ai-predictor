import type { LlmProvider } from "../providers/LlmProvider.js";
import type { WcFixture } from "../interfaces/fixture.js";
import type { BlendedForecast } from "../interfaces/forecast.js";
import { mergeForecast } from "../fusion/HybridMerger.js";

export class ForecastPipeline {
  constructor(private provider: LlmProvider, private aiWeight = 0.35) {}

  async run(fixture: WcFixture): Promise<BlendedForecast> {
    const ai = await this.provider.analyze(fixture);
    return mergeForecast(fixture, ai, this.aiWeight);
  }

  async runBatch(fixtures: WcFixture[]): Promise<BlendedForecast[]> {
    return Promise.all(fixtures.map((f) => this.run(f)));
  }
}
