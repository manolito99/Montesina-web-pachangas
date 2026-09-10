import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { isAdmin } from "@/lib/admin";
import { generateAmericanoRound } from "@/lib/tournament-logic";

/**
 * Rehace las rondas que todavia no tienen ningun resultado, respetando su hora
 * y sus pistas, con los jugadores activos en este momento. Sirve para cuando
 * alguien falla o se apunta a ultima hora en un torneo ya planificado.
 *
 * Las rondas con algun resultado metido no se tocan, y su historial de
 * companeros y partidos jugados se conserva para no repetir parejas.
 */
export async function POST(
  _req: NextRequest,
  { params }: { params: { id: string } },
) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string })?.id;
  const userEmail = session?.user?.email;
  if (!userId) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const tournament = await db.tournament.findUnique({
    where: { id: params.id },
    include: {
      players: { where: { active: true } },
      rounds: { include: { matches: true }, orderBy: { roundNumber: "asc" } },
    },
  });

  if (!tournament) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  if (!isAdmin(userEmail) && tournament.organizerId !== userId) {
    return NextResponse.json({ error: "Solo el organizador" }, { status: 403 });
  }
  if (tournament.status !== "IN_PROGRESS") {
    return NextResponse.json({ error: "El torneo no esta en curso" }, { status: 400 });
  }
  if (tournament.format === "MEXICANO") {
    return NextResponse.json({
      error: "El Mexicano empareja por clasificacion: genera la siguiente ronda cuando toque",
    }, { status: 400 });
  }
  if (tournament.players.length < 4) {
    return NextResponse.json({ error: "Hacen falta al menos 4 jugadores activos" }, { status: 400 });
  }

  const jugadas = tournament.rounds.filter((r) => r.matches.some((m) => m.completed));
  const pendientes = tournament.rounds.filter((r) => !r.matches.some((m) => m.completed));

  if (pendientes.length === 0) {
    return NextResponse.json({ error: "No hay ninguna ronda sin resultados que rehacer" }, { status: 400 });
  }

  // Historial solo de lo ya jugado
  const partnerHistory = new Map<string, Set<string>>();
  const matchesPlayed = new Map<string, number>();
  const lastPlayedRound = new Map<string, number>();
  for (const r of jugadas) {
    for (const m of r.matches) {
      for (const [x, y] of [[m.player1Id, m.player2Id], [m.player3Id, m.player4Id]]) {
        if (!partnerHistory.has(x)) partnerHistory.set(x, new Set());
        if (!partnerHistory.has(y)) partnerHistory.set(y, new Set());
        partnerHistory.get(x)!.add(y);
        partnerHistory.get(y)!.add(x);
      }
      for (const id of [m.player1Id, m.player2Id, m.player3Id, m.player4Id]) {
        matchesPlayed.set(id, (matchesPlayed.get(id) ?? 0) + 1);
        lastPlayedRound.set(id, Math.max(lastPlayedRound.get(id) ?? 0, r.roundNumber));
      }
    }
  }

  const players = tournament.players.map((p) => ({ id: p.id, totalPoints: p.totalPoints }));
  const nuevas: { roundId: string; matches: { courtIndex: number; player1Id: string; player2Id: string; player3Id: string; player4Id: string }[] }[] = [];

  for (const round of pendientes) {
    const numCourts = round.courtNames.length || round.matches.length || 1;
    const result = generateAmericanoRound(players, partnerHistory, numCourts, matchesPlayed, lastPlayedRound);
    if (result.matches.length === 0) {
      return NextResponse.json({
        error: `No se pueden formar partidos en la ronda ${round.roundNumber} con ${players.length} jugadores`,
      }, { status: 400 });
    }
    for (const m of result.matches) {
      for (const [x, y] of [m.teamA, m.teamB]) {
        if (!partnerHistory.has(x)) partnerHistory.set(x, new Set());
        if (!partnerHistory.has(y)) partnerHistory.set(y, new Set());
        partnerHistory.get(x)!.add(y);
        partnerHistory.get(y)!.add(x);
      }
      for (const id of [...m.teamA, ...m.teamB]) {
        matchesPlayed.set(id, (matchesPlayed.get(id) ?? 0) + 1);
        lastPlayedRound.set(id, round.roundNumber);
      }
    }
    nuevas.push({
      roundId: round.id,
      matches: result.matches.map((m) => ({
        courtIndex: m.courtIndex,
        player1Id: m.teamA[0], player2Id: m.teamA[1],
        player3Id: m.teamB[0], player4Id: m.teamB[1],
      })),
    });
  }

  await db.$transaction([
    db.tournamentMatch.deleteMany({ where: { roundId: { in: pendientes.map((r) => r.id) } } }),
    ...nuevas.map((n) =>
      db.tournamentRound.update({
        where: { id: n.roundId },
        data: { matches: { create: n.matches } },
      }),
    ),
  ]);

  return NextResponse.json({
    success: true,
    rondasRehechas: pendientes.map((r) => r.roundNumber),
    jugadoresActivos: players.length,
  });
}
