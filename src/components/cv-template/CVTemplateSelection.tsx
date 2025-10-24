"use client";
import { useEffect, useState } from "react";
import { LS_KEYS_SELECTED_CV } from "./types";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";
import { ImageWithPreview } from "@/components/ui/image-preview";

export interface CVTemplate {
  name: string;
  link: string;
}

const items = [
  {
    id: "id1",
    name: "the best template",
    link: "logo192.png",
  },
  {
    id: "id2",
    name: "the second best template",
    link: "logo512.png",
  },
];

export function CVTemplateSelection() {
  const [api, setApi] = useState<CarouselApi>();
  const [templates, setTemplates] = useState<CVTemplate[]>([]);
  const [selected, setSelected] = useState<CVTemplate>();

  const [count, setCount] = useState(0);
  const [apiReady, setApiReady] = useState(false);
  const [needsInitialScroll, setNeedsInitialScroll] = useState(true);

  // need to also auto scroll carousel on mount
  // probs need to modify the api stuff

  useEffect(() => {
    if (!api) {
      return;
    }

    setCount(api.scrollSnapList().length);
    setSelected(templates[api.selectedScrollSnap()]);

    api.on("select", () => {
      setSelected(templates[api.selectedScrollSnap()]);
    });

    // Listen for reInit event - this fires when API is fully ready
    api.on("reInit", () => {
      setApiReady(true);
    });
  }, [api, templates]);

  useEffect(() => {
    if (!api || !apiReady || templates.length === 0 || !needsInitialScroll) {
      return;
    }

    const raw = localStorage.getItem(LS_KEYS_SELECTED_CV);
    if (raw) {
      try {
        const savedTemplate = JSON.parse(raw) as CVTemplate;
        const scrollPos = templates.findIndex(
          (template) => template.name === savedTemplate.name,
        );

        if (scrollPos > -1) {
          api.scrollTo(scrollPos);
          setSelected(templates[scrollPos]);
        }
        setNeedsInitialScroll(false);
      } catch (error) {
        console.error("Failed to parse saved template:", error);
        setNeedsInitialScroll(false);
      }
    } else {
      setNeedsInitialScroll(false);
    }
  }, [api, apiReady, templates, needsInitialScroll]);

  useEffect(() => {
    setTemplates(items);
  }, []);

  useEffect(() => {
    console.log("Templates updated:", templates);
  }, [templates]);

  useEffect(() => {
    if (selected) {
      localStorage.setItem(LS_KEYS_SELECTED_CV, JSON.stringify(selected));
    }
  }, [selected]);

  return (
    <div className="mx-auto max-w-xs">
      <Carousel setApi={setApi} className="w-full max-w-xs">
        <CarouselContent>
          {templates.map((item, index) => (
            <CarouselItem key={index}>
              <div className="flex flex-col aspect-square items-center justify-center">
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
        Template{" "}
        {selected
          ? templates.findIndex((t) => t.name === selected.name) + 1
          : 1}{" "}
      </div>
    </div>
  );
}
