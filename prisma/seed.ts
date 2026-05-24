import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // ─── Club courts (las 3 pistas oficiales de Montesiña) ───
  const montesina = await prisma.court.upsert({
    where: { id: "court-montesina" },
    update: { name: "Montesiña", type: "OUTDOOR", location: "Club Montesiña", address: "Montesiña, Pontevedra", isClub: true },
    create: { id: "court-montesina", name: "Montesiña", type: "OUTDOOR", location: "Club Montesiña", address: "Montesiña, Pontevedra", isClub: true },
  });

  const lebron = await prisma.court.upsert({
    where: { id: "court-lebron" },
    update: { name: "Lebrón", type: "INDOOR", location: "Club Montesiña", address: "Montesiña, Pontevedra", isClub: true },
    create: { id: "court-lebron", name: "Lebrón", type: "INDOOR", location: "Club Montesiña", address: "Montesiña, Pontevedra", isClub: true },
  });

  const pavillon = await prisma.court.upsert({
    where: { id: "court-pavillon" },
    update: { name: "Pabellón", type: "INDOOR", location: "Club Montesiña", address: "Montesiña, Pontevedra", isClub: true },
    create: { id: "court-pavillon", name: "Pabellón", type: "INDOOR", location: "Club Montesiña", address: "Montesiña, Pontevedra", isClub: true },
  });

  console.log("Seed completed:");
  console.log(`  3 club courts: ${montesina.name}, ${lebron.name}, ${pavillon.name}`);
  console.log("  No demo users or pachangas — real users register via Google/email");
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
