import type { ClubContext } from "../interfaces/clubMatch.js";
import type { ClubPrior } from "../fusion/ClubStatisticalPrior.js";

export const CLUB_SYSTEM_PROMPT = `You are a club soccer match analyst.
Respond ONLY with JSON:
{"homeWin":0-1,"draw":0-1,"awayWin":0-1,"confidence":0-1,"reasoning":"..."}
Probabilities must sum to ~1. Confidence reflects data quality.`;

function formatRecord(label: string, record: ClubContext["homeRecord"]): string {
  if (record.played === 0) return `${label}: no matches in dataset`;
  return `${label}: ${record.played}P ${record.wins}W-${record.draws}D-${record.losses}L, GF-GA ${record.goalsFor}-${record.goalsAgainst}`;
}

export function buildClubUserPrompt(context: ClubContext, baseline: ClubPrior): string {
  const sparse =
    !context.resolvedHome ||
    !context.resolvedAway ||
    context.homeRecord.played + context.awayRecord.played < 4;

  return [
    `Predict full-time outcome for ${context.homeTeam} (home) vs ${context.awayTeam} (away).`,
    `Dataset: ${context.league} division ${context.division}, season ${context.year}.`,
    `Resolved: home=${context.resolvedHome ?? "unknown"}, away=${context.resolvedAway ?? "unknown"}.`,
    formatRecord("Home record", context.homeRecord),
    formatRecord("Away record", context.awayRecord),
    context.headToHead.played > 0
      ? `H2H: ${context.headToHead.played} matches (${context.headToHead.homeWins}H-${context.headToHead.draws}D-${context.headToHead.awayWins}A as home/away above)`
      : "H2H: none in dataset",
    `League draw rate: ${(context.leagueDrawRate * 100).toFixed(1)}%`,
    `Statistical baseline: home ${(baseline.homeWin * 100).toFixed(1)}%, draw ${(baseline.draw * 100).toFixed(1)}%, away ${(baseline.awayWin * 100).toFixed(1)}% (conf ${(baseline.confidence * 100).toFixed(0)}%)`,
    sparse
      ? "Data is sparse — blend baseline with general football knowledge; lower confidence."
      : "Use historical signals as primary evidence.",
  ].join("\n");
}

export function parseClubLlmJson(raw: string) {
  const match = raw.match(/\{[\s\S]*\}/);
  if (!match) throw new Error("No JSON in club LLM response");
  const obj = JSON.parse(match[0]) as {
    homeWin: number;
    draw: number;
    awayWin: number;
    confidence: number;
    reasoning: string;
  };
  const sum = obj.homeWin + obj.draw + obj.awayWin;
  const scale = sum > 0 ? 1 / sum : 1;
  return {
    homeWin: obj.homeWin * scale,
    draw: obj.draw * scale,
    awayWin: obj.awayWin * scale,
    confidence: Math.min(1, Math.max(0, obj.confidence)),
    reasoning: obj.reasoning,
  };
}
