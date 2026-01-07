import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Experience, ExperienceSchema } from "@/lib/schemas";

interface WorkExpModalProps {
  onClose: () => void;
  onSave: (exp: Experience) => void;
  initial?: Partial<Experience>;
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

export function WorkExpModal({ onClose, onSave, initial }: WorkExpModalProps) {
  const [form, setForm] = useState<Experience>({
    title: initial?.title ?? "",
    company: initial?.company ?? "",
    start_date: initial?.start_date ?? "",
    end_date: initial?.end_date ?? "",
    b1: initial?.b1 ?? "",
    b2: initial?.b2 ?? "",
  });

  const [errors, setErrors] = useState<
    Partial<Record<keyof Experience, string>>
  >({});

  const isOngoing = form.end_date === "Ongoing";

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target as {
      name: keyof Experience;
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

  const validate = (): boolean => {
    const parsed = ExperienceSchema.safeParse(form);
    if (parsed.success) {
      setErrors({});
      return true;
    }
    const fieldErrors: Partial<Record<keyof Experience, string>> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0] as keyof Experience;
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
          edit work experience
        </h3>
        <Button type="button" variant="ghost" onClick={onClose}>
          close
        </Button>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-sm text-zinc-300">job title</label>
        <Input
          placeholder="job title"
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
        <label className="text-sm text-zinc-300">company</label>
        <Input
          placeholder="company"
          name="company"
          value={form.company}
          onChange={handleChange}
          aria-invalid={!!errors.company}
        />
        {errors.company ? (
          <span className="text-xs text-red-400">{errors.company}</span>
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
          id="exp-ongoing"
          checked={isOngoing}
          onCheckedChange={handleToggleOngoing}
        />
        <label htmlFor="exp-ongoing" className="text-sm text-zinc-200">
          ongoing
        </label>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-sm text-zinc-300">description 1</label>
        <Textarea
          placeholder="first description"
          className="w-full"
          name="b1"
          value={form.b1}
          onChange={handleChange}
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-sm text-zinc-300">description 2</label>
        <Textarea
          placeholder="second description"
          className="w-full"
          name="b2"
          value={form.b2}
          onChange={handleChange}
        />
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
