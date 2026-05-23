import { NextRequest, NextResponse } from "next/server";
import {
  webpush,
  getAllSubscriptions,
  removeSubscription,
} from "@/lib/push";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      title = "Montesiña Padel",
      body: msgBody = "Tienes una notificación",
      icon = "/icons/icon-192.png",
      badge = "/icons/icon-192.png",
      url = "/",
      tag,
      data,
    } = body;

    const payload = JSON.stringify({
      title,
      body: msgBody,
      icon,
      badge,
      url,
      tag: tag || `montesina-${Date.now()}`,
      data,
    });

    const subscriptions = getAllSubscriptions();

    if (subscriptions.length === 0) {
      return NextResponse.json(
        { error: "No subscriptions found", sent: 0 },
        { status: 404 },
      );
    }

    const results = await Promise.allSettled(
      subscriptions.map(async (sub) => {
        try {
          await webpush.sendNotification(
            {
              endpoint: sub.endpoint,
              keys: sub.keys,
            },
            payload,
          );
          return { endpoint: sub.endpoint, success: true };
        } catch (err: unknown) {
          const statusCode =
            err && typeof err === "object" && "statusCode" in err
              ? (err as { statusCode: number }).statusCode
              : 0;
          if (statusCode === 404 || statusCode === 410) {
            removeSubscription(sub.endpoint);
          }
          return { endpoint: sub.endpoint, success: false, statusCode };
        }
      }),
    );

    const sent = results.filter(
      (r) => r.status === "fulfilled" && r.value.success,
    ).length;
    const failed = results.length - sent;

    return NextResponse.json({ sent, failed, total: subscriptions.length });
  } catch {
    return NextResponse.json(
      { error: "Failed to send notifications" },
      { status: 500 },
    );
  }
}
