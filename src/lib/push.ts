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

const subscriptions = new Map<string, PushSubscriptionRecord>();

export function saveSubscription(sub: PushSubscriptionRecord) {
  subscriptions.set(sub.endpoint, { ...sub, createdAt: Date.now() });
}

export function removeSubscription(endpoint: string) {
  subscriptions.delete(endpoint);
}

export function getAllSubscriptions(): PushSubscriptionRecord[] {
  return Array.from(subscriptions.values());
}

export function getSubscriptionCount(): number {
  return subscriptions.size;
}
