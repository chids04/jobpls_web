import { useState } from "react";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";

export type ProjectForm = {
  projectName: string;
  dateFrom: string; // MM/YYYY
  dateTo: string; // MM/YYYY or empty when ongoing
  info1: string;
  info2: string;
  url: string;
  ongoing: boolean;
  languages: string[];
};

interface ProjectModalProps {
  onClose: () => void;
  onSave: (project: ProjectForm) => void;
  initial?: Partial<ProjectForm>;
}

const mmYYYY = z
  .string()
  .regex(/^(0[1-9]|1[0-2])\/\d{4}$/, "Must be in MM/YYYY format");

const ProjectSchema = z
  .object({
    projectName: z.string().trim(),
    dateFrom: mmYYYY,
    dateTo: z.string().default(""),
    info1: z.string().optional().default(""),
    info2: z.string().optional().default(""),
    url: z
      .string()
      .trim()
      .default("")
      .refine(
        (v) => v === "" || /^https?:\/\//i.test(v),
        "Must be a valid URL or leave empty",
      ),
    ongoing: z.boolean(),
    languages: z.array(z.string().trim()).optional().default([]),
  })
  .superRefine((val, ctx) => {
    if (val.ongoing) {
      // Allow empty dateTo when ongoing, but if provided, it must be valid format
      if (val.dateTo && val.dateTo.trim() !== "") {
        if (!mmYYYY.safeParse(val.dateTo).success) {
          ctx.addIssue({
            path: ["dateTo"],
            code: "custom",
            message: "Must be in MM/YYYY format or left empty if ongoing",
          });
        }
      }
    } else {
      // Not ongoing -> dateTo is required and must be valid MM/YYYY
      if (!val.dateTo || !mmYYYY.safeParse(val.dateTo).success) {
        ctx.addIssue({
          path: ["dateTo"],
          code: "custom",
          message: "Required in MM/YYYY format",
        });
      }
    }
  });

function normalizeMMYYYYInput(raw: string) {
  const digits = raw.replace(/\D/g, "");
  const mm = digits.slice(0, 2);
  const yyyy = digits.slice(2, 6);
  if (!mm) return "";
  const out =
    mm +
    (yyyy
      ? `/${yyyy}`
      : mm.length === 2 && raw.includes("/")
        ? "/"
        : raw.includes("/")
          ? "/"
          : digits.length > 2
            ? "/"
            : "");
  return (yyyy ? `${mm}/${yyyy}` : out).slice(0, 7);
}

export function ProjectModal({ onClose, onSave, initial }: ProjectModalProps) {
  const [projectDetails, setProjectDetails] = useState<ProjectForm>({
    projectName: initial?.projectName ?? "",
    dateFrom: initial?.dateFrom ?? "",
    dateTo: initial?.dateTo ?? "",
    info1: initial?.info1 ?? "",
    info2: initial?.info2 ?? "",
    url: initial?.url ?? "",
    ongoing: initial?.ongoing ?? false,
    languages: initial?.languages ?? [],
  });
  const [languagesText, setLanguagesText] = useState(
    initial?.languages?.join(", ") ?? "",
  );

  const [errors, setErrors] = useState<
    Partial<Record<keyof ProjectForm, string>>
  >({});

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target as {
      name: keyof ProjectForm;
      value: string;
    };
    if (name === "dateFrom" || name === "dateTo") {
      setProjectDetails((prev) => ({
        ...prev,
        [name]: normalizeMMYYYYInput(value),
      }));
      setErrors((prev) => ({ ...prev, [name]: undefined }));
      return;
    }

    setProjectDetails((prev) => ({
      ...prev,
      [name]: value,
    }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const handleToggleOngoing = (checked: boolean | "indeterminate") => {
    const isChecked = Boolean(checked);
    setProjectDetails((prev) => ({
      ...prev,
      ongoing: isChecked,
      dateTo: isChecked ? "" : prev.dateTo,
    }));
    setErrors((prev) => ({ ...prev, dateTo: undefined }));
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
    const fieldErrors: Partial<Record<keyof ProjectForm, string>> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0] as keyof ProjectForm;
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
          name="projectName"
          value={projectDetails.projectName}
          onChange={handleChange}
          aria-invalid={!!errors.projectName}
        />
        {errors.projectName ? (
          <span className="text-xs text-red-400">{errors.projectName}</span>
        ) : null}
      </div>

      <div className="flex flex-row gap-2">
        <div className="flex-1 flex flex-col gap-1">
          <Input
            placeholder="MM/YYYY"
            name="dateFrom"
            value={projectDetails.dateFrom}
            onChange={handleChange}
            inputMode="numeric"
            maxLength={7}
            aria-invalid={!!errors.dateFrom}
          />
          {errors.dateFrom ? (
            <span className="text-xs text-red-400">{errors.dateFrom}</span>
          ) : (
            <span className="text-[10px] text-zinc-400">
              start date (MM/YYYY)
            </span>
          )}
        </div>

        <div className="flex-1 flex flex-col gap-1">
          <Input
            placeholder="MM/YYYY"
            name="dateTo"
            value={projectDetails.dateTo}
            onChange={handleChange}
            inputMode="numeric"
            maxLength={7}
            disabled={projectDetails.ongoing}
            aria-invalid={!!errors.dateTo}
          />
          {errors.dateTo ? (
            <span className="text-xs text-red-400">{errors.dateTo}</span>
          ) : (
            <span className="text-[10px] text-zinc-400">
              end date (MM/YYYY)
              {projectDetails.ongoing ? " (disabled while ongoing)" : ""}
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Checkbox
          id="proj-ongoing"
          checked={projectDetails.ongoing}
          onCheckedChange={handleToggleOngoing}
        />
        <label htmlFor="proj-ongoing" className="text-sm text-zinc-200">
          ongoing
        </label>
      </div>

      <label className="text-sm text-zinc-300">info 1</label>
      <Textarea
        placeholder="info 1"
        className="w-full"
        name="info1"
        value={projectDetails.info1}
        onChange={handleChange}
      />
      <label className="text-sm text-zinc-300">info 2</label>
      <Textarea
        placeholder="info 2"
        className="w-full"
        name="info2"
        value={projectDetails.info2}
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
          Enter languages as a comma-separated list.
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
