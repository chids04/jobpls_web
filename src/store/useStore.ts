import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { ResumeTemplate, ResumeTemplateSchema } from "@/lib/schemas";
import { CVTemplate, GeneratedPdfs, CurrentJobState } from "@/lib/types";
import { z } from "zod";

const AppStateSchema = z.object({
  templates: z.record(z.string(), ResumeTemplateSchema),
  selectedTemplateId: z.string().nullable(),
  selectedCV: z.any().nullable(),
  jobDesc: z.string().optional(),
  specialInstr: z.string().optional(),
  currentJob: z.any().nullable(),
});

export type { ResumeTemplate };

type AppState = {
  templates: Record<string, ResumeTemplate>;
  selectedTemplateId: string | null;

  selectedCV: CVTemplate | null;

  jobDesc: string;
  specialInstr: string;

  currentJob: CurrentJobState | null;

  addTemplate: (template: ResumeTemplate) => void;
  updateTemplate: (template: ResumeTemplate) => void;
  deleteTemplate: (id: string) => void;
  setSelectedTemplateId: (id: string | null) => void;
  setSelectedCV: (cv: CVTemplate | null) => void;
  setJobDesc: (desc: string) => void;
  setSpecialInstr: (instr: string) => void;
  setCurrentJob: (job: CurrentJobState | null) => void;
};

type PdfStore = {
  cv: string | null;
  cover: string | null;
  setCV: (cv: string | null) => void;
  setCover: (cover: string | null) => void;
  clearPDFs: () => void;
};

export const usePDFStore = create<PdfStore>()(
  persist(
    (set) => ({
      cv: null,
      cover: null,

      setCV: (cv) => set({ cv }),
      setCover: (cover) => set({ cover }),
      clearPDFs: () => set({ cv: null, cover: null }),
    }),
    {
      name: "jobpls-pdfs",
      storage: createJSONStorage(() =>
        typeof window !== "undefined"
          ? sessionStorage
          : {
              getItem: () => null,
              setItem: () => {},
              removeItem: () => {},
            },
      ),
    },
  ),
);

export const useTemplateStore = create<AppState>()(
  persist(
    (set) => ({
      templates: {},
      selectedTemplateId: null,
      selectedCV: null,
      jobDesc: "",
      specialInstr: "",
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
      setCurrentJob: (job) => set({ currentJob: job }),
    }),
    {
      name: "jobpls-storage",
      storage: createJSONStorage(() => ({
        getItem: (name) =>
          typeof window !== "undefined" ? localStorage.getItem(name) : null,
        setItem: (name, value) =>
          typeof window !== "undefined"
            ? localStorage.setItem(name, value)
            : undefined,
        removeItem: (name) =>
          typeof window !== "undefined"
            ? localStorage.removeItem(name)
            : undefined,
      })),
      onRehydrateStorage: (_state) => {
        console.log("hydration starting");
        return (rehydratedState, error) => {
          if (error) {
            console.error("hydration failed", error);
          } else if (rehydratedState) {
            const result = AppStateSchema.safeParse(rehydratedState);
            if (!result.success) {
              console.error(
                "failed to parse saved state, possibly corrupted",
                result.error,
              );
            } else {
              console.log("succesfully restored and validated state");
            }
          }
        };
      },
    },
  ),
);
