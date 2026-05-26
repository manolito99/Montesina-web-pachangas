import { NextRequest, NextResponse } from "next/server";
import { processReminders } from "@/lib/services/push";

export async function GET(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get("secret");
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await processReminders();
    return NextResponse.json(result);
  } catch (err) {
    console.error("[cron/reminders] error:", err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
