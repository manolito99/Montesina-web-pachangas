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
  sitsOut: string[];
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * Picks `numPairs` pairs out of `pool`, never repeating a past partner.
 * The pool is already ordered by priority, and the earliest player still free is
 * always forced into a pair, so the players who most need to play never get
 * skipped in favour of someone further down the queue. Exhaustive backtracking:
 * the pool is a dozen players at most. Returns null if no valid pairing exists.
 */
function findPairing(
  pool: string[],
  numPairs: number,
  partnerHistory: Map<string, Set<string>>,
): [string, string][] | null {
  const pairs: [string, string][] = [];
  const used = new Set<string>();
  // Safety valve for big pools with a saturated history: give up rather than
  // hang, and let the caller fall back to a wider pool / a repeated partner.
  let budget = 50_000;

  const backtrack = (): boolean => {
    if (pairs.length === numPairs) return true;
    if (budget-- <= 0) return false;
    const i = pool.findIndex((p) => !used.has(p));
    if (i === -1) return false;
    const a = pool[i];
    used.add(a);
    for (let j = i + 1; j < pool.length; j++) {
      const b = pool[j];
      if (used.has(b)) continue;
      if (partnerHistory.get(a)?.has(b)) continue;
      used.add(b);
      pairs.push([a, b]);
      if (backtrack()) return true;
      pairs.pop();
      used.delete(b);
    }
    used.delete(a);
    return false;
  };

  return backtrack() ? pairs : null;
}

export function generateAmericanoRound(
  players: PlayerSlot[],
  partnerHistory: Map<string, Set<string>>,
  numCourts: number,
  matchesPlayed: Map<string, number> = new Map(),
  lastPlayedRound: Map<string, number> = new Map(),
): RoundResult {
  // Priority: fewest matches first, then whoever has been sitting out longest,
  // then random. Sorting is stable, so the shuffle breaks the remaining ties.
  const shuffled = shuffle(players.map((p) => p.id));
  const ids = shuffled.sort((a, b) => {
    const byMatches = (matchesPlayed.get(a) ?? 0) - (matchesPlayed.get(b) ?? 0);
    if (byMatches !== 0) return byMatches;
    return (lastPlayedRound.get(a) ?? 0) - (lastPlayedRound.get(b) ?? 0);
  });

  const maxMatchesPerRound = Math.min(Math.floor(ids.length / 4), numCourts);
  const needed = maxMatchesPerRound * 4;

  // Try to fill the round with exactly the `needed` players at the front of the
  // queue. Only if they cannot be paired without repeating a partner do we widen
  // the pool one player at a time — balance matters more than partner variety.
  let pairs: [string, string][] | null = null;
  for (let extra = 0; extra <= ids.length - needed && !pairs; extra++) {
    pairs = findPairing(ids.slice(0, needed + extra), needed / 2, partnerHistory);
  }
  // Last resort: everyone has already played with everyone, so allow a repeat.
  if (!pairs) pairs = findPairing(ids.slice(0, needed), needed / 2, new Map());
  if (!pairs) return { matches: [], sitsOut: ids };

  const used = new Set(pairs.flat());
  const matches: MatchPairing[] = [];
  for (let k = 0; k + 1 < pairs.length; k += 2) {
    matches.push({
      teamA: pairs[k],
      teamB: pairs[k + 1],
      courtIndex: Math.floor(k / 2),
    });
  }

  return { matches, sitsOut: ids.filter((id) => !used.has(id)) };
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

  return { matches, sitsOut: ordered.slice(usedCount) };
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
