/**
 * Imports published WordPress pages from www.interphaze.org into Topic + Post rows
 * so Pocket Scholar routes aligned with the nav bar resolve to scraped HTML content.
 *
 * Usage: npx tsx scripts/import-interphaze-nav-pages.ts
 * Requires PocketScholar_DATABASE_URL and at least one User (or WORDPRESS_IMPORT_USER_ID).
 *
 * Source: WP REST API (same host as public site). Paths are mapped explicitly because
 * legacy URLs use /rules/character/class/... while the app uses /class/...
 */

import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  PrismaClient,
  Prisma,
} from "@prisma/client";

function loadEnvFiles() {
  for (const name of [".env.local", ".env"]) {
    const p = resolve(process.cwd(), name);
    if (!existsSync(p)) continue;
    const raw = readFileSync(p, "utf8");
    for (const line of raw.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eq = trimmed.indexOf("=");
      if (eq <= 0) continue;
      const key = trimmed.slice(0, eq).trim();
      let val = trimmed.slice(eq + 1).trim();
      if (
        (val.startsWith('"') && val.endsWith('"')) ||
        (val.startsWith("'") && val.endsWith("'"))
      ) {
        val = val.slice(1, -1);
      }
      if (process.env[key] === undefined) process.env[key] = val;
    }
  }
}

loadEnvFiles();

const db = new PrismaClient();

const WP_API =
  (process.env.INTERPHAZE_WP_API_ROOT?.trim() ||
    "https://www.interphaze.org/wp-json") + "";

function slugify(s: string) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60);
}

function normalizePath(urlOrPath: string): string {
  try {
    const u = urlOrPath.startsWith("http")
      ? new URL(urlOrPath)
      : new URL(urlOrPath, "https://www.interphaze.org/");
    let p = u.pathname.replace(/\/$/, "") || "/";
    return p.toLowerCase();
  } catch {
    return (
      urlOrPath.replace(/\/$/, "").toLowerCase() ||
      "/"
    );
  }
}

function wpHtmlToQuillJson(html: string): Prisma.InputJsonValue {
  const text = html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<\/(p|div|h[1-6]|li|br)\s*>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/\n{3,}/g, "\n\n")
    .trim();
  return {
    content: {
      ops: [{ insert: text ? `${text}\n` : "\n" }],
    },
  };
}

function decodeEntities(s: string) {
  return s
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, h) =>
      String.fromCharCode(parseInt(h, 16))
    )
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

async function resolveAuthorUserId(): Promise<string> {
  const explicit = process.env.WORDPRESS_IMPORT_USER_ID?.trim();
  if (explicit) {
    const u = await db.user.findUnique({ where: { id: explicit } });
    if (u) return u.id;
    throw new Error(`WORDPRESS_IMPORT_USER_ID=${explicit} not found in DB.`);
  }
  const first = await db.user.findFirst({ orderBy: { id: "asc" } });
  if (!first) {
    throw new Error(
      "No users in database. Sign in once or set WORDPRESS_IMPORT_USER_ID."
    );
  }
  return first.id;
}

async function ensureTopic(title: string): Promise<string> {
  const existing = await db.topic.findFirst({
    where: { title: { equals: title, mode: "insensitive" } },
  });
  if (existing) return existing.id;
  const id = `seed_topic_${slugify(title)}`;
  const created = await db.topic.create({
    data: {
      id,
      title,
      shortDesc: `Imported from interphaze.org (${new Date().toISOString().slice(0, 10)})`,
    },
  });
  return created.id;
}

type WpPage = {
  id: number;
  slug: string;
  link: string;
  title: { rendered: string };
  content: { rendered: string };
  modified: string;
};

