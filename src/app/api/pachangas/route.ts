import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sendPushFiltered } from "@/lib/services/push";

const DEMO_USER_ID = "user-demo";

export async function GET() {
  const pachangas = await db.pachanga.findMany({
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
        organizerId: DEMO_USER_ID,
        participations: {
          create: {
            userId: DEMO_USER_ID,
            status: "CONFIRMED",
          },
        },
      },
      include: {
        court: true,
        organizer: { select: { id: true, name: true } },
      },
    });

    // Send push notification to all subscribers
    const catName = { M: "Masculino", F: "Femenino", X: "Mixto" }[category] || category;
    const d = new Date(date);
    const dayNames = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
    const dateStr = `${dayNames[d.getDay()]} ${d.getDate()} · ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;

    sendPushFiltered(
      {
        title: `Nueva pachanga ${catName}`,
        body: `${dateStr} · ${pachanga.court.name} · ${price}€/jugador`,
        url: `/pachangas/${pachanga.id}`,
        tag: `new-pachanga-${pachanga.id}`,
      },
      {
        category,
        levelMin,
        levelMax,
        courtId,
        excludeUserId: DEMO_USER_ID,
      },
    ).catch(() => {});

    return NextResponse.json(pachanga, { status: 201 });
  } catch (err) {
    console.error("[api/pachangas] POST error:", err);
    return NextResponse.json(
      { error: "Failed to create pachanga" },
      { status: 500 },
    );
  }
}
