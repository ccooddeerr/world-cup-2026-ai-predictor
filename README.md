# WC2026 AI Hybrid Forecaster

FIFA World Cup 2026 hybrid forecaster — combines statistical ensemble models with AI match analysis for richer World Cup predictions.

## Features

- Statistical ensemble (Elo, Poisson, form)
- Mock AI provider for offline use
- Configurable AI blend weight (default 70/30 statistical/AI)
- OpenAI-compatible live AI integration
- Group standings and tournament champion forecasts

## Usage

```bash
npm install
npm run forecast -- predict A1
npm run forecast -- standings
npm run forecast -- tournament
npm test
```

Set `OPENAI_API_KEY` in `.env` for live AI mode, or use mock AI offline.
