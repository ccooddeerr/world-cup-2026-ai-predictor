import { describe, it, expect } from "vitest";
import { mergeForecast } from "../src/fusion/HybridMerger.js";

describe("HybridMerger", () => {
  it("blends AI and statistical", () => {
    const f = { code: "A1", group: "A", homeCode: "USA", awayCode: "SEN", venue: "X", context: "test" };
    const r = mergeForecast(f, { homePct: 0.5, drawPct: 0.25, awayPct: 0.25, narrative: "t", provider: "mock" }, 0.5);
    expect(r.homePct + r.drawPct + r.awayPct).toBeCloseTo(1, 1);
  });
});
