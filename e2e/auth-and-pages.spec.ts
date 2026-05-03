import { test, expect } from "@playwright/test";

test.describe("Public pages", () => {
  test("home loads with hero heading", async ({ page }) => {
    await page.goto("/");
    await expect(
      page.getByRole("heading", {
        name: /welcome to the lands of interphaze/i,
      })
    ).toBeVisible();
  });

  test("login page loads with welcome content", async ({ page }) => {
    await page.goto("/login");
    await expect(
      page.getByRole("heading", { name: /welcome back/i })
    ).toBeVisible();
    await expect(page.getByRole("link", { name: /sign up/i })).toBeVisible();
  });

  test("sign-up page loads with create-account messaging", async ({
    page,
  }) => {
    await page.goto("/sign-up");
    await expect(
      page.getByRole("heading", { name: /create an account/i })
    ).toBeVisible();
    await expect(
      page.getByText(/use one of the providers below/i)
    ).toBeVisible();
  });

  test("navbar Login link reaches sign-in flow", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: /^login$/i }).click();
    await expect(page).toHaveURL(/\/login/);
    await expect(
      page.getByRole("heading", { name: /welcome back/i })
    ).toBeVisible();
  });

  test("spell library route renders heading", async ({ page }) => {
    await page.goto("/spell-library");
    await expect(
      page.getByRole("heading", { name: /^spell library$/i })
    ).toBeVisible();
  });

  test("skills page renders heading", async ({ page }) => {
    await page.goto("/skills");
    await expect(page.getByRole("heading", { name: /^skills$/i })).toBeVisible();
  });

  test("events index renders upcoming events heading", async ({ page }) => {
    await page.goto("/events");
    await expect(
      page.getByRole("heading", {
        name: "Upcoming Events",
        level: 1,
      })
    ).toBeVisible();
  });

  test("settings redirects unauthenticated users to login", async ({
    page,
  }) => {
    await page.goto("/settings");
    await expect(page).toHaveURL(/\/login/);
  });
});

test.describe("OAuth controls on login", () => {
  test("login shows Google or a clear unavailable notice", async ({
    page,
  }) => {
    await page.goto("/login");
    const google = page.getByRole("button", { name: /google/i });
    const unavailable = page.getByText(/sign-in is temporarily unavailable/i);
    await expect(google.or(unavailable).first()).toBeVisible({
      timeout: 15_000,
    });
  });
});
