import { Button } from "@/components/ui/button";
import { DUPLICATE_SUFFIX_BASE } from "@/lib/types";
import { ResumeTemplate } from "@/store/useStore";
import { ImportDialog } from "./ImportDialog";
import { Resume, ResumeDataSchema, ResumeTemplateSchema } from "@/lib/schemas";
import { useRef, useState } from "react";

/* props for the templates list component */
export type TemplatesListProps = {
  templates: ResumeTemplate[];
  onCreate: () => void;
  onImport: (template: Resume) => void;
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
  onImport,
  onEdit,
  onDelete,
  onDuplicate,
}: TemplatesListProps) {
  const [openImportDialog, setOpenImportDialog] = useState(false);
  const jsonInputRef = useRef<HTMLInputElement>(null);

  const handleExport = (template: ResumeTemplate) => {
    const dataStr = JSON.stringify(template, null, 2);
    const dataUri =
      "data:application/json;charset=utf-8," + encodeURIComponent(dataStr);
    const exportFileDefaultName = `${template.templateName.replace(/\s+/g, "_")}_template.json`;

    const linkElement = document.createElement("a");
    linkElement.setAttribute("href", dataUri);
    linkElement.setAttribute("download", exportFileDefaultName);
    linkElement.click();
  };

  const handleJsonImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const json = JSON.parse(e.target?.result as string);
        // try parsing as full template first, then as just resume data
        const templateResult = ResumeTemplateSchema.safeParse(json);
        if (templateResult.success) {
          onImport(templateResult.data.resume);
        } else {
          const resumeResult = ResumeDataSchema.safeParse(json);
          if (resumeResult.success) {
            onImport(resumeResult.data);
          } else {
            alert("Invalid JSON format for resume template");
          }
        }
      } catch (err) {
        alert("Error parsing JSON file");
      }
      // reset input
      if (jsonInputRef.current) jsonInputRef.current.value = "";
    };
    reader.readAsText(file);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* header */}
      <div className="flex flex-col md:flex-row gap-2 items-center justify-between">
        <h1 className="text-xl font-semibold">Resume Templates</h1>

        <div className="flex gap-2">
          <Button type="button" onClick={onCreate} className="text-black">
            create new
          </Button>
          <Button
            type="button"
            onClick={() => setOpenImportDialog(true)}
            className="text-black"
          >
            import from file
          </Button>

          <Button
            type="button"
            onClick={() => jsonInputRef.current?.click()}
            className="text-black"
          >
            import JSON
          </Button>
          <input
            type="file"
            ref={jsonInputRef}
            onChange={handleJsonImport}
            accept=".json"
            className="hidden"
          />

          <ImportDialog
            onTemplateCreated={onImport}
            isDialogOpen={openImportDialog}
            onDialogOpenChange={setOpenImportDialog}
          />
        </div>
      </div>

      {/* empty state */}
      {templates.length === 0 ? (
        <div className="rounded border border-zinc-700 bg-zinc-800 p-6 text-sm text-zinc-300">
          You have no templates yet. Click "Create new template" to build your
          first Resume template.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2  lg-grid-cols-3 gap-4">
          {templates.map((tpl) => (
            <div
              key={tpl.templateId}
              className="min-w-0 rounded border border-zinc-700 bg-zinc-800 p-4 flex flex-col gap-2"
            >
              <div className="flex items-center justify-between">
                <div className="text-base font-medium">{tpl.templateName}</div>
                <div className="flex flex-wrap justify-center gap-2">
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
                    variant="outline"
                    onClick={() => handleExport(tpl)}
                  >
                    Export
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
