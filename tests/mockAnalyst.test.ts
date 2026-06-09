import { describe, it, expect } from "vitest";
import { MockAnalyst } from "../src/providers/MockAnalyst.js";

describe("MockAnalyst", () => {
  it("returns forecast", async () => {
    const r = await new MockAnalyst().analyze({
      code: "B1", group: "B", homeCode: "ARG", awayCode: "AUS", venue: "SoFi", context: "test",
    });
    expect(r.homePct).toBeGreaterThan(r.awayPct);
  });
});
