import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { isAdmin } from "@/lib/admin";

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } },
) {
  const tournament = await db.tournament.findUnique({
    where: { id: params.id },
    include: {
      organizer: { select: { id: true, name: true } },
      players: {
        include: { user: { select: { id: true, name: true, level: true, gender: true, image: true } } },
        orderBy: { totalPoints: "desc" },
      },
      rounds: {
        include: {
          matches: {
            include: {
              player1: { select: { id: true, guestName: true, user: { select: { id: true, name: true } } } },
              player2: { select: { id: true, guestName: true, user: { select: { id: true, name: true } } } },
              player3: { select: { id: true, guestName: true, user: { select: { id: true, name: true } } } },
              player4: { select: { id: true, guestName: true, user: { select: { id: true, name: true } } } },
            },
          },
        },
        orderBy: { roundNumber: "asc" },
      },
    },
  });

  if (!tournament) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Normalize player display data (user OR guest)
  const normalizePlayer = (p: { user: { id: string; name: string | null; level: number; gender?: string; image?: string | null } | null; guestName: string | null; guestLevel: number | null }) => ({
    displayName: p.user?.name || p.guestName || "?",
    level: p.user?.level || p.guestLevel || 3,
    isGuest: !p.user,
  });

  const result = {
    ...tournament,
    players: tournament.players.map((p) => ({ ...p, ...normalizePlayer(p), user: p.user ? { ...p.user, name: p.user.name || p.guestName, level: p.user.level } : { id: p.id, name: p.guestName, level: p.guestLevel || 3, gender: "MALE", image: null } })),
    rounds: tournament.rounds.map((r) => ({
      ...r,
      matches: r.matches.map((m) => ({
        ...m,
        player1: { ...m.player1, user: m.player1.user ? { id: m.player1.user.id, name: m.player1.user.name || m.player1.guestName } : { id: m.player1.id, name: m.player1.guestName } },
        player2: { ...m.player2, user: m.player2.user ? { id: m.player2.user.id, name: m.player2.user.name || m.player2.guestName } : { id: m.player2.id, name: m.player2.guestName } },
        player3: { ...m.player3, user: m.player3.user ? { id: m.player3.user.id, name: m.player3.user.name || m.player3.guestName } : { id: m.player3.id, name: m.player3.guestName } },
        player4: { ...m.player4, user: m.player4.user ? { id: m.player4.user.id, name: m.player4.user.name || m.player4.guestName } : { id: m.player4.id, name: m.player4.guestName } },
      })),
    })),
  };

  return NextResponse.json(result);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } },
) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string })?.id;
  const userEmail = session?.user?.email;
  if (!userId) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const tournament = await db.tournament.findUnique({ where: { id: params.id } });
  if (!tournament) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const admin = isAdmin(userEmail);

  if (!admin && tournament.organizerId !== userId) {
    return NextResponse.json({ error: "Solo el organizador puede eliminar" }, { status: 403 });
  }
  if (!admin && (tournament.status === "IN_PROGRESS" || tournament.status === "FINISHED")) {
    return NextResponse.json({ error: "No se puede eliminar un torneo en curso o finalizado" }, { status: 400 });
  }

  // Borrar en orden: matches → rounds → players → tournament
  // (TournamentMatch referencia a TournamentPlayer sin cascade, hay que hacerlo a mano)
  await db.tournamentMatch.deleteMany({
    where: { round: { tournamentId: params.id } },
  });
  await db.tournamentRound.deleteMany({ where: { tournamentId: params.id } });
  await db.tournamentPlayer.deleteMany({ where: { tournamentId: params.id } });
  await db.tournament.delete({ where: { id: params.id } });

  return NextResponse.json({ success: true });
}
