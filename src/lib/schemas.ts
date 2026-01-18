import { z } from "zod";

export const MM_YYYY_REGEX = /^(0[1-9]|1[0-2])\/\d{4}$/;
export const DateFormSchema = z.object({
  start_date: z.string().regex(MM_YYYY_REGEX, "Must be in MM/YYYY format"),
  end_date: z.union([
    z.string().regex(MM_YYYY_REGEX, "Must be in MM/YYYY format"),
    z.literal("Ongoing"),
  ]),
});

export const ProjectSchema = z.object({
  title: z.string().trim().min(1, "Title is required"),
  b1: z.string().optional().default(""),
  b2: z.string().optional().default(""),
  languages: z.array(z.string()).optional().default([]),
  url: z.url(),
});

export const EducationSchema = DateFormSchema.extend({
  title: z.string().trim().min(1, "Title is required"),
  grade: z.string().trim().min(1, "Grade is required"),
  name: z.string().trim().min(1, "Institution name is required"),
  location: z.string().trim().min(1, "Location is required"),
  modules: z.array(z.string()).optional().default([]),
});

export const ExperienceSchema = DateFormSchema.extend({
  title: z.string().trim().min(1, "Job title is required"),
  company: z.string().trim().min(1, "Company is required"),
  b1: z.string().optional().default(""),
  b2: z.string().optional().default(""),
});

export const ResumeDataSchema = z.object({
  full_name: z.string(),
  email: z.email(),
  github: z.url().optional(),
  languages: z.array(z.string()).optional(),
  frameworks: z.array(z.string()).optional(),
  developer_tools: z.array(z.string()).optional(),
  residency: z.string(),
  about_me: z.string(),
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

export const OutputSchema = z.object({
  resume: ResumeDataSchema,
  cover: CoverDataSchema,
});

export type Project = z.infer<typeof ProjectSchema>;
export type Education = z.infer<typeof EducationSchema>;
export type Experience = z.infer<typeof ExperienceSchema>;
export type Resume = z.infer<typeof ResumeDataSchema>;
export type ResumeTemplate = z.infer<typeof ResumeTemplateSchema>;
