import { afterEach, describe, expect, it } from "vitest";
import { cacheGet, cacheSet, clearMemoryCache } from "../src/utils/redisCache.js";

describe("redisCache", () => {
  afterEach(() => {
    clearMemoryCache();
    delete process.env.REDIS_URL;
    delete process.env.REDIS_HOST;
  });

  it("stores forecast cache", async () => {
    await cacheSet("forecast:A1:0.35", { homePct: 0.4 }, 60);
    const v = await cacheGet<{ homePct: number }>("forecast:A1:0.35");
    expect(v?.homePct).toBe(0.4);
  });
});
