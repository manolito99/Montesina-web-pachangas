import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const q = req.nextUrl.searchParams.get("q") || "";
  const gender = req.nextUrl.searchParams.get("gender");

  const users = await db.user.findMany({
    where: {
      name: { contains: q, mode: "insensitive" },
      ...(gender === "MALE" || gender === "FEMALE" ? { gender } : {}),
    },
    select: { id: true, name: true, level: true, gender: true, image: true },
    take: 20,
    orderBy: { name: "asc" },
  });

  return NextResponse.json(users);
}
