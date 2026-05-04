"use client";

import Image from "next/image";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import type { HomeGalleryItem } from "@/lib/home-gallery";
import { cn } from "@/lib/utils";

type HomeGalleryCarouselProps = {
  items: HomeGalleryItem[];
  className?: string;
};

export function HomeGalleryCarousel({
  items,
  className,
}: HomeGalleryCarouselProps) {
  if (items.length === 0) return null;

  return (
    <div className={cn("relative w-full", className)}>
      <Carousel
        opts={{ align: "start", loop: items.length > 1 }}
        className="w-full"
      >
        <CarouselContent className="-ml-2 sm:-ml-3">
          {items.map((item, index) => (
            <CarouselItem
              key={`${item.src}-${index}`}
              className="basis-full pl-2 sm:basis-[85%] sm:pl-3 md:basis-[75%] lg:basis-[70%]"
            >
              <figure className="medieval-frame overflow-hidden p-0">
                <div className="relative aspect-[4/3] w-full border-b border-stone-200 sm:aspect-[16/10]">
                  <Image
                    src={item.src}
                    alt={item.alt}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 85vw, 720px"
                    priority={index === 0}
                  />
                </div>
                {item.caption ? (
                  <figcaption className="px-3 py-2.5 text-center text-sm text-stone-600 sm:py-3">
                    {item.caption}
                  </figcaption>
                ) : (
                  <figcaption className="sr-only">{item.alt}</figcaption>
                )}
              </figure>
            </CarouselItem>
          ))}
        </CarouselContent>
        {items.length > 1 ? (
          <>
            <CarouselPrevious
              variant="outline"
              className="left-1 top-[42%] h-9 w-9 border-stone-300 bg-white/95 text-stone-800 shadow-md hover:bg-amber-50 sm:left-2 md:top-1/2 md:h-10 md:w-10"
            />
            <CarouselNext
              variant="outline"
              className="right-1 top-[42%] h-9 w-9 border-stone-300 bg-white/95 text-stone-800 shadow-md hover:bg-amber-50 sm:right-2 md:top-1/2 md:h-10 md:w-10"
            />
          </>
        ) : null}
      </Carousel>
    </div>
  );
}
