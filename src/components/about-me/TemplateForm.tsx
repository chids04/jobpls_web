import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Project, Experience, Education } from "@/lib/schemas";
import { ResumeTemplate } from "@/store/useStore";

import { ModalType, ModalDisplay } from "@/components/about-me/ModalDisplay";
import MockAboutMe from "@/mock/resume.json?raw";
import { DEBUG_MENU } from "@/lib/vars";
import { z } from "zod";

/* form values used when creating or editing templates */
export type TemplateFormValues = {
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
};

export type TemplateFormProps = {
  initial?: ResumeTemplate | null;
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
    full_name: "",
    about_me: "",
    email: "",
    github: "",
    languages: [],
    frameworks: [],
    developer_tools: [],
    projects: [],
    work_exp: [],
    education: [],
    residency: "",
  });
  const [languagesText, setLanguagesText] = useState("");
  const [frameworksText, setFrameworksText] = useState("");
  const [toolsText, setToolsText] = useState("");

  /* modal state for nested editors */
  const [isModal, setModal] = useState(false);
  const [modalType, setModalType] = useState<ModalType>("project");
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const importData = () => {
    try {
      const resume = JSON.parse(MockAboutMe);

      setFormData({
        ...resume,
        templateName: `Mock ${crypto.randomUUID()}`,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        console.log(error.issues);
      }
    }
  };

  /* hydrate from initial when provided */
  useEffect(() => {
    if (!initial) {
      resetForm();
      return;
    }

    setFormData({
      templateName: initial.templateName || "",
      full_name: initial.resume.full_name || "",
      about_me: initial.resume.about_me || "",
      email: initial.resume.email || "",
      github: initial.resume.github || "",
      languages: initial.resume.languages || [],
      frameworks: initial.resume.frameworks || [],
      developer_tools: initial.resume.developer_tools || [],
      projects: initial.resume.projects || [],
      work_exp: initial.resume.work_exp || [],
      education: initial.resume.education || [],
      residency: initial.resume.residency || "",
    });

    setLanguagesText(initial.resume.languages?.join(",") || "");
    setFrameworksText(initial.resume.frameworks?.join(",") || "");
    setToolsText(initial.resume.developer_tools?.join(",") || "");

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
        let new_work = [...formData.work_exp];
        // this is not good but idk the better alternative lol
        if (editingIndex != null) {
          new_work[editingIndex] = newItem as Experience;
          setFormData((prev) => ({
            ...prev,
            work_exp: new_work,
          }));
        } else {
          new_work = [...new_work, newItem as Experience];
          setFormData((prev) => ({
            ...prev,
            work_exp: new_work,
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
        const newWork = formData.work_exp.filter((_, i) => i != removeIdx);
        setFormData((prev) => ({
          ...prev,
          work_exp: newWork,
        }));
        break;
    }
  };

  /* helper to reset the form state */
  const resetForm = () => {
    setFormData({
      templateName: "",
      full_name: "",
      about_me: "",
      email: "",
      github: "",
      languages: [],
      frameworks: [],
      developer_tools: [],
      projects: [],
      work_exp: [],
      education: [],
      residency: "",
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

  /* get current array from text input */
  const parseList = (text: string) => {
    if (text.trim().length === 0) return [];
    return text
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
          const initialWork = formData.work_exp[index];
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
  /* render form */
  return (
    <div className="flex flex-col relative gap-5 max-w-3xl mx-auto px-4 items-center py-6 border-2">
      {DEBUG_MENU && (
        <div className="absolute top-2 right-2">
          <Button onClick={importData}>import from json</Button>
        </div>
      )}
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

      {/* full_name */}
      <div className="flex flex-col">
        <h3>name</h3>
        <Input
          placeholder="enter your name"
          className="max-w-3xs"
          name="full_name"
          value={formData.full_name}
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

      {/* residency */}
      <div className="flex flex-col max-w-md w-full">
        <h3>location</h3>
        <Input
          placeholder="enter location (London/UK)"
          name="residency"
          className="max-w-md"
          value={formData.residency}
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

      {/* about_me */}
      <div className="flex flex-col w-full gap-1">
        <h3>about me</h3>
        <Textarea
          className="w-full"
          name="about_me"
          value={formData.about_me}
          onChange={handleInputChange}
        />
      </div>

      {/* languages editor */}
      <div className="flex flex-col w-full gap-1">
        <h3>languages</h3>
        <div className="flex flex-row gap-2 w-full">
          <Textarea
            className="w-full"
            placeholder="e.g. react, typescript, tailwind"
            name="languages"
            value={languagesText}
            onChange={(e) => setLanguagesText(e.target.value)}
          />
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              const list = parseList(languagesText);
              setFormData((prev) => ({ ...prev, languages: list }));
              setLanguagesText(list.join(", "));
            }}
          >
            save
          </Button>
        </div>
        <p className="text-xs text-zinc-400">
          enter languages as a comma-separated list.
        </p>
        <div className="flex flex-wrap gap-2 mt-2">
          {formData.languages.map((lang, i) => (
            <div
              key={`${lang}-${i}`}
              className="flex items-center gap-2 rounded border border-zinc-700 bg-zinc-800 px-2 py-1 text-sm"
            >
              <span>{lang}</span>
              <Button
                type="button"
                size="sm"
                variant="destructive"
                onClick={() => {
                  const next = formData.languages.filter((_, idx) => idx !== i);
                  setFormData((prev) => ({ ...prev, languages: next }));
                  setLanguagesText(next.join(", "));
                }}
              >
                delete
              </Button>
            </div>
          ))}
        </div>
      </div>

      {/* frameworks editor */}
      <div className="flex flex-col w-full gap-1">
        <h3>frameworks</h3>
        <div className="flex flex-row gap-2 w-full">
          <Textarea
            className="w-full"
            placeholder="e.g. react, nextjs, express"
            name="frameworks"
            value={frameworksText}
            onChange={(e) => setFrameworksText(e.target.value)}
          />
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              const list = parseList(frameworksText);
              setFormData((prev) => ({ ...prev, frameworks: list }));
              setFrameworksText(list.join(", "));
            }}
          >
            save
          </Button>
        </div>
        <div className="flex flex-wrap gap-2 mt-2">
          {formData.frameworks.map((fw, i) => (
            <div
              key={`${fw}-${i}`}
              className="flex items-center gap-2 rounded border border-zinc-700 bg-zinc-800 px-2 py-1 text-sm"
            >
              <span>{fw}</span>
              <Button
                type="button"
                size="sm"
                variant="destructive"
                onClick={() => {
                  const next = formData.frameworks.filter(
                    (_, idx) => idx !== i,
                  );
                  setFormData((prev) => ({ ...prev, frameworks: next }));
                  setFrameworksText(next.join(", "));
                }}
              >
                delete
              </Button>
            </div>
          ))}
        </div>
      </div>

      {/* developer_tools editor */}
      <div className="flex flex-col w-full gap-1">
        <h3>developer tools</h3>
        <div className="flex flex-row gap-2 w-full">
          <Textarea
            className="w-full"
            placeholder="e.g. git, docker, kubernetes"
            name="developer_tools"
            value={toolsText}
            onChange={(e) => setToolsText(e.target.value)}
          />
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              const list = parseList(toolsText);
              setFormData((prev) => ({ ...prev, developer_tools: list }));
              setToolsText(list.join(", "));
            }}
          >
            save
          </Button>
        </div>
        <div className="flex flex-wrap gap-2 mt-2">
          {formData.developer_tools.map((tool, i) => (
            <div
              key={`${tool}-${i}`}
              className="flex items-center gap-2 rounded border border-zinc-700 bg-zinc-800 px-2 py-1 text-sm"
            >
              <span>{tool}</span>
              <Button
                type="button"
                size="sm"
                variant="destructive"
                onClick={() => {
                  const next = formData.developer_tools.filter(
                    (_, idx) => idx !== i,
                  );
                  setFormData((prev) => ({ ...prev, developer_tools: next }));
                  setToolsText(next.join(", "));
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
                {edu.start_date} - {edu.end_date}
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
          {formData.work_exp.map((exp: Experience, i: number) => (
            <div
              key={i}
              className="rounded border border-zinc-700 bg-zinc-800 px-3 py-2"
            >
              <div className="text-sm font-medium">
                {exp.title} @ {exp.company}
              </div>
              <div className="text-xs text-zinc-400">
                {exp.start_date} - {exp.end_date}
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
        <div className="fixed inset-0 z-1000 bg-zinc-950/90 flex items-center justify-center p-4">
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
