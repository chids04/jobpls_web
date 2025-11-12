import { useEffect, useState, type ReactNode } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  AboutMeTemplate,
  Project,
  Experience,
  Education,
  convertDateToForm,
} from "@/lib/types";

import { ModalType, ModalDisplay } from "@/components/about-me/ModalDisplay";

/* form values used when creating or editing templates */
export type TemplateFormValues = {
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
};

export type TemplateFormProps = {
  initial?: AboutMeTemplate | null;
  // handler to cancel from parent
  onCancel: () => void;

  /* handler invoked with final values when save is clicked */
  onSave: (values: TemplateFormValues) => void;
  /* optional label for the primary save button */
  saveLabel?: string;
};

export function TemplateForm({
  initial = null,
  onCancel,
  onSave,
  saveLabel = "Save template",
}: TemplateFormProps) {
  /* local form state */
  const [modalItem, setModalItem] = useState<
    Project | Experience | Education | null
  >(null);

  const [formData, setFormData] = useState<TemplateFormValues>({
    templateName: "",
    name: "",
    summary: "",
    email: "",
    github: "",
    skills: [],
    projects: [],
    workExperiences: [],
    education: [],
    location: "",
  });
  const [skillsText, setSkillsText] = useState("");

  /* modal state for nested editors */
  const [isModal, setModal] = useState(false);
  const [modalType, setModalType] = useState<ModalType>("project");
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  /* hydrate from initial when provided */
  useEffect(() => {
    if (!initial) {
      resetForm();
      return;
    }

    setFormData({
      templateName: initial.templateName || "",
      name: initial.name || "",
      summary: initial.summary || "",
      email: initial.email || "",
      github: initial.github || "",
      skills: initial.skills,
      projects: initial.projects || [],
      workExperiences: initial.workExperiences || [],
      education: initial.education || [],
      location: initial.location || "",
    });

    setSkillsText(initial.skills.join(","));

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

  const closeModal = () => {
    setModal(false);
    setEditingIndex(null);
    setModalItem(null);
  };

  const updateModalSelection = (
    editingIndex: number | null,
    modalType: ModalType,
    newItem: Project | Experience | Education,
  ) => {
    switch (modalType) {
      case "edu":
        let new_edu = [...formData.education];
        // this is not good but idk the better alternative lol
        if (editingIndex != null) {
          new_edu[editingIndex] = newItem as Education;
          setFormData((prev) => ({
            ...prev,
            education: new_edu,
          }));
        } else {
          new_edu = [...new_edu, newItem as Education];
          setFormData((prev) => ({
            ...prev,
            education: new_edu,
          }));
        }
        break;

      case "work":
        let new_work = [...formData.workExperiences];
        // this is not good but idk the better alternative lol
        if (editingIndex != null) {
          new_work[editingIndex] = newItem as Experience;
          setFormData((prev) => ({
            ...prev,
            workExperiences: new_work,
          }));
        } else {
          new_work = [...new_work, newItem as Experience];
          setFormData((prev) => ({
            ...prev,
            workExperiences: new_work,
          }));
        }
        break;

      case "project":
        let new_proj = [...formData.projects];
        // this is not good but idk the better alternative lol
        if (editingIndex != null) {
          new_proj[editingIndex] = newItem as Project;
          setFormData((prev) => ({
            ...prev,
            projects: new_proj,
          }));
        } else {
          new_proj = [...new_proj, newItem as Project];
          setFormData((prev) => ({
            ...prev,
            projects: new_proj,
          }));
        }
        break;
    }
  };

  const removeSelection = (type: ModalType, removeIdx: number) => {
    switch (type) {
      case "edu":
        const newEdu = formData.education.filter((_, i) => i != removeIdx);
        setFormData((prev) => ({
          ...prev,
          education: newEdu,
        }));
        break;

      case "project":
        const newProj = formData.projects.filter((_, i) => i != removeIdx);
        setFormData((prev) => ({
          ...prev,
          projects: newProj,
        }));
        break;

      case "work":
        const newWork = formData.workExperiences.filter(
          (_, i) => i != removeIdx,
        );
        setFormData((prev) => ({
          ...prev,
          workExperiences: newWork,
        }));
        break;
    }
  };

  /* helper to reset the form state */
  const resetForm = () => {
    setFormData({
      templateName: "",
      name: "",
      summary: "",
      email: "",
      github: "",
      skills: [],
      projects: [],
      workExperiences: [],
      education: [],
      location: "",
    });
    setModal(false);
    setEditingIndex(null);
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target; // 'name' corresponds to the input's name attribute
    setFormData((prevData) => ({
      // Return a NEW object
      ...prevData, // Copy all existing fields from prevData
      [name]: value, // Update/overwrite the specific field using computed property name
    }));
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
    if (index != null) {
      switch (type) {
        case "edu":
          const initialEdu = formData.education[index];
          setModalItem(initialEdu);
          break;

        case "work":
          const initialWork = formData.workExperiences[index];
          setModalItem(initialWork);
          break;

        case "project":
          const initialProject = formData.projects[index];
          setModalItem(initialProject);
          break;
      }
    }

    setEditingIndex(index);
    setModalType(type);
    setModal(true);
  };

  /* construct final values and invoke onSave */
  const handleSave = () => {
    if (!formData.templateName.trim()) {
      alert("Please enter a template name before saving.");
      return;
    }

    onSave(formData);
  };

  /* format date range for display */
  const formatDateRange = (dates: {
    start: string;
    end: string | "Ongoing";
  }) => {
    const startDate = convertDateToForm(dates.start);
    const endDate =
      dates.end === "Ongoing" ? dates.end : convertDateToForm(dates.end);
    return `${startDate} - ${endDate}`;
  };

  /* render form */
  return (
    <div className="flex flex-col gap-5 max-w-3xl mx-auto px-4 items-center py-6 border-2">
      {/* template name */}
      <div className="flex flex-col items-center gap-2 mb-5">
        <h3>template name</h3>
        <Input
          placeholder="enter a template name"
          className="max-w-md"
          name="templateName"
          value={formData.templateName}
          onChange={handleInputChange}
        />
      </div>

      {/* name */}
      <div className="flex flex-col">
        <h3>name</h3>
        <Input
          placeholder="enter your name"
          className="max-w-3xs"
          name="name"
          value={formData.name}
          onChange={handleInputChange}
        />
      </div>

      {/* email */}
      <div className="flex flex-col max-w-md w-full">
        <h3>email</h3>
        <Input
          type="email"
          name="email"
          placeholder="enter your email"
          className="max-w-md"
          value={formData.email}
          onChange={handleInputChange}
        />
      </div>

      {/* location */}
      <div className="flex flex-col max-w-md w-full">
        <h3>location</h3>
        <Input
          placeholder="enter location (London/UK)"
          name="location"
          className="max-w-md"
          value={formData.location}
          onChange={handleInputChange}
        />
      </div>

      {/* github */}
      <div className="flex flex-col max-w-md w-full">
        <h3>github</h3>
        <Input
          type="url"
          name="github"
          placeholder="enter your github url"
          className="max-w-md"
          value={formData.github ?? ""}
          onChange={handleInputChange}
        />
      </div>

      {/* summary */}
      <div className="flex flex-col w-full gap-1">
        <h3>about me</h3>
        <Textarea
          className="w-full"
          name="summary"
          value={formData.summary}
          onChange={handleInputChange}
        />
      </div>

      {/* skills editor */}
      <div className="flex flex-col w-full gap-1">
        <h3>skills</h3>
        <div className="flex flex-row gap-2 w-full">
          <Textarea
            className="w-full"
            placeholder="e.g. react, typescript, tailwind"
            name="skills"
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
            save
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
      {/* education editor */}
      <div className="flex flex-col gap-2 w-full">
        <div className="flex items-center gap-2">
          <h3 className="flex-1">education</h3>
          <Button
            type="button"
            variant="outline"
            className="text-black"
            onClick={() => handleModal("edu", null)}
          >
            add
          </Button>
        </div>
        <div className="flex flex-wrap gap-3">
          {formData.education.map((edu, i) => (
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
                  onClick={() => handleModal("edu", i)}
                >
                  edit
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  onClick={() => removeSelection("edu", i)}
                >
                  delete
                </Button>
              </div>
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
            onClick={() => handleModal("work", null)}
          >
            add
          </Button>
        </div>
        <div className="flex flex-wrap gap-3">
          {formData.workExperiences.map((exp: Experience, i: number) => (
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
                  onClick={() => handleModal("work", i)}
                >
                  edit
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  onClick={() => removeSelection("work", i)}
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
            onClick={() => handleModal("project", null)}
          >
            add
          </Button>
        </div>
        <div className="flex flex-wrap gap-3">
          {formData.projects.map((proj, i) => (
            <div
              key={i}
              className="rounded border border-zinc-700 bg-zinc-800 px-3 py-2"
            >
              <div className="text-sm font-medium">{proj.title}</div>
              <div className="mt-1 flex gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => handleModal("project", i)}
                >
                  edit
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  onClick={() => removeSelection("project", i)}
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
          <ModalDisplay
            type={modalType}
            onSave={updateModalSelection}
            onClose={closeModal}
            initialItem={modalItem}
            editingIndex={editingIndex}
          />
        </div>
      ) : null}
    </div>
  );
}

export default TemplateForm;
