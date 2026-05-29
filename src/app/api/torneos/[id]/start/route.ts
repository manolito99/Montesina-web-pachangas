import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { generateAmericanoRound, generateMexicanoRound } from "@/lib/tournament-logic";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string })?.id;
  if (!userId) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const tournament = await db.tournament.findUnique({
    where: { id: params.id },
    include: { players: { where: { active: true } } },
  });

  if (!tournament) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  if (tournament.organizerId !== userId) {
    return NextResponse.json({ error: "Solo el organizador" }, { status: 403 });
  }
  if (tournament.status === "IN_PROGRESS" || tournament.status === "FINISHED") {
    return NextResponse.json({ error: "El torneo ya está en curso" }, { status: 400 });
  }
  if (tournament.players.length < 4) {
    return NextResponse.json({ error: "Se necesitan al menos 4 jugadores" }, { status: 400 });
  }

  let requestedCourts: number | null = null;
  try {
    const body = await req.json();
    if (typeof body?.numCourts === "number" && body.numCourts >= 1 && body.numCourts <= 20) {
      requestedCourts = body.numCourts;
    }
  } catch { /* no body, use default */ }
  const numCourts = requestedCourts ?? (tournament.courtIds.length || 1);
  const players = tournament.players.map((p) => ({ id: p.id, totalPoints: 0 }));

  const result = tournament.format === "MEXICANO"
    ? generateMexicanoRound(players, 1, numCourts)
    : generateAmericanoRound(players, new Map(), numCourts);

  const round = await db.tournamentRound.create({
    data: {
      tournamentId: params.id,
      roundNumber: 1,
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
    data: { status: "IN_PROGRESS", currentRound: 1 },
  });

  return NextResponse.json({ round, sitsOut: result.sitsOut });
}
