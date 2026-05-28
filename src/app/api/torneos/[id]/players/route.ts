import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function POST(
  req: NextRequest,
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
    return NextResponse.json({ error: "Solo el organizador puede añadir jugadores" }, { status: 403 });
  }
  if (tournament.status !== "DRAFT" && tournament.status !== "OPEN") {
    return NextResponse.json({ error: "No se pueden añadir jugadores a un torneo en curso" }, { status: 400 });
  }

  const body = await req.json();
  const userIds: string[] = Array.isArray(body.userIds) ? body.userIds : [];
  const guests: { name: string; level?: number }[] = Array.isArray(body.guests) ? body.guests : [];

  if (userIds.length === 0 && guests.length === 0) {
    return NextResponse.json({ error: "Debes añadir al menos un jugador" }, { status: 400 });
  }

  // Validate gender for registered users
  if (userIds.length > 0 && tournament.category !== "X") {
    const requiredGender = tournament.category === "M" ? "MALE" : "FEMALE";
    const users = await db.user.findMany({ where: { id: { in: userIds } }, select: { id: true, gender: true } });
    const invalid = users.filter((u) => u.gender !== requiredGender);
    if (invalid.length > 0) {
      return NextResponse.json({ error: `Género incorrecto para categoría ${tournament.category}` }, { status: 400 });
    }
  }

  // Skip already added users
  const existing = await db.tournamentPlayer.findMany({
    where: { tournamentId: params.id, userId: { in: userIds } },
    select: { userId: true },
  });
  const existingIds = new Set(existing.map((e) => e.userId));
  const newUserIds = userIds.filter((id) => !existingIds.has(id));

  const inserts = [
    ...newUserIds.map((uid) => ({ tournamentId: params.id, userId: uid })),
    ...guests
      .filter((g) => g.name && g.name.trim())
      .map((g) => ({
        tournamentId: params.id,
        guestName: g.name.trim(),
        guestLevel: g.level && g.level >= 1 && g.level <= 5 ? g.level : 3,
      })),
  ];

  if (inserts.length > 0) {
    await db.tournamentPlayer.createMany({ data: inserts });
    await db.tournament.update({ where: { id: params.id }, data: { status: "OPEN" } });
  }

  return NextResponse.json({ added: inserts.length });
}
