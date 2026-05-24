import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string })?.id;

  if (!userId) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const user = await db.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      gender: true,
      level: true,
      createdAt: true,
    },
  });

  if (!user) {
    return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
  }

  // Stats
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const [totalPlayed, totalCreated, thisMonth, upcoming, created] = await Promise.all([
    // Total pachangas where user participated (confirmed) and date is past
    db.participation.count({
      where: {
        userId,
        status: "CONFIRMED",
        pachanga: { date: { lt: now } },
      },
    }),
    // Total pachangas organized
    db.pachanga.count({ where: { organizerId: userId } }),
    // This month
    db.participation.count({
      where: {
        userId,
        status: "CONFIRMED",
        pachanga: { date: { gte: monthStart } },
      },
    }),
    // Upcoming pachangas (future, confirmed)
    db.pachanga.findMany({
      where: {
        date: { gte: now },
        participations: { some: { userId, status: "CONFIRMED" } },
      },
      include: {
        court: true,
        organizer: { select: { id: true, name: true } },
        _count: { select: { participations: { where: { status: "CONFIRMED" } } } },
      },
      orderBy: { date: "asc" },
      take: 10,
    }),
    // Created by user (recent)
    db.pachanga.findMany({
      where: { organizerId: userId },
      include: {
        court: true,
        organizer: { select: { id: true, name: true } },
        _count: { select: { participations: { where: { status: "CONFIRMED" } } } },
      },
      orderBy: { date: "desc" },
      take: 10,
    }),
  ]);

  // Category distribution for "favorite"
  const catCounts = await db.participation.groupBy({
    by: ["pachangaId"],
    where: { userId, status: "CONFIRMED" },
  });
  const pachangaIds = catCounts.map((c) => c.pachangaId);
  const cats = pachangaIds.length > 0
    ? await db.pachanga.groupBy({
        by: ["category"],
        where: { id: { in: pachangaIds } },
        _count: true,
        orderBy: { _count: { category: "desc" } },
      })
    : [];
  const favCategory = cats.length > 0
    ? { M: "Masculino", F: "Femenino", X: "Mixto" }[cats[0].category] || "—"
    : "—";

  // Attendance rate
  const totalConfirmed = await db.participation.count({
    where: { userId, status: "CONFIRMED" },
  });
  const totalInvolved = await db.participation.count({
    where: { userId },
  });
  const attendance = totalInvolved > 0
    ? `${Math.round((totalConfirmed / totalInvolved) * 100)}%`
    : "—";

  return NextResponse.json({
    user,
    stats: {
      played: totalPlayed,
      created: totalCreated,
      thisMonth,
      attendance,
      favCategory,
    },
    upcoming,
    created,
  });
}
