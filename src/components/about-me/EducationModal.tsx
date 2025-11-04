import { useState } from "react";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Education, convertDateFromForm, convertDateToForm } from "lib/types";

interface EducationModalProps {
  onClose: () => void;
  onSave: (education: Education) => void;
  initial?: Partial<Education>;
}

const mmYYYY = z
  .string()
  .regex(/^(0[1-9]|1[0-2])\/\d{4}$/, "Must be in MM/YYYY format");

const EducationSchema = z
  .object({
    title: z.string().trim().min(1, "Title is required"),
    grade: z.string().trim().min(1, "Grade is required"),
    name: z.string().trim().min(1, "Institution name is required"),
    dateFrom: mmYYYY,
    dateTo: z.string().optional().default(""),
    location: z.string().trim().min(1, "Location is required"),
    modules: z.array(z.string().trim()).optional().default([]),
    ongoing: z.boolean(),
  })
  .superRefine((val, ctx) => {
    if (val.ongoing) {
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
  if (yyyy) return `${mm}/${yyyy}`.slice(0, 7);
  // when user types the slash or continues typing after month, insert "/"
  if (digits.length > 2) return `${mm}/`;
  return mm;
}

export function EducationModal({
  onClose,
  onSave,
  initial,
}: EducationModalProps) {
  // convert from unified format to form format for editing
  const initialDateFrom = initial?.dates?.start
    ? convertDateToForm(initial.dates.start)
    : "";
  const initialOngoing = initial?.dates?.end === "Ongoing";
  const initialDateTo = initialOngoing
    ? ""
    : initial?.dates?.end
      ? convertDateToForm(initial.dates.end as string)
      : "";

  const [form, setForm] = useState({
    title: initial?.title ?? "",
    grade: initial?.grade ?? "",
    name: initial?.name ?? "",
    dateFrom: initialDateFrom,
    dateTo: initialDateTo,
    location: initial?.location ?? "",
    modules: initial?.modules ?? [],
    ongoing: initialOngoing,
  });

  const [modulesText, setModulesText] = useState(
    initial?.modules?.join(", ") ?? "",
  );

  const [errors, setErrors] = useState<
    Partial<Record<keyof typeof form, string>>
  >({});

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target as {
      name: keyof typeof form;
      value: string;
    };

    if (name === "dateFrom" || name === "dateTo") {
      setForm((prev) => ({
        ...prev,
        [name]: normalizeMMYYYYInput(value),
      }));
      setErrors((prev) => ({ ...prev, [name]: undefined }));
      return;
    }

    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const handleToggleOngoing = (checked: boolean | "indeterminate") => {
    const isChecked = Boolean(checked);
    setForm((prev) => ({
      ...prev,
      ongoing: isChecked,
      dateTo: isChecked ? "" : prev.dateTo,
    }));
    setErrors((prev) => ({ ...prev, dateTo: undefined }));
  };

  const handleModulesSave = () => {
    const list = modulesText
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    setForm((prev) => ({ ...prev, modules: list }));
    setModulesText(list.join(", "));
  };

  const handleModuleDelete = (index: number) => {
    setForm((prev) => {
      const next = prev.modules.filter((_, i) => i !== index);
      setModulesText(next.join(", "));
      return { ...prev, modules: next };
    });
  };

  const validate = (): boolean => {
    const parsed = EducationSchema.safeParse(form);
    if (parsed.success) {
      setErrors({});
      return true;
    }
    const fieldErrors: Partial<Record<keyof typeof form, string>> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0] as keyof typeof form;
      if (!fieldErrors[key]) {
        fieldErrors[key] = issue.message;
      }
    }
    setErrors(fieldErrors);
    return false;
  };

  const handleSave = () => {
    if (!validate()) return;

    // convert to unified format
    const education: Education = {
      title: form.title,
      grade: form.grade,
      name: form.name,
      dates: {
        start: convertDateFromForm(form.dateFrom),
        end: form.ongoing ? "Ongoing" : convertDateFromForm(form.dateTo),
      },
      location: form.location,
      modules: form.modules.length > 0 ? form.modules : undefined,
    };

    onSave(education);
    onClose();
  };

  const isEditing = !!initial && !!initial.title;

  return (
    <div className="flex flex-col gap-4 max-w-md p-8 bg-zinc-800 border-zinc-500 border-2 rounded-lg max-h-[80vh] overflow-y-auto">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">
          {isEditing ? "edit education" : "add education"}
        </h3>
        <Button type="button" variant="ghost" onClick={onClose}>
          close
        </Button>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-sm text-zinc-300">title</label>
        <Input
          placeholder="e.g. Bachelor of Science in Computer Science"
          name="title"
          value={form.title}
          onChange={handleChange}
          aria-invalid={!!errors.title}
        />
        {errors.title ? (
          <span className="text-xs text-red-400">{errors.title}</span>
        ) : null}
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-sm text-zinc-300">grade</label>
        <Input
          placeholder="e.g. First Class Honours, 3.8 GPA"
          name="grade"
          value={form.grade}
          onChange={handleChange}
          aria-invalid={!!errors.grade}
        />
        {errors.grade ? (
          <span className="text-xs text-red-400">{errors.grade}</span>
        ) : null}
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-sm text-zinc-300">institution</label>
        <Input
          placeholder="university or institution name"
          name="name"
          value={form.name}
          onChange={handleChange}
          aria-invalid={!!errors.name}
        />
        {errors.name ? (
          <span className="text-xs text-red-400">{errors.name}</span>
        ) : null}
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-sm text-zinc-300">location</label>
        <Input
          placeholder="city, country"
          name="location"
          value={form.location}
          onChange={handleChange}
          aria-invalid={!!errors.location}
        />
        {errors.location ? (
          <span className="text-xs text-red-400">{errors.location}</span>
        ) : null}
      </div>

      <div className="flex flex-row gap-2">
        <div className="flex-1 flex flex-col gap-1">
          <label className="text-sm text-zinc-300">start date</label>
          <Input
            placeholder="MM/YYYY"
            name="dateFrom"
            value={form.dateFrom}
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
          <label className="text-sm text-zinc-300">end date</label>
          <Input
            placeholder="MM/YYYY"
            name="dateTo"
            value={form.dateTo}
            onChange={handleChange}
            inputMode="numeric"
            maxLength={7}
            disabled={form.ongoing}
            aria-invalid={!!errors.dateTo}
          />
          {errors.dateTo ? (
            <span className="text-xs text-red-400">{errors.dateTo}</span>
          ) : (
            <span className="text-[10px] text-zinc-400">
              end date (MM/YYYY)
              {form.ongoing ? " (disabled while ongoing)" : ""}
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Checkbox
          id="edu-ongoing"
          checked={form.ongoing}
          onCheckedChange={handleToggleOngoing}
        />
        <label htmlFor="edu-ongoing" className="text-sm text-zinc-200">
          ongoing
        </label>
      </div>

      <div className="flex flex-col gap-2">
        <h4 className="text-sm font-medium">modules</h4>
        <div className="flex gap-2">
          <Textarea
            className="w-full"
            placeholder="e.g. Data Structures, Algorithms, Database Systems"
            value={modulesText}
            onChange={(e) => setModulesText(e.target.value)}
          />
          <Button type="button" variant="outline" onClick={handleModulesSave}>
            save
          </Button>
        </div>
        <p className="text-xs text-zinc-400">
          enter modules as a comma-separated list.
        </p>
        <div className="flex flex-wrap gap-2 mt-1">
          {form.modules.map((module, i) => (
            <div
              key={`${module}-${i}`}
              className="flex items-center gap-2 rounded border border-zinc-700 bg-zinc-800 px-2 py-1 text-sm"
            >
              <span>{module}</span>
              <Button
                type="button"
                size="sm"
                variant="destructive"
                onClick={() => handleModuleDelete(i)}
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
