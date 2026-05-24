import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } },
) {
  const pachanga = await db.pachanga.findUnique({
    where: { id: params.id },
    include: {
      court: true,
      organizer: { select: { id: true, name: true, level: true } },
      participations: {
        include: {
          user: { select: { id: true, name: true, level: true, gender: true } },
        },
        orderBy: { joinedAt: "asc" },
      },
      chatMessages: {
        include: { user: { select: { id: true, name: true } } },
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!pachanga) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(pachanga);
}
