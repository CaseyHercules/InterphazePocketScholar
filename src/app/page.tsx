import Link from "next/link";
import {
  BookOpen,
  Calendar,
  ScrollText,
  Shirt,
  Sparkles,
  Swords,
  Users,
  Wand2,
} from "lucide-react";

import { HomeGalleryCarousel } from "@/components/HomeGalleryCarousel";
import { NextEventHomeCard } from "@/components/NextEventHomeCard";
import { Button } from "@/components/ui/button";
import { db } from "@/lib/db";
import {
  getArchiveGalleryAttribution,
  getHomeGalleryState,
} from "@/lib/home-gallery";
import { getNextPublishedEvent, type NextEventPayload } from "@/lib/next-event";
import { cn } from "@/lib/utils";

const TOPIC_START_ENTRIES: {
  key: string;
  label: string;
  description: string;
  Icon: typeof BookOpen;
}[] = [
  {
    key: "intro",
    label: "New to Interphaze",
    description:
      "Orientation and practical first steps before your first event.",
    Icon: BookOpen,
  },
  {
    key: "rules",
    label: "Rules & mechanics",
    description:
      "Combat, advancement, spellcasting, and the core systems of play.",
    Icon: ScrollText,
  },
];

type TopicCardEntry = {
  kind: "topic";
  href: string;
  title: string;
  description: string;
  Icon: typeof BookOpen;
};

type ExploreEntry =
  | TopicCardEntry
  | { kind: "nextEvent"; payload: NextEventPayload | null };

async function getHomeExploreEntries(): Promise<ExploreEntry[]> {
  const topics = await db.topic.findMany({ select: { title: true } });
  const lowerTitles = new Set(topics.map((t) => t.title.toLowerCase()));

  const topicCards: TopicCardEntry[] = TOPIC_START_ENTRIES.filter((e) =>
    lowerTitles.has(e.key)
  ).map((e) => ({
    kind: "topic" as const,
    href: `/${e.key}`,
    title: e.label,
    description: e.description,
    Icon: e.Icon,
  }));

  const introCard = topicCards.find((c) => c.href === "/intro");
  const rulesCard = topicCards.find((c) => c.href === "/rules");
  const nextEvent = await getNextPublishedEvent();

  const entries: ExploreEntry[] = [];
  if (introCard) entries.push(introCard);
  entries.push({ kind: "nextEvent", payload: nextEvent });
  if (rulesCard) entries.push(rulesCard);

  return entries;
}

const pillars = [
  {
    title: "Dynamic Player-Driven Storytelling",
    body:
      "Shape the destiny of Interphaze through your actions and decisions. The player-driven narrative ensures every weekend is an entirely distinct and captivating adventure, where your choices matter.",
    Icon: Sparkles,
  },
  {
    title: "Unparalleled Creative Freedom",
    body:
      "In Interphaze, the only limit is your imagination. Craft and embody your own unique character, from valiant heroes to enigmatic mages, and weave your own stories within this expansive, dynamic world.",
    Icon: Wand2,
  },
  {
    title: "Family-Friendly and RPG Player-Focused",
    body:
      "Designed for families and attendees of Renaissance Faires and RPG players alike, our LARP offers a safe, inclusive, and educational experience that caters to different age groups, interests, and experience levels.",
    Icon: Users,
  },
  {
    title: "Approachable Combat and Unique Spellcasting",
    body:
      "Experience a one-of-a-kind combat system that's approachable yet strategic. Plus, dive into spellcasting with a customizable system, crafting your own spells to shape your character's magical abilities.",
    Icon: Swords,
  },
  {
    title: "Costuming and Props Customization",
    body:
      "Bring your own costume and props to showcase your creativity, and enhance your character's appearance. For added convenience, select items are available on-site, making the experience accessible to all.",
    Icon: Shirt,
  },
] as const;

