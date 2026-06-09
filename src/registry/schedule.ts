import type { WcFixture } from "../interfaces/fixture.js";

export const WC26_OPENERS: WcFixture[] = [
  { code: "A1", group: "A", homeCode: "USA", awayCode: "SEN", venue: "MetLife", context: "Tournament opener, host nation pressure" },
  { code: "B1", group: "B", homeCode: "ARG", awayCode: "AUS", venue: "SoFi", context: "Defending champions vs AFC representative" },
  { code: "C1", group: "C", homeCode: "FRA", awayCode: "CAN", venue: "BMO Field", context: "European favorite vs CONCACAF host" },
];
export const fixtureByCode = (code: string) => WC26_OPENERS.find((f) => f.code === code);
