import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { isAdmin } from "@/lib/admin";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string; playerId: string } },
) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string })?.id;
  const userEmail = session?.user?.email;
  if (!userId) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const tournament = await db.tournament.findUnique({ where: { id: params.id } });
  if (!tournament) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  if (!isAdmin(userEmail) && tournament.organizerId !== userId) {
    return NextResponse.json({ error: "Solo el organizador" }, { status: 403 });
  }

  // En DRAFT/OPEN se puede borrar al jugador del torneo (todavía no hay rondas)
  if (tournament.status === "DRAFT" || tournament.status === "OPEN") {
    await db.tournamentPlayer.delete({ where: { id: params.playerId } }).catch(() => null);
    return NextResponse.json({ success: true });
  }

  // En IN_PROGRESS no se borra: se marca como inactivo (retirado).
  // Solo se bloquea si tiene un partido pendiente en una ronda que YA se esta
  // jugando. En un torneo planificado todas las rondas existen desde el principio,
  // asi que mirar solo `currentRound` (la ultima) bloqueaba siempre; las rondas
  // futuras se arreglan luego con "recalcular rondas pendientes".
  if (tournament.status === "IN_PROGRESS") {
    const rounds = await db.tournamentRound.findMany({
      where: { tournamentId: params.id },
      include: { matches: true },
    });
    const now = Date.now();
    const enJuego = (r: (typeof rounds)[number]) =>
      r.matches.some((m) => m.completed) ||
      (tournament.scheduled
        ? r.startsAt !== null && r.startsAt.getTime() <= now
        : r.roundNumber === tournament.currentRound);

    const bloquea = rounds.some(
      (r) =>
        enJuego(r) &&
        r.matches.some(
          (m) =>
            !m.completed &&
            (m.player1Id === params.playerId ||
              m.player2Id === params.playerId ||
              m.player3Id === params.playerId ||
              m.player4Id === params.playerId),
        ),
    );
    if (bloquea) {
      return NextResponse.json({
        error: "Este jugador tiene un partido pendiente en la ronda que se esta jugando. Mete primero ese resultado.",
      }, { status: 400 });
    }

    await db.tournamentPlayer.update({
      where: { id: params.playerId },
      data: { active: false },
    });
    return NextResponse.json({ success: true, action: "deactivated" });
  }

  return NextResponse.json({ error: "El torneo ya esta finalizado" }, { status: 400 });
}

// PUT: Reactivar a un jugador retirado
export async function PUT(
  _req: NextRequest,
  { params }: { params: { id: string; playerId: string } },
) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string })?.id;
  const userEmail = session?.user?.email;
  if (!userId) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const tournament = await db.tournament.findUnique({ where: { id: params.id } });
  if (!tournament) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  if (!isAdmin(userEmail) && tournament.organizerId !== userId) {
    return NextResponse.json({ error: "Solo el organizador" }, { status: 403 });
  }

  await db.tournamentPlayer.update({
    where: { id: params.playerId },
    data: { active: true },
  });
  return NextResponse.json({ success: true, action: "reactivated" });
}
