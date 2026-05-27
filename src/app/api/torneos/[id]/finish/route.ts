import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function POST(
  _req: NextRequest,
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
    return NextResponse.json({ error: "Solo el organizador" }, { status: 403 });
  }
  if (tournament.status !== "IN_PROGRESS") {
    return NextResponse.json({ error: "El torneo no está en curso" }, { status: 400 });
  }

  await db.tournament.update({
    where: { id: params.id },
    data: { status: "FINISHED" },
  });

  return NextResponse.json({ success: true });
}
