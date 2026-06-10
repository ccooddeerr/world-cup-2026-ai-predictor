import { fetch } from "undici";
import type { ClubContext, HeadToHeadRecord, TeamRecord } from "../interfaces/clubMatch.js";

export const CLUB_CSV_URL =
  "https://raw.githubusercontent.com/georgedouzas/sports-betting/data/data/soccer/modelling/{league}_{division}_{year}.csv";

export interface ClubHistoryOptions {
  league?: string;
  division?: number;
  year?: number;
  /** Use embedded sample rows instead of remote CSV (tests / offline). */
  mock?: boolean;
}

export interface MatchRow {
  home_team: string;
  away_team: string;
  home_goals: number;
  away_goals: number;
}

const DEFAULTS = { league: "England", division: 1, year: 2020 };

/** Minimal sample rows for offline tests and mock analyst runs. */
export const MOCK_MATCH_ROWS: MatchRow[] = [
  { home_team: "Arsenal", away_team: "Chelsea", home_goals: 2, away_goals: 1 },
  { home_team: "Chelsea", away_team: "Arsenal", home_goals: 0, away_goals: 2 },
  { home_team: "Arsenal", away_team: "Liverpool", home_goals: 1, away_goals: 1 },
  { home_team: "Liverpool", away_team: "Arsenal", home_goals: 3, away_goals: 1 },
  { home_team: "Chelsea", away_team: "Liverpool", home_goals: 2, away_goals: 2 },
  { home_team: "Arsenal", away_team: "Tottenham", home_goals: 3, away_goals: 0 },
  { home_team: "Chelsea", away_team: "Tottenham", home_goals: 1, away_goals: 0 },
];

let remoteCache: MatchRow[] | null = null;

function normalizeTeam(name: string): string {
  return name.trim().toLowerCase();
}

export function teamsMatch(a: string, b: string): boolean {
  const left = normalizeTeam(a);
  const right = normalizeTeam(b);
  return left === right || left.includes(right) || right.includes(left);
}

function parseCsvLine(line: string): string[] {
  const out: string[] = [];
  let cur = "";
  let quoted = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      quoted = !quoted;
      continue;
    }
    if (ch === "," && !quoted) {
      out.push(cur);
      cur = "";
      continue;
    }
    cur += ch;
  }
  out.push(cur);
  return out;
}

function csvToRows(text: string): MatchRow[] {
  const lines = text.trim().split(/\r?\n/);
  if (lines.length < 2) return [];
  const headers = parseCsvLine(lines[0]);
  const homeIdx = headers.indexOf("home_team");
  const awayIdx = headers.indexOf("away_team");
  const hgIdx = headers.indexOf("target__home_team__full_time_goals");
  const agIdx = headers.indexOf("target__away_team__full_time_goals");
  if (homeIdx < 0 || awayIdx < 0 || hgIdx < 0 || agIdx < 0) return [];

  const rows: MatchRow[] = [];
  for (const line of lines.slice(1)) {
    if (!line.trim()) continue;
    const cols = parseCsvLine(line);
    const home = cols[homeIdx]?.trim();
    const away = cols[awayIdx]?.trim();
    const hg = Number(cols[hgIdx]);
    const ag = Number(cols[agIdx]);
    if (!home || !away || Number.isNaN(hg) || Number.isNaN(ag)) continue;
    rows.push({ home_team: home, away_team: away, home_goals: hg, away_goals: ag });
  }
  return rows;
}

function buildUrl(opts: ClubHistoryOptions): string {
  const league = opts.league ?? DEFAULTS.league;
  const division = opts.division ?? DEFAULTS.division;
  const year = opts.year ?? DEFAULTS.year;
  return CLUB_CSV_URL.replace("{league}", league)
    .replace("{division}", String(division))
    .replace("{year}", String(year));
}

/** Fetch historical club match rows (England 2020 by default). */
export async function loadClubHistory(options: ClubHistoryOptions = {}): Promise<MatchRow[]> {
  if (options.mock) return MOCK_MATCH_ROWS;
  if (remoteCache) return remoteCache;

  const url = buildUrl(options);
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch club history: ${url} (${res.status})`);
  remoteCache = csvToRows(await res.text());
  return remoteCache;
}

function emptyRecord(): TeamRecord {
  return { played: 0, wins: 0, draws: 0, losses: 0, goalsFor: 0, goalsAgainst: 0 };
}

function emptyH2H(): HeadToHeadRecord {
  return { played: 0, homeWins: 0, draws: 0, awayWins: 0 };
}

function resolveTeamName(query: string, candidates: string[]): string | null {
  const exact = candidates.find((c) => normalizeTeam(c) === normalizeTeam(query));
  if (exact) return exact;
  return candidates.find((c) => teamsMatch(c, query)) ?? null;
}

function addResult(record: TeamRecord, result: "win" | "draw" | "loss", gf: number, ga: number): void {
  record.played += 1;
  record.goalsFor += gf;
  record.goalsAgainst += ga;
  if (result === "win") record.wins += 1;
  else if (result === "draw") record.draws += 1;
  else record.losses += 1;
}

/** Build team form and head-to-head stats from historical rows. */
export function buildClubContext(
  homeTeam: string,
  awayTeam: string,
  rows: MatchRow[],
  meta: Pick<ClubHistoryOptions, "league" | "division" | "year"> = {},
): ClubContext {
  const allTeams = [...new Set(rows.flatMap((r) => [r.home_team, r.away_team]))];
  const resolvedHome = resolveTeamName(homeTeam, allTeams);
  const resolvedAway = resolveTeamName(awayTeam, allTeams);

  const homeRecord = emptyRecord();
  const awayRecord = emptyRecord();
  const headToHead = emptyH2H();
  let draws = 0;
  let finished = 0;

  for (const row of rows) {
    const { home_team: home, away_team: away, home_goals: hg, away_goals: ag } = row;
    finished += 1;
    const result = hg > ag ? "home" : hg < ag ? "away" : "draw";
    if (result === "draw") draws += 1;

    if (resolvedHome && teamsMatch(home, resolvedHome)) {
      addResult(
        homeRecord,
        result === "home" ? "win" : result === "draw" ? "draw" : "loss",
        hg,
        ag,
      );
    }
    if (resolvedAway && teamsMatch(away, resolvedAway)) {
      addResult(
        awayRecord,
        result === "away" ? "win" : result === "draw" ? "draw" : "loss",
        ag,
        hg,
      );
    }
    if (
      resolvedHome &&
      resolvedAway &&
      teamsMatch(home, resolvedHome) &&
      teamsMatch(away, resolvedAway)
    ) {
      headToHead.played += 1;
      if (result === "home") headToHead.homeWins += 1;
      else if (result === "draw") headToHead.draws += 1;
      else headToHead.awayWins += 1;
    }
  }

  return {
    homeTeam: homeTeam.trim(),
    awayTeam: awayTeam.trim(),
    resolvedHome,
    resolvedAway,
    homeRecord,
    awayRecord,
    headToHead,
    leagueDrawRate: finished > 0 ? draws / finished : 0.25,
    league: meta.league ?? DEFAULTS.league,
    division: meta.division ?? DEFAULTS.division,
    year: meta.year ?? DEFAULTS.year,
  };
}

/** Reset remote cache (tests). */
export function resetClubHistoryCache(): void {
  remoteCache = null;
}
