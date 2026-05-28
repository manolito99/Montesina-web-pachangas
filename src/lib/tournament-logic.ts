interface PlayerSlot {
  id: string;
}

interface MatchPairing {
  teamA: [string, string];
  teamB: [string, string];
  courtIndex: number;
}

interface RoundResult {
  matches: MatchPairing[];
  sitsOut: string | null;
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function generateAmericanoRound(
  players: PlayerSlot[],
  partnerHistory: Map<string, Set<string>>,
  numCourts: number,
  matchesPlayed: Map<string, number> = new Map(),
): RoundResult {
  // Order: fewest matches first, then random within same count
  const shuffled = shuffle(players.map((p) => p.id));
  const ids = shuffled.sort((a, b) => {
    const ma = matchesPlayed.get(a) ?? 0;
    const mb = matchesPlayed.get(b) ?? 0;
    return ma - mb;
  });

  const maxMatchesPerRound = Math.min(Math.floor(ids.length / 4), numCourts);
  const used = new Set<string>();
  const pairs: [string, string][] = [];

  for (let i = 0; i < ids.length && pairs.length < maxMatchesPerRound * 2; i++) {
    if (used.has(ids[i])) continue;
    for (let j = i + 1; j < ids.length; j++) {
      if (used.has(ids[j])) continue;
      const history = partnerHistory.get(ids[i]);
      if (!history || !history.has(ids[j])) {
        pairs.push([ids[i], ids[j]]);
        used.add(ids[i]);
        used.add(ids[j]);
        break;
      }
    }
  }

  // If greedy couldn't fill enough pairs, fill with any remaining
  if (pairs.length < maxMatchesPerRound * 2) {
    for (let i = 0; i < ids.length && pairs.length < maxMatchesPerRound * 2; i++) {
      if (used.has(ids[i])) continue;
      for (let j = i + 1; j < ids.length; j++) {
        if (used.has(ids[j])) continue;
        pairs.push([ids[i], ids[j]]);
        used.add(ids[i]);
        used.add(ids[j]);
        break;
      }
    }
  }

  const matches: MatchPairing[] = [];
  for (let k = 0; k + 1 < pairs.length; k += 2) {
    matches.push({
      teamA: pairs[k],
      teamB: pairs[k + 1],
      courtIndex: Math.floor(k / 2),
    });
  }

  const sitsOut = ids.find((id) => !used.has(id)) ?? null;

  return { matches, sitsOut };
}

export function generateMexicanoRound(
  players: { id: string; totalPoints: number }[],
  roundNumber: number,
  numCourts: number,
): RoundResult {
  let ordered: string[];

  if (roundNumber === 1) {
    ordered = shuffle(players.map((p) => p.id));
  } else {
    const sorted = [...players].sort((a, b) => b.totalPoints - a.totalPoints);
    ordered = sorted.map((p) => p.id);
  }

  const maxMatches = Math.min(Math.floor(ordered.length / 4), numCourts);
  const matches: MatchPairing[] = [];

  for (let i = 0; i < maxMatches; i++) {
    const base = i * 4;
    matches.push({
      teamA: [ordered[base], ordered[base + 1]],
      teamB: [ordered[base + 2], ordered[base + 3]],
      courtIndex: i,
    });
  }

  const usedCount = maxMatches * 4;
  const sitsOut = ordered.length > usedCount ? ordered[usedCount] : null;

  return { matches, sitsOut };
}

export function calculateTotalRounds(playerCount: number): number {
  return playerCount - 1;
}

export function validateScores(
  scoreA: number,
  scoreB: number,
  pointsPerMatch: number,
  freeScoring = false,
): boolean {
  if (!Number.isInteger(scoreA) || !Number.isInteger(scoreB) || scoreA < 0 || scoreB < 0) {
    return false;
  }
  if (freeScoring) return true;
  return scoreA + scoreB === pointsPerMatch;
}
