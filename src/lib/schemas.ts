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
  title: z.string().trim().min(1, "Title is required").optional(),
  b1: z.string().optional().default("").optional(),
  b2: z.string().optional().default("").optional(),
  languages: z.array(z.string()).optional().default([]).optional(),
  url: z.string().optional(),
});

export const EducationSchema = DateFormSchema.extend({
  title: z.string().trim().min(1, "Title is required").optional(),
  grade: z.string().trim().min(1, "Grade is required").optional(),
  name: z.string().trim().min(1, "Institution name is required").optional(),
  location: z.string().trim().min(1, "Location is required").optional(),
  modules: z.array(z.string()).optional().default([]).optional(),
});

export const ExperienceSchema = DateFormSchema.extend({
  title: z.string().trim().min(1, "Job title is required").optional(),
  company: z.string().trim().min(1, "Company is required").optional(),
  b1: z.string().optional().default("").optional(),
  b2: z.string().optional().default("").optional(),
});

export const ResumeDataSchema = z.object({
  full_name: z.string().optional(),
  email: z.string().optional(),
  github: z.string().optional(),
  languages: z.array(z.string()).optional(),
  frameworks: z.array(z.string()).optional(),
  developer_tools: z.array(z.string()).optional(),
  residency: z.string().optional(),
  about_me: z.string().optional(),
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
export type GenerationOutput = z.infer<typeof GenerationOutputSchema>;
