import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, ReactNode } from "react";
import TemplatesList from "@/components/about-me/TemplatesList";
import TemplateForm from "@/components/about-me/TemplateForm";
import { useTemplateStore, ResumeTemplate } from "@/store/useStore";
import {
  Education,
  Experience,
  Project,
  Resume,
  ResumeTemplateSchema,
} from "@/lib/schemas";
import axios from "axios";
import { useSession } from "@/lib/auth-client";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Status, StatusVariant } from "@/components/ui/Status";

export const Route = createFileRoute("/about-me")({
  component: RouteComponent,
  ssr: false,
});

function RouteComponent() {
  const { data: session } = useSession();
  const { templates, addTemplate, updateTemplate, deleteTemplate, cloudSync } =
    useTemplateStore();

  const isPro = session?.user?.tier === "pro";
  const canSync = isPro && cloudSync;

  const [status, setStatus] = useState<{
    variant: StatusVariant;
    msg: ReactNode;
  }>({
    variant: "default",
    msg: "",
  });

  const setStatusMessage = (msg: ReactNode, variant: StatusVariant) => {
    setStatus({ msg, variant });
  };

  const templatesArray = Object.values(templates).sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
  );

  const [isCreating, setIsCreating] = useState(false);
  const [editingTemplateId, setEditingTemplateId] = useState<string | null>(
    null,
  );
  const [formInitial, setFormInitial] = useState<ResumeTemplate | null>(null);

  // Fetch cloud templates
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["cloudTemplates"],
    queryFn: async () => {
      if (!canSync) return [];
      const response = await axios.get<ResumeTemplate[]>("/api/templates");
      return response.data;
    },
    enabled: canSync,
  });

  useEffect(() => {
    if (data && Array.isArray(data)) {
      data.forEach((cloudTemplate: unknown) => {
        const result = ResumeTemplateSchema.safeParse(cloudTemplate);
        if (!result.success) {
          if (import.meta.env.DEV) {
            console.warn("skipping invalid cloud template", result.error);
          }
          return;
        }
        const parsed = result.data;
        const existing = templates[parsed.templateId];
        if (
          !existing ||
          new Date(parsed.updatedAt) > new Date(existing.updatedAt)
        ) {
          addTemplate({ ...parsed, isSynced: true });
        }
      });
    }
  }, [data]);

  useEffect(() => {
    if (data) {
      setStatusMessage("", "success");
    } else if (isLoading) {
      setStatusMessage("Loading templates", "loading");
    } else if (isError) {
      setStatusMessage(`Error loading templates ${error.message}`, "error");
    }
  }, [data, isLoading, isError]);

  const syncMutation = useMutation({
    mutationFn: async (template: ResumeTemplate) => {
      if (!canSync) return;
      return axios.post("/api/templates", template);
    },
    onMutate: () => {
      setStatusMessage("Syncing template to cloud...", "loading");
    },
    onSuccess: () => {
      setStatusMessage("Cloud sync successful", "success");
      setTimeout(() => setStatusMessage("", "default"), 3000);
    },
    onError: (error) => {
      if (import.meta.env.DEV) console.error("Cloud sync failed", error);
      setStatusMessage("Cloud sync failed", "error");
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      if (!canSync) return;
      return axios.delete(`/api/templates?id=${id}`);
    },
    onMutate: () => {
      setStatusMessage("Deleting from cloud...", "loading");
    },
    onSuccess: () => {
      setStatusMessage("Deleted from cloud", "success");
      setTimeout(() => setStatusMessage("", "default"), 3000);
    },
    onError: (error) => {
      if (import.meta.env.DEV) console.error("Cloud delete failed", error);
      setStatusMessage("Failed to delete from cloud", "error");
    },
  });

  const handleCreate = () => {
    setEditingTemplateId(null);
    setFormInitial(null);
    setIsCreating(true);
  };

  const handleEdit = (template: ResumeTemplate) => {
    setEditingTemplateId(template.templateId);
    setFormInitial(template);
    setIsCreating(true);
  };

  const handleCreateFromImport = (template: Resume) => {
    setFormInitial({
      templateId: "",
      templateName: "",
      resume: template,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    setEditingTemplateId(null);
    setIsCreating(true);
  };

  const handleDelete = async (id: string) => {
    const t = templates[id];
    const confirmText = t
      ? `Delete template "${t.templateName}"? This cannot be undone.`
      : "Delete this template? This cannot be undone.";
    if (!confirm(confirmText)) return;

    if (canSync) {
      deleteMutation.mutate(id);
    }
    deleteTemplate(id);
  };

  const handleUpload = (template: ResumeTemplate) => {
    if (!canSync) return;
    syncMutation.mutate(template, {
      onSuccess: () => {
        updateTemplate({ ...template, isSynced: true });
        setStatusMessage("Cloud sync successful", "success");
        setTimeout(() => setStatusMessage("", "default"), 3000);
      },
    });
  };

  const handleDuplicate = async (duplicate: ResumeTemplate) => {
    if (canSync) {
      syncMutation.mutate(duplicate, {
        onSuccess: () => {
          addTemplate({ ...duplicate, isSynced: true });
        },
      });
    } else {
      addTemplate(duplicate);
    }
  };

  const handleCancel = () => {
    setIsCreating(false);
    setEditingTemplateId(null);
    setFormInitial(null);
  };

  const handleSave = async (values: {
    templateName: string;
    full_name: string;
    email: string;
    residency: string;
    github: string | null;
    about_me: string;
    languages: string[];
    frameworks: string[];
    developer_tools: string[];
    projects: Project[];
    work_exp: Experience[];
    education: Education[];
  }) => {
    const now = new Date();
    let finalTemplate: ResumeTemplate;

    if (editingTemplateId) {
      const existingTemplate = templates[editingTemplateId];
      if (!existingTemplate) return;

      finalTemplate = {
        ...existingTemplate,
        templateName: values.templateName,
        resume: {
          full_name: values.full_name,
          email: values.email,
          github: values.github ?? undefined,
          about_me: values.about_me,
          residency: values.residency,
          languages: values.languages,
          frameworks: values.frameworks,
          developer_tools: values.developer_tools,
          projects: values.projects,
          work_exp: values.work_exp,
          education: values.education,
        },
        updatedAt: now,
      };
    } else {
      const templateId = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
      finalTemplate = {
        templateId,
        templateName: values.templateName,
        resume: {
          full_name: values.full_name,
          email: values.email,
          github: values.github ?? undefined,
          about_me: values.about_me,
          residency: values.residency,
          languages: values.languages,
          frameworks: values.frameworks,
          developer_tools: values.developer_tools,
          projects: values.projects,
          work_exp: values.work_exp,
          education: values.education,
        },
        createdAt: now,
        updatedAt: now,
      };
    }

    if (canSync) {
      syncMutation.mutate(finalTemplate, {
        onSuccess: () => {
          const syncedTemplate = { ...finalTemplate, isSynced: true };
          if (editingTemplateId) {
            updateTemplate(syncedTemplate);
          } else {
            addTemplate(syncedTemplate);
          }
        },
        onError: () => {
          const unsyncedTemplate = { ...finalTemplate, isSynced: false };
          if (editingTemplateId) {
            updateTemplate(unsyncedTemplate);
          } else {
            addTemplate(unsyncedTemplate);
          }
        },
      });
    } else {
      if (editingTemplateId) {
        updateTemplate(finalTemplate);
      } else {
        addTemplate(finalTemplate);
      }
    }

    setIsCreating(false);
    setEditingTemplateId(null);
    setFormInitial(null);
  };

  if (!isCreating) {
    return (
      <div className="flex flex-col gap-4">
        <TemplatesList
          templates={templatesArray}
          onCreate={handleCreate}
          onImport={handleCreateFromImport}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onDuplicate={handleDuplicate}
          onUpload={handleUpload}
          cloudSyncEnabled={canSync}
        />
        {status.msg && <Status variant={status.variant} message={status.msg} />}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <TemplateForm
        initial={formInitial ?? undefined}
        onCancel={handleCancel}
        onSave={handleSave}
        saveLabel={editingTemplateId ? "update template" : "save template"}
      />
      {status.msg && <Status variant={status.variant} message={status.msg} />}
    </div>
  );
}
