/* shared types and constants for about me templates */

import type { ProjectForm } from "./ProjectModal";
import type { WorkExpForm } from "./WorkExpModal";

/* modal types used across about me components */
export enum ModalType {
  WorkExperience,
  Project,
}

/* local storage keys */
export const LS_KEY_TEMPLATES = "aboutMe.templates";

/* duplicate name suffix base used when generating unique names */
export const DUPLICATE_SUFFIX_BASE = "Copy";

/* template model stored in local storage */
export type AboutMeTemplate = {
  id: string;
  templateName: string;
  name: string;
  email: string;
  summary: string;
  skills: string[];
  projects: ProjectForm[];
  workExperiences: WorkExpForm[];
  createdAt: string; // iso string
  updatedAt: string; // iso string
};
