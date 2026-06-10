import { config } from "dotenv";

let loaded = false;

/** Load `.env` once (no-op if already loaded). */
export function loadEnv(): void {
  if (loaded) return;
  config();
  loaded = true;
}
