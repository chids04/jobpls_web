import { z } from "zod";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

import { ResumeTemplate, ResumeTemplateSchema } from "@/lib/schemas";
import { CVTemplate, CV_Type, CurrentJobState } from "@/lib/types";

const AppStateDataSchema = z.object({
  templates: z.record(z.string(), ResumeTemplateSchema),
  selectedTemplateId: z.string().nullable(),
  selectedCV: z.any().nullable(),
  jobDesc: z.string().catch(""),
  specialInstr: z.string().catch(""),
  currentJob: z.any().nullable(),
  apiKey: z.string().nullable(),
});

type AppStateData = z.infer<typeof AppStateDataSchema>;

type AppActions = {
  addTemplate: (template: ResumeTemplate) => void;
  updateTemplate: (template: ResumeTemplate) => void;
  deleteTemplate: (id: string) => void;
  setSelectedTemplateId: (id: string | null) => void;
  setSelectedCV: (cv: CV_Type | null) => void;
  setJobDesc: (desc: string) => void;
  setSpecialInstr: (instr: string) => void;
  setCurrentJob: (job: CurrentJobState | null) => void;
  setApiKey: (key: string) => void;
};

type AppState = AppStateData & AppActions;

export type { ResumeTemplate };

type PdfStore = {
  cv: string | undefined;
  cover: string | undefined;
  setCV: (cv: string | undefined) => void;
  setCover: (cover: string | undefined) => void;
  clearPDFs: () => void;
};

export const usePDFStore = create<PdfStore>()(
  persist(
    (set) => ({
      cv: undefined,
      cover: undefined,

      setCV: (cv) => set({ cv }),
      setCover: (cover) => set({ cover }),
      clearPDFs: () => set({ cv: undefined, cover: undefined }),
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
      apiKey: null,

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
      setApiKey: (key) => set({ apiKey: key }),
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
            const result = AppStateDataSchema.safeParse(rehydratedState);
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
