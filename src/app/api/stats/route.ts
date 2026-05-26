import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

const ADMIN_EMAIL = "nolomanolo990@gmail.com";

export async function GET() {
  const session = await getServerSession(authOptions);
  const email = session?.user?.email;
  if (email !== ADMIN_EMAIL) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  // ── Users ──
  const totalUsers = await db.user.count();
  const newUsersWeek = await db.user.count({ where: { createdAt: { gte: sevenDaysAgo } } });

  const genderCounts = await db.user.groupBy({ by: ["gender"], _count: true });
  const males = genderCounts.find((g) => g.gender === "MALE")?._count ?? 0;
  const females = genderCounts.find((g) => g.gender === "FEMALE")?._count ?? 0;

  const levelCounts = await db.user.groupBy({ by: ["level"], _count: true, orderBy: { level: "asc" } });
  const levels = Array.from({ length: 5 }, (_, i) => ({
    level: i + 1,
    count: levelCounts.find((l) => l.level === i + 1)?._count ?? 0,
  }));

  const googleUsers = await db.account.count({ where: { provider: "google" } });
  const emailUsers = totalUsers - googleUsers;

  const activeUserIds = await db.participation.findMany({
    where: { status: "CONFIRMED", pachanga: { date: { gte: thirtyDaysAgo } } },
    select: { userId: true },
    distinct: ["userId"],
  });
  const activeUsers = activeUserIds.length;

  // Top 5 players
  const topPlayersRaw = await db.participation.groupBy({
    by: ["userId"],
    where: { status: "CONFIRMED" },
    _count: true,
    orderBy: { _count: { userId: "desc" } },
    take: 5,
  });
  const topUserIds = topPlayersRaw.map((t) => t.userId);
  const topUsersData = await db.user.findMany({
    where: { id: { in: topUserIds } },
    select: { id: true, name: true, level: true },
  });
  const topPlayers = topPlayersRaw.map((t) => {
    const u = topUsersData.find((u) => u.id === t.userId);
    return { name: u?.name ?? "?", level: u?.level ?? 0, count: t._count };
  });

  // ── Pachangas ──
  const totalPachangas = await db.pachanga.count();
  const pachangasMonth = await db.pachanga.count({ where: { createdAt: { gte: startOfMonth } } });

  const catCounts = await db.pachanga.groupBy({ by: ["category"], _count: true });
  const categories = {
    M: catCounts.find((c) => c.category === "M")?._count ?? 0,
    F: catCounts.find((c) => c.category === "F")?._count ?? 0,
    X: catCounts.find((c) => c.category === "X")?._count ?? 0,
  };

  const courtCounts = await db.pachanga.groupBy({ by: ["courtId"], _count: true, orderBy: { _count: { courtId: "desc" } } });
  const courtIds = courtCounts.map((c) => c.courtId);
  const courtsData = await db.court.findMany({ where: { id: { in: courtIds } }, select: { id: true, name: true } });
  const courts = courtCounts.map((c) => ({
    name: courtsData.find((co) => co.id === c.courtId)?.name ?? "?",
    count: c._count,
  }));

  // Fill rate
  const allPachangas = await db.pachanga.findMany({
    select: { maxPlayers: true, _count: { select: { participations: { where: { status: "CONFIRMED" } } } } },
  });
  const fillRates = allPachangas.map((p) => p._count.participations / p.maxPlayers);
  const avgFillRate = fillRates.length > 0 ? fillRates.reduce((a, b) => a + b, 0) / fillRates.length : 0;
  const completionRate = fillRates.length > 0 ? fillRates.filter((r) => r >= 1).length / fillRates.length : 0;

  // By day of week
  const allDates = await db.pachanga.findMany({ select: { date: true } });
  const dayNames = ["Dom", "Lun", "Mar", "Mie", "Jue", "Vie", "Sab"];
  const byDay = Array.from({ length: 7 }, (_, i) => ({
    day: dayNames[i],
    count: allDates.filter((p) => p.date.getDay() === i).length,
  }));

  // By time slot
  const timeSlots = [
    { label: "Mañana (8-13h)", min: 8, max: 13 },
    { label: "Tarde (13-18h)", min: 13, max: 18 },
    { label: "Noche (18-23h)", min: 18, max: 23 },
  ];
  const byTimeSlot = timeSlots.map((slot) => ({
    label: slot.label,
    count: allDates.filter((p) => {
      const h = p.date.getHours();
      return h >= slot.min && h < slot.max;
    }).length,
  }));

  // ── Trends (last 8 weeks) ──
  const eightWeeksAgo = new Date(now.getTime() - 8 * 7 * 24 * 60 * 60 * 1000);
  const recentPachangas = await db.pachanga.findMany({
    where: { createdAt: { gte: eightWeeksAgo } },
    select: { createdAt: true },
  });
  const recentParticipations = await db.participation.findMany({
    where: { status: "CONFIRMED", joinedAt: { gte: eightWeeksAgo } },
    select: { joinedAt: true },
  });

  const weeks: { label: string; pachangas: number; participations: number }[] = [];
  for (let i = 7; i >= 0; i--) {
    const weekStart = new Date(now.getTime() - (i + 1) * 7 * 24 * 60 * 60 * 1000);
    const weekEnd = new Date(now.getTime() - i * 7 * 24 * 60 * 60 * 1000);
    const d = weekStart;
    const label = `${d.getDate()}/${d.getMonth() + 1}`;
    weeks.push({
      label,
      pachangas: recentPachangas.filter((p) => p.createdAt >= weekStart && p.createdAt < weekEnd).length,
      participations: recentParticipations.filter((p) => p.joinedAt >= weekStart && p.joinedAt < weekEnd).length,
    });
  }

  // ── Push ──
  const pushSubs = await db.pushSubscription.count();

  return NextResponse.json({
    users: { total: totalUsers, active: activeUsers, newWeek: newUsersWeek, males, females, googleUsers, emailUsers, levels, topPlayers },
    pachangas: { total: totalPachangas, month: pachangasMonth, categories, courts, avgFillRate: Math.round(avgFillRate * 100), completionRate: Math.round(completionRate * 100), byDay, byTimeSlot },
    trends: { weeks },
    push: { subscribers: pushSubs },
  });
}
