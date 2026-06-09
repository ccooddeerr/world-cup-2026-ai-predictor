import { request } from "undici";
import type { LlmProvider } from "./LlmProvider.js";
import type { LlmForecast } from "../interfaces/forecast.js";
import type { WcFixture } from "../interfaces/fixture.js";
import { buildUserPrompt } from "../prompts/buildUserPrompt.js";
import { SYSTEM_PROMPT } from "../prompts/systemPrompts.js";
import { parseLlmJson } from "../prompts/parseLlmJson.js";

export class OpenAiAnalyst implements LlmProvider {
  readonly name = "openai";
  constructor(private apiKey: string, private model = "gpt-4o-mini", private baseUrl = "https://api.openai.com/v1") {}

  async analyze(fixture: WcFixture): Promise<LlmForecast> {
    const res = await request(`${this.baseUrl}/chat/completions`, {
      method: "POST",
      headers: { Authorization: `Bearer ${this.apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: this.model,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: buildUserPrompt(fixture) },
        ],
        temperature: 0.2,
      }),
    });
    const body = await res.body.json() as { choices: Array<{ message: { content: string } }> };
    const parsed = parseLlmJson(body.choices[0].message.content);
    return { ...parsed, provider: this.name };
  }
}
