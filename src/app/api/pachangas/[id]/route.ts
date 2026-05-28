import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { sendPushToParticipants } from "@/lib/services/push";
import { isAdmin } from "@/lib/admin";

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } },
) {
  const pachanga = await db.pachanga.findUnique({
    where: { id: params.id },
    include: {
      court: true,
      organizer: { select: { id: true, name: true, level: true } },
      participations: {
        include: {
          user: { select: { id: true, name: true, level: true, gender: true } },
        },
        orderBy: { joinedAt: "asc" },
      },
      chatMessages: {
        include: { user: { select: { id: true, name: true } } },
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!pachanga) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(pachanga);
}

export async function DELETE(
  _req: NextRequest,
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
    include: { court: true },
  });

  if (!pachanga) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (!isAdmin(userEmail) && pachanga.organizerId !== userId) {
    return NextResponse.json({ error: "Solo el creador puede eliminar la pachanga" }, { status: 403 });
  }

  // Notify participants before deleting
  const d = pachanga.date;
  const dayNames = ["Dom", "Lun", "Mar", "Mie", "Jue", "Vie", "Sab"];
  const timeStr = `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
  sendPushToParticipants(
    {
      title: "Pachanga cancelada",
      body: `${dayNames[d.getDay()]} ${d.getDate()} · ${timeStr}h · ${pachanga.court.name}`,
      url: "/pachangas",
      tag: `cancel-${params.id}`,
    },
    params.id,
    userId,
  ).catch((err) => console.error("[push] cancel notify error:", err));

  await db.participation.deleteMany({ where: { pachangaId: params.id } });
  await db.chatMessage.deleteMany({ where: { pachangaId: params.id } });
  await db.pachanga.delete({ where: { id: params.id } });

  return NextResponse.json({ success: true });
}
