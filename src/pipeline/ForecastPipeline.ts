import type { LlmProvider } from "../providers/LlmProvider.js";
import type { WcFixture } from "../interfaces/fixture.js";
import type { BlendedForecast } from "../interfaces/forecast.js";
import { mergeForecast } from "../fusion/HybridMerger.js";
import { cacheGet, cacheSet } from "../utils/redisCache.js";

export class ForecastPipeline {
  constructor(private provider: LlmProvider, private aiWeight = 0.35) {}

  async run(fixture: WcFixture, useCache = true): Promise<BlendedForecast> {
    const cacheKey = `forecast:${fixture.code}:${this.aiWeight}`;
    if (useCache) {
      const cached = await cacheGet<BlendedForecast>(cacheKey);
      if (cached) return cached;
    }
    const ai = await this.provider.analyze(fixture);
    const result = mergeForecast(fixture, ai, this.aiWeight);
    if (useCache) await cacheSet(cacheKey, result);
    return result;
  }

  async runBatch(fixtures: WcFixture[], useCache = true): Promise<BlendedForecast[]> {
    return Promise.all(fixtures.map((f) => this.run(f, useCache)));
  }
}
