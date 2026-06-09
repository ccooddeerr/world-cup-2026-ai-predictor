export interface AiMatchInsight {
  homeWinProb: number;
  drawProb: number;
  awayWinProb: number;
  reasoning: string;
  source: "mock" | "openai";
}
