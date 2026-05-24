import { NextRequest, NextResponse } from "next/server";
import { sendPushToAll } from "@/lib/services/push";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      title = "Montesiña Padel",
      body: msgBody = "Tienes una notificación",
      url = "/",
      tag,
    } = body;

    const result = await sendPushToAll({ title, body: msgBody, url, tag });

    if (result.sent === 0 && result.failed === 0) {
      return NextResponse.json(
        { error: "No subscriptions found", sent: 0 },
        { status: 404 },
      );
    }

    return NextResponse.json(result);
  } catch (err) {
    console.error("[push/send] error:", err);
    return NextResponse.json(
      { error: "Failed to send notifications" },
      { status: 500 },
    );
  }
}
