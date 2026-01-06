import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import TemplatesList from "@/components/about-me/TemplatesList";
import TemplateForm from "@/components/about-me/TemplateForm";
import { useAboutMeTemplates } from "@/hooks/useAppStorage";

import { AboutMeTemplate, Education, Experience, Project } from "@/lib/types";

export const Route = createFileRoute("/about-me")({
  component: RouteComponent,
  ssr: false,
});

// route component that renders templates list or the template form
function RouteComponent() {
  const {
    templates,
    addTemplate,
    updateTemplate,
    deleteTemplate,
    duplicateTemplate,
  } = useAboutMeTemplates();

  // view state: list vs form
  const [isCreating, setIsCreating] = useState(false);
  const [editingTemplateId, setEditingTemplateId] = useState<string | null>(
    null,
  );
  const [formInitial, setFormInitial] = useState<AboutMeTemplate | null>(null);

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
    deleteTemplate(id);
  };

  // duplicate a template (already has a unique name and id from list component)
  const handleDuplicate = (duplicate: AboutMeTemplate) => {
    duplicateTemplate(duplicate);
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
    location: string;
    github: string | null;
    summary: string;
    skills: string[];
    projects: Project[];
    workExperiences: Experience[];
    education: Education[];
  }) => {
    const now = new Date().toISOString();

    if (editingTemplateId) {
      // update existing template
      const existingTemplate = templates.find(
        (t) => t.id === editingTemplateId,
      );
      if (existingTemplate) {
        const updatedTemplate: AboutMeTemplate = {
          ...existingTemplate,
          templateName: values.templateName,
          name: values.name,
          email: values.email,
          github: values.github,
          summary: values.summary,
          location: values.location,
          skills: values.skills,
          projects: values.projects,
          workExperiences: values.workExperiences,
          education: values.education,
          updatedAt: now,
        };
        updateTemplate(updatedTemplate);
      }
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
      github: values.github,
      summary: values.summary,
      location: values.location,
      skills: values.skills,
      projects: values.projects,
      workExperiences: values.workExperiences,
      education: values.education,
      createdAt: now,
      updatedAt: now,
    };
    addTemplate(template);
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
