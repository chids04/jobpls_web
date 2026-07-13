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
  userTier: z.enum(["free", "pro"]).default("free"),
  cloudSync: z.boolean().default(true),
  docGenOptions: z.object({
    hasCV: z.boolean(),
    hasCover: z.boolean(),
  }),
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
  setUserTier: (tier: "free" | "pro") => void;
  setCloudSync: (sync: boolean) => void;
  setDocGenOptions: ({
    hasCV,
    hasCover,
  }: {
    hasCV: boolean;
    hasCover: boolean;
  }) => void;
};

type AppState = AppStateData & AppActions;

export type { ResumeTemplate };

type PdfStore = {
  cv: string | undefined;
  cover: string | undefined;
  // filename metadata so reloaded docs keep correct download names
  company: string | undefined;
  createdAt: string | undefined;
  setCV: (cv: string | undefined) => void;
  setCover: (cover: string | undefined) => void;
  setPdfMeta: (company: string | undefined, createdAt: string) => void;
  clearPDFs: () => void;
};

export const usePDFStore = create<PdfStore>()(
  persist(
    (set) => ({
      cv: undefined,
      cover: undefined,
      company: undefined,
      createdAt: undefined,

      setCV: (cv) => set({ cv }),
      setCover: (cover) => set({ cover }),
      setPdfMeta: (company, createdAt) => set({ company, createdAt }),
      clearPDFs: () =>
        set({
          cv: undefined,
          cover: undefined,
          company: undefined,
          createdAt: undefined,
        }),
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
      selectedCV: CV_Type.TechCV,
      jobDesc: "",
      specialInstr: "",
      currentJob: null,
      apiKey: null,
      userTier: "free",
      cloudSync: true,
      docGenOptions: {
        hasCV: true,
        hasCover: true,
      },

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
      setUserTier: (tier) => set({ userTier: tier }),
      setCloudSync: (sync) => set({ cloudSync: sync }),
      setDocGenOptions: (options) => set({ docGenOptions: options }),
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
      merge: (persistedState, currentState) => {
        const persisted = (persistedState ?? {}) as Partial<AppStateData>;

        if (persisted.templates && typeof persisted.templates === "object") {
          const cleaned: Record<string, ResumeTemplate> = {};
          for (const [key, template] of Object.entries(persisted.templates)) {
            const result = ResumeTemplateSchema.safeParse(template);
            if (result.success && key === result.data.templateId) {
              cleaned[result.data.templateId] = result.data;
            } else if (import.meta.env.DEV) {
              console.warn(`Dropping invalid persisted template "${key}"`);
            }
          }
          persisted.templates = cleaned;
        }

        return { ...currentState, ...persisted };
      },
    },
  ),
);
