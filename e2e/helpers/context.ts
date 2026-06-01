import { Browser, BrowserContext } from "@playwright/test";

/**
 * Creates a fresh browser context with the PWA install onboarding flag set so
 * the modal doesn't intercept clicks in tests.
 */
export async function newTestContext(browser: Browser): Promise<BrowserContext> {
  const ctx = await browser.newContext();
  await ctx.addInitScript(() => {
    try {
      window.localStorage.setItem("montesina-onboarding-done", "1");
    } catch {
      /* ignore */
    }
  });
  return ctx;
}
