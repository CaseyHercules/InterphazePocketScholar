async function globalSetup() {
  const db = (process.env.PocketScholar_DATABASE_URL ?? "").trim();
  if (!db && process.env.CI === "true") {
    throw new Error(
      "[e2e] CI requires PocketScholar_DATABASE_URL so Next.js can start for Playwright."
    );
  }
}

export default globalSetup;
