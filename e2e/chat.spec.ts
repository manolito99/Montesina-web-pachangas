import { test, expect } from "@playwright/test";
import { seedE2E, cleanupE2E, E2E_EMAILS } from "./helpers/fixtures";
import { login } from "./helpers/login";
import { newTestContext } from "./helpers/context";

test.describe("chat de pachanga — flujo de dos usuarios", () => {
  test.afterEach(async () => {
    await cleanupE2E();
  });

  test("Alice y Bob conversan y ambos ven los mensajes", async ({ browser }) => {
    const { pachangaId } = await seedE2E();

    const aliceCtx = await newTestContext(browser);
    const bobCtx = await newTestContext(browser);
    const alicePage = await aliceCtx.newPage();
    const bobPage = await bobCtx.newPage();

    try {
      await login(alicePage, E2E_EMAILS.alice);
      await login(bobPage, E2E_EMAILS.bob);

      await alicePage.goto(`/pachangas/${pachangaId}`);
      await bobPage.goto(`/pachangas/${pachangaId}`);

      // Alice writes a message
      const aliceInput = alicePage.getByTestId("chat-input").first();
      await aliceInput.fill("Hola desde Alice");
      await aliceInput.press("Enter");

      // Alice sees it as "mine" (lime background)
      const aliceOwn = alicePage
        .locator(".bg-lime")
        .filter({ hasText: "Hola desde Alice" });
      await expect(aliceOwn.first()).toBeVisible({ timeout: 5_000 });

      // Bob sees it (≤7s; one polling cycle + slack) as "theirs" (bg-fill)
      const bobIncoming = bobPage
        .locator(".bg-fill")
        .filter({ hasText: "Hola desde Alice" });
      await expect(bobIncoming.first()).toBeVisible({ timeout: 8_000 });
      await expect(bobPage.getByText("Alice E2E", { exact: false }).first()).toBeVisible();

      // Bob replies
      const bobInput = bobPage.getByTestId("chat-input").first();
      await bobInput.fill("Hola Alice!");
      await bobPage.getByTestId("chat-send").first().click();

      // Bob sees his own message in lime
      const bobOwn = bobPage
        .locator(".bg-lime")
        .filter({ hasText: "Hola Alice!" });
      await expect(bobOwn.first()).toBeVisible({ timeout: 5_000 });

      // Alice sees Bob's message via polling
      const aliceIncoming = alicePage
        .locator(".bg-fill")
        .filter({ hasText: "Hola Alice!" });
      await expect(aliceIncoming.first()).toBeVisible({ timeout: 8_000 });

      // Chat counter reflects both messages on both sides
      await expect(alicePage.getByText(/CHAT\s*·\s*2/).first()).toBeVisible();
      await expect(bobPage.getByText(/CHAT\s*·\s*2/).first()).toBeVisible();
    } finally {
      await aliceCtx.close();
      await bobCtx.close();
    }
  });
});
