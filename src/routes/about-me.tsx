import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import TemplatesList from "@/components/about-me/TemplatesList";
import TemplateForm from "@/components/about-me/TemplateForm";
import { useStore, ResumeTemplate } from "@/store/useStore";
import { Education, Experience, Project } from "@/lib/schemas";

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
  } = useStore();

  const templatesArray = Object.values(templates).sort((a, b) => 
    new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );

  // view state: list vs form
  const [isCreating, setIsCreating] = useState(false);
  const [editingTemplateId, setEditingTemplateId] = useState<string | null>(
    null,
  );
  const [formInitial, setFormInitial] = useState<ResumeTemplate | null>(null);

  // start creating a new template
  const handleCreate = () => {
    setEditingTemplateId(null);
    setFormInitial(null);
    setIsCreating(true);
  };

  // start editing an existing template
  const handleEdit = (template: ResumeTemplate) => {
    setEditingTemplateId(template.templateId);
    setFormInitial(template);
    setIsCreating(true);
  };

  // delete a template with confirmation
  const handleDelete = (id: string) => {
    const t = templates[id];
    const confirmText = t
      ? `Delete template "${t.templateName}"? This cannot be undone.`
      : "Delete this template? This cannot be undone.";
    if (!confirm(confirmText)) return;
    deleteTemplate(id);
  };

  // duplicate a template (already has a unique name and id from list component)
  const handleDuplicate = (duplicate: ResumeTemplate) => {
    addTemplate(duplicate);
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

    if (editingTemplateId) {
      // update existing template
      const existingTemplate = templates[editingTemplateId];
      if (existingTemplate) {
        const updatedTemplate: ResumeTemplate = {
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
        updateTemplate(updatedTemplate);
      }
      setIsCreating(false);
      setEditingTemplateId(null);
      setFormInitial(null);
      return;
    }

    // create new template
    const templateId = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
    const template: ResumeTemplate = {
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
    addTemplate(template);
    setIsCreating(false);
    setEditingTemplateId(null);
    setFormInitial(null);
  };

  // render list view
  if (!isCreating) {
    return (
      <TemplatesList
        templates={templatesArray}
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
