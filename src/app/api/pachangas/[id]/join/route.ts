import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { sendPushToAll } from "@/lib/services/push";

async function getUserId(): Promise<string | null> {
  const session = await getServerSession(authOptions);
  return (session?.user as { id?: string })?.id ?? null;
}

export async function POST(
  _req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const userId = await getUserId();
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

    // Validate gender matches pachanga category
    const user = await db.user.findUnique({ where: { id: userId }, select: { name: true, gender: true } });
    if (pachanga.category === "M" && user?.gender !== "MALE") {
      return NextResponse.json({ error: "Esta pachanga es solo para hombres" }, { status: 403 });
    }
    if (pachanga.category === "F" && user?.gender !== "FEMALE") {
      return NextResponse.json({ error: "Esta pachanga es solo para mujeres" }, { status: 403 });
    }

    const existing = await db.participation.findUnique({
      where: { userId_pachangaId: { userId, pachangaId: params.id } },
    });

    if (existing) {
      return NextResponse.json({ error: "Already joined" }, { status: 409 });
    }

    const confirmedCount = pachanga._count.participations;
    const isFull = confirmedCount >= pachanga.maxPlayers;

    const participation = await db.participation.create({
      data: {
        userId,
        pachangaId: params.id,
        status: isFull ? "WAITLIST" : "CONFIRMED",
        position: isFull ? confirmedCount + 1 : null,
      },
    });

    if (!isFull && confirmedCount + 1 >= pachanga.maxPlayers) {
      await db.pachanga.update({
        where: { id: params.id },
        data: { status: "FULL" },
      });
    }

    // Notify: someone joined
    const pachangaFull = await db.pachanga.findUnique({
      where: { id: params.id },
      include: { court: true },
    });
    if (pachangaFull) {
      sendPushToAll({
        title: `${user?.name ?? "Alguien"} se ha apuntado`,
        body: `${pachangaFull.court.name} · ${confirmedCount + 1}/${pachangaFull.maxPlayers} jugadores`,
        url: `/pachangas/${params.id}`,
        tag: `join-${params.id}`,
      }).catch(() => {});
    }

    return NextResponse.json(participation, { status: 201 });
  } catch (err) {
    console.error("[api/pachangas/join] POST error:", err);
    return NextResponse.json({ error: "Failed to join" }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const userId = await getUserId();
    if (!userId) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const existing = await db.participation.findUnique({
      where: { userId_pachangaId: { userId, pachangaId: params.id } },
    });

    if (!existing) {
      return NextResponse.json({ error: "Not joined" }, { status: 404 });
    }

    await db.participation.delete({
      where: { id: existing.id },
    });

    const confirmedCount = await db.participation.count({
      where: { pachangaId: params.id, status: "CONFIRMED" },
    });

    const pachanga = await db.pachanga.findUnique({ where: { id: params.id } });

    if (pachanga && confirmedCount < pachanga.maxPlayers && pachanga.status === "FULL") {
      await db.pachanga.update({
        where: { id: params.id },
        data: { status: "OPEN" },
      });

      const nextInWaitlist = await db.participation.findFirst({
        where: { pachangaId: params.id, status: "WAITLIST" },
        orderBy: { joinedAt: "asc" },
      });

      if (nextInWaitlist) {
        await db.participation.update({
          where: { id: nextInWaitlist.id },
          data: { status: "CONFIRMED", position: null },
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[api/pachangas/leave] DELETE error:", err);
    return NextResponse.json({ error: "Failed to leave" }, { status: 500 });
  }
}
