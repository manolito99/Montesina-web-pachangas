import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string; playerId: string } },
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
    return NextResponse.json({ error: "Solo el organizador" }, { status: 403 });
  }
  if (tournament.status !== "DRAFT" && tournament.status !== "OPEN") {
    return NextResponse.json({ error: "No se pueden quitar jugadores de un torneo en curso" }, { status: 400 });
  }

  await db.tournamentPlayer.delete({ where: { id: params.playerId } }).catch(() => null);
  return NextResponse.json({ success: true });
}
