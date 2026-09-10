/**
 * Siembra el torneo del equipo con un cuadrante FIJO (parejas y horarios
 * concretos, no generados al azar).
 *
 *   npx tsx scripts/seed-torneo-equipo.ts 2026-09-13 [--dry]
 *
 * Con --dry solo informa de que jugadores tienen cuenta y que horarios saldrian,
 * sin escribir nada. Requiere TZ=Europe/Madrid en el proceso.
 */
import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

const FECHA = process.argv[2];
const DRY = process.argv.includes("--dry");
const ORGANIZER_EMAIL = "nolomanolo990@gmail.com";
const DURACION_MIN = 30;

const JUGADORES = [
  "Jesús", "Sousa", "Nolo", "David", "Emilio", "Ramón",
  "Pablo", "Hugo Alén", "Iván Martínez", "Diego Lorenzo", "Juanjo", "Barbosa",
];

/** [horaInicio, pistas, [ [parejaA, parejaB] por pista ]] */
const CUADRANTE: [string, string[], [string, string][][]][] = [
  ["18:30", ["Lebrón", "Pabellón"], [
    [["Diego Lorenzo", "Emilio"], ["Barbosa", "Sousa"]],
    [["Juanjo", "Iván Martínez"], ["Hugo Alén", "David"]],
  ]],
  ["19:00", ["Lebrón", "Pabellón"], [
    [["Pablo", "Nolo"], ["Jesús", "Ramón"]],
    [["Juanjo", "Sousa"], ["Barbosa", "Diego Lorenzo"]],
  ]],
  ["19:30", ["Lebrón", "Pabellón"], [
    [["David", "Iván Martínez"], ["Hugo Alén", "Emilio"]],
    [["Pablo", "Jesús"], ["Nolo", "Ramón"]],
  ]],
  ["20:00", ["Montesiña", "Pabellón"], [
    [["Diego Lorenzo", "Juanjo"], ["Sousa", "Emilio"]],
    [["Barbosa", "Pablo"], ["David", "Nolo"]],
  ]],
  ["20:30", ["Montesiña", "Pabellón"], [
    [["Hugo Alén", "Jesús"], ["Iván Martínez", "Ramón"]],
    [["Pablo", "Emilio"], ["Barbosa", "Nolo"]],
  ]],
  ["21:00", ["Montesiña", "Pabellón"], [
    [["David", "Juanjo"], ["Diego Lorenzo", "Sousa"]],
    [["Ramón", "Hugo Alén"], ["Jesús", "Iván Martínez"]],
  ]],
];

/** Homonimos en el club: se fija la cuenta por email para no equivocarse */
const CUENTAS: Record<string, string> = {
  "Nolo": "nolomanolo990@gmail.com",
  "Sousa": "daviddesousalorenzo@gmail.com",
  "Barbosa": "barbosalorenzodavid@gmail.com",
  "Juanjo": "xoanbgpn1983@gmail.com",
  "David": "davidalvarezvidal9@gmail.com",
};

const norm = (s: string) =>
  s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();

