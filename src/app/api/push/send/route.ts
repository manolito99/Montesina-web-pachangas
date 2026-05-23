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
    } = body;

    const payload = JSON.stringify({
      title,
      body: msgBody,
      icon,
      badge,
      url,
      tag: tag || `montesina-${Date.now()}`,
    });

    const subscriptions = getAllSubscriptions();
    console.log(`[push] Sending to ${subscriptions.length} subscription(s)`);

    if (subscriptions.length === 0) {
      return NextResponse.json(
        { error: "No subscriptions found", sent: 0 },
        { status: 404 },
      );
    }

    const results = await Promise.allSettled(
      subscriptions.map(async (sub) => {
        try {
          console.log(`[push] Sending to endpoint: ${sub.endpoint.slice(0, 60)}...`);
          const result = await webpush.sendNotification(
            { endpoint: sub.endpoint, keys: sub.keys },
            payload,
          );
          console.log(`[push] Success: status ${result.statusCode}`);
          return { endpoint: sub.endpoint, success: true };
        } catch (err: unknown) {
          const statusCode =
            err && typeof err === "object" && "statusCode" in err
              ? (err as { statusCode: number }).statusCode
              : 0;
          const errBody =
            err && typeof err === "object" && "body" in err
              ? (err as { body: string }).body
              : "";
          console.error(`[push] Failed: status ${statusCode}, body: ${errBody}`);
          if (statusCode === 404 || statusCode === 410) {
            removeSubscription(sub.endpoint);
          }
          return { endpoint: sub.endpoint, success: false, statusCode, error: errBody };
        }
      }),
    );

    const sent = results.filter(
      (r) => r.status === "fulfilled" && r.value.success,
    ).length;
    const failed = results.length - sent;
    const errors = results
      .filter((r) => r.status === "fulfilled" && !r.value.success)
      .map((r) => r.status === "fulfilled" ? r.value : null)
      .filter(Boolean);

    console.log(`[push] Done: ${sent} sent, ${failed} failed`);

    return NextResponse.json({ sent, failed, total: subscriptions.length, errors });
  } catch (err) {
    console.error("[push] Unexpected error:", err);
    return NextResponse.json(
      { error: "Failed to send notifications" },
      { status: 500 },
    );
  }
}
