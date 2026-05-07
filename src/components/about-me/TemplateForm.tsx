import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Project, Experience, Education } from "@/lib/schemas";
import { ResumeTemplate } from "@/store/useStore";

import {
  ResumeFieldsEditor,
  ResumeFieldsValue,
  emptyResumeFields,
  resumeToFields,
} from "@/components/about-me/ResumeFieldsEditor";
import MockAboutMe from "@/mock/resume.json?raw";
import { DEBUG_MENU } from "@/lib/vars";
import { z } from "zod";

/* form values used when creating or editing templates */
export type TemplateFormValues = {
  templateName: string;
  full_name: string;
  email: string;
  residency: string;
  github: string | null;
  about_me: string;
  languages: string[];
  frameworks: string[];
  developer_tools: string[];
  projects: Project[];
  work_exp: Experience[];
  education: Education[];
};

export type TemplateFormProps = {
  initial?: ResumeTemplate | null;
  // handler to cancel from parent
  onCancel: () => void;

  /* handler invoked with final values when save is clicked */
  onSave: (values: TemplateFormValues) => void;
  /* optional label for the primary save button */
  saveLabel?: string;
};

export function TemplateForm({
  initial = null,
  onCancel,
  onSave,
  saveLabel = "save template",
}: TemplateFormProps) {
  const [templateName, setTemplateName] = useState("");
  const [resumeFields, setResumeFields] =
    useState<ResumeFieldsValue>(emptyResumeFields());

  const importData = () => {
    try {
      const resume = JSON.parse(MockAboutMe);
      setTemplateName(`Mock ${crypto.randomUUID()}`);
      setResumeFields(resumeToFields(resume));
    } catch (error) {
      if (error instanceof z.ZodError) {
      }
    }
  };

  useEffect(() => {
    if (!initial) {
      setTemplateName("");
      setResumeFields(emptyResumeFields());
      return;
    }
    setTemplateName(initial.templateName || "");
    setResumeFields(resumeToFields(initial.resume));
  }, [initial]);

  const handleSave = () => {
    if (!templateName.trim()) {
      alert("Please enter a template name before saving.");
      return;
    }

    onSave({ templateName, ...resumeFields });
  };

  return (
    <div className="flex flex-col gap-5  px-4 max-w-4xl items-center py-6 border-2 mx-auto w-full">
      {DEBUG_MENU && (
        <div className="absolute top-2 right-2">
          <Button onClick={importData}>import from json</Button>
        </div>
      )}
      {/* template name */}
      <div className="flex flex-col items-center gap-2 mb-5">
        <h3>template name</h3>
        <Input
          placeholder="enter a template name"
          className="max-w-md"
          name="templateName"
          value={templateName}
          onChange={(e) => setTemplateName(e.target.value)}
        />
      </div>

      <ResumeFieldsEditor value={resumeFields} onChange={setResumeFields} />

      {/* actions */}
      <div className="sticky bottom-0 left-0 right-0 bg-zinc-900/60 backdrop-blur border-t border-zinc-800 w-full py-3 mt-6">
        <div className="max-w-3xl mx-auto px-4 flex items-center justify-between">
          <Button type="button" variant="ghost" onClick={onCancel}>
            cancel
          </Button>
          <Button type="button" className="text-black" onClick={handleSave}>
            {saveLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default TemplateForm;
