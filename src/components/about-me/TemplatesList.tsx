import { Button } from "@/components/ui/button";
import { DUPLICATE_SUFFIX_BASE } from "@/lib/types";
import { ResumeTemplate } from "@/store/useStore";
import { useState } from "react";

/* props for the templates list component */
export type TemplatesListProps = {
  templates: ResumeTemplate[];
  onCreate: () => void;
  onEdit: (template: ResumeTemplate) => void;
  onDelete: (id: string) => void;
  onDuplicate: (template: ResumeTemplate) => void;
};

function generateUniqueTemplateName(
  originalName: string,
  existingNames: Set<string>,
): string {
  const baseName = `${originalName} ${DUPLICATE_SUFFIX_BASE}`;
  if (!existingNames.has(baseName)) return baseName;

  let i = 2;
  let candidate = `${baseName} (${i})`;
  while (existingNames.has(candidate)) {
    i += 1;
    candidate = `${baseName} (${i})`;
  }
  return candidate;
}

/* create a duplicated template with a new id, timestamps, and a unique name */
function makeDuplicateTemplate(
  template: ResumeTemplate,
  allTemplates: ResumeTemplate[],
): ResumeTemplate {
  const existingNames = new Set(allTemplates.map((t) => t.templateName));
  const newName = generateUniqueTemplateName(
    template.templateName,
    existingNames,
  );
  const now = new Date();
  return {
    ...template,
    templateId: `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`,
    templateName: newName,
    createdAt: now,
    updatedAt: now,
  };
}

/* list view component for about me templates */
export function TemplatesList({
  templates,
  onCreate,
  onEdit,
  onDelete,
  onDuplicate,
}: TemplatesListProps) {
  const [showPDFModal, setShowPDFModal] = useState(false);

  const onPDFImport = () => {};

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto px-4 py-6">
      {/* header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Resume Templates</h1>

        <div className="flex gap-2">
          <Button type="button" onClick={onCreate} className="text-black">
            Create new template
          </Button>

          <Button type="button" onClick={() => {}}>
            Import from PDF
          </Button>
        </div>
      </div>

      {/* empty state */}
      {templates.length === 0 ? (
        <div className="rounded border border-zinc-700 bg-zinc-800 p-6 text-sm text-zinc-300">
          You have no templates yet. Click "Create new template" to build your
          first Resume template.
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {templates.map((tpl) => (
            <div
              key={tpl.templateId}
              className="rounded border border-zinc-700 bg-zinc-800 p-4 flex flex-col gap-2"
            >
              <div className="flex items-center justify-between">
                <div className="text-base font-medium">{tpl.templateName}</div>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => onEdit(tpl)}
                  >
                    Edit
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      const duplicate = makeDuplicateTemplate(tpl, templates);
                      onDuplicate(duplicate);
                    }}
                  >
                    Duplicate
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="destructive"
                    onClick={() => onDelete(tpl.templateId)}
                  >
                    Delete
                  </Button>
                </div>
              </div>

              <div className="text-xs text-zinc-400">
                Created {tpl.createdAt.toLocaleString()}
              </div>

              <div className="text-sm text-zinc-200">
                <div className="truncate">
                  <span className="text-zinc-400">Name:</span>{" "}
                  {tpl.resume.full_name || "-"}
                </div>
                <div className="truncate">
                  <span className="text-zinc-400">Email:</span>{" "}
                  {tpl.resume.email || "-"}
                </div>
                <div className="truncate">
                  <span className="text-zinc-400">Languages:</span>{" "}
                  {tpl.resume.languages && tpl.resume.languages.length > 0
                    ? tpl.resume.languages.join(", ")
                    : "-"}
                </div>
                <div className="truncate">
                  <span className="text-zinc-400">Projects:</span>{" "}
                  {tpl.resume.projects?.length || 0}
                </div>
                <div className="truncate">
                  <span className="text-zinc-400">Work Experience:</span>{" "}
                  {tpl.resume.work_exp?.length || 0}
                </div>
                <div className="truncate">
                  <span className="text-zinc-400">Education:</span>{" "}
                  {tpl.resume.education?.length || 0}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default TemplatesList;
