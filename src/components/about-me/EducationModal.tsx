import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Education, EducationSchema } from "@/lib/schemas";

interface EducationModalProps {
  onClose: () => void;
  onSave: (education: Education) => void;
  initial?: Partial<Education>;
}

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
  const [form, setForm] = useState<Education>({
    title: initial?.title ?? "",
    grade: initial?.grade ?? "",
    name: initial?.name ?? "",
    start_date: initial?.start_date ?? "",
    end_date: initial?.end_date ?? "",
    location: initial?.location ?? "",
    modules: initial?.modules ?? [],
  });

  const [modulesText, setModulesText] = useState(
    initial?.modules?.join(", ") ?? "",
  );

  const [errors, setErrors] = useState<
    Partial<Record<keyof Education, string>>
  >({});

  const isOngoing = form.end_date === "Ongoing";

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target as {
      name: keyof Education;
      value: string;
    };

    if (name === "start_date" || name === "end_date") {
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
      end_date: isChecked ? "Ongoing" : "",
    }));
    setErrors((prev) => ({ ...prev, end_date: undefined }));
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
      const next = prev.modules?.filter((_, i) => i !== index) ?? [];
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
    const fieldErrors: Partial<Record<keyof Education, string>> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0] as keyof Education;
      if (!fieldErrors[key]) {
        fieldErrors[key] = issue.message;
      }
    }
    setErrors(fieldErrors);
    return false;
  };

  const handleSave = () => {
    if (!validate()) return;

    onSave(form);
    onClose();
  };

  return (
    <div className="flex flex-col gap-4 max-w-md p-8 bg-zinc-800 border-zinc-500 border-2 rounded-lg max-h-[80vh] overflow-y-auto">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">
          edit education
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
            name="start_date"
            value={form.start_date}
            onChange={handleChange}
            maxLength={7}
            aria-invalid={!!errors.start_date}
          />
          {errors.start_date ? (
            <span className="text-xs text-red-400">{errors.start_date}</span>
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
            name="end_date"
            value={form.end_date === "Ongoing" ? "" : form.end_date}
            onChange={handleChange}
            maxLength={7}
            disabled={isOngoing}
            aria-invalid={!!errors.end_date}
          />
          {errors.end_date ? (
            <span className="text-xs text-red-400">{errors.end_date}</span>
          ) : (
            <span className="text-[10px] text-zinc-400">
              end date (MM/YYYY)
              {isOngoing ? " (disabled while ongoing)" : ""}
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Checkbox
          id="edu-ongoing"
          checked={isOngoing}
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
          {form.modules?.map((module, i) => (
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
