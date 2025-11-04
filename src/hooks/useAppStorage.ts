import { useLocalStorage } from "./useLocalStorage";
import {
  LS_KEY_TEMPLATES,
  LS_KEYS_SELECTED_CV,
  LS_KEY_SELECTED_ABOUT_ME_TEMPLATE_ID,
  LS_JOB_DESC,
  LS_SPECIAL_INSTR,
  LS_CURRENT_JOB,
  type AboutMeTemplate,
  type CVTemplate,
  LS_LAST_GEN_PDF,
  GeneratedPdfs,
  type CurrentJobState,
} from "lib/types";

/**
 * hook for managing about me templates in localStorage
 */
export function useAboutMeTemplates() {
  const [templates, setTemplates] = useLocalStorage<AboutMeTemplate[]>(
    LS_KEY_TEMPLATES,
    [],
  );

  // helper functions for template management
  const addTemplate = (template: AboutMeTemplate) => {
    setTemplates((prev) => [template, ...prev]);
  };

  const updateTemplate = (updatedTemplate: AboutMeTemplate) => {
    setTemplates((prev) =>
      prev.map((t) => (t.id === updatedTemplate.id ? updatedTemplate : t)),
    );
  };

  const deleteTemplate = (id: string) => {
    setTemplates((prev) => prev.filter((t) => t.id !== id));
  };

  const duplicateTemplate = (template: AboutMeTemplate) => {
    setTemplates((prev) => [template, ...prev]);
  };

  return {
    templates,
    setTemplates,
    addTemplate,
    updateTemplate,
    deleteTemplate,
    duplicateTemplate,
  };
}

/**
 * hook for managing selected about me template
 */
export function useSelectedAboutMeTemplate() {
  const [selectedId, setSelectedId] = useLocalStorage<string | null>(
    LS_KEY_SELECTED_ABOUT_ME_TEMPLATE_ID,
    null,
  );

  const { templates } = useAboutMeTemplates();

  const selectedTemplate = selectedId
    ? templates.find((t) => t.id === selectedId)
    : null;

  const selectTemplate = (template: AboutMeTemplate | null) => {
    setSelectedId(template?.id || null);
  };

  const clearSelection = () => {
    setSelectedId(null);
  };

  return {
    selectedTemplate,
    selectedId,
    selectTemplate,
    clearSelection,
    setSelectedId,
  };
}

/**
 * hook for managing selected cv template
 */
export function useSelectedCVTemplate() {
  const [selectedCV, setSelectedCV] = useLocalStorage<CVTemplate | null>(
    LS_KEYS_SELECTED_CV,
    null,
  );

  const selectCV = (cv: CVTemplate | null) => {
    setSelectedCV(cv);
  };

  const clearCV = () => {
    setSelectedCV(null);
  };

  return {
    selectedCV,
    selectCV,
    clearCV,
    setSelectedCV,
  };
}

// hook for managing last saved cv and cover letter
export function useLastGeneratedPDF() {
  const [generatedPdfs, setGeneratedPdfs] =
    useLocalStorage<GeneratedPdfs | null>(LS_LAST_GEN_PDF, null);

  const updateGenerated = (pdfs: GeneratedPdfs) => {
    setGeneratedPdfs(pdfs);
  };

  const clearGenerated = () => {
    setGeneratedPdfs(null);
  };

  return {
    generatedPdfs,
    updateGenerated,
    clearGenerated,
  };
}

/**
 * hook for managing current job state with persistence
 */
export function useCurrentJob() {
  const [currentJob, setCurrentJob] = useLocalStorage<CurrentJobState | null>(
    LS_CURRENT_JOB,
    null,
  );

  const saveJobState = (jobId: string, pollUrl: string) => {
    const jobState: CurrentJobState = {
      jobId,
      timestamp: Date.now(),
      pollUrl,
    };
    setCurrentJob(jobState);
  };

  const clearJobState = () => {
    setCurrentJob(null);
  };

  // check if job is recent (within last 30 minutes)
  const isJobRecent = (maxAgeMinutes: number = 30): boolean => {
    if (!currentJob) return false;
    const now = Date.now();
    const maxAge = maxAgeMinutes * 60 * 1000; // convert to milliseconds
    return now - currentJob.timestamp < maxAge;
  };

  return {
    currentJob,
    saveJobState,
    clearJobState,
    isJobRecent,
  };
}

/**
 * hook for managing job description
 */
export function useJobDescription() {
  const [jobDesc, setJobDesc] = useLocalStorage<string>(LS_JOB_DESC, "");

  const updateJobDesc = (desc: string) => {
    setJobDesc(desc);
  };

  const clearJobDesc = () => {
    setJobDesc("");
  };

  const isValid = jobDesc.trim().length > 0;

  return {
    jobDesc,
    setJobDesc,
    updateJobDesc,
    clearJobDesc,
    isValid,
  };
}

/**
 * hook for managing special instructions
 */
export function useSpecialInstructions() {
  const [specialInstr, setSpecialInstr] = useLocalStorage<string>(
    LS_SPECIAL_INSTR,
    "",
  );

  const updateSpecialInstr = (instr: string) => {
    setSpecialInstr(instr);
  };

  const clearSpecialInstr = () => {
    setSpecialInstr("");
  };

  return {
    specialInstr,
    setSpecialInstr,
    updateSpecialInstr,
    clearSpecialInstr,
  };
}

/**
 * combined hook for generate page data
 */
export function useGeneratePageData() {
  const cvHook = useSelectedCVTemplate();
  const templateHook = useSelectedAboutMeTemplate();
  const jobDescHook = useJobDescription();
  const specialInstrHook = useSpecialInstructions();

  const isReady = !!(
    cvHook.selectedCV &&
    templateHook.selectedTemplate &&
    jobDescHook.isValid
  );

  const missingItems = [];
  if (!cvHook.selectedCV) missingItems.push("CV template");
  if (!templateHook.selectedTemplate) missingItems.push("About Me template");
  if (!jobDescHook.isValid) missingItems.push("Job description");

  return {
    cv: cvHook,
    template: templateHook,
    jobDesc: jobDescHook,
    specialInstr: specialInstrHook,
    isReady,
    missingItems,
  };
}
