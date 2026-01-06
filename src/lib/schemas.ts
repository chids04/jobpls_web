import { z } from "zod";

export const DateRangeSchema = z.object({
  start: z.string(),
  end: z.union([z.string(), z.literal("Ongoing")]),
});

export const ProjectSchema = z.object({
  title: z.string(),
  b1: z.string(),
  b2: z.string(),
  languages: z.array(z.string()),
  url: z.string(),
});

export const EducationSchema = z.object({
  title: z.string(),
  grade: z.string(),
  name: z.string(),
  dates: DateRangeSchema,
  location: z.string(),
  modules: z.array(z.string()).optional(),
});

export const ExperienceSchema = z.object({
  title: z.string(),
  dates: DateRangeSchema,
  company: z.string(),
  b1: z.string(),
  b2: z.string(),
});

export const HeaderSchema = z.object({
  full_name: z.string(),
  email: z.email(),
  github: z.string().optional(),
  residency: z.string(),
});

export const SummarySchema = z.object({
  about_me: z.string(),
});

export const TechSkillsSchema = z.object({
  languages: z.array(z.string()),
  frameworks: z.array(z.string()),
  developer_tools: z.array(z.string()),
});

export const ResumeDataSchema = z.object({
  header: HeaderSchema,
  summary: SummarySchema,
  tech_skills: TechSkillsSchema.optional(),
  education: z.array(EducationSchema).optional(),
  projects: z.array(ProjectSchema).optional(),
  work_exp: z.array(ExperienceSchema).optional(),
});
