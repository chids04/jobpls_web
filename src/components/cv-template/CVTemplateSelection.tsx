"use client";
import { useEffect, useState } from "react";
import { useSelectedCVTemplate } from "@/hooks/useAppStorage";
import { CVTemplate } from "@/lib/types";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";
import { ImageWithPreview } from "@/components/ui/image-preview";

const items: CVTemplate[] = [
  {
    name: "tech cv template",
    link: "tech_template.webp",
  },
  {
    name: "general cv template",
    link: "general_template.webp",
  },
];

export function CVTemplateSelection() {
  const [api, setApi] = useState<CarouselApi>();
  const [templates] = useState<CVTemplate[]>(items);
  const { selectedCV, selectCV } = useSelectedCVTemplate();

  const [count, setCount] = useState(0);
  const [apiReady, setApiReady] = useState(false);
  const [needsInitialScroll, setNeedsInitialScroll] = useState(true);

  // setup carousel api and event listeners
  useEffect(() => {
    if (!api) {
      return;
    }

    setCount(api.scrollSnapList().length);

    // handle selection changes
    const handleSelect = () => {
      const currentIndex = api.selectedScrollSnap();
      const currentTemplate = templates[currentIndex];
      if (currentTemplate) {
        selectCV(currentTemplate);
      }
    };

    api.on("select", handleSelect);

    // listen for reInit event - this fires when API is fully ready
    api.on("reInit", () => {
      setApiReady(true);
    });

    return () => {
      api.off("select", handleSelect);
      api.off("reInit", () => {});
    };
  }, [api, templates, selectCV]);

  // scroll to saved template on mount
  useEffect(() => {
    if (!api || !apiReady || templates.length === 0 || !needsInitialScroll) {
      return;
    }

    if (selectedCV) {
      const scrollPos = templates.findIndex(
        (template) => template.name === selectedCV.name,
      );

      if (scrollPos > -1) {
        api.scrollTo(scrollPos);
      }
    }

    setNeedsInitialScroll(false);
  }, [api, apiReady, templates, selectedCV, needsInitialScroll]);

  const currentIndex = selectedCV
    ? templates.findIndex((t) => t.name === selectedCV.name)
    : 0;

  return (
    <div className="flex flex-col items-center gap-4">
      <h2 className="text-xl font-semibold">choose cv template</h2>

      <div className="mx-auto max-w-xs">
        <Carousel setApi={setApi} className="w-full max-w-xs">
          <CarouselContent>
            {templates.map((item, index) => (
              <CarouselItem key={index}>
                <div className="flex flex-col items-center justify-center">
                  <ImageWithPreview
                    src={item.link}
                    alt={item.name}
                    className="w-full h-full object-cover rounded-lg"
                  />
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>

        <div className="text-muted-foreground py-2 text-center text-sm">
          template {currentIndex + 1} of {templates.length}
        </div>

        {selectedCV && (
          <div className="text-center">
            <div className="text-sm font-medium">{selectedCV.name}</div>
          </div>
        )}
      </div>
    </div>
  );
}
