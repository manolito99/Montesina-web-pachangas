import { Page, expect } from "@playwright/test";
import { E2E_PASSWORD } from "./fixtures";

/**
 * Logs in via the NextAuth credentials API directly.
 *
 * We avoid driving the form through `signIn()` because the next-auth/react client
 * and SessionProvider race on `GET /api/auth/csrf` and overwrite each other's
 * csrf-token cookie — signIn ends up POSTing an old token, NextAuth rejects with
 * `?csrf=true`, no session is set, and the test sees an unauthenticated page.
 *
 * Doing the auth round-trip ourselves with `page.request` is deterministic: one
 * CSRF fetch, one credentials POST, one cookie chain. The resulting session
 * cookie lives on the browser context, so subsequent `page.goto` calls run
 * authenticated.
 */
export async function login(page: Page, email: string, password = E2E_PASSWORD) {
  const csrfRes = await page.request.get("/api/auth/csrf");
  const { csrfToken } = (await csrfRes.json()) as { csrfToken: string };

  const loginRes = await page.request.post("/api/auth/callback/credentials", {
    form: {
      email,
      password,
      csrfToken,
      callbackUrl: "/",
      json: "true",
    },
  });
  expect(loginRes.ok()).toBeTruthy();

  const session = await page.request.get("/api/auth/session");
  const json = (await session.json()) as { user?: { id?: string } };
  if (!json?.user?.id) {
    throw new Error(`[e2e] login failed for ${email}: no session after callback`);
  }
}
