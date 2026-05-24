import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

async function getUserId(): Promise<string | null> {
  const session = await getServerSession(authOptions);
  return (session?.user as { id?: string })?.id ?? null;
}

export async function GET() {
  const courts = await db.court.findMany({
    orderBy: [{ isClub: "desc" }, { name: "asc" }],
  });
  return NextResponse.json(courts);
}

export async function POST(req: NextRequest) {
  try {
    const userId = await getUserId();

    const body = await req.json();
    const { name, type, location, address } = body;

    if (!name || !type) {
      return NextResponse.json(
        { error: "name and type are required" },
        { status: 400 },
      );
    }

    const court = await db.court.create({
      data: {
        name,
        type: type === "INDOOR" ? "INDOOR" : "OUTDOOR",
        location: location || null,
        address: address || null,
        isClub: false,
        createdBy: userId,
      },
    });

    return NextResponse.json(court, { status: 201 });
  } catch (err) {
    console.error("[api/courts] POST error:", err);
    return NextResponse.json(
      { error: "Failed to create court" },
      { status: 500 },
    );
  }
}
