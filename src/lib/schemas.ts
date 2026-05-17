import { z } from "zod";

export const MM_YYYY_REGEX = /^(0[1-9]|1[0-2])\/\d{4}$/;
export const DateFormSchema = z.object({
  start_date: z
    .string()
    .trim()
    .regex(MM_YYYY_REGEX, "Must be in MM/YYYY format")
    .catch(""),
  end_date: z
    .union([
      z.string().regex(MM_YYYY_REGEX, "Must be in MM/YYYY format"),
      z.literal("Ongoing"),
    ])
    .catch(""),
});

export const ProjectSchema = z.object({
  title: z.string().trim().default(""),
  b1: z.string().trim().default(""),
  b2: z.string().default(""),
  languages: z.array(z.string().trim()).optional().default([]),
  url: z.string().default(""),
});

export const EducationSchema = DateFormSchema.extend({
  title: z.string().trim().default(""),
  grade: z.string().trim().default(""),
  name: z.string().trim().default(""),
  location: z.string().trim().default(""),
  modules: z.array(z.string()).optional().default([]),
});

export const ExperienceSchema = DateFormSchema.extend({
  title: z.string().trim().default(""),
  company: z.string().trim().default(""),
  b1: z.string().trim().default(""),
  b2: z.string().trim().default(""),
});

export const ResumeDataSchema = z.object({
  full_name: z.string().default(""),
  email: z.string().default(""),
  github: z.string().optional(),
  languages: z.array(z.string()).optional(),
  frameworks: z.array(z.string()).optional(),
  developer_tools: z.array(z.string()).optional(),
  residency: z.string().optional(),
  about_me: z.string().default(""),
  education: z.array(EducationSchema).optional(),
  projects: z.array(ProjectSchema).optional(),
  work_exp: z.array(ExperienceSchema).optional(),
});

export const ResumeTemplateSchema = z.object({
  templateId: z.string(),
  templateName: z.string(),
  resume: ResumeDataSchema,
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  isSynced: z.boolean().default(false).optional(),
});

export const CoverDataSchema = z.object({
  hiring_manager: z.string(),
  company_name: z.string(),
  salutation: z.string(),
  paragraphs: z.array(z.string()),
});

export const GenerationOutputSchema = z.object({
  ...ResumeDataSchema.shape,
  ...CoverDataSchema.shape,
});

export type Project = z.infer<typeof ProjectSchema>;
export type Education = z.infer<typeof EducationSchema>;
export type Experience = z.infer<typeof ExperienceSchema>;
export type Resume = z.infer<typeof ResumeDataSchema>;
export type ResumeTemplate = z.infer<typeof ResumeTemplateSchema>;
export type CoverData = z.infer<typeof CoverDataSchema>;
export type GenerationOutput = z.infer<typeof GenerationOutputSchema>;
