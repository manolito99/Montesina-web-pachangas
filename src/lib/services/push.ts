import fs from "fs";
import path from "path";

// eslint-disable-next-line @typescript-eslint/no-require-imports
const webpush = require("web-push") as typeof import("web-push");

webpush.setVapidDetails(
  process.env.VAPID_SUBJECT!,
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!,
);

export { webpush };

export interface PushSubscriptionRecord {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
  createdAt: number;
}

const SUBS_FILE = path.join(process.cwd(), ".push-subscriptions.json");

function readSubs(): Map<string, PushSubscriptionRecord> {
  try {
    const data = fs.readFileSync(SUBS_FILE, "utf-8");
    const arr: PushSubscriptionRecord[] = JSON.parse(data);
    return new Map(arr.map((s) => [s.endpoint, s]));
  } catch {
    return new Map();
  }
}

function writeSubs(subs: Map<string, PushSubscriptionRecord>) {
  fs.writeFileSync(SUBS_FILE, JSON.stringify(Array.from(subs.values()), null, 2));
}

export function saveSubscription(sub: PushSubscriptionRecord) {
  const subs = readSubs();
  subs.set(sub.endpoint, { ...sub, createdAt: Date.now() });
  writeSubs(subs);
  console.log(`[push] Subscription saved. Total: ${subs.size}`);
}

export function removeSubscription(endpoint: string) {
  const subs = readSubs();
  subs.delete(endpoint);
  writeSubs(subs);
  console.log(`[push] Subscription removed. Total: ${subs.size}`);
}

export function getAllSubscriptions(): PushSubscriptionRecord[] {
  const subs = readSubs();
  return Array.from(subs.values());
}

export function getSubscriptionCount(): number {
  return readSubs().size;
}

export async function sendPushToAll(payload: {
  title: string;
  body: string;
  url?: string;
  tag?: string;
}): Promise<{ sent: number; failed: number }> {
  const subscriptions = getAllSubscriptions();
  if (subscriptions.length === 0) return { sent: 0, failed: 0 };

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
    subscriptions.map(async (sub) => {
      try {
        await webpush.sendNotification({ endpoint: sub.endpoint, keys: sub.keys }, data);
        sent++;
      } catch (err: unknown) {
        failed++;
        const statusCode = err && typeof err === "object" && "statusCode" in err
          ? (err as { statusCode: number }).statusCode : 0;
        if (statusCode === 404 || statusCode === 410) {
          removeSubscription(sub.endpoint);
        }
      }
    }),
  );

  console.log(`[push] Broadcast: ${sent} sent, ${failed} failed`);
  return { sent, failed };
}
