import { useState } from "react";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Experience,
    convertDateFromForm,
    convertDateToForm,
} from "@/lib/types";

interface WorkExpModalProps {
    onClose: () => void;
    onSave: (exp: Experience) => void;
    initial?: Partial<Experience>;
}

const mmYYYY = z
    .string()
    .regex(/^(0[1-9]|1[0-2])\/\d{4}$/, "Must be in MM/YYYY format");

const WorkExpSchema = z
    .object({
        title: z.string().trim().min(1, "Job title is required"),
        company: z.string().trim().min(1, "Company is required"),
        dateFrom: mmYYYY,
        dateTo: z.string().optional().default(""),
        b1: z.string().optional().default(""),
        b2: z.string().optional().default(""),
        ongoing: z.boolean(),
    })
    .superRefine((val, ctx) => {
        if (val.ongoing) {
            if (val.dateTo && val.dateTo.trim() !== "") {
                if (!mmYYYY.safeParse(val.dateTo).success) {
                    ctx.addIssue({
                        path: ["dateTo"],
                        code: "custom",
                        message:
                            "Must be in MM/YYYY format or left empty if ongoing",
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

export function WorkExpModal({ onClose, onSave, initial }: WorkExpModalProps) {
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
        company: initial?.company ?? "",
        dateFrom: initialDateFrom,
        dateTo: initialDateTo,
        b1: initial?.b1 ?? "",
        b2: initial?.b2 ?? "",
        ongoing: initialOngoing,
    });

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

    const validate = (): boolean => {
        const parsed = WorkExpSchema.safeParse(form);
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
        const experience: Experience = {
            title: form.title,
            company: form.company,
            dates: {
                start: convertDateFromForm(form.dateFrom),
                end: form.ongoing
                    ? "Ongoing"
                    : convertDateFromForm(form.dateTo),
            },
            b1: form.b1,
            b2: form.b2,
        };

        onSave(experience);
        onClose();
    };

    const isEditing = !!initial && !!initial.title;

    return (
        <div className="flex flex-col gap-4 max-w-md p-8 bg-zinc-800 border-zinc-500 border-2 rounded-lg max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">
                    {isEditing ? "edit work experience" : "add work experience"}
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
                    <span className="text-xs text-red-400">
                        {errors.company}
                    </span>
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
                        maxLength={7}
                        aria-invalid={!!errors.dateFrom}
                    />
                    {errors.dateFrom ? (
                        <span className="text-xs text-red-400">
                            {errors.dateFrom}
                        </span>
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
                        maxLength={7}
                        disabled={form.ongoing}
                        aria-invalid={!!errors.dateTo}
                    />
                    {errors.dateTo ? (
                        <span className="text-xs text-red-400">
                            {errors.dateTo}
                        </span>
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
                    id="exp-ongoing"
                    checked={form.ongoing}
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
