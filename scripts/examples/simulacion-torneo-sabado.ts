const { generateAmericanoRound } = require("./src/lib/tournament-logic");

const NAMES = [
  "Jesús", "Pablo", "Iván", "Gon", "Rilla", "Lucho", "Diego L",
  "David A", "Oscar", "Rodri", "Rubén Cal", "Quique", "Emilio",
  "Diego M", "Feli", "Manu", "Sousa", "Forty", "Mandy", "Hugo", "Juanjo",
];

console.log("================================================");
console.log("  SIMULACION TORNEO SABADO - 21 JUGADORES REALES");
console.log("  Bloque 1: 11:00-12:30 (2 pistas, 4 rondas)");
console.log("  Bloque 2: 12:30-14:00 (3 pistas, 4 rondas)");
console.log("================================================");

const players = NAMES.map((name, i) => ({ id: String(i + 1), name }));
const playerById = new Map(players.map((p) => [p.id, p.name]));
const partnerHistory = new Map<string, Set<string>>();
const matchesPlayed = new Map<string, number>();
const bump = (id: string) => matchesPlayed.set(id, (matchesPlayed.get(id) ?? 0) + 1);

const config = [
  { rounds: 4, courts: 2, label: "BLOQUE 1 (11:00-12:30)" },
  { rounds: 4, courts: 3, label: "BLOQUE 2 (12:30-14:00)" },
];

let round = 0;
let totalMatches = 0;
for (const block of config) {
  console.log(`\n━━━ ${block.label} ━━━`);
  for (let r = 0; r < block.rounds; r++) {
    round++;
    const res = generateAmericanoRound(
      players.map((p) => ({ id: p.id })),
      partnerHistory,
      block.courts,
      matchesPlayed
    );
    const playing = new Set<string>();
    console.log(`\nRonda ${round}:`);
    res.matches.forEach((m: any, i: number) => {
      const t1 = playerById.get(m.teamA[0]);
      const t2 = playerById.get(m.teamA[1]);
      const t3 = playerById.get(m.teamB[0]);
      const t4 = playerById.get(m.teamB[1]);
      console.log(`  Pista ${i + 1}: ${t1} + ${t2}  vs  ${t3} + ${t4}`);
      [m.teamA[0], m.teamA[1], m.teamB[0], m.teamB[1]].forEach((id: string) => playing.add(id));
      partnerHistory.set(m.teamA[0], (partnerHistory.get(m.teamA[0]) ?? new Set()).add(m.teamA[1]));
      partnerHistory.set(m.teamA[1], (partnerHistory.get(m.teamA[1]) ?? new Set()).add(m.teamA[0]));
      partnerHistory.set(m.teamB[0], (partnerHistory.get(m.teamB[0]) ?? new Set()).add(m.teamB[1]));
      partnerHistory.set(m.teamB[1], (partnerHistory.get(m.teamB[1]) ?? new Set()).add(m.teamB[0]));
      bump(m.teamA[0]); bump(m.teamA[1]); bump(m.teamB[0]); bump(m.teamB[1]);
      totalMatches++;
    });
    const sittingOut = players.filter((p) => !playing.has(p.id)).map((p) => p.name);
    console.log(`  Descansan: ${sittingOut.join(", ")}`);
  }
}

console.log("\n================================================");
console.log("  RESUMEN FINAL");
console.log("================================================");
console.log(`Total partidos: ${totalMatches}`);
console.log(`Total slots: ${totalMatches * 4}`);

console.log("\nPartidos por jugador (ordenado):");
const ranked = players
  .map((p) => ({ name: p.name, count: matchesPlayed.get(p.id) ?? 0 }))
  .sort((a, b) => b.count - a.count);
ranked.forEach((r) => console.log(`  ${r.count} partidos · ${r.name}`));

const counts = ranked.map((r) => r.count);
const min = Math.min(...counts);
const max = Math.max(...counts);
const with4 = counts.filter((n) => n === 4).length;
const with3 = counts.filter((n) => n === 3).length;
console.log(`\nMin: ${min}, Max: ${max}, Diferencia: ${max - min}`);
console.log(`${with4} jugadores con 4 partidos, ${with3} jugadores con 3 partidos`);
