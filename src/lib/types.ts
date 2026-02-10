import { Resume } from "./schemas";

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

export enum CV_Type {
  TechCV,
  GeneralCV,
}

// cv template type
export interface CVTemplate {
  name: string;
  link: string;
  variant: CV_Type;
}

export enum ModalType {
  WorkExperience,
  Project,
  Education,
}
export interface GenerateReq {
  resume: Resume;
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

export interface DateRange {
  start: Date; // YYYY-MM-DD
  end: Date | "Ongoing";
}

export interface CoverLetterData {
  hiring_manager: string;
  company_name: string;
  salutation: string;
  paragraphs: string[];
}

// utility functions for date conversion

export const dateString = (date: Date): string => {
  if (!(date instanceof Date)) {
    date = new Date(date);
  }

  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const year = date.getFullYear().toString();
  return `${month}/${year}`;
};

export function displayDate(dateRange: DateRange): string {
  return `${dateString(dateRange.start)} - ${dateRange.end == "Ongoing" ? "Ongoing" : dateString(dateRange.end)}`;
}

export function formatDate(mmYYYY: string): Date {
  if (!mmYYYY || mmYYYY.trim() === "") throw new Error("invalid date string");
  const [month, year] = mmYYYY.split("/");

  if (!month || !year || month.length != 2 || year.length != 4) {
    throw new Error("invalid date string");
  }

  return new Date(Number(year), Number(month) - 1);
}
