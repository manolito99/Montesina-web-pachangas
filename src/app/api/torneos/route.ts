import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  const tournaments = await db.tournament.findMany({
    include: {
      organizer: { select: { id: true, name: true } },
      _count: { select: { players: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(tournaments);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string })?.id;
  if (!userId) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const body = await req.json();
  const { name, format, category, pointsPerMatch = 21, courtIds = [], notes, playerIds = [], guests = [] } = body;

  if (!name || !format || !category) {
    return NextResponse.json({ error: "name, format y category son obligatorios" }, { status: 400 });
  }

  if (!["AMERICANO", "MEXICANO"].includes(format)) {
    return NextResponse.json({ error: "Formato inválido" }, { status: 400 });
  }

  const creator = await db.user.findUnique({ where: { id: userId }, select: { gender: true } });
  if (category === "M" && creator?.gender !== "MALE") {
    return NextResponse.json({ error: "Solo hombres pueden crear torneos masculinos" }, { status: 403 });
  }
  if (category === "F" && creator?.gender !== "FEMALE") {
    return NextResponse.json({ error: "Solo mujeres pueden crear torneos femeninos" }, { status: 403 });
  }

  const tournament = await db.tournament.create({
    data: {
      name,
      format,
      category,
      pointsPerMatch,
      courtIds,
      notes: notes || null,
      status: (playerIds.length + guests.length) > 0 ? "OPEN" : "DRAFT",
      organizerId: userId,
      players: (playerIds.length + guests.length) > 0 ? {
        create: [
          ...playerIds.map((uid: string) => ({ userId: uid })),
          ...guests
            .filter((g: { name?: string }) => g.name && g.name.trim())
            .map((g: { name: string; level?: number }) => ({
              guestName: g.name.trim(),
              guestLevel: g.level && g.level >= 1 && g.level <= 5 ? g.level : 3,
            })),
        ],
      } : undefined,
    },
    include: {
      organizer: { select: { id: true, name: true } },
      _count: { select: { players: true } },
    },
  });

  return NextResponse.json(tournament, { status: 201 });
}
