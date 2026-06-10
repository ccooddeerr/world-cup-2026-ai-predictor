export interface ClubMatchInput {
  homeTeam: string;
  awayTeam: string;
}

export interface TeamRecord {
  played: number;
  wins: number;
  draws: number;
  losses: number;
  goalsFor: number;
  goalsAgainst: number;
}

export interface HeadToHeadRecord {
  played: number;
  homeWins: number;
  draws: number;
  awayWins: number;
}

export interface ClubContext extends ClubMatchInput {
  resolvedHome: string | null;
  resolvedAway: string | null;
  homeRecord: TeamRecord;
  awayRecord: TeamRecord;
  headToHead: HeadToHeadRecord;
  leagueDrawRate: number;
  league: string;
  division: number;
  year: number;
}

export interface ClubLlmForecast {
  homeWin: number;
  draw: number;
  awayWin: number;
  confidence: number;
  reasoning: string;
  provider: string;
}

export interface ClubBlendedForecast extends ClubLlmForecast {
  statisticalWeight: number;
  aiWeight: number;
}
