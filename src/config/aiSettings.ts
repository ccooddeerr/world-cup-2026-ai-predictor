import { loadEnv } from "./loadEnv.js";

loadEnv();

export const AI_SETTINGS = {
  blendWeight: Number(process.env.AI_BLEND_WEIGHT ?? 0.35),
  model: process.env.AI_MODEL ?? process.env.OPENAI_MODEL ?? "gpt-4o-mini",
  apiKey: process.env.OPENAI_API_KEY ?? "",
  baseUrl: process.env.AI_BASE_URL ?? process.env.OPENAI_BASE_URL ?? "https://api.openai.com/v1",
  useMock: process.env.AI_USE_MOCK !== "false",
};
