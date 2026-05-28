import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { validateScores } from "@/lib/tournament-logic";

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string; matchId: string } },
) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string })?.id;
  if (!userId) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const tournament = await db.tournament.findUnique({ where: { id: params.id } });
  if (!tournament) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  if (tournament.organizerId !== userId) {
    return NextResponse.json({ error: "Solo el organizador puede meter resultados" }, { status: 403 });
  }
  if (tournament.status !== "IN_PROGRESS") {
    return NextResponse.json({ error: "El torneo no está en curso" }, { status: 400 });
  }

  const { scoreTeamA, scoreTeamB } = await req.json();

  if (!validateScores(scoreTeamA, scoreTeamB, tournament.pointsPerMatch, tournament.freeScoring)) {
    return NextResponse.json({
      error: tournament.freeScoring
        ? "Los resultados deben ser numeros enteros >= 0"
        : `Los puntos deben sumar ${tournament.pointsPerMatch}`,
    }, { status: 400 });
  }

  const match = await db.tournamentMatch.findUnique({ where: { id: params.matchId } });
  if (!match) {
    return NextResponse.json({ error: "Partido no encontrado" }, { status: 404 });
  }
  if (match.completed) {
    return NextResponse.json({ error: "El resultado ya fue registrado" }, { status: 400 });
  }

  // Update match score
  await db.tournamentMatch.update({
    where: { id: params.matchId },
    data: { scoreTeamA, scoreTeamB, completed: true },
  });

  // Update player points
  await db.tournamentPlayer.update({
    where: { id: match.player1Id },
    data: { totalPoints: { increment: scoreTeamA } },
  });
  await db.tournamentPlayer.update({
    where: { id: match.player2Id },
    data: { totalPoints: { increment: scoreTeamA } },
  });
  await db.tournamentPlayer.update({
    where: { id: match.player3Id },
    data: { totalPoints: { increment: scoreTeamB } },
  });
  await db.tournamentPlayer.update({
    where: { id: match.player4Id },
    data: { totalPoints: { increment: scoreTeamB } },
  });

  return NextResponse.json({ success: true });
}
