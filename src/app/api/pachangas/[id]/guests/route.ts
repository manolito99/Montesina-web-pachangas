import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { isAdmin } from "@/lib/admin";

// POST /api/pachangas/[id]/guests
// Solo el organizador (o admin) puede añadir un externo por nombre.
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string })?.id;
  const userEmail = session?.user?.email;
  if (!userId) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const pachanga = await db.pachanga.findUnique({
    where: { id: params.id },
    include: { _count: { select: { participations: { where: { status: "CONFIRMED" } } } } },
  });

  if (!pachanga) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (!isAdmin(userEmail) && pachanga.organizerId !== userId) {
    return NextResponse.json({ error: "Solo el organizador puede añadir externos" }, { status: 403 });
  }

  const body = await req.json().catch(() => ({}));
  const guestName = typeof body?.name === "string" ? body.name.trim() : "";
  if (!guestName) {
    return NextResponse.json({ error: "Falta el nombre del jugador" }, { status: 400 });
  }
  if (guestName.length > 60) {
    return NextResponse.json({ error: "Nombre demasiado largo" }, { status: 400 });
  }

  const confirmedCount = pachanga._count.participations;
  const isFull = confirmedCount >= pachanga.maxPlayers;
  const waitlistCount = await db.participation.count({
    where: { pachangaId: params.id, status: "WAITLIST" },
  });

  const participation = await db.participation.create({
    data: {
      pachangaId: params.id,
      guestName,
      status: isFull ? "WAITLIST" : "CONFIRMED",
      position: isFull ? waitlistCount + 1 : null,
    },
  });

  if (!isFull && confirmedCount + 1 >= pachanga.maxPlayers) {
    await db.pachanga.update({
      where: { id: params.id },
      data: { status: "FULL" },
    });
  }

  return NextResponse.json(participation, { status: 201 });
}
