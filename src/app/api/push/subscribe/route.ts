import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import {
  saveSubscription,
  removeSubscription,
  getSubscriptionCount,
} from "@/lib/services/push";

async function getUserId(): Promise<string | null> {
  const session = await getServerSession(authOptions);
  return (session?.user as { id?: string })?.id ?? null;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { subscription } = body;

    if (
      !subscription?.endpoint ||
      !subscription?.keys?.p256dh ||
      !subscription?.keys?.auth
    ) {
      return NextResponse.json(
        { error: "Invalid subscription object" },
        { status: 400 },
      );
    }

    const userId = await getUserId();

    await saveSubscription(
      subscription.endpoint,
      subscription.keys.p256dh,
      subscription.keys.auth,
      userId,
    );

    const total = await getSubscriptionCount();
    return NextResponse.json({ success: true, total });
  } catch (err) {
    console.error("[push/subscribe] POST error:", err);
    return NextResponse.json(
      { error: "Failed to save subscription" },
      { status: 500 },
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const body = await req.json();
    const { endpoint } = body;

    if (!endpoint) {
      return NextResponse.json(
        { error: "Missing endpoint" },
        { status: 400 },
      );
    }

    await removeSubscription(endpoint);
    const total = await getSubscriptionCount();
    return NextResponse.json({ success: true, total });
  } catch (err) {
    console.error("[push/subscribe] DELETE error:", err);
    return NextResponse.json(
      { error: "Failed to remove subscription" },
      { status: 500 },
    );
  }
}
