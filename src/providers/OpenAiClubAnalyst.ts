import { request } from "undici";
import type { ClubLlmProvider } from "./ClubLlmProvider.js";
import type { ClubContext, ClubLlmForecast } from "../interfaces/clubMatch.js";
import { clubStatisticalPrior } from "../fusion/ClubStatisticalPrior.js";
import { buildClubUserPrompt, CLUB_SYSTEM_PROMPT, parseClubLlmJson } from "../prompts/clubPrompts.js";

export class OpenAiClubAnalyst implements ClubLlmProvider {
  readonly name = "openai-club";

  constructor(
    private apiKey: string,
    private model = "gpt-4o-mini",
    private baseUrl = "https://api.openai.com/v1",
  ) {}

  async analyze(context: ClubContext): Promise<ClubLlmForecast> {
    const baseline = clubStatisticalPrior(context);
    const res = await request(`${this.baseUrl}/chat/completions`, {
      method: "POST",
      headers: { Authorization: `Bearer ${this.apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: this.model,
        messages: [
          { role: "system", content: CLUB_SYSTEM_PROMPT },
          { role: "user", content: buildClubUserPrompt(context, baseline) },
        ],
        temperature: 0.2,
      }),
    });
    const body = (await res.body.json()) as { choices: Array<{ message: { content: string } }> };
    const parsed = parseClubLlmJson(body.choices[0].message.content);
    return { ...parsed, provider: this.name };
  }
}
