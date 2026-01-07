import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import {
  ResumeTemplate,
  ResumeTemplateSchema,
} from "@/lib/schemas";
import {
  CVTemplate,
  GeneratedPdfs,
  CurrentJobState,
} from "@/lib/types";
import { z } from "zod";

const AppStateSchema = z.object({
  templates: z.record(z.string(), ResumeTemplateSchema),
  selectedTemplateId: z.string().nullable(),
  selectedCV: z.any().nullable(), // Simplified for now as CVTemplate is an interface
  jobDesc: z.string(),
  specialInstr: z.string(),
  generatedPdfs: z.any().nullable(),
  currentJob: z.any().nullable(),
});

export type { ResumeTemplate };

interface AppState {
  // Templates stored as a hashmap keyed by templateId
  templates: Record<string, ResumeTemplate>;
  selectedTemplateId: string | null;
  
  // CV Selection
  selectedCV: CVTemplate | null;
  
  // Job Data
  jobDesc: string;
  specialInstr: string;
  
  // Generation State
  generatedPdfs: GeneratedPdfs | null;
  currentJob: CurrentJobState | null;

  // Actions
  addTemplate: (template: ResumeTemplate) => void;
  updateTemplate: (template: ResumeTemplate) => void;
  deleteTemplate: (id: string) => void;
  setSelectedTemplateId: (id: string | null) => void;
  setSelectedCV: (cv: CVTemplate | null) => void;
  setJobDesc: (desc: string) => void;
  setSpecialInstr: (instr: string) => void;
  setGeneratedPdfs: (pdfs: GeneratedPdfs | null) => void;
  setCurrentJob: (job: CurrentJobState | null) => void;
  clearGenerated: () => void;
}

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      templates: {},
      selectedTemplateId: null,
      selectedCV: null,
      jobDesc: "",
      specialInstr: "",
      generatedPdfs: null,
      currentJob: null,

      addTemplate: (template) =>
        set((state) => ({
          templates: { ...state.templates, [template.templateId]: template },
        })),
      updateTemplate: (updated) =>
        set((state) => ({
          templates: { ...state.templates, [updated.templateId]: updated },
        })),
      deleteTemplate: (id) =>
        set((state) => {
          const { [id]: _, ...remaining } = state.templates;
          return { templates: remaining };
        }),
      setSelectedTemplateId: (id) => set({ selectedTemplateId: id }),
      setSelectedCV: (cv) => set({ selectedCV: cv }),
      setJobDesc: (desc) => set({ jobDesc: desc }),
      setSpecialInstr: (instr) => set({ specialInstr: instr }),
      setGeneratedPdfs: (pdfs) => set({ generatedPdfs: pdfs }),
      setCurrentJob: (job) => set({ currentJob: job }),
      clearGenerated: () => set({ generatedPdfs: null }),
    }),
    {
      name: "jobpls-storage",
      storage: createJSONStorage(() => ({
        getItem: (name) => (typeof window !== "undefined" ? localStorage.getItem(name) : null),
        setItem: (name, value) => (typeof window !== "undefined" ? localStorage.setItem(name, value) : undefined),
        removeItem: (name) => (typeof window !== "undefined" ? localStorage.removeItem(name) : undefined),
      })),
      // Validation and transformation during rehydration
      onRehydrateStorage: (_state) => {
        console.log("hydration starting");
        return (rehydratedState, error) => {
          if (error) {
            console.error("hydration failed", error);
          } else if (rehydratedState) {
            const result = AppStateSchema.safeParse(rehydratedState);
            if (!result.success) {
              console.error("store validation failed, resetting to defaults", result.error);
              // You could choose to fix the state here or return defaults
            } else {
              console.log("store validated and transformed (Dates restored)");
            }
          }
        };
      },
    }
  )
);