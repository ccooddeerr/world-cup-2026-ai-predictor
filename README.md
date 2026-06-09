# WC2026 AI Hybrid Forecaster

LLM-first TypeScript forecaster for FIFA World Cup 2026 — provider pipeline with statistical priors and hybrid blending.

## Architecture

```
src/
├── bin/forecaster.ts        CLI entry
├── providers/               LlmProvider, MockAnalyst, OpenAiAnalyst
├── prompts/                 System prompts, JSON parsing
├── fusion/                  StatisticalPrior + HybridMerger
├── pipeline/                ForecastPipeline (async batch)
├── registry/                Schedule + Elo lookup tables
├── interfaces/              Forecast & fixture contracts
└── config/                  AI_SETTINGS from env
```

## Commands

```bash
npm install
npm run forecast -- ask A1
npm run forecast -- batch
npm test
```

Set `OPENAI_API_KEY` for live AI; defaults to mock analyst.
