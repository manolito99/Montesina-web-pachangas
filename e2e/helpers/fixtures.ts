import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

export const E2E_PASSWORD = "e2etest1234";

export const E2E_EMAILS = {
  alice: "e2e-alice@test.local",
  bob: "e2e-bob@test.local",
  carol: "e2e-carol@test.local",
} as const;

export interface SeedResult {
  aliceId: string;
  bobId: string;
  carolId: string;
  pachangaId: string;
}

const PACHANGA_NOTE = "[e2e] pachanga de tests";

function getDb() {
  return new PrismaClient();
}

export async function cleanupE2E(): Promise<void> {
  const db = getDb();
  try {
    const users = await db.user.findMany({
      where: { email: { in: Object.values(E2E_EMAILS) as string[] } },
      select: { id: true },
    });
    const userIds = users.map((u) => u.id);

    const pachangas = await db.pachanga.findMany({
      where: { OR: [{ organizerId: { in: userIds } }, { notes: PACHANGA_NOTE }] },
      select: { id: true },
    });
    const pachangaIds = pachangas.map((p) => p.id);

    if (pachangaIds.length) {
      await db.chatMessage.deleteMany({ where: { pachangaId: { in: pachangaIds } } });
      await db.participation.deleteMany({ where: { pachangaId: { in: pachangaIds } } });
      await db.pachanga.deleteMany({ where: { id: { in: pachangaIds } } });
    }

    if (userIds.length) {
      await db.chatMessage.deleteMany({ where: { userId: { in: userIds } } });
      await db.participation.deleteMany({ where: { userId: { in: userIds } } });
      await db.notificationPrefs.deleteMany({ where: { userId: { in: userIds } } });
      await db.pushSubscription.deleteMany({ where: { userId: { in: userIds } } });
      await db.session.deleteMany({ where: { userId: { in: userIds } } });
      await db.account.deleteMany({ where: { userId: { in: userIds } } });
      await db.user.deleteMany({ where: { id: { in: userIds } } });
    }
  } finally {
    await db.$disconnect();
  }
}

export async function seedE2E(): Promise<SeedResult> {
  await cleanupE2E();
  const db = getDb();
  try {
    const passwordHash = await bcrypt.hash(E2E_PASSWORD, 10);

    const [alice, bob, carol] = await Promise.all([
      db.user.create({
        data: {
          email: E2E_EMAILS.alice,
          name: "Alice E2E",
          password: passwordHash,
          gender: "FEMALE",
          level: 3,
          profileCompleted: true,
        },
      }),
      db.user.create({
        data: {
          email: E2E_EMAILS.bob,
          name: "Bob E2E",
          password: passwordHash,
          gender: "MALE",
          level: 3,
          profileCompleted: true,
        },
      }),
      db.user.create({
        data: {
          email: E2E_EMAILS.carol,
          name: "Carol E2E",
          password: passwordHash,
          gender: "FEMALE",
          level: 3,
          profileCompleted: true,
        },
      }),
    ]);

    // Use the seeded club court ("Montesiña").
    const court = await db.court.findFirst({ where: { isClub: true } });
    if (!court) {
      throw new Error("[e2e] no club court found — run prisma db seed first");
    }

    // Two days from now, 18:00 local time.
    const date = new Date();
    date.setDate(date.getDate() + 2);
    date.setHours(18, 0, 0, 0);

    const pachanga = await db.pachanga.create({
      data: {
        category: "X",
        date,
        duration: 90,
        courtId: court.id,
        levelMin: 1,
        levelMax: 5,
        maxPlayers: 4,
        price: 5,
        notes: PACHANGA_NOTE,
        status: "OPEN",
        organizerId: alice.id,
      },
    });

    await db.participation.createMany({
      data: [
        { userId: alice.id, pachangaId: pachanga.id, status: "CONFIRMED" },
        { userId: bob.id, pachangaId: pachanga.id, status: "CONFIRMED" },
      ],
    });

    return {
      aliceId: alice.id,
      bobId: bob.id,
      carolId: carol.id,
      pachangaId: pachanga.id,
    };
  } finally {
    await db.$disconnect();
  }
}
