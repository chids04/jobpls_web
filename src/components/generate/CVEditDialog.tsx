import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { GenerationOutput, Resume } from "@/lib/schemas";
import {
  ResumeFieldsEditor,
  ResumeFieldsValue,
  resumeToFields,
} from "@/components/about-me/ResumeFieldsEditor";

export type CVEditDialogProps = {
  open: boolean;
  initial: GenerationOutput | null;
  onCancel: () => void;
  onRegenerate: (edited: Resume) => Promise<void> | void;
  isGenerating?: boolean;
};

export function CVEditDialog({
  open,
  initial,
  onCancel,
  onRegenerate,
  isGenerating = false,
}: CVEditDialogProps) {
  const [fields, setFields] = useState<ResumeFieldsValue>(() =>
    resumeToFields(initial ?? undefined),
  );

  // Re-hydrate when the dialog is opened with a different generation
  useEffect(() => {
    if (open) setFields(resumeToFields(initial ?? undefined));
  }, [open, initial]);

  if (!open) return null;

  const handleRegenerate = async () => {
    const edited: Resume = {
      full_name: fields.full_name,
      email: fields.email,
      residency: fields.residency,
      github: fields.github ?? "",
      about_me: fields.about_me,
      languages: fields.languages,
      frameworks: fields.frameworks,
      developer_tools: fields.developer_tools,
      projects: fields.projects,
      work_exp: fields.work_exp,
      education: fields.education,
    };
    await onRegenerate(edited);
  };

  return (
    <div className="fixed inset-0 z-1000 bg-zinc-950/90 flex items-start justify-center overflow-y-auto p-4">
      <div className="flex flex-col gap-5 px-4 max-w-4xl items-center py-6 border-2 mx-auto w-full bg-zinc-900">
        <h2 className="text-xl font-bold">edit cv</h2>

        <ResumeFieldsEditor value={fields} onChange={setFields} />

        <div className="sticky bottom-0 left-0 right-0 bg-zinc-900/60 backdrop-blur border-t border-zinc-800 w-full py-3 mt-6">
          <div className="max-w-3xl mx-auto px-4 flex items-center justify-between">
            <Button
              type="button"
              variant="ghost"
              onClick={onCancel}
              disabled={isGenerating}
            >
              cancel
            </Button>
            <Button
              type="button"
              className="text-black"
              onClick={handleRegenerate}
              disabled={isGenerating}
            >
              {isGenerating ? "generating..." : "generate pdf"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CVEditDialog;
