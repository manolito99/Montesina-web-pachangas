const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!;

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export async function getRegistration(): Promise<ServiceWorkerRegistration | null> {
  if (!("serviceWorker" in navigator)) return null;
  return navigator.serviceWorker.ready;
}

export async function getCurrentSubscription(): Promise<PushSubscription | null> {
  const reg = await getRegistration();
  if (!reg) return null;
  return reg.pushManager.getSubscription();
}

export async function subscribeToPush(): Promise<PushSubscription | null> {
  const reg = await getRegistration();
  if (!reg) throw new Error("Service Worker not available");

  const permission = await Notification.requestPermission();
  if (permission !== "granted") {
    throw new Error("Notification permission denied");
  }

  const subscription = await reg.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
  });

  await fetch("/api/push/subscribe", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ subscription: subscription.toJSON() }),
  });

  return subscription;
}

export async function unsubscribeFromPush(): Promise<void> {
  const subscription = await getCurrentSubscription();
  if (!subscription) return;

  await fetch("/api/push/subscribe", {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ endpoint: subscription.endpoint }),
  });

  await subscription.unsubscribe();
}

export async function sendTestPush(options?: {
  title?: string;
  body?: string;
  url?: string;
}): Promise<{ sent: number; failed: number; errors?: unknown[] }> {
  const res = await fetch("/api/push/send", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      title: options?.title ?? "Montesiña Padel",
      body: options?.body ?? "Tu pachanga empieza en 1 hora — Pista 1 · 19:00",
      url: options?.url ?? "/pachangas/1",
    }),
  });
  const data = await res.json();
  console.log("[push-client] send result:", data);
  return data;
}

export function isPushSupported(): boolean {
  return (
    typeof window !== "undefined" &&
    "serviceWorker" in navigator &&
    "PushManager" in window &&
    "Notification" in window
  );
}
