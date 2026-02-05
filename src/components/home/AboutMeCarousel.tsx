import { useState, useEffect } from "react";
import useEmblaCarousel from "embla-carousel-react";
import AutoScroll from "embla-carousel-auto-scroll";

import { AboutMeItem } from "./AboutMeItem";
import { ResumeTemplate, ResumeTemplateSchema } from "@/lib/schemas";

import { z } from "zod";

import styles from "./AboutMeCarousel.module.css";
import mockTemplates from "@/mock/mock_aboutme.json?raw";

export function AboutMeCarousel() {
  const [templates, setTemplates] = useState<ResumeTemplate[]>([]);
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true }, [
    AutoScroll({ stopOnInteraction: false }),
  ]);

  useEffect(() => {
    if (emblaApi) {
      emblaApi.reInit();
      emblaApi.plugins().autoScroll?.play();
    }
  }, [emblaApi, templates]);

  useEffect(() => {
    const ResumeTemplateSchemaList = z.array(ResumeTemplateSchema);

    const resumeTemplates = ResumeTemplateSchemaList.parse(
      JSON.parse(mockTemplates),
    );

    console.log(mockTemplates);
    console.log(resumeTemplates);

    setTemplates(resumeTemplates);
  }, []);

  return (
    <div className="embla container">
      <div className={styles.embla__viewport} ref={emblaRef}>
        <div className={styles.embla__container}>
          {templates.map((template) => (
            <div
              key={template.templateId}
              className={`${styles.embla__slide} flex-[0_0_60%] md:flex-[0_0_33%]`}
            >
              <AboutMeItem template={template}></AboutMeItem>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
