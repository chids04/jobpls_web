import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import TemplatesList from "@/components/about-me/TemplatesList";
import TemplateForm from "@/components/about-me/TemplateForm";
import {
  LS_KEY_TEMPLATES,
  type AboutMeTemplate,
} from "@/components/about-me/types";

export const Route = createFileRoute("/about-me")({
  component: RouteComponent,
  ssr: false,
});

// route component that renders templates list or the template form
function RouteComponent() {
  // templates state
  const [templates, setTemplates] = useState<AboutMeTemplate[]>([]);

  // view state: list vs form
  const [isCreating, setIsCreating] = useState(false);
  const [editingTemplateId, setEditingTemplateId] = useState<string | null>(
    null,
  );
  const [formInitial, setFormInitial] = useState<AboutMeTemplate | null>(null);

  // load templates from local storage
  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_KEY_TEMPLATES);
      if (raw) {
        const parsed = JSON.parse(raw) as AboutMeTemplate[];
        if (Array.isArray(parsed)) {
          setTemplates(parsed);
        }
      }
    } catch (e) {
      console.error("failed to load templates from localStorage", e);
    }
  }, []);

  // start creating a new template
  const handleCreate = () => {
    setEditingTemplateId(null);
    setFormInitial(null);
    setIsCreating(true);
  };

  // start editing an existing template
  const handleEdit = (template: AboutMeTemplate) => {
    setEditingTemplateId(template.id);
    setFormInitial(template);
    setIsCreating(true);
  };

  // delete a template with confirmation
  const handleDelete = (id: string) => {
    const t = templates.find((x) => x.id === id);
    const confirmText = t
      ? `Delete template "${t.templateName}"? This cannot be undone.`
      : "Delete this template? This cannot be undone.";
    if (!confirm(confirmText)) return;
    setTemplates((prev) => {
      const next = prev.filter((tpl) => tpl.id !== id);
      try {
        localStorage.setItem(LS_KEY_TEMPLATES, JSON.stringify(next));
      } catch (e) {
        console.error("failed to save templates to localStorage", e);
      }
      return next;
    });
  };

  // duplicate a template (already has a unique name and id from list component)
  const handleDuplicate = (duplicate: AboutMeTemplate) => {
    setTemplates((prev) => {
      const next = [duplicate, ...prev];
      try {
        localStorage.setItem(LS_KEY_TEMPLATES, JSON.stringify(next));
      } catch (e) {
        console.error("failed to save templates to localStorage", e);
      }
      return next;
    });
  };

  // cancel creation or editing, go back to list
  const handleCancel = () => {
    setIsCreating(false);
    setEditingTemplateId(null);
    setFormInitial(null);
  };

  // save handler for create/update
  const handleSave = (values: {
    templateName: string;
    name: string;
    email: string;
    summary: string;
    skills: string[];
    projects: AboutMeTemplate["projects"];
    workExperiences: AboutMeTemplate["workExperiences"];
  }) => {
    const now = new Date().toISOString();

    if (editingTemplateId) {
      // update existing template
      setTemplates((prev) => {
        const next = prev.map((t) =>
          t.id === editingTemplateId
            ? {
                ...t,
                templateName: values.templateName,
                name: values.name,
                email: values.email,
                summary: values.summary,
                skills: values.skills,
                projects: values.projects,
                workExperiences: values.workExperiences,
                updatedAt: now,
              }
            : t,
        );
        try {
          localStorage.setItem(LS_KEY_TEMPLATES, JSON.stringify(next));
        } catch (e) {
          console.error("failed to save templates to localStorage", e);
        }
        return next;
      });
      setIsCreating(false);
      setEditingTemplateId(null);
      setFormInitial(null);
      return;
    }

    // create new template
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
    const template: AboutMeTemplate = {
      id,
      templateName: values.templateName,
      name: values.name,
      email: values.email,
      summary: values.summary,
      skills: values.skills,
      projects: values.projects,
      workExperiences: values.workExperiences,
      createdAt: now,
      updatedAt: now,
    };
    setTemplates((prev) => {
      const next = [template, ...prev];
      try {
        localStorage.setItem(LS_KEY_TEMPLATES, JSON.stringify(next));
      } catch (e) {
        console.error("failed to save templates to localStorage", e);
      }
      return next;
    });
    setIsCreating(false);
    setEditingTemplateId(null);
    setFormInitial(null);
  };

  // render list view
  if (!isCreating) {
    return (
      <TemplatesList
        templates={templates}
        onCreate={handleCreate}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onDuplicate={handleDuplicate}
      />
    );
  }

  // render form view
  return (
    <TemplateForm
      initial={formInitial ?? undefined}
      onCancel={handleCancel}
      onSave={handleSave}
      saveLabel={editingTemplateId ? "Update template" : "Save template"}
    />
  );
}
