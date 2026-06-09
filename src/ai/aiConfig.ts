export const AI_CONFIG = {
  blendWeight: Number(process.env.AI_BLEND_WEIGHT ?? 0.3),
  useMock: process.env.AI_USE_MOCK !== "false",
  model: process.env.AI_MODEL ?? "gpt-4o-mini",
  timeoutMs: Number(process.env.AI_TIMEOUT_MS ?? 15000),
} as const;
