// eslint-disable-next-line @typescript-eslint/no-require-imports
const webpush = require("web-push") as typeof import("web-push");
import { db } from "@/lib/db";

webpush.setVapidDetails(
  process.env.VAPID_SUBJECT!,
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!,
);

export { webpush };

export async function saveSubscription(
  endpoint: string,
  p256dh: string,
  auth: string,
  userId?: string | null,
) {
  await db.pushSubscription.upsert({
    where: { endpoint },
    create: { endpoint, p256dh, auth, userId: userId || null },
    update: { p256dh, auth, userId: userId || undefined },
  });
  const total = await db.pushSubscription.count();
  console.log(`[push] Subscription saved. Total: ${total}`);
}

export async function removeSubscription(endpoint: string) {
  await db.pushSubscription.deleteMany({ where: { endpoint } });
  const total = await db.pushSubscription.count();
  console.log(`[push] Subscription removed. Total: ${total}`);
}

export async function getSubscriptionCount() {
  return db.pushSubscription.count();
}

export async function sendPushToAll(payload: {
  title: string;
  body: string;
  url?: string;
  tag?: string;
}) {
  const subs = await db.pushSubscription.findMany();
  if (subs.length === 0) return { sent: 0, failed: 0 };

  const data = JSON.stringify({
    title: payload.title,
    body: payload.body,
    icon: "/icons/icon-192.png",
    badge: "/icons/icon-192.png",
    url: payload.url || "/",
    tag: payload.tag || `montesina-${Date.now()}`,
  });

  let sent = 0;
  let failed = 0;

  await Promise.allSettled(
    subs.map(async (sub) => {
      try {
        await webpush.sendNotification(
          { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
          data,
        );
        sent++;
      } catch (err: unknown) {
        failed++;
        const sc = err && typeof err === "object" && "statusCode" in err
          ? (err as { statusCode: number }).statusCode : 0;
        if (sc === 404 || sc === 410) {
          await db.pushSubscription.deleteMany({ where: { endpoint: sub.endpoint } });
        }
      }
    }),
  );

  console.log(`[push] Broadcast: ${sent} sent, ${failed} failed`);
  return { sent, failed };
}

export async function sendPushFiltered(
  payload: { title: string; body: string; url?: string; tag?: string },
  filter: {
    category?: string;
    levelMin?: number;
    levelMax?: number;
    courtId?: string;
    excludeUserId?: string;
  },
) {
  // Get all subscriptions with their user's notification prefs
  const subs = await db.pushSubscription.findMany({
    include: {
      user: {
        include: { notifPrefs: true },
      },
    },
  });

  if (subs.length === 0) return { sent: 0, failed: 0 };

  const data = JSON.stringify({
    title: payload.title,
    body: payload.body,
    icon: "/icons/icon-192.png",
    badge: "/icons/icon-192.png",
    url: payload.url || "/",
    tag: payload.tag || `montesina-${Date.now()}`,
  });

  let sent = 0;
  let failed = 0;
  let skipped = 0;

  await Promise.allSettled(
    subs.map(async (sub) => {
      // Skip the user who created the pachanga
      if (filter.excludeUserId && sub.userId === filter.excludeUserId) {
        skipped++;
        return;
      }

      const prefs = sub.user?.notifPrefs;

      // If user has prefs, check them
      if (prefs) {
        if (!prefs.newPachanga) { skipped++; return; }

        // Check category preference
        if (filter.category) {
          if (filter.category === "M" && !prefs.catMasculino) { skipped++; return; }
          if (filter.category === "F" && !prefs.catFemenino) { skipped++; return; }
          if (filter.category === "X" && !prefs.catMixto) { skipped++; return; }
        }

        // Check level preference
        if (prefs.onlyMyLevel && sub.user && filter.levelMin != null && filter.levelMax != null) {
          const userLevel = sub.user.level;
          if (userLevel < filter.levelMin || userLevel > filter.levelMax) {
            skipped++;
            return;
          }
        }

        // Check court preference
        if (prefs.courtId && filter.courtId && prefs.courtId !== filter.courtId) {
          skipped++;
          return;
        }
      }

      try {
        await webpush.sendNotification(
          { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
          data,
        );
        sent++;
      } catch (err: unknown) {
        failed++;
        const sc = err && typeof err === "object" && "statusCode" in err
          ? (err as { statusCode: number }).statusCode : 0;
        if (sc === 404 || sc === 410) {
          await db.pushSubscription.deleteMany({ where: { endpoint: sub.endpoint } });
        }
      }
    }),
  );

  console.log(`[push] Filtered: ${sent} sent, ${failed} failed, ${skipped} skipped`);
  return { sent, failed, skipped };
}
