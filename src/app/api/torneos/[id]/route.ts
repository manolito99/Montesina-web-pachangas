import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } },
) {
  const tournament = await db.tournament.findUnique({
    where: { id: params.id },
    include: {
      organizer: { select: { id: true, name: true } },
      players: {
        include: { user: { select: { id: true, name: true, level: true, gender: true, image: true } } },
        orderBy: { totalPoints: "desc" },
      },
      rounds: {
        include: {
          matches: {
            include: {
              player1: { include: { user: { select: { id: true, name: true } } } },
              player2: { include: { user: { select: { id: true, name: true } } } },
              player3: { include: { user: { select: { id: true, name: true } } } },
              player4: { include: { user: { select: { id: true, name: true } } } },
            },
          },
        },
        orderBy: { roundNumber: "asc" },
      },
    },
  });

  if (!tournament) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(tournament);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } },
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
    return NextResponse.json({ error: "Solo el organizador puede eliminar" }, { status: 403 });
  }
  if (tournament.status === "IN_PROGRESS" || tournament.status === "FINISHED") {
    return NextResponse.json({ error: "No se puede eliminar un torneo en curso o finalizado" }, { status: 400 });
  }

  await db.tournament.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
}