/** Pocket Scholar `/topic/postId` → candidate WordPress pathnames (checked in order). */
const ROUTE_MAP: { topic: string; postId: string; wpPaths: string[] }[] = [
  { topic: "intro", postId: "new", wpPaths: ["/rules/new"] },
  { topic: "intro", postId: "conduct", wpPaths: ["/rules/conduct"] },
  { topic: "intro", postId: "character", wpPaths: ["/rules/character"] },

  { topic: "rules", postId: "summary", wpPaths: ["/rules"] },
  { topic: "rules", postId: "combat", wpPaths: ["/rules/step"] },
  { topic: "rules", postId: "abilities", wpPaths: ["/rules/step/abilities"] },
  { topic: "rules", postId: "items", wpPaths: ["/rules/items"] },
  {
    topic: "rules",
    postId: "spellcasting",
    wpPaths: ["/rules/spellcasting"],
  },

  ...[
    "cleric",
    "druid",
    "mage",
    "fighter",
    "monk",
    "performer",
    "psion",
    "ranger",
    "rogue",
    "scholar",
    "shaman",
  ].map((c) => ({
    topic: "class",
    postId: c,
    wpPaths: [`/rules/character/class/${c}`],
  })),

  ...[
    "dwarf",
    "elf",
    "gnome",
    "half-elf",
    "half-orc",
    "halfling",
    "human",
    "kenogre",
    "pumerre",
  ].map((r) => ({
    topic: "race",
    postId: r,
    wpPaths: [`/rules/character/race/${r}`],
  })),

  {
    topic: "setting",
    postId: "inspiration",
    wpPaths: ["/setting"],
  },
  { topic: "setting", postId: "geography", wpPaths: ["/setting/geography"] },
  { topic: "setting", postId: "history", wpPaths: ["/setting/history"] },
  { topic: "setting", postId: "economy", wpPaths: ["/setting/economy"] },
  { topic: "setting", postId: "laws", wpPaths: ["/setting/laws"] },
  { topic: "setting", postId: "society", wpPaths: ["/setting/society"] },
  { topic: "setting", postId: "religion", wpPaths: ["/setting/religion"] },
  { topic: "setting", postId: "guilds", wpPaths: ["/setting/guilds"] },

  { topic: "about", postId: "us", wpPaths: ["/about"] },
  { topic: "about", postId: "team", wpPaths: ["/about/team"] },
  { topic: "about", postId: "contact", wpPaths: ["/about/contact"] },
  {
    topic: "about",
    postId: "join",
    wpPaths: ["/about/team/volunteer"],
  },

  {
    topic: "events",
    postId: "registration",
    wpPaths: ["/registration"],
  },
];

async function fetchAllWpPages(): Promise<WpPage[]> {
  const out: WpPage[] = [];
  let page = 1;
  for (;;) {
    const url = new URL(`${WP_API.replace(/\/$/, "")}/wp/v2/pages`);
    url.searchParams.set("per_page", "100");
    url.searchParams.set("page", String(page));
    url.searchParams.set("status", "publish");

    const res = await fetch(url.toString(), {
      headers: {
        Accept: "application/json",
        "User-Agent": "InterphazePocketScholar-import-interphaze-nav/1.0",
      },
    });

    if (!res.ok) {
      const t = await res.text();
      throw new Error(`WP pages ${res.status}: ${t.slice(0, 400)}`);
    }

    const batch = (await res.json()) as WpPage[];
    if (!Array.isArray(batch) || batch.length === 0) break;
    out.push(...batch);
    if (batch.length < 100) break;
    page += 1;
  }
  return out;
}

async function run() {
  const authorId = await resolveAuthorUserId();
  console.warn(`Fetching WordPress pages from ${WP_API}…`);
  const pages = await fetchAllWpPages();

  const byPath = new Map<string, WpPage>();
  for (const p of pages) {
    const key = normalizePath(p.link);
    byPath.set(key, p);
  }

  console.warn(`Indexed ${byPath.size} unique paths from ${pages.length} pages.`);

  let ok = 0;
  let skipped = 0;
  let missing = 0;

  for (const route of ROUTE_MAP) {
    if (route.wpPaths.length === 0) {
      console.warn(
        `Skip /${route.topic}/${route.postId}: no public WP page on interphaze.org for this nav link (skills hub).`
      );
      skipped += 1;
      continue;
    }

    let wp: WpPage | undefined;
    for (const cand of route.wpPaths) {
      const key = normalizePath(cand);
      wp = byPath.get(key);
      if (wp) break;
    }

    if (!wp) {
      console.warn(
        `Missing WP content for /${route.topic}/${route.postId} (tried ${route.wpPaths.join(", ")})`
      );
      missing += 1;
      continue;
    }

    const topicId = await ensureTopic(route.topic);
    const title = decodeEntities(
      wp.title.rendered.replace(/<[^>]+>/g, "").trim()
    );
    const content = wpHtmlToQuillJson(wp.content.rendered);

    await db.post.upsert({
      where: { id: route.postId },
      create: {
        id: route.postId,
        title: title || `${route.topic}/${route.postId}`,
        content,
        topicId,
        userId: authorId,
        updatedAt: new Date(wp.modified || Date.now()),
      },
      update: {
        title: title || `${route.topic}/${route.postId}`,
        content,
        topicId,
        userId: authorId,
        updatedAt: new Date(wp.modified || Date.now()),
      },
    });

    ok += 1;
  }

  console.warn(
    `Done. Upserted ${ok} posts, skipped ${skipped} (no source page), missing ${missing}.`
  );
}

run()
  .then(async () => {
    await db.$disconnect();
    process.exit(0);
  })
  .catch(async (e) => {
    console.error(e);
    await db.$disconnect();
    process.exit(1);
  });
