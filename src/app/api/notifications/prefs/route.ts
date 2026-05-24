import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

async function getUserId(): Promise<string | null> {
  const session = await getServerSession(authOptions);
  return (session?.user as { id?: string })?.id ?? null;
}

export async function GET() {
  const userId = await getUserId();
  if (!userId) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  let prefs = await db.notificationPrefs.findUnique({ where: { userId } });

  if (!prefs) {
    prefs = await db.notificationPrefs.create({
      data: { userId },
    });
  }

  return NextResponse.json(prefs);
}

export async function PUT(req: NextRequest) {
  const userId = await getUserId();
  if (!userId) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const body = await req.json();

  const prefs = await db.notificationPrefs.upsert({
    where: { userId },
    create: { userId, ...body },
    update: body,
  });

  return NextResponse.json(prefs);
}
