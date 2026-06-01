import { test, expect } from "@playwright/test";
import { seedE2E, cleanupE2E, E2E_EMAILS } from "./helpers/fixtures";
import { login } from "./helpers/login";
import { newTestContext } from "./helpers/context";

test.describe("chat de pachanga — validación", () => {
  test.afterEach(async () => {
    await cleanupE2E();
  });

  test("botón submit deshabilitado con input vacío", async ({ browser }) => {
    const { pachangaId } = await seedE2E();
    const ctx = await newTestContext(browser);
    const page = await ctx.newPage();

    try {
      await login(page, E2E_EMAILS.alice);
      await page.goto(`/pachangas/${pachangaId}`);

      const sendBtn = page.getByTestId("chat-send").first();
      await expect(sendBtn).toBeDisabled();

      const input = page.getByTestId("chat-input").first();
      await input.fill("   ");
      await expect(sendBtn).toBeDisabled();

      await input.fill("hola");
      await expect(sendBtn).toBeEnabled();
    } finally {
      await ctx.close();
    }
  });

  test("API devuelve 400 con texto vacío o > 500 chars", async ({ browser }) => {
    const { pachangaId } = await seedE2E();
    const ctx = await newTestContext(browser);
    const page = await ctx.newPage();

    try {
      await login(page, E2E_EMAILS.alice);
      await page.goto(`/pachangas/${pachangaId}`);

      const empty = await page.request.post(`/api/pachangas/${pachangaId}/chat`, {
        data: { text: "   " },
      });
      expect(empty.status()).toBe(400);

      const tooLong = await page.request.post(`/api/pachangas/${pachangaId}/chat`, {
        data: { text: "a".repeat(501) },
      });
      expect(tooLong.status()).toBe(400);

      const ok = await page.request.post(`/api/pachangas/${pachangaId}/chat`, {
        data: { text: "ok" },
      });
      expect(ok.status()).toBe(201);
    } finally {
      await ctx.close();
    }
  });
});
