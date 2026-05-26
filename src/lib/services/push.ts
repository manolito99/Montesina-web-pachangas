// eslint-disable-next-line
const webpush = require("web-push") as typeof import("web-push");
import { db } from "@/lib/db";

let vapidInitialized = false;
function ensureVapid() {
  if (vapidInitialized) return;
  webpush.setVapidDetails(
    process.env.VAPID_SUBJECT!,
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
    process.env.VAPID_PRIVATE_KEY!,
  );
  vapidInitialized = true;
}

export { webpush };

async function sendToSubs(
  subs: { endpoint: string; p256dh: string; auth: string }[],
  data: string,
) {
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

  return { sent, failed };
}

function buildPayload(payload: { title: string; body: string; url?: string; tag?: string }) {
  return JSON.stringify({
    title: payload.title,
    body: payload.body,
    icon: "/icons/icon-192.png",
    badge: "/icons/icon-192.png",
    url: payload.url || "/",
    tag: payload.tag || `montesina-${Date.now()}`,
  });
}

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
  ensureVapid();
  const subs = await db.pushSubscription.findMany();
  if (subs.length === 0) return { sent: 0, failed: 0 };

  const data = buildPayload(payload);
  const result = await sendToSubs(subs, data);
  console.log(`[push] Broadcast: ${result.sent} sent, ${result.failed} failed`);
  return result;
}

export async function sendPushToParticipants(
  payload: { title: string; body: string; url?: string; tag?: string },
  pachangaId: string,
  excludeUserId?: string,
) {
  ensureVapid();

  const participations = await db.participation.findMany({
    where: {
      pachangaId,
      status: { in: ["CONFIRMED", "WAITLIST"] },
      ...(excludeUserId ? { userId: { not: excludeUserId } } : {}),
    },
    select: { userId: true },
  });

  const userIds = participations.map((p) => p.userId);
  if (userIds.length === 0) return { sent: 0, failed: 0 };

  const subs = await db.pushSubscription.findMany({
    where: { userId: { in: userIds } },
    include: { user: { include: { notifPrefs: true } } },
  });

  const filtered = subs.filter((sub) => {
    const prefs = sub.user?.notifPrefs;
    if (prefs && !prefs.alguienSeApunta) return false;
    return true;
  });

  if (filtered.length === 0) return { sent: 0, failed: 0 };

  const data = buildPayload(payload);
  const result = await sendToSubs(filtered, data);
  console.log(`[push] Participants (${pachangaId}): ${result.sent} sent, ${result.failed} failed`);
  return result;
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
  ensureVapid();
  const subs = await db.pushSubscription.findMany({
    include: {
      user: {
        include: { notifPrefs: true },
      },
    },
  });

  if (subs.length === 0) return { sent: 0, failed: 0 };

  const data = buildPayload(payload);

  let sent = 0;
  let failed = 0;
  let skipped = 0;

  await Promise.allSettled(
    subs.map(async (sub) => {
      if (filter.excludeUserId && sub.userId === filter.excludeUserId) {
        skipped++;
        return;
      }

      const prefs = sub.user?.notifPrefs;

      if (prefs) {
        if (!prefs.newPachanga) { skipped++; return; }

        if (filter.category) {
          if (filter.category === "M" && !prefs.catMasculino) { skipped++; return; }
          if (filter.category === "F" && !prefs.catFemenino) { skipped++; return; }
          if (filter.category === "X" && !prefs.catMixto) { skipped++; return; }
        }

        if (prefs.onlyMyLevel && sub.user && filter.levelMin != null && filter.levelMax != null) {
          const userLevel = sub.user.level;
          if (userLevel < filter.levelMin || userLevel > filter.levelMax) {
            skipped++;
            return;
          }
        }

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
