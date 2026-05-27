import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { generateAmericanoRound, generateMexicanoRound } from "@/lib/tournament-logic";

export async function POST(
  _req: NextRequest,
  { params }: { params: { id: string } },
) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string })?.id;
  if (!userId) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const tournament = await db.tournament.findUnique({
    where: { id: params.id },
    include: {
      players: true,
      rounds: { include: { matches: true }, orderBy: { roundNumber: "desc" }, take: 1 },
    },
  });

  if (!tournament) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  if (tournament.organizerId !== userId) {
    return NextResponse.json({ error: "Solo el organizador" }, { status: 403 });
  }
  if (tournament.status !== "IN_PROGRESS") {
    return NextResponse.json({ error: "El torneo no está en curso" }, { status: 400 });
  }

  const lastRound = tournament.rounds[0];
  if (lastRound) {
    const incomplete = lastRound.matches.filter((m) => !m.completed);
    if (incomplete.length > 0) {
      return NextResponse.json({ error: `Faltan ${incomplete.length} resultados en la ronda actual` }, { status: 400 });
    }
  }

  const nextRoundNumber = tournament.currentRound + 1;
  const numCourts = tournament.courtIds.length || 1;
  const players = tournament.players.map((p) => ({ id: p.id, totalPoints: p.totalPoints }));

  let result;
  if (tournament.format === "AMERICANO") {
    // Build partner history from all previous rounds
    const allRounds = await db.tournamentRound.findMany({
      where: { tournamentId: params.id },
      include: { matches: true },
    });
    const partnerHistory = new Map<string, Set<string>>();
    for (const r of allRounds) {
      for (const m of r.matches) {
        if (!partnerHistory.has(m.player1Id)) partnerHistory.set(m.player1Id, new Set());
        if (!partnerHistory.has(m.player2Id)) partnerHistory.set(m.player2Id, new Set());
        partnerHistory.get(m.player1Id)!.add(m.player2Id);
        partnerHistory.get(m.player2Id)!.add(m.player1Id);
        if (!partnerHistory.has(m.player3Id)) partnerHistory.set(m.player3Id, new Set());
        if (!partnerHistory.has(m.player4Id)) partnerHistory.set(m.player4Id, new Set());
        partnerHistory.get(m.player3Id)!.add(m.player4Id);
        partnerHistory.get(m.player4Id)!.add(m.player3Id);
      }
    }
    result = generateAmericanoRound(players, partnerHistory, numCourts);
  } else {
    result = generateMexicanoRound(players, nextRoundNumber, numCourts);
  }

  if (result.matches.length === 0) {
    return NextResponse.json({ error: "No se pueden generar más rondas" }, { status: 400 });
  }

  const round = await db.tournamentRound.create({
    data: {
      tournamentId: params.id,
      roundNumber: nextRoundNumber,
      matches: {
        create: result.matches.map((m) => ({
          courtIndex: m.courtIndex,
          player1Id: m.teamA[0],
          player2Id: m.teamA[1],
          player3Id: m.teamB[0],
          player4Id: m.teamB[1],
        })),
      },
    },
    include: { matches: true },
  });

  await db.tournament.update({
    where: { id: params.id },
    data: { currentRound: nextRoundNumber },
  });

  return NextResponse.json({ round, sitsOut: result.sitsOut });
}
