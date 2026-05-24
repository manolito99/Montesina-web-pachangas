import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();
const DEMO_PASSWORD = bcrypt.hashSync("demo123", 12);

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

  // ─── Demo users ───
  const demo = await prisma.user.upsert({
    where: { email: "javi@correo.com" },
    update: {},
    create: {
      id: "user-demo",
      name: "Javi González",
      email: "javi@correo.com",
      password: DEMO_PASSWORD,
      gender: "MALE",
      level: 3,
    },
  });

  const marta = await prisma.user.upsert({
    where: { email: "marta@correo.com" },
    update: {},
    create: {
      id: "user-marta",
      name: "Marta López",
      email: "marta@correo.com",
      password: DEMO_PASSWORD,
      gender: "FEMALE",
      level: 3,
    },
  });

  const carlos = await prisma.user.upsert({
    where: { email: "carlos@correo.com" },
    update: {},
    create: {
      id: "user-carlos",
      name: "Carlos Ruiz",
      email: "carlos@correo.com",
      password: DEMO_PASSWORD,
      gender: "MALE",
      level: 4,
    },
  });

  const lucia = await prisma.user.upsert({
    where: { email: "lucia@correo.com" },
    update: {},
    create: {
      id: "user-lucia",
      name: "Lucía Vega",
      email: "lucia@correo.com",
      password: DEMO_PASSWORD,
      gender: "FEMALE",
      level: 2,
    },
  });

  // ─── Sample pachangas ───
  const today = new Date();
  today.setHours(19, 0, 0, 0);

  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(20, 30, 0, 0);

  const p1 = await prisma.pachanga.upsert({
    where: { id: "pachanga-1" },
    update: {},
    create: {
      id: "pachanga-1",
      category: "X",
      date: today,
      duration: 90,
      courtId: montesina.id,
      levelMin: 2,
      levelMax: 4,
      maxPlayers: 4,
      price: 8,
      notes: "Buscamos nivel medio. Llevo pelotas. Cancelo si llueve antes de las 17h.",
      status: "OPEN",
      organizerId: marta.id,
    },
  });

  await prisma.participation.upsert({
    where: { userId_pachangaId: { userId: marta.id, pachangaId: p1.id } },
    update: {},
    create: { userId: marta.id, pachangaId: p1.id, status: "CONFIRMED" },
  });
  await prisma.participation.upsert({
    where: { userId_pachangaId: { userId: carlos.id, pachangaId: p1.id } },
    update: {},
    create: { userId: carlos.id, pachangaId: p1.id, status: "CONFIRMED" },
  });
  await prisma.participation.upsert({
    where: { userId_pachangaId: { userId: demo.id, pachangaId: p1.id } },
    update: {},
    create: { userId: demo.id, pachangaId: p1.id, status: "CONFIRMED" },
  });

  const p2 = await prisma.pachanga.upsert({
    where: { id: "pachanga-2" },
    update: {},
    create: {
      id: "pachanga-2",
      category: "M",
      date: tomorrow,
      duration: 90,
      courtId: lebron.id,
      levelMin: 3,
      levelMax: 5,
      maxPlayers: 4,
      price: 8,
      status: "OPEN",
      organizerId: carlos.id,
    },
  });

  await prisma.participation.upsert({
    where: { userId_pachangaId: { userId: carlos.id, pachangaId: p2.id } },
    update: {},
    create: { userId: carlos.id, pachangaId: p2.id, status: "CONFIRMED" },
  });
  await prisma.participation.upsert({
    where: { userId_pachangaId: { userId: demo.id, pachangaId: p2.id } },
    update: {},
    create: { userId: demo.id, pachangaId: p2.id, status: "CONFIRMED" },
  });

  console.log("Seed completed:");
  console.log(`  3 club courts: ${montesina.name}, ${lebron.name}, ${pavillon.name}`);
  console.log(`  4 users (demo: javi@correo.com)`);
  console.log(`  2 pachangas with participations`);
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
