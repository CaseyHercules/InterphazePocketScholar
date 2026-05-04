"use client";

import { format } from "date-fns";
import { Calendar, ChevronRight, MapPin } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

import type { NextEventPayload } from "@/lib/next-event";
import { cn } from "@/lib/utils";

function countdownParts(targetMs: number, nowMs: number) {
  const diff = targetMs - nowMs;
  if (diff <= 0) return null;
  const s = Math.floor(diff / 1000);
  const days = Math.floor(s / 86400);
  const hours = Math.floor((s % 86400) / 3600);
  const minutes = Math.floor((s % 3600) / 60);
  const seconds = s % 60;
  return { days, hours, minutes, seconds };
}

type NextEventHomeCardProps = {
  event: NextEventPayload | null;
};

export function NextEventHomeCard({ event }: NextEventHomeCardProps) {
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    const tick = () => setNow(Date.now());
    const id = window.setInterval(tick, 1000);
    const first = window.setTimeout(tick, 0);
    return () => {
      window.clearInterval(id);
      window.clearTimeout(first);
    };
  }, []);

  if (!event) {
    return (
      <Link
        href="/events"
        className={cn(
          "medieval-frame medieval-frame-interactive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/40",
          "block rounded-md p-5 no-underline sm:p-6"
        )}
      >
        <div className="flex gap-4 sm:gap-5">
          <span
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md border border-stone-300 bg-amber-50 text-stone-700"
            aria-hidden
          >
            <Calendar className="h-5 w-5" />
          </span>
          <div className="min-w-0 text-left">
            <p className="text-xs font-medium uppercase tracking-wide text-amber-900/70">
              Events
            </p>
            <h3 className="post-letter mt-1 text-lg font-semibold text-stone-800">
              Upcoming events
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-stone-600">
              Dates, locations, and registration for weekends in the Lands.
            </p>
            <p className="post-letter mt-4 text-sm font-medium text-amber-800/90">
              Continue »
            </p>
          </div>
        </div>
      </Link>
    );
  }

  const targetMs = new Date(event.date).getTime();
  const parts = now !== null ? countdownParts(targetMs, now) : null;

  return (
    <Link
      href={`/events/${event.id}`}
      className={cn(
        "medieval-frame medieval-frame-interactive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/40",
        "block rounded-md border-amber-200/80 bg-gradient-to-br from-amber-50/40 to-transparent p-5 no-underline ring-1 ring-amber-300/30 sm:p-6"
      )}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:gap-5">
        <span
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md border border-amber-300/80 bg-amber-50 text-stone-800 sm:mt-0.5"
          aria-hidden
        >
          <Calendar className="h-5 w-5" />
        </span>
        <div className="min-w-0 flex-1 text-left">
          <p className="text-xs font-medium uppercase tracking-wide text-amber-900/80">
            Next event
          </p>
          <h3 className="post-letter mt-1 text-lg font-semibold leading-snug text-stone-900">
            {event.title}
          </h3>
          <p className="mt-1.5 text-sm text-stone-700">
            {format(new Date(event.date), "EEEE, MMMM d, yyyy")}
          </p>
          {event.location ? (
            <p className="mt-1 flex items-start gap-1.5 text-sm text-stone-600">
              <MapPin
                className="mt-0.5 h-4 w-4 shrink-0 text-stone-500"
                aria-hidden
              />
              <span>{event.location}</span>
            </p>
          ) : null}

          {now === null ? (
            <div
              className="mt-4 h-[96px] rounded-md border border-dashed border-stone-200 bg-stone-50/60"
              aria-hidden
            />
          ) : parts ? (
            <div
              className="mt-4 rounded-md border border-stone-200/90 bg-white/70 px-3 py-3"
              aria-live="polite"
              aria-atomic="true"
            >
              <p className="mb-2 text-center text-[11px] font-medium uppercase tracking-wider text-stone-500">
                Starts in
              </p>
              <div className="grid grid-cols-4 gap-2 text-center tabular-nums">
                <div>
                  <span className="post-letter block text-xl font-semibold text-stone-900 sm:text-2xl">
                    {parts.days}
                  </span>
                  <span className="text-[10px] uppercase text-stone-500">
                    days
                  </span>
                </div>
                <div>
                  <span className="post-letter block text-xl font-semibold text-stone-900 sm:text-2xl">
                    {String(parts.hours).padStart(2, "0")}
                  </span>
                  <span className="text-[10px] uppercase text-stone-500">
                    hrs
                  </span>
                </div>
                <div>
                  <span className="post-letter block text-xl font-semibold text-stone-900 sm:text-2xl">
                    {String(parts.minutes).padStart(2, "0")}
                  </span>
                  <span className="text-[10px] uppercase text-stone-500">
                    min
                  </span>
                </div>
                <div>
                  <span className="post-letter block text-xl font-semibold text-stone-900 sm:text-2xl">
                    {String(parts.seconds).padStart(2, "0")}
                  </span>
                  <span className="text-[10px] uppercase text-stone-500">
                    sec
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <p className="mt-3 text-sm font-medium text-amber-900/90">
              This event is starting—tap for details.
            </p>
          )}

          <p className="post-letter mt-4 inline-flex items-center gap-1 text-sm font-medium text-amber-800/90">
            View event details
            <ChevronRight className="h-4 w-4" aria-hidden />
          </p>
        </div>
      </div>
    </Link>
  );
}
