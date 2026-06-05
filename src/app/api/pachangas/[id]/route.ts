import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { sendPushToParticipants, sendPushFiltered } from "@/lib/services/push";
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

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string })?.id;
  const userEmail = session?.user?.email;
  if (!userId) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const body = (await req.json().catch(() => null)) as { category?: unknown } | null;
  const nextCategory = body?.category;

  if (nextCategory !== "X") {
    return NextResponse.json(
      { error: "Solo se permite convertir a mixto (X)" },
      { status: 400 },
    );
  }

  const pachanga = await db.pachanga.findUnique({
    where: { id: params.id },
    include: { court: true },
  });
  if (!pachanga) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (!isAdmin(userEmail) && pachanga.organizerId !== userId) {
    return NextResponse.json(
      { error: "Solo el organizador puede cambiar la categoría" },
      { status: 403 },
    );
  }

  if (pachanga.status === "FINISHED" || pachanga.status === "CANCELLED") {
    return NextResponse.json(
      { error: "No se puede modificar una pachanga finalizada o cancelada" },
      { status: 400 },
    );
  }

  if (pachanga.category === "X") {
    return NextResponse.json(
      { error: "La pachanga ya es mixta" },
      { status: 400 },
    );
  }

  // category is "M" or "F" here — both transitions to "X" are safe: existing
  // participants stay valid (X accepts any gender), no waitlist invalidation.
  const updated = await db.pachanga.update({
    where: { id: params.id },
    data: { category: "X" },
    include: {
      court: true,
      organizer: { select: { id: true, name: true, level: true } },
      participations: {
        include: { user: { select: { id: true, name: true, level: true, gender: true } } },
        orderBy: { joinedAt: "asc" },
      },
    },
  });

  // Push: tell the gender that just gained access. The gender hard-gate in
  // push.ts already prevents cross-gender leakage, so we mark the push as
  // category X and let the recipient's prefs (catMixto) filter naturally.
  const d = updated.date;
  const dayNames = ["Dom", "Lun", "Mar", "Mie", "Jue", "Vie", "Sab"];
  const months = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];
  const dateStr = `${dayNames[d.getDay()]} ${d.getDate()} ${months[d.getMonth()]}`;
  const timeStr = `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
  sendPushFiltered(
    {
      title: "Pachanga abierta a mixto",
      body: `${dateStr} · ${timeStr}h · ${updated.court.name}`,
      url: `/pachangas/${params.id}`,
      tag: `convert-mixed-${params.id}`,
    },
    {
      category: "X",
      levelMin: updated.levelMin,
      levelMax: updated.levelMax,
      courtId: updated.courtId,
      excludeUserId: userId,
    },
  ).catch((err) => console.error("[push] convert-mixed notify error:", err));

  return NextResponse.json(updated);
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
