import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  const courts = await db.court.findMany({ orderBy: { name: "asc" } });
  return NextResponse.json(courts);
}
