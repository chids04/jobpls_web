import { useState, useEffect } from "react";
import Autoplay from "embla-carousel-autoplay";
import AutoScroll from "embla-carousel-auto-scroll";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";
import { AboutMeTemplate } from "@/lib/types";

interface AboutMeCarouselProps {
  templates: AboutMeTemplate[];
}
export function AboutMeCarousel({ templates }: AboutMeCarouselProps) {
  const [api, setApi] = useState<CarouselApi>();

  return (
    <Carousel
      setApi={setApi}
      className="w-full"
      opts={{
        align: "center",
        loop: true,
      }}
      plugins={[
        AutoScroll({
          speed: 2,
        }),
        Autoplay({
          delay: 1000,
        }),
      ]}
    >
      <CarouselContent className="-ml-30">
        {templates.map((tpl, i) => (
          <CarouselItem
            className="flex flex-col items-center justify-center  pl-20 ml-10 md:basis-1/2 lg:basis-1/3"
            key={i}
          >
            <div className="rounded border border-zinc-700 bg-zinc-800 p-4 flex flex-col gap-2 max-w-sm">
              <div className="flex items-center justify-between">
                <div className="text-base font-medium">{tpl.templateName}</div>
              </div>

              <div className="text-xs text-zinc-400">
                Created {new Date(tpl.createdAt).toLocaleString()}
              </div>

              <div className="text-sm text-zinc-200">
                <div className="truncate">
                  <span className="text-zinc-400">Name:</span> {tpl.name || "-"}
                </div>
                <div className="truncate">
                  <span className="text-zinc-400">Email:</span>{" "}
                  {tpl.email || "-"}
                </div>
                <div className="truncate">
                  <span className="text-zinc-400">Skills:</span>{" "}
                  {tpl.skills && tpl.skills.length > 0
                    ? tpl.skills.join(", ")
                    : "-"}
                </div>
                <div className="truncate">
                  <span className="text-zinc-400">Projects:</span>{" "}
                  {tpl.projects?.length}
                </div>
                <div className="truncate">
                  <span className="text-zinc-400">Work Experience:</span>{" "}
                  {tpl.workExperiences?.length || 0}
                </div>
                <div className="truncate">
                  <span className="text-zinc-400">Education:</span>{" "}
                  {tpl.education?.length || 0}
                </div>
              </div>
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
    </Carousel>
  );
}
