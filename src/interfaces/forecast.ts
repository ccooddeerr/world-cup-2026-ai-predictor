export interface LlmForecast {
  homePct: number;
  drawPct: number;
  awayPct: number;
  narrative: string;
  provider: string;
}

export interface BlendedForecast extends LlmForecast {
  statisticalWeight: number;
  aiWeight: number;
}
