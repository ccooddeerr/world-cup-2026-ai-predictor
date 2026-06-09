import type { LlmForecast } from "../interfaces/forecast.js";

export function parseLlmJson(raw: string): Omit<LlmForecast, "provider"> {
  const match = raw.match(/\{[\s\S]*\}/);
  if (!match) throw new Error("No JSON in LLM response");
  const obj = JSON.parse(match[0]) as { homePct: number; drawPct: number; awayPct: number; narrative: string };
  return { homePct: obj.homePct, drawPct: obj.drawPct, awayPct: obj.awayPct, narrative: obj.narrative };
}
