import { useEffect, useState } from "react";
import { useTemplateStore } from "@/store/useStore";
import { CV_Type, CVTemplate } from "@/lib/types";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";

import { EmblaCarouselType, EmblaEventType } from "embla-carousel";

import { ImageWithPreview } from "@/components/ui/image-preview";

const items: CVTemplate[] = [
  {
    name: "tech cv template",
    link: "tech_template.webp",
    variant: CV_Type.TechCV,
  },
  {
    name: "general cv template",
    link: "general_template.webp",
    variant: CV_Type.GeneralCV,
  },
];

export function CVTemplateSelection() {
  const [api, setApi] = useState<CarouselApi>();
  const [templates] = useState<CVTemplate[]>(items);
  const { selectedCV, setSelectedCV } = useTemplateStore();

  // setup carousel api and event listeners
  useEffect(() => {
    if (!api) {
      return;
    }

    if (api && selectedCV) {
      const scrollPos = templates.findIndex(
        (template) => template.variant === selectedCV,
      );

      if (scrollPos > -1) {
        api.scrollTo(scrollPos, true);
      }
    }

    // handle selection changes
    const handleSelect = (emblaApi: EmblaCarouselType) => {
      const currentIndex = emblaApi.selectedScrollSnap();
      const selectedTemplate = templates[currentIndex];
      if (selectedTemplate) {
        setSelectedCV(selectedTemplate.variant);
      }
    };

    api.on("select", handleSelect);

    // listen for reInit event - this fires when API is fully ready
    api.on("reInit", onReinit);

    return () => {
      api.off("select", handleSelect);
      api.off("reInit", onReinit);
    };
  }, [api]);

  const onReinit = (emblaApi: EmblaCarouselType) => {
    if (selectedCV && emblaApi) {
      const scrollPos = templates.findIndex(
        (template) => template.name === selectedCV.name,
      );

      if (scrollPos > -1) {
        emblaApi.scrollTo(scrollPos, true);
      }
    }
  };

  const currentIndex = selectedCV
    ? templates.findIndex((t) => t.variant === selectedCV)
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
      </div>
    </div>
  );
}