export default async function Home() {
  const { items: galleryItems, showArchiveAttribution } =
    await getHomeGalleryState();
  const galleryAttribution = getArchiveGalleryAttribution();
  const exploreEntries = await getHomeExploreEntries();

  return (
    <div className="flex w-full flex-col gap-8 pb-8 sm:gap-12 sm:pb-10 md:gap-16 md:pb-14">
      <section
        aria-labelledby="hero-heading"
        className="w-full overflow-hidden rounded-md border border-stone-200/90 bg-gradient-to-b from-[#fffefb] via-[#faf6ee] to-[#f3ebe0] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.85)]"
      >
        <div className="mx-auto max-w-3xl px-4 pb-10 pt-9 text-center sm:px-8 sm:pb-16 sm:pt-14">
          <div
            className="mb-6 flex items-center justify-center gap-3 text-stone-400"
            aria-hidden
          >
            <span className="h-px w-10 max-w-[18%] bg-stone-300 sm:w-14" />
            <span className="post-letter text-xl text-stone-500">&#x2767;</span>
            <span className="h-px w-10 max-w-[18%] bg-stone-300 sm:w-14" />
          </div>
          <h1
            id="hero-heading"
            className="post-letter text-balance text-2xl font-semibold leading-[1.2] text-stone-900 sm:text-4xl sm:leading-tight md:text-5xl"
          >
            Welcome to the Lands of Interphaze
          </h1>
          <div className="post-letter mx-auto mt-5 max-w-2xl space-y-3 text-sm leading-relaxed text-stone-600 text-pretty sm:text-base md:text-lg">
            <p>
              Interphaze is one of the longest-running LARPs in the Midwest. We
              offer family-friendly weekend gatherings in the Lands of
              Interphaze where you step away from everyday life and play together
              in a shared fantasy world.
            </p>
            <p>
              Expect camping, costumes if you want them, and stories told
              through intrigue, music, safe staged combat, and spellcraft.
              Newcomers and veterans alike are welcome. Every Phaze is its own
              memorable adventure.
            </p>
          </div>

          <div className="mx-auto mt-8 flex w-full max-w-lg flex-col gap-3 sm:max-w-none sm:flex-row sm:justify-center sm:gap-4">
            <Button
              asChild
              size="lg"
              className="post-letter h-12 w-full min-w-0 border-0 bg-stone-800 px-7 text-base text-amber-50 shadow-md hover:bg-stone-700 sm:w-auto"
            >
              <Link href="/intro" className="gap-2">
                <BookOpen className="h-5 w-5 shrink-0" aria-hidden />
                New to LARP?
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="post-letter h-12 w-full min-w-0 border-stone-300 bg-white/90 px-7 text-base text-stone-800 shadow-sm hover:bg-amber-50/90 sm:w-auto"
            >
              <Link href="/events" className="gap-2">
                <Calendar className="h-5 w-5 shrink-0" aria-hidden />
                Upcoming events
              </Link>
            </Button>
          </div>

          <p className="mx-auto mt-6 max-w-md px-1 text-sm leading-relaxed text-stone-500 sm:px-0">
            Been before?{" "}
            <Link
              href="/events"
              className="font-medium text-amber-900 underline decoration-amber-300/80 underline-offset-2 hover:text-amber-950"
            >
              Register for the next event
            </Link>
            {" "}or open the{" "}
            <Link
              href="/rules/summary"
              className="font-medium text-amber-900 underline decoration-amber-300/80 underline-offset-2 hover:text-amber-950"
            >
              rules summary
            </Link>
            .
          </p>
        </div>
      </section>

      <section
        aria-labelledby="gallery-heading"
        className="mx-auto w-full max-w-[1000px] px-3 sm:px-4"
      >
        <div className="mb-6 text-center sm:mb-8">
          <h2 id="gallery-heading" className="section-heading-medieval mb-3">
            Gallery
          </h2>
          <p className="mx-auto max-w-2xl text-pretty text-sm leading-relaxed text-stone-600 sm:text-base">
            Scenes from Interphaze weekends—costume, combat, and camp. Swipe or
            use the arrows to browse.
          </p>
        </div>

        {galleryItems.length === 0 ? (
          <div className="mx-auto max-w-4xl">
            <p className="sr-only">
              Photo gallery—event images will be added here in the future.
            </p>
            <div
              className="grid grid-cols-2 gap-2 sm:gap-3 md:grid-cols-3"
              aria-hidden
            >
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="aspect-square rounded-md border border-dashed border-stone-300 bg-stone-50/80"
                />
              ))}
            </div>
          </div>
        ) : (
          <div className="mx-auto w-full max-w-4xl">
            <HomeGalleryCarousel items={galleryItems} />
            {showArchiveAttribution ? (
              <p className="post-letter mt-6 text-center text-xs leading-relaxed text-stone-500">
                {galleryAttribution.label}{" "}
                <a
                  href={galleryAttribution.archiveUrl}
                  className="font-medium text-amber-800/90 underline decoration-amber-300 underline-offset-2 hover:text-amber-900"
                  rel="noopener noreferrer"
                >
                  View the archived page
                </a>
                .
              </p>
            ) : null}
          </div>
        )}
      </section>

      <section
        aria-label="Guides and next event"
        className="mx-auto w-full max-w-[1000px] px-3 sm:px-4"
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 md:gap-7 xl:grid-cols-3 xl:gap-8 [&>*]:min-h-0">
          {exploreEntries.map((entry) =>
            entry.kind === "nextEvent" ? (
              <NextEventHomeCard key="next-event" event={entry.payload} />
            ) : (
              <TopicExploreCard key={entry.href} entry={entry} />
            )
          )}
        </div>
      </section>

      <section
        aria-labelledby="pillars-heading"
        className="mx-auto w-full max-w-[1000px] px-3 pb-2 pt-2 sm:px-4"
      >
        <h2 id="pillars-heading" className="section-heading-medieval mb-6 sm:mb-8">
          Why Interphaze
        </h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6 lg:grid-cols-3">
          {pillars.map(({ title, body, Icon }) => (
            <div key={title} className="medieval-frame rounded-md p-4 sm:p-5">
              <div className="flex gap-3 border-b border-stone-200 pb-3">
                <span
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-stone-300 bg-amber-50 text-stone-700"
                  aria-hidden
                >
                  <Icon className="h-4 w-4" />
                </span>
                <h3 className="post-letter text-base font-semibold leading-snug text-stone-800">
                  {title}
                </h3>
              </div>
              <p className="mt-4 text-left text-sm leading-relaxed text-stone-600">
                {body}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function TopicExploreCard({ entry }: { entry: TopicCardEntry }) {
  const Icon = entry.Icon;
  return (
    <Link
      href={entry.href}
      className={cn(
        "medieval-frame medieval-frame-interactive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/40",
        "block rounded-md p-4 no-underline sm:p-6",
        entry.href === "/intro" &&
          "ring-2 ring-amber-400/35 ring-offset-2 ring-offset-[#fdfbf7]"
      )}
    >
      <div className="flex gap-4 sm:gap-5">
        <span
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md border border-stone-300 bg-amber-50 text-stone-700"
          aria-hidden
        >
          <Icon className="h-5 w-5" />
        </span>
        <div className="min-w-0 text-left">
          <p className="text-xs font-medium uppercase tracking-wide text-amber-900/70">
            {entry.href === "/intro" ? "Recommended first" : "Guide"}
          </p>
          <h3 className="post-letter mt-1 text-lg font-semibold text-stone-800">
            {entry.title}
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-stone-600">
            {entry.description}
          </p>
          <p className="post-letter mt-4 text-sm font-medium text-amber-800/90">
            Continue »
          </p>
        </div>
      </div>
    </Link>
  );
}
