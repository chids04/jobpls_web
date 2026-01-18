import { createFileRoute } from "@tanstack/react-router";
import { useTemplateStore } from "@/store/useStore";
import { TemplateDropdown } from "@/components/about-me/TemplateDropdown";
import { CVTemplateSelection } from "@/components/cv-template/CVTemplateSelection";

export const Route = createFileRoute("/cv-template")({
  component: RouteComponent,
  ssr: false,
});

function RouteComponent() {
  const { templates } = useTemplateStore();
  const templatesArray = Object.values(templates);

  return (
    <div className="container mx-auto p-10 flex flex-col md:flex-row items-center gap-10 md:gap-40 justify-center">
      <div className="flex flex-col items-center justify-center gap-5">
        <h2 className="text-2xl font-bold text-center">
          select about me template
        </h2>
        <TemplateDropdown templates={templatesArray} />
      </div>

      <div className="">
        <CVTemplateSelection />
      </div>
    </div>
  );
}
