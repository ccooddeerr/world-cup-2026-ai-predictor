import { describe, it, expect } from "vitest";
import { statisticalPrior } from "../src/fusion/StatisticalPrior.js";

describe("StatisticalPrior", () => {
  it("favors higher elo", () => {
    const r = statisticalPrior({ code: "B1", group: "B", homeCode: "ARG", awayCode: "AUS", venue: "X", context: "" });
    expect(r.homePct).toBeGreaterThan(r.awayPct);
  });
});
