import { createFileRoute } from "@tanstack/react-router";
import { LS_KEY_TEMPLATES, AboutMeTemplate } from "@/components/about-me/types";
import { useState, useEffect } from "react";
import { TemplateDropdown } from "@/components/about-me/TemplateDropdown";

import { CVTemplateSelection } from "@/components/cv-template/CVTemplateSelection";

export const Route = createFileRoute("/cv-template")({
  component: RouteComponent,
});

function RouteComponent() {
  const [templates, setTemplates] = useState<AboutMeTemplate[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_KEY_TEMPLATES);

      console.log(raw);

      if (raw) {
        const parsed = JSON.parse(raw) as AboutMeTemplate[];
        if (Array.isArray(parsed)) {
          setTemplates(parsed);
        }
      }
    } catch (e) {
      console.error("failed to load templates from localStorage", e);
    }
  }, []);

  return (
    <div className="flex flex-col container mx-auto p-4 items-center justify-center">
      <h3>select a cv template</h3>
      <CVTemplateSelection />

      <div className="w-full mx-2 h-[1px] border-1 border-gray-700 my-4"></div>

      <div className="flex flex-col items-center gap-3">
        <h3>select about me template</h3>
        <TemplateDropdown templates={templates} />
      </div>
    </div>
  );
}
