import { cleanupE2E } from "./fixtures";

export default async function globalSetup() {
  // Wipe leftover e2e data so a previous failed run can't pollute this one.
  await cleanupE2E();
}
