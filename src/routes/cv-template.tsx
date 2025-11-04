import { createFileRoute } from "@tanstack/react-router";
import { useAboutMeTemplates } from "@/hooks/useAppStorage";
import { TemplateDropdown } from "@/components/about-me/TemplateDropdown";
import { CVTemplateSelection } from "@/components/cv-template/CVTemplateSelection";

export const Route = createFileRoute("/cv-template")({
  component: RouteComponent,
  ssr: false,
});

function RouteComponent() {
  const { templates } = useAboutMeTemplates();

  return (
    <div className="flex flex-col gap-10 items-center">
      <div className="flex flex-col items-center gap-5">
        <h1 className="text-2xl font-bold">select cv template</h1>
        <TemplateDropdown templates={templates} />
      </div>

      <div className="w-full max-w-4xl">
        <CVTemplateSelection />
      </div>
    </div>
  );
}
