import { cleanupE2E } from "./fixtures";

export default async function globalTeardown() {
  await cleanupE2E();
}
