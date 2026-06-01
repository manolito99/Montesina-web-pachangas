import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { isAdmin } from "@/lib/admin";
import { sendPushPlazaLibre } from "@/lib/services/push";

// DELETE /api/pachangas/[id]/participations/[participationId]
// Solo organizador o admin: quita a un jugador (registrado o externo).
// Si la pachanga estaba completa y se libera plaza, sube al primero de la lista de espera
// y notifica plaza libre.
export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string; participationId: string } },
) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string })?.id;
  const userEmail = session?.user?.email;
  if (!userId) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const pachanga = await db.pachanga.findUnique({ where: { id: params.id } });
  if (!pachanga) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (!isAdmin(userEmail) && pachanga.organizerId !== userId) {
    return NextResponse.json({ error: "Solo el organizador puede quitar jugadores" }, { status: 403 });
  }

  const existing = await db.participation.findUnique({
    where: { id: params.participationId },
  });

  if (!existing || existing.pachangaId !== params.id) {
    return NextResponse.json({ error: "Participacion no encontrada" }, { status: 404 });
  }

  await db.participation.delete({ where: { id: params.participationId } });

  // Si la pachanga estaba completa y ahora hay plaza, abrir + promover lista de espera
  const wasFull = pachanga.status === "FULL";
  const confirmedCount = await db.participation.count({
    where: { pachangaId: params.id, status: "CONFIRMED" },
  });

  if (wasFull && confirmedCount < pachanga.maxPlayers) {
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

    // Notify plaza libre
    const full = await db.pachanga.findUnique({
      where: { id: params.id },
      include: { court: true },
    });
    if (full) {
      const catName = { M: "Masculino", F: "Femenino", X: "Mixto" }[full.category] || full.category;
      const d = new Date(full.date);
      const dayNames = ["Dom", "Lun", "Mar", "Mie", "Jue", "Vie", "Sab"];
      const timeStr = `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
      sendPushPlazaLibre(
        {
          title: `Plaza libre en pachanga ${catName}`,
          body: `${dayNames[d.getDay()]} ${d.getDate()} · ${timeStr}h · ${full.court.name}`,
          url: `/pachangas/${params.id}`,
          tag: `plaza-libre-${params.id}`,
        },
        { category: full.category, courtId: full.courtId },
      ).catch((err) => console.error("[push] plaza libre error:", err));
    }
  }

  return NextResponse.json({ success: true });
}
