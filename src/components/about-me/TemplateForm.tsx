import { useEffect, useState, type ReactNode } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { ProjectModal } from "@/components/about-me/ProjectModal";
import { WorkExpModal } from "@/components/about-me/WorkExpModal";
import { EducationModal } from "@/components/about-me/EducationModal";
import {
  ModalType,
  AboutMeTemplate,
  Project,
  Experience,
  Education,
  convertDateToForm,
} from "lib/types";

/* form values used when creating or editing templates */
export type TemplateFormValues = {
  templateName: string;
  name: string;
  email: string;
  summary: string;
  skills: string[];
  projects: Project[];
  workExperiences: Experience[];
  education: Education[];
};

export type TemplateFormProps = {
  /* initial values for the form (used for editing) */
  initial?: AboutMeTemplate | TemplateFormValues | null;
  /* handler invoked when cancel is clicked */
  onCancel: () => void;
  /* handler invoked with final values when save is clicked */
  onSave: (values: TemplateFormValues) => void;
  /* optional label for the primary save button */
  saveLabel?: string;
};

/* form component for creating and editing templates with save/cancel and embedded modals */
export function TemplateForm({
  initial = null,
  onCancel,
  onSave,
  saveLabel = "Save template",
}: TemplateFormProps) {
  /* local form state */
  const [templateName, setTemplateName] = useState("");
  const [name, setName] = useState("");
  const [summary, setSummary] = useState("");
  const [email, setEmail] = useState("");
  const [skillsText, setSkillsText] = useState("");
  const [projects, setProjects] = useState<Project[]>([]);
  const [workExperiences, setWorkExperiences] = useState<Experience[]>([]);
  const [education, setEducation] = useState<Education[]>([]);

  /* modal state for nested editors */
  const [isModal, setModal] = useState(false);
  const [modalType, setModalType] = useState<ModalType>(ModalType.Project);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  /* hydrate from initial when provided */
  useEffect(() => {
    if (!initial) {
      resetForm();
      return;
    }
    setTemplateName(initial.templateName || "");
    setName(initial.name || "");
    setEmail(initial.email || "");
    setSummary(initial.summary || "");
    const initSkills = Array.isArray(initial.skills) ? initial.skills : [];
    setSkillsText(initSkills.join(", "));

    setProjects(Array.isArray(initial.projects) ? initial.projects : []);
    setWorkExperiences(
      Array.isArray(initial.workExperiences) ? initial.workExperiences : [],
    );
    setEducation(Array.isArray(initial.education) ? initial.education : []);

    setModal(false);
    setEditingIndex(null);
  }, [initial]);

  /* prevent body scroll when modal is open */
  useEffect(() => {
    if (!isModal) return;

    const y = window.scrollY;
    const original = {
      overflow: document.body.style.overflow,
      position: document.body.style.position,
      top: document.body.style.top,
      width: document.body.style.width,
    };

    document.body.style.overflow = "hidden";
    document.body.style.position = "fixed";
    document.body.style.top = `-${y}px`;
    document.body.style.width = "100%";

    return () => {
      document.body.style.overflow = original.overflow;
      document.body.style.position = original.position;
      document.body.style.top = original.top;
      document.body.style.width = original.width;
      window.scrollTo(0, y);
    };
  }, [isModal]);

  /* helper to reset the form state */
  const resetForm = () => {
    setTemplateName("");
    setName("");
    setEmail("");
    setSummary("");
    setSkillsText("");
    setProjects([]);
    setWorkExperiences([]);
    setEducation([]);
    setModal(false);
    setEditingIndex(null);
  };

  /* get current skills array from text input */
  const getCurrentSkills = () => {
    if (skillsText.trim().length === 0) return [];
    return skillsText
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
  };

  /* open a nested modal for project, work experience, or education */
  const handleModal = (type: ModalType, index: number | null) => {
    setEditingIndex(index);
    setModalType(type);
    setModal(true);
  };

  /* construct final values and invoke onSave */
  const handleSave = () => {
    if (!templateName.trim()) {
      alert("Please enter a template name before saving.");
      return;
    }
    onSave({
      templateName: templateName.trim(),
      name,
      email,
      summary,
      skills: getCurrentSkills(),
      projects,
      workExperiences,
      education,
    });
  };

  /* format date range for display */
  const formatDateRange = (dates: {
    start: string;
    end: string | "Ongoing";
  }) => {
    const startDate = convertDateToForm(dates.start);
    const endDate =
      dates.end === "Ongoing" ? "present" : convertDateToForm(dates.end);
    return `${startDate} - ${endDate}`;
  };

  /* modal content rendering */
  let modal: ReactNode = null;
  if (isModal) {
    switch (modalType) {
      case ModalType.Project:
        modal = (
          <ProjectModal
            onClose={() => {
              setModal(false);
              setEditingIndex(null);
            }}
            onSave={(proj) => {
              setProjects((prev) => {
                if (editingIndex !== null) {
                  const copy = [...prev];
                  copy[editingIndex] = proj;
                  return copy;
                }
                return [...prev, proj];
              });
            }}
            initial={editingIndex !== null ? projects[editingIndex] : undefined}
          />
        );
        break;
      case ModalType.WorkExperience:
        modal = (
          <WorkExpModal
            onClose={() => {
              setModal(false);
              setEditingIndex(null);
            }}
            onSave={(exp) => {
              setWorkExperiences((prev) => {
                if (editingIndex !== null) {
                  const copy = [...prev];
                  copy[editingIndex] = exp;
                  return copy;
                }
                return [...prev, exp];
              });
            }}
            initial={
              editingIndex !== null ? workExperiences[editingIndex] : undefined
            }
          />
        );
        break;
      case ModalType.Education:
        modal = (
          <EducationModal
            onClose={() => {
              setModal(false);
              setEditingIndex(null);
            }}
            onSave={(edu) => {
              setEducation((prev) => {
                if (editingIndex !== null) {
                  const copy = [...prev];
                  copy[editingIndex] = edu;
                  return copy;
                }
                return [...prev, edu];
              });
            }}
            initial={
              editingIndex !== null ? education[editingIndex] : undefined
            }
          />
        );
        break;
    }
  }

  /* render form */
  return (
    <div className="flex flex-col gap-5 max-w-3xl mx-auto px-4 items-center py-6">
      {/* template name */}
      <div className="flex flex-col items-center gap-2 mb-5">
        <h3>template name</h3>
        <Input
          placeholder="enter a template name"
          className="max-w-md"
          value={templateName}
          onChange={(e) => setTemplateName(e.target.value)}
        />
      </div>

      {/* name */}
      <div className="flex flex-col">
        <h3>name</h3>
        <Input
          placeholder="enter your name"
          className="max-w-3xs"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>

      {/* email */}
      <div className="flex flex-col max-w-md w-full">
        <h3>email</h3>
        <Input
          type="email"
          placeholder="enter your email"
          className="max-w-md"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>

      {/* summary */}
      <div className="flex flex-col w-full gap-1">
        <h3>about me</h3>
        <Textarea
          className="w-full"
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
        />
      </div>

      {/* skills editor */}
      <div className="flex flex-col w-full gap-1">
        <h3>skills</h3>
        <div className="flex flex-row gap-2 w-full">
          <Textarea
            className="w-full"
            placeholder="e.g. react, typescript, tailwind"
            value={skillsText}
            onChange={(e) => setSkillsText(e.target.value)}
          />
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              const list = getCurrentSkills();
              setSkillsText(list.join(", "));
            }}
          >
            format
          </Button>
        </div>
        <p className="text-xs text-zinc-400">
          enter skills as a comma-separated list.
        </p>
        <div className="flex flex-wrap gap-2 mt-2">
          {getCurrentSkills().map((skill, i) => (
            <div
              key={`${skill}-${i}`}
              className="flex items-center gap-2 rounded border border-zinc-700 bg-zinc-800 px-2 py-1 text-sm"
            >
              <span>{skill}</span>
              <Button
                type="button"
                size="sm"
                variant="destructive"
                onClick={() => {
                  const currentSkills = getCurrentSkills();
                  const next = currentSkills.filter((_, idx) => idx !== i);
                  setSkillsText(next.join(", "));
                }}
              >
                delete
              </Button>
            </div>
          ))}
        </div>
      </div>

      {/* work experience editor */}
      <div className="flex flex-col gap-2 w-full">
        <div className="flex items-center gap-2">
          <h3 className="flex-1">work experience</h3>
          <Button
            type="button"
            variant="outline"
            className="text-black"
            onClick={() => handleModal(ModalType.WorkExperience, null)}
          >
            add
          </Button>
        </div>
        <div className="flex flex-wrap gap-3">
          {workExperiences.map((exp, i) => (
            <div
              key={i}
              className="rounded border border-zinc-700 bg-zinc-800 px-3 py-2"
            >
              <div className="text-sm font-medium">
                {exp.title} @ {exp.company}
              </div>
              <div className="text-xs text-zinc-400">
                {formatDateRange(exp.dates)}
              </div>
              <div className="mt-1 flex gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => handleModal(ModalType.WorkExperience, i)}
                >
                  edit
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  onClick={() =>
                    setWorkExperiences(
                      workExperiences.filter((_, idx) => idx !== i),
                    )
                  }
                >
                  delete
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* education editor */}
      <div className="flex flex-col gap-2 w-full">
        <div className="flex items-center gap-2">
          <h3 className="flex-1">education</h3>
          <Button
            type="button"
            variant="outline"
            className="text-black"
            onClick={() => handleModal(ModalType.Education, null)}
          >
            add
          </Button>
        </div>
        <div className="flex flex-wrap gap-3">
          {education.map((edu, i) => (
            <div
              key={i}
              className="rounded border border-zinc-700 bg-zinc-800 px-3 py-2"
            >
              <div className="text-sm font-medium">
                {edu.title} @ {edu.name}
              </div>
              <div className="text-xs text-zinc-400">
                {formatDateRange(edu.dates)}
              </div>
              <div className="text-xs text-zinc-500">{edu.grade}</div>
              <div className="mt-1 flex gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => handleModal(ModalType.Education, i)}
                >
                  edit
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  onClick={() =>
                    setEducation(education.filter((_, idx) => idx !== i))
                  }
                >
                  delete
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* projects editor */}
      <div className="flex flex-col gap-2 w-full">
        <div className="flex items-center gap-2">
          <h3 className="flex-1">projects</h3>
          <Button
            type="button"
            variant="outline"
            className="text-black"
            onClick={() => handleModal(ModalType.Project, null)}
          >
            add
          </Button>
        </div>
        <div className="flex flex-wrap gap-3">
          {projects.map((proj, i) => (
            <div
              key={i}
              className="rounded border border-zinc-700 bg-zinc-800 px-3 py-2"
            >
              <div className="text-sm font-medium">{proj.title}</div>
              <div className="mt-1 flex gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => handleModal(ModalType.Project, i)}
                >
                  edit
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  onClick={() =>
                    setProjects(projects.filter((_, idx) => idx !== i))
                  }
                >
                  delete
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* actions */}
      <div className="sticky bottom-0 left-0 right-0 bg-zinc-900/60 backdrop-blur border-t border-zinc-800 w-full py-3 mt-6">
        <div className="max-w-3xl mx-auto px-4 flex items-center justify-between">
          <Button type="button" variant="ghost" onClick={onCancel}>
            cancel
          </Button>
          <Button type="button" className="text-black" onClick={handleSave}>
            {saveLabel}
          </Button>
        </div>
      </div>

      {/* modal overlay */}
      {isModal ? (
        <div className="fixed inset-0 z-[1000] bg-zinc-950/90 flex items-center justify-center p-4">
          {modal}
        </div>
      ) : null}
    </div>
  );
}

export default TemplateForm;
