import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { generateAmericanoRound, generateMexicanoRound } from "@/lib/tournament-logic";

interface ParsedBlock {
  startsAt: Date;
  rounds: number;
  courtNames: string[];
}

/** Validates the schedule sent by the planner. Returns { error } if unusable. */
function parseSchedule(raw: {
  matchDurationMin?: unknown;
  restBetweenMin?: unknown;
  blocks?: { startsAt?: unknown; rounds?: unknown; courtNames?: unknown }[];
}): { matchDurationMin: number; restBetweenMin: number; blocks: ParsedBlock[] } | { error: string } {
  const matchDurationMin = Number(raw.matchDurationMin);
  const restBetweenMin = Number(raw.restBetweenMin);
  if (!Number.isInteger(matchDurationMin) || matchDurationMin < 1 || matchDurationMin > 180) {
    return { error: "La duracion del partido debe estar entre 1 y 180 minutos" };
  }
  if (!Number.isInteger(restBetweenMin) || restBetweenMin < 0 || restBetweenMin > 120) {
    return { error: "El descanso entre rondas debe estar entre 0 y 120 minutos" };
  }
  if (!Array.isArray(raw.blocks) || raw.blocks.length === 0 || raw.blocks.length > 10) {
    return { error: "Define entre 1 y 10 bloques horarios" };
  }

  const blocks: ParsedBlock[] = [];
  let totalRounds = 0;
  for (const [i, b] of raw.blocks.entries()) {
    const startsAt = new Date(String(b.startsAt));
    if (isNaN(startsAt.getTime())) {
      return { error: `Bloque ${i + 1}: la hora de inicio no es valida` };
    }
    const rounds = Number(b.rounds);
    if (!Number.isInteger(rounds) || rounds < 1 || rounds > 30) {
      return { error: `Bloque ${i + 1}: las rondas deben estar entre 1 y 30` };
    }
    const courtNames = Array.isArray(b.courtNames)
      ? b.courtNames.map((c) => String(c).trim()).filter(Boolean).slice(0, 20)
      : [];
    if (courtNames.length === 0) {
      return { error: `Bloque ${i + 1}: indica al menos una pista` };
    }
    totalRounds += rounds;
    blocks.push({ startsAt, rounds, courtNames });
  }
  if (totalRounds > 60) {
    return { error: "Demasiadas rondas en total (maximo 60)" };
  }

  return { matchDurationMin, restBetweenMin, blocks };
}

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string })?.id;
  if (!userId) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const tournament = await db.tournament.findUnique({
    where: { id: params.id },
    include: { players: { where: { active: true } } },
  });

  if (!tournament) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  if (tournament.organizerId !== userId) {
    return NextResponse.json({ error: "Solo el organizador" }, { status: 403 });
  }
  if (tournament.status === "IN_PROGRESS" || tournament.status === "FINISHED") {
    return NextResponse.json({ error: "El torneo ya está en curso" }, { status: 400 });
  }
  if (tournament.players.length < 4) {
    return NextResponse.json({ error: "Se necesitan al menos 4 jugadores" }, { status: 400 });
  }

  let body: unknown = null;
  try {
    body = await req.json();
  } catch { /* no body, use defaults */ }
  const payload = (body ?? {}) as {
    numCourts?: unknown;
    schedule?: {
      matchDurationMin?: unknown;
      restBetweenMin?: unknown;
      blocks?: { startsAt?: unknown; rounds?: unknown; courtNames?: unknown }[];
    };
  };

  const players = tournament.players.map((p) => ({ id: p.id, totalPoints: 0 }));

  /* ── Planned tournament: build the whole schedule up front ── */
  if (payload.schedule) {
    if (tournament.format === "MEXICANO") {
      return NextResponse.json({
        error: "El formato Mexicano empareja segun la clasificacion, asi que las rondas no se pueden planificar por adelantado",
      }, { status: 400 });
    }

    const plan = parseSchedule(payload.schedule);
    if ("error" in plan) {
      return NextResponse.json({ error: plan.error }, { status: 400 });
    }

    const partnerHistory = new Map<string, Set<string>>();
    const matchesPlayed = new Map<string, number>();
    const lastPlayedRound = new Map<string, number>();
    const rounds: {
      roundNumber: number;
      startsAt: Date;
      endsAt: Date;
      courtNames: string[];
      matches: { courtIndex: number; player1Id: string; player2Id: string; player3Id: string; player4Id: string }[];
    }[] = [];

    let roundNumber = 0;
    for (const block of plan.blocks) {
      const slotMin = plan.matchDurationMin + plan.restBetweenMin;
      for (let i = 0; i < block.rounds; i++) {
        roundNumber++;
        const startsAt = new Date(block.startsAt.getTime() + i * slotMin * 60_000);
        const endsAt = new Date(startsAt.getTime() + plan.matchDurationMin * 60_000);
        const result = generateAmericanoRound(
          players, partnerHistory, block.courtNames.length, matchesPlayed, lastPlayedRound,
        );
        if (result.matches.length === 0) {
          return NextResponse.json({
            error: `No se pueden formar partidos en la ronda ${roundNumber}. Revisa el numero de pistas y de jugadores.`,
          }, { status: 400 });
        }
        for (const m of result.matches) {
          for (const [x, y] of [m.teamA, m.teamB]) {
            if (!partnerHistory.has(x)) partnerHistory.set(x, new Set());
            if (!partnerHistory.has(y)) partnerHistory.set(y, new Set());
            partnerHistory.get(x)!.add(y);
            partnerHistory.get(y)!.add(x);
          }
          for (const p of [...m.teamA, ...m.teamB]) {
            matchesPlayed.set(p, (matchesPlayed.get(p) ?? 0) + 1);
            lastPlayedRound.set(p, roundNumber);
          }
        }
        rounds.push({
          roundNumber,
          startsAt,
          endsAt,
          courtNames: block.courtNames,
          matches: result.matches.map((m) => ({
            courtIndex: m.courtIndex,
            player1Id: m.teamA[0],
            player2Id: m.teamA[1],
            player3Id: m.teamB[0],
            player4Id: m.teamB[1],
          })),
        });
      }
    }

    await db.$transaction([
      ...rounds.map((r) =>
        db.tournamentRound.create({
          data: {
            tournamentId: params.id,
            roundNumber: r.roundNumber,
            startsAt: r.startsAt,
            endsAt: r.endsAt,
            courtNames: r.courtNames,
            matches: { create: r.matches },
          },
        }),
      ),
      db.tournament.update({
        where: { id: params.id },
        data: {
          status: "IN_PROGRESS",
          currentRound: rounds.length,
          scheduled: true,
          startsAt: rounds[0].startsAt,
          matchDurationMin: plan.matchDurationMin,
        },
      }),
    ]);

    return NextResponse.json({ scheduled: true, rounds: rounds.length });
  }

  /* ── Unplanned tournament: one round at a time, as before ── */
  const requestedCourts = typeof payload.numCourts === "number" && payload.numCourts >= 1 && payload.numCourts <= 20
    ? payload.numCourts
    : null;
  const numCourts = requestedCourts ?? (tournament.courtIds.length || 1);

  const result = tournament.format === "MEXICANO"
    ? generateMexicanoRound(players, 1, numCourts)
    : generateAmericanoRound(players, new Map(), numCourts);

  const round = await db.tournamentRound.create({
    data: {
      tournamentId: params.id,
      roundNumber: 1,
      matches: {
        create: result.matches.map((m) => ({
          courtIndex: m.courtIndex,
          player1Id: m.teamA[0],
          player2Id: m.teamA[1],
          player3Id: m.teamB[0],
          player4Id: m.teamB[1],
        })),
      },
    },
    include: { matches: true },
  });

  await db.tournament.update({
    where: { id: params.id },
    data: { status: "IN_PROGRESS", currentRound: 1 },
  });

  return NextResponse.json({ round, sitsOut: result.sitsOut });
}
