import type { WcFixture } from "../interfaces/fixture.js";

export function buildUserPrompt(f: WcFixture): string {
  return `Analyze WC2026 fixture ${f.code}: ${f.homeCode} vs ${f.awayCode} at ${f.venue}.
Group ${f.group}. Context: ${f.context}`;
}
