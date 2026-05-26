import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { webpush, ensureVapid } from "@/lib/services/push";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string })?.id;
  if (!userId) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const {
      title = "Montesiña Padel",
      body: msgBody = "Tienes una notificación",
      url = "/",
      tag,
    } = body;

    const subs = await db.pushSubscription.findMany({ where: { userId } });
    if (subs.length === 0) {
      return NextResponse.json({ error: "No tienes suscripciones activas", sent: 0 }, { status: 404 });
    }

    ensureVapid();
    const data = JSON.stringify({
      title,
      body: msgBody,
      icon: "/icons/icon-192.png",
      badge: "/icons/icon-192.png",
      url,
      tag: tag || `test-${Date.now()}`,
    });

    let sent = 0;
    let failed = 0;
    for (const sub of subs) {
      try {
        await webpush.sendNotification(
          { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
          data,
        );
        sent++;
      } catch {
        failed++;
      }
    }

    return NextResponse.json({ sent, failed });
  } catch (err) {
    console.error("[push/send] error:", err);
    return NextResponse.json({ error: "Failed to send" }, { status: 500 });
  }
}
