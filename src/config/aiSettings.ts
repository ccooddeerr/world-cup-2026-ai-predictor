export const AI_SETTINGS = {
  blendWeight: Number(process.env.AI_BLEND_WEIGHT ?? 0.35),
  model: process.env.AI_MODEL ?? "gpt-4o-mini",
  apiKey: process.env.OPENAI_API_KEY ?? "",
  useMock: process.env.AI_USE_MOCK !== "false",
};
