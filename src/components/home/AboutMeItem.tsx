import { ResumeTemplate } from "@/lib/schemas";

interface AboutMeItemProps {
  template: ResumeTemplate;
}

export function AboutMeItem({ template }: AboutMeItemProps) {
  return (
    <div className="rounded border border-zinc-700 bg-zinc-800 p-4 flex flex-col gap-2 w-full">
      <div className="flex items-center justify-between">
        <div className="text-base font-medium">{template.templateName}</div>
      </div>

      <div className="text-xs text-zinc-400">
        Created {template.createdAt.toLocaleString()}
      </div>

      <div className="text-sm text-zinc-200">
        <div className="truncate">
          <span className="text-zinc-400">Name:</span>{" "}
          {template.resume?.full_name || "-"}
        </div>
        <div className="truncate">
          <span className="text-zinc-400">Email:</span>{" "}
          {template.resume?.email || "-"}
        </div>
        <div className="truncate">
          <span className="text-zinc-400">Languages:</span>{" "}
          {template.resume?.languages && template.resume.languages.length > 0
            ? template.resume.languages.join(", ")
            : "-"}
        </div>
        <div className="truncate">
          <span className="text-zinc-400">Projects:</span>{" "}
          {template.resume?.projects?.length || 0}
        </div>
        <div className="truncate">
          <span className="text-zinc-400">Work Experience:</span>{" "}
          {template.resume?.work_exp?.length || 0}
        </div>
        <div className="truncate">
          <span className="text-zinc-400">Education:</span>{" "}
          {template.resume?.education?.length || 0}
        </div>
      </div>
    </div>
  );
}
