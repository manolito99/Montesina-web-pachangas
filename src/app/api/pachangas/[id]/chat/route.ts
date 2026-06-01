import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { sendPushChatMessage } from "@/lib/services/push";

async function getUserId(): Promise<string | null> {
  const session = await getServerSession(authOptions);
  return (session?.user as { id?: string })?.id ?? null;
}

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  const url = new URL(req.url);
  const after = url.searchParams.get("after");

  const afterDate = after ? new Date(after) : null;
  const validAfter = afterDate && !Number.isNaN(afterDate.getTime()) ? afterDate : null;

  const messages = await db.chatMessage.findMany({
    where: {
      pachangaId: params.id,
      ...(validAfter ? { createdAt: { gt: validAfter } } : {}),
    },
    include: { user: { select: { id: true, name: true } } },
    orderBy: { createdAt: "asc" },
    take: 200,
  });

  return NextResponse.json({ messages });
}

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const userId = await getUserId();
    if (!userId) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const body = (await req.json().catch(() => null)) as { text?: unknown } | null;
    const raw = typeof body?.text === "string" ? body.text : "";
    const text = raw.trim();

    if (text.length === 0) {
      return NextResponse.json({ error: "Mensaje vacío" }, { status: 400 });
    }
    if (text.length > 500) {
      return NextResponse.json({ error: "Mensaje demasiado largo (máx. 500)" }, { status: 400 });
    }

    const pachanga = await db.pachanga.findUnique({
      where: { id: params.id },
      include: {
        court: { select: { name: true } },
        participations: {
          where: { userId, status: { in: ["CONFIRMED", "WAITLIST"] } },
          select: { id: true },
        },
      },
    });

    if (!pachanga) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const canPost =
      userId === pachanga.organizerId || pachanga.participations.length > 0;

    if (!canPost) {
      return NextResponse.json(
        { error: "Solo los apuntados pueden escribir en el chat" },
        { status: 403 },
      );
    }

    const message = await db.chatMessage.create({
      data: { text, userId, pachangaId: params.id },
      include: { user: { select: { id: true, name: true } } },
    });

    sendPushChatMessage(
      {
        title: `${message.user.name} · ${pachanga.court.name}`,
        body: text.length > 120 ? `${text.slice(0, 120)}…` : text,
        url: `/pachangas/${params.id}`,
        tag: `chat-${params.id}`,
      },
      params.id,
      userId,
    ).catch((err) => console.error("[push] chat notify error:", err));

    return NextResponse.json(message, { status: 201 });
  } catch (err) {
    console.error("[api/pachangas/chat] POST error:", err);
    return NextResponse.json({ error: "Failed to send" }, { status: 500 });
  }
}
