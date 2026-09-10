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

/** Cuantas veces se han enfrentado dos jugadores: id -> id -> veces */
export type OpponentHistory = Map<string, Map<string, number>>;

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function timesFaced(opponentHistory: OpponentHistory, a: string, b: string): number {
  return opponentHistory.get(a)?.get(b) ?? 0;
}

/**
 * Enumera emparejamientos validos (sin repetir companero) del `pool`, hasta un
 * maximo. El pool viene ordenado por prioridad y el primer jugador libre siempre
 * entra en una pareja, asi que los que mas necesitan jugar nunca se quedan fuera
 * en favor de alguien de mas abajo en la cola.
 */
function enumeratePairings(
  pool: string[],
  numPairs: number,
  partnerHistory: Map<string, Set<string>>,
  maxCandidates: number,
): [string, string][][] {
  const out: [string, string][][] = [];
  const pairs: [string, string][] = [];
  const used = new Set<string>();
  let budget = 50_000;

  // Devuelve true para cortar la busqueda (ya hay bastantes candidatos)
  const backtrack = (): boolean => {
    if (budget-- <= 0) return true;
    if (pairs.length === numPairs) {
      out.push(pairs.map((p) => [...p] as [string, string]));
      return out.length >= maxCandidates;
    }
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
      const stop = backtrack();
      pairs.pop();
      used.delete(b);
      if (stop) { used.delete(a); return true; }
    }
    used.delete(a);
    return false;
  };

  backtrack();
  return out;
}

/**
 * Reparte las parejas en partidos intentando que no se repitan los rivales.
 * Greedy: coge la primera pareja libre y la cruza con la que menos veces se
 * haya enfrentado a ella. Devuelve los partidos y cuanto "repite" el reparto.
 */
function buildMatches(
  pairs: [string, string][],
  opponentHistory: OpponentHistory,
): { matches: MatchPairing[]; cost: number } {
  const encuentros = (p: [string, string], q: [string, string]) =>
    timesFaced(opponentHistory, p[0], q[0]) + timesFaced(opponentHistory, p[0], q[1]) +
    timesFaced(opponentHistory, p[1], q[0]) + timesFaced(opponentHistory, p[1], q[1]);

  const libres = pairs.map((_, i) => i);
  const matches: MatchPairing[] = [];
  let cost = 0;

  while (libres.length >= 2) {
    const i = libres.shift() as number;
    let mejor = 0;
    let mejorCoste = Infinity;
    for (let k = 0; k < libres.length; k++) {
      const c = encuentros(pairs[i], pairs[libres[k]]);
      if (c < mejorCoste) { mejorCoste = c; mejor = k; }
      if (c === 0) break;
    }
    const j = libres.splice(mejor, 1)[0];
    cost += mejorCoste;
    matches.push({ teamA: pairs[i], teamB: pairs[j], courtIndex: matches.length });
  }

  return { matches, cost };
}

export function generateAmericanoRound(
  players: PlayerSlot[],
  partnerHistory: Map<string, Set<string>>,
  numCourts: number,
  matchesPlayed: Map<string, number> = new Map(),
  lastPlayedRound: Map<string, number> = new Map(),
  opponentHistory: OpponentHistory = new Map(),
): RoundResult {
  // Prioridad: menos partidos jugados, luego quien lleva mas tiempo sin jugar,
  // luego al azar. El sort es estable, asi que el shuffle rompe los empates.
  const shuffled = shuffle(players.map((p) => p.id));
  const ids = shuffled.sort((a, b) => {
    const byMatches = (matchesPlayed.get(a) ?? 0) - (matchesPlayed.get(b) ?? 0);
    if (byMatches !== 0) return byMatches;
    return (lastPlayedRound.get(a) ?? 0) - (lastPlayedRound.get(b) ?? 0);
  });

  const maxMatchesPerRound = Math.min(Math.floor(ids.length / 4), numCourts);
  if (maxMatchesPerRound === 0) return { matches: [], sitsOut: ids };
  const needed = maxMatchesPerRound * 4;

  // Se rellena la ronda con exactamente los `needed` primeros de la cola. Solo si
  // no hay forma de emparejarlos sin repetir companero se ensancha el pool de uno
  // en uno: el equilibrio de partidos manda sobre la variedad.
  let candidatos: [string, string][][] = [];
  for (let extra = 0; extra <= ids.length - needed && candidatos.length === 0; extra++) {
    candidatos = enumeratePairings(ids.slice(0, needed + extra), needed / 2, partnerHistory, 200);
  }
  // Ultimo recurso: todos han jugado ya con todos, se permite repetir companero.
  if (candidatos.length === 0) {
    candidatos = enumeratePairings(ids.slice(0, needed), needed / 2, new Map(), 200);
  }
  if (candidatos.length === 0) return { matches: [], sitsOut: ids };

  // De todos los emparejamientos validos, el que menos repita rivales.
  let mejor = buildMatches(candidatos[0], opponentHistory);
  for (let i = 1; i < candidatos.length && mejor.cost > 0; i++) {
    const cand = buildMatches(candidatos[i], opponentHistory);
    if (cand.cost < mejor.cost) mejor = cand;
  }

  const used = new Set(mejor.matches.flatMap((m) => [...m.teamA, ...m.teamB]));
  return { matches: mejor.matches, sitsOut: ids.filter((id) => !used.has(id)) };
}

/** Apunta en el historial los rivales de un partido ya emparejado */
export function recordOpponents(
  opponentHistory: OpponentHistory,
  teamA: [string, string],
  teamB: [string, string],
): void {
  for (const a of teamA) {
    for (const b of teamB) {
      for (const [x, y] of [[a, b], [b, a]]) {
        if (!opponentHistory.has(x)) opponentHistory.set(x, new Map());
        const m = opponentHistory.get(x) as Map<string, number>;
        m.set(y, (m.get(y) ?? 0) + 1);
      }
    }
  }
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