async function main() {
  if (!FECHA || !/^\d{4}-\d{2}-\d{2}$/.test(FECHA)) {
    throw new Error("Pasa la fecha: npx tsx scripts/seed-torneo-equipo.ts YYYY-MM-DD");
  }

  const organizer = await db.user.findUnique({ where: { email: ORGANIZER_EMAIL } });
  if (!organizer) throw new Error(`No existe el usuario ${ORGANIZER_EMAIL}`);

  // Enlaza con cuentas reales. Los que tienen homonimos en el club se fijan por
  // email; el resto por nombre, y si hay mas de un candidato se deja de invitado
  // antes que arriesgarse a meter en el torneo a quien no es.
  const users = await db.user.findMany({ select: { id: true, name: true, email: true } });
  const resolved = JUGADORES.map((nombre) => {
    const email = CUENTAS[nombre];
    if (email) {
      const hit = users.find((u) => u.email === email);
      if (!hit) throw new Error(`No existe la cuenta ${email} (para ${nombre})`);
      return { nombre, userId: hit.id, cuenta: hit.name, nota: "por email" };
    }
    const n = norm(nombre);
    const cands = users.filter((u) => u.name && (norm(u.name) === n || norm(u.name).startsWith(n + " ")));
    if (cands.length === 1) return { nombre, userId: cands[0].id, cuenta: cands[0].name, nota: "por nombre" };
    if (cands.length > 1) {
      return { nombre, userId: null, cuenta: null, nota: `AMBIGUO: ${cands.map((c) => c.name).join(" / ")} -> va de invitado` };
    }
    return { nombre, userId: null, cuenta: null, nota: "sin cuenta" };
  });

  console.log("\nJugadores:");
  for (const r of resolved) {
    console.log(`  ${r.nombre.padEnd(16)} ${r.userId ? `-> "${r.cuenta}"` : "-> INVITADO"}   (${r.nota})`);
  }

  const at = (hhmm: string) => new Date(`${FECHA}T${hhmm}:00`);
  const hm = (d: Date) => d.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" });

  console.log(`\nCuadrante (${FECHA}, TZ=${Intl.DateTimeFormat().resolvedOptions().timeZone}):`);
  for (const [hora, pistas, partidos] of CUADRANTE) {
    const ini = at(hora);
    const fin = new Date(ini.getTime() + DURACION_MIN * 60_000);
    console.log(`  ${hm(ini)}-${hm(fin)}  ${pistas.join(" + ")}`);
    partidos.forEach(([a, b], i) => console.log(`      ${pistas[i]}: ${a.join(" / ")} vs ${b.join(" / ")}`));
  }

  if (DRY) { console.log("\n--dry: no se ha escrito nada.\n"); return; }

  const t = await db.tournament.create({
    data: {
      name: "Torneo del equipo — Montesiña",
      format: "PERSONALIZADO",
      category: "M",
      status: "IN_PROGRESS",
      pointsPerMatch: 21,
      freeScoring: true,
      matchDurationMin: DURACION_MIN,
      courtIds: [],
      scheduled: true,
      startsAt: at(CUADRANTE[0][0]),
      currentRound: CUADRANTE.length,
      organizerId: organizer.id,
      notes:
        "Turno 1 (18:30-20:00): Lebrón + Pabellón\n" +
        "Turno 2 (20:00-21:30): Montesiña + Pabellón\n" +
        "Partidos de 30 min a juegos libres. Cada uno juega 4 partidos.",
      players: {
        create: resolved.map((r) => (r.userId ? { userId: r.userId } : { guestName: r.nombre })),
      },
    },
    include: { players: { include: { user: true } } },
  });

  // Indexado por el nombre corto del cuadrante, no por el de la cuenta:
  // "Barbosa" en el cuadrante es la cuenta "David Barbosa".
  const idDe = new Map<string, string>();
  for (const r of resolved) {
    const fila = t.players.find((x) => (r.userId ? x.userId === r.userId : x.guestName === r.nombre));
    if (!fila) throw new Error(`No se creo el jugador ${r.nombre}`);
    idDe.set(norm(r.nombre), fila.id);
  }
  const pid = (nombre: string) => {
    const id = idDe.get(norm(nombre));
    if (!id) throw new Error(`No encuentro al jugador ${nombre}`);
    return id;
  };

  for (const [idx, [hora, pistas, partidos]] of CUADRANTE.entries()) {
    const ini = at(hora);
    await db.tournamentRound.create({
      data: {
        tournamentId: t.id,
        roundNumber: idx + 1,
        startsAt: ini,
        endsAt: new Date(ini.getTime() + DURACION_MIN * 60_000),
        courtNames: pistas,
        matches: {
          create: partidos.map(([a, b], i) => ({
            courtIndex: i,
            player1Id: pid(a[0]), player2Id: pid(a[1]),
            player3Id: pid(b[0]), player4Id: pid(b[1]),
          })),
        },
      },
    });
  }

  console.log(`\nTorneo creado: /torneos/${t.id}\n`);
}

main().catch((e) => { console.error(e.message); process.exit(1); }).finally(() => db.$disconnect());
