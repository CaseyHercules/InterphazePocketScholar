import { PrismaClient } from "@prisma/client";
import "server-only";
import { statSync } from "node:fs";
import { join } from "node:path";

const databaseUrl = (process.env.PocketScholar_DATABASE_URL ?? "").trim();
if (!databaseUrl) {
  throw new Error(
    "[db] Missing PocketScholar_DATABASE_URL. Prisma adapter cannot persist OAuth users/accounts."
  );
}

declare global {
  // eslint-disable-next-line no-var, no-unused-vars
  var cachedPrisma: PrismaClient | undefined;
  // eslint-disable-next-line no-var, no-unused-vars
  var cachedPrismaGenMtimeMs: number | undefined;
}

function prismaGeneratedClientMtimeMs(): number {
  const candidates = [
    join(process.cwd(), "node_modules/.prisma/client/index.js"),
    join(process.cwd(), "node_modules/.prisma/client/default.js"),
  ];
  for (const p of candidates) {
    try {
      return statSync(p).mtimeMs;
    } catch {
      continue;
    }
  }
  return 0;
}

let productionPrisma: PrismaClient | undefined;

function getPrisma(): PrismaClient {
  if (process.env.NODE_ENV === "production") {
    if (!productionPrisma) {
      productionPrisma = new PrismaClient();
    }
    return productionPrisma;
  }

  const m = prismaGeneratedClientMtimeMs();
  if (!global.cachedPrisma) {
    global.cachedPrisma = new PrismaClient();
    global.cachedPrismaGenMtimeMs = m;
    return global.cachedPrisma;
  }
  if (m !== 0 && m !== global.cachedPrismaGenMtimeMs) {
    void global.cachedPrisma.$disconnect();
    global.cachedPrisma = new PrismaClient();
    global.cachedPrismaGenMtimeMs = m;
  }
  return global.cachedPrisma;
}

export const prisma = new Proxy({} as PrismaClient, {
  get(_target, prop, receiver) {
    const client = getPrisma();
    return Reflect.get(client, prop, receiver);
  },
}) as PrismaClient;

export const db = prisma;
