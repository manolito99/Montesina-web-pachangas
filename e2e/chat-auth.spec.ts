import { test, expect } from "@playwright/test";
import { seedE2E, cleanupE2E, E2E_EMAILS } from "./helpers/fixtures";
import { login } from "./helpers/login";
import { newTestContext } from "./helpers/context";

test.describe("chat de pachanga — autorización", () => {
  test.afterEach(async () => {
    await cleanupE2E();
  });

  test("usuario no apuntado ve fallback y POST devuelve 403", async ({ browser }) => {
    const { pachangaId } = await seedE2E();

    const carolCtx = await newTestContext(browser);
    const carolPage = await carolCtx.newPage();

    try {
      await login(carolPage, E2E_EMAILS.carol);
      await carolPage.goto(`/pachangas/${pachangaId}`);

      await expect(
        carolPage.getByText("Apúntate para participar en el chat").first(),
      ).toBeVisible();

      // Direct POST using Carol's authenticated request context
      const res = await carolPage.request.post(`/api/pachangas/${pachangaId}/chat`, {
        data: { text: "intento prohibido" },
      });
      expect(res.status()).toBe(403);
    } finally {
      await carolCtx.close();
    }
  });

  test("sin sesión, POST devuelve 401", async ({ request }) => {
    const { pachangaId } = await seedE2E();

    const res = await request.post(`/api/pachangas/${pachangaId}/chat`, {
      data: { text: "anónimo" },
    });
    expect(res.status()).toBe(401);
  });
});
