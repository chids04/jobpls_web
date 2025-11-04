import { useState } from "react";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

import { Project } from "lib/types";

interface ProjectModalProps {
  onClose: () => void;
  onSave: (project: Project) => void;
  initial?: Partial<Project>;
}

const ProjectSchema = z.object({
  title: z.string().trim(),
  b1: z.string().optional().default(""),
  b2: z.string().optional().default(""),
  url: z
    .string()
    .trim()
    .default("")
    .refine(
      (v) => v === "" || /^https?:\/\//i.test(v),
      "Must be a valid URL or leave empty",
    ),
  languages: z.array(z.string().trim()).optional().default([]),
});

export function ProjectModal({ onClose, onSave, initial }: ProjectModalProps) {
  const [projectDetails, setProjectDetails] = useState<Project>({
    title: initial?.title ?? "",
    b1: initial?.b1 ?? "",
    b2: initial?.b2 ?? "",
    url: initial?.url ?? "",
    languages: initial?.languages ?? [],
  });
  const [languagesText, setLanguagesText] = useState(
    initial?.languages?.join(", ") ?? "",
  );

  const [errors, setErrors] = useState<Partial<Record<keyof Project, string>>>(
    {},
  );

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target as {
      name: keyof Project;
      value: string;
    };

    setProjectDetails((prev) => ({
      ...prev,
      [name]: value,
    }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const handleLanguagesSave = () => {
    const list = languagesText
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    setProjectDetails((prev) => ({ ...prev, languages: list }));
    setLanguagesText(list.join(", "));
  };

  const handleLanguageDelete = (index: number) => {
    setProjectDetails((prev) => {
      const next = prev.languages.filter((_, i) => i !== index);
      setLanguagesText(next.join(", "));
      return { ...prev, languages: next };
    });
  };

  const validate = (): boolean => {
    const parsed = ProjectSchema.safeParse(projectDetails);
    if (parsed.success) {
      setErrors({});
      return true;
    }
    const fieldErrors: Partial<Record<keyof Project, string>> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0] as keyof Project;
      if (!fieldErrors[key]) {
        fieldErrors[key] = issue.message;
      }
    }
    setErrors(fieldErrors);
    return false;
  };

  const handleSave = () => {
    if (!validate()) return;
    onSave(projectDetails);
    onClose();
  };

  return (
    <div className="flex flex-col gap-4 max-w-md p-8 bg-zinc-800 border-zinc-500 border-2 rounded-lg max-h-[80vh] overflow-y-auto">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Add Project</h3>
        <Button type="button" variant="ghost" onClick={onClose}>
          close
        </Button>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-sm text-zinc-300">name</label>
        <Input
          placeholder="project name"
          name="title"
          value={projectDetails.title}
          onChange={handleChange}
          aria-invalid={!!errors.title}
        />
        {errors.title ? (
          <span className="text-xs text-red-400">{errors.title}</span>
        ) : null}
      </div>

      <label className="text-sm text-zinc-300">description 1</label>
      <Textarea
        placeholder="first description"
        className="w-full"
        name="b1"
        value={projectDetails.b1}
        onChange={handleChange}
      />

      <label className="text-sm text-zinc-300">description 2</label>
      <Textarea
        placeholder="second description"
        className="w-full"
        name="b2"
        value={projectDetails.b2}
        onChange={handleChange}
      />

      <div className="flex flex-col gap-1">
        <label className="text-sm text-zinc-300">url</label>
        <Input
          placeholder="url"
          type="url"
          name="url"
          value={projectDetails.url}
          onChange={handleChange}
          aria-invalid={!!errors.url}
        />
        {errors.url ? (
          <span className="text-xs text-red-400">{errors.url}</span>
        ) : null}
      </div>

      <div className="flex flex-col gap-2">
        <h4 className="text-sm font-medium">languages</h4>
        <div className="flex gap-2">
          <Textarea
            className="w-full"
            placeholder="e.g. TypeScript, Rust, Go"
            value={languagesText}
            onChange={(e) => setLanguagesText(e.target.value)}
          />
          <Button type="button" variant="outline" onClick={handleLanguagesSave}>
            save
          </Button>
        </div>
        <p className="text-xs text-zinc-400">
          enter languages as a comma-separated list.
        </p>
        <div className="flex flex-wrap gap-2 mt-1">
          {projectDetails.languages.map((lang, i) => (
            <div
              key={`${lang}-${i}`}
              className="flex items-center gap-2 rounded border border-zinc-700 bg-zinc-800 px-2 py-1 text-sm"
            >
              <span>{lang}</span>
              <Button
                type="button"
                size="sm"
                variant="destructive"
                onClick={() => handleLanguageDelete(i)}
              >
                delete
              </Button>
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-2 justify-end">
        <Button type="button" variant="outline" onClick={onClose}>
          cancel
        </Button>
        <Button type="button" onClick={handleSave}>
          save
        </Button>
      </div>
    </div>
  );
}
