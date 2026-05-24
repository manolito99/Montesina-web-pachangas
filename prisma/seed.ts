import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Courts
  const courts = await Promise.all([
    prisma.court.upsert({
      where: { id: "court-1" },
      update: {},
      create: { id: "court-1", name: "Pista 1", type: "OUTDOOR" },
    }),
    prisma.court.upsert({
      where: { id: "court-2" },
      update: {},
      create: { id: "court-2", name: "Pista 2", type: "INDOOR" },
    }),
    prisma.court.upsert({
      where: { id: "court-3" },
      update: {},
      create: { id: "court-3", name: "Pista 3", type: "INDOOR" },
    }),
    prisma.court.upsert({
      where: { id: "court-4" },
      update: {},
      create: { id: "court-4", name: "Pista 4", type: "OUTDOOR" },
    }),
  ]);

  // Demo user
  const demo = await prisma.user.upsert({
    where: { email: "javi@correo.com" },
    update: {},
    create: {
      id: "user-demo",
      name: "Javi González",
      email: "javi@correo.com",
      password: "$demo$",
      gender: "MALE",
      level: 3,
    },
  });

  // Extra users for pachangas
  const marta = await prisma.user.upsert({
    where: { email: "marta@correo.com" },
    update: {},
    create: {
      id: "user-marta",
      name: "Marta López",
      email: "marta@correo.com",
      password: "$demo$",
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
      password: "$demo$",
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
      password: "$demo$",
      gender: "FEMALE",
      level: 2,
    },
  });

  // Sample pachangas
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
      courtId: "court-1",
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
      courtId: "court-3",
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
  console.log(`  ${courts.length} courts`);
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
