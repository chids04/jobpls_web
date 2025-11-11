export const LS_KEY_TEMPLATES = "aboutMe.templates";
export const LS_KEYS_SELECTED_CV = "cvTemplates.selected";
export const DUPLICATE_SUFFIX_BASE = "Copy";
export const LS_SPECIAL_INSTR = "generate.specialInstr";
export const LS_JOB_DESC = "aboutMe.jobDesc";
export const LS_KEY_SELECTED_ABOUT_ME_TEMPLATE_ID =
  "aboutMe.selectedTemplateId";
export const LS_LAST_GEN_PDF = "generate.lastGen";
export const LS_CURRENT_JOB = "generate.currentJob";

export const SERVER_URL = import.meta.env.VITE_SERVER_URL;

// current job state for persistence and resuming polling
export interface CurrentJobState {
  jobId: string;
  timestamp: number; // unix timestamp in milliseconds
  pollUrl: string;
}

// cv template type
export interface CVTemplate {
  name: string;
  link: string;
}

export enum ModalType {
  WorkExperience,
  Project,
  Education,
}
export interface GenerateReq {
  resume: ResumeData;
  job_desc: string;
  special_instr: string | null;
}

export interface GeneratedPdfs {
  cv: string | null;
  cover: string | null;
}

export interface GenerateResp {
  job_id: string;
}

// unified backend types
export type EndDate = "Ongoing" | string; // dates are formatted as "YYYY-MM-DD"

export interface DateRange {
  start: string; // YYYY-MM-DD
  end: EndDate;
}

export interface Project {
  title: string;
  b1: string;
  b2: string;
  languages: string[];
  url: string;
}

export interface Education {
  title: string;
  grade: string;
  name: string;
  dates: DateRange;
  location: string;
  modules?: string[];
}

export interface Experience {
  title: string;
  dates: DateRange;
  company: string;
  b1: string;
  b2: string;
}

export interface Header {
  full_name: string;
  email: string;
  github?: string;
  residency: string;
}

export interface Summary {
  about_me: string;
}

export interface TechSkills {
  languages: string[];
  frameworks: string[];
  developer_tools: string[];
}

export interface ResumeData {
  header: Header;
  summary: Summary;
  tech_skills?: TechSkills;
  education?: Education[];
  projects?: Project[];
  work_exp?: Experience[];
}

export interface CoverLetterData {
  hiring_manager: string;
  company_name: string;
  salutation: string;
  paragraphs: string[];
}

// template model stored in local storage
export type AboutMeTemplate = {
  id: string;
  templateName: string;
  name: string;
  email: string;
  summary: string;
  location: string;
  github: string | null;
  skills: string[];
  projects: Project[] | null;
  workExperiences: Experience[] | null;
  education: Education[] | null;
  createdAt: string; // iso string
  updatedAt: string; // iso string
};

// utility functions for date conversion
export function convertDateFromForm(mmYYYY: string): string {
  if (!mmYYYY || mmYYYY.trim() === "") return "";
  const [month, year] = mmYYYY.split("/");
  return `${year}-${month.padStart(2, "0")}-01`;
}

export function convertDateToForm(isoDate: string): string {
  if (!isoDate || isoDate.trim() === "") return "";
  const date = new Date(isoDate);
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const year = date.getFullYear().toString();
  return `${month}/${year}`;
}
