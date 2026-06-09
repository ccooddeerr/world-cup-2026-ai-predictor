import { ELO_TABLE } from "../registry/nationElo.js";
import type { WcFixture } from "../interfaces/fixture.js";

export function statisticalPrior(fixture: WcFixture) {
  const h = ELO_TABLE[fixture.homeCode] ?? 1700;
  const a = ELO_TABLE[fixture.awayCode] ?? 1700;
  const pHome = 1 / (1 + Math.pow(10, (a - h - 65) / 400));
  const pAway = 1 / (1 + Math.pow(10, (h + 65 - a) / 400));
  const draw = 0.25;
  const rem = 1 - draw;
  const t = pHome + pAway || 1;
  return { homePct: rem * pHome / t, drawPct: draw, awayPct: rem * pAway / t };
}
