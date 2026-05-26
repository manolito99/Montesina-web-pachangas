import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { sendPushFiltered } from "@/lib/services/push";

async function getUserId(): Promise<string | null> {
  const session = await getServerSession(authOptions);
  return (session?.user as { id?: string })?.id ?? null;
}

export async function GET() {
  const pachangas = await db.pachanga.findMany({
    where: { date: { gte: new Date() } },
    include: {
      court: true,
      organizer: { select: { id: true, name: true, level: true } },
      participations: {
        where: { status: { in: ["CONFIRMED", "WAITLIST"] } },
        include: { user: { select: { id: true, name: true, level: true, gender: true } } },
        orderBy: { joinedAt: "asc" },
      },
      _count: { select: { participations: { where: { status: "CONFIRMED" } } } },
    },
    orderBy: { date: "asc" },
  });

  return NextResponse.json(pachangas);
}

export async function POST(req: NextRequest) {
  try {
    const userId = await getUserId();
    if (!userId) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const body = await req.json();
    const {
      category,
      date,
      duration = 90,
      courtId,
      levelMin = 1,
      levelMax = 5,
      maxPlayers = 4,
      price = 0,
      notes,
    } = body;

    if (!category || !date || !courtId) {
      return NextResponse.json(
        { error: "category, date, and courtId are required" },
        { status: 400 },
      );
    }

    const creator = await db.user.findUnique({ where: { id: userId }, select: { gender: true } });
    if (category === "M" && creator?.gender !== "MALE") {
      return NextResponse.json({ error: "Solo los hombres pueden crear pachangas masculinas" }, { status: 403 });
    }
    if (category === "F" && creator?.gender !== "FEMALE") {
      return NextResponse.json({ error: "Solo las mujeres pueden crear pachangas femeninas" }, { status: 403 });
    }

    const pachanga = await db.pachanga.create({
      data: {
        category,
        date: new Date(date),
        duration,
        courtId,
        levelMin,
        levelMax,
        maxPlayers,
        price,
        notes: notes || null,
        status: "OPEN",
        organizerId: userId,
        participations: {
          create: {
            userId,
            status: "CONFIRMED",
          },
        },
      },
      include: {
        court: true,
        organizer: { select: { id: true, name: true } },
      },
    });

    // Send push notification filtered by preferences
    const catName = { M: "Masculino", F: "Femenino", X: "Mixto" }[category as "M" | "F" | "X"] || category;
    const d = new Date(date);
    const dayNames = ["Dom", "Lun", "Mar", "Mie", "Jue", "Vie", "Sab"];
    const months = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];
    const dateStr = `${dayNames[d.getDay()]} ${d.getDate()} ${months[d.getMonth()]}`;
    const timeStr = `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;

    sendPushFiltered(
      {
        title: `Nueva pachanga ${catName}`,
        body: `${dateStr} · ${timeStr}h · ${pachanga.court.name} · ${price}€`,
        url: `/pachangas/${pachanga.id}`,
        tag: `new-pachanga-${pachanga.id}`,
      },
      {
        category,
        levelMin,
        levelMax,
        courtId,
        excludeUserId: userId,
      },
    ).catch((err) => console.error("[push] new pachanga notify error:", err));

    return NextResponse.json(pachanga, { status: 201 });
  } catch (err) {
    console.error("[api/pachangas] POST error:", err);
    return NextResponse.json(
      { error: "Failed to create pachanga" },
      { status: 500 },
    );
  }
}
