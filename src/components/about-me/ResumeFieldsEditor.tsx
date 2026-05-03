import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Project, Experience, Education, Resume } from "@/lib/schemas";

import { ModalType, ModalDisplay } from "@/components/about-me/ModalDisplay";

export type ResumeFieldsValue = {
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

export type ResumeFieldsEditorProps = {
  value: ResumeFieldsValue;
  onChange: (next: ResumeFieldsValue) => void;
};

export function emptyResumeFields(): ResumeFieldsValue {
  return {
    full_name: "",
    email: "",
    residency: "",
    github: "",
    about_me: "",
    languages: [],
    frameworks: [],
    developer_tools: [],
    projects: [],
    work_exp: [],
    education: [],
  };
}

export function resumeToFields(resume: Resume | undefined): ResumeFieldsValue {
  return {
    full_name: resume?.full_name || "",
    email: resume?.email || "",
    residency: resume?.residency || "",
    github: resume?.github || "",
    about_me: resume?.about_me || "",
    languages: resume?.languages || [],
    frameworks: resume?.frameworks || [],
    developer_tools: resume?.developer_tools || [],
    projects: resume?.projects || [],
    work_exp: resume?.work_exp || [],
    education: resume?.education || [],
  };
}

export function ResumeFieldsEditor({
  value,
  onChange,
}: ResumeFieldsEditorProps) {
  const [languagesText, setLanguagesText] = useState(
    value.languages.join(", "),
  );
  const [frameworksText, setFrameworksText] = useState(
    value.frameworks.join(", "),
  );
  const [toolsText, setToolsText] = useState(
    value.developer_tools.join(", "),
  );

  const [modalItem, setModalItem] = useState<
    Project | Experience | Education | null
  >(null);
  const [isModal, setModal] = useState(false);
  const [modalType, setModalType] = useState<ModalType>("project");
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  // Re-sync local comma-text buffers when value resets/replaces externally
  // (e.g. opening the editor with a fresh resume).
  useEffect(() => {
    setLanguagesText(value.languages.join(", "));
    setFrameworksText(value.frameworks.join(", "));
    setToolsText(value.developer_tools.join(", "));
  }, [value.languages, value.frameworks, value.developer_tools]);

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

  const update = (patch: Partial<ResumeFieldsValue>) => {
    onChange({ ...value, ...patch });
  };

  const closeModal = () => {
    setModal(false);
    setEditingIndex(null);
    setModalItem(null);
  };

  const updateModalSelection = (
    editingIdx: number | null,
    type: ModalType,
    newItem: Project | Experience | Education,
  ) => {
    switch (type) {
      case "edu": {
        const next = [...value.education];
        if (editingIdx != null) next[editingIdx] = newItem as Education;
        else next.push(newItem as Education);
        update({ education: next });
        break;
      }
      case "work": {
        const next = [...value.work_exp];
        if (editingIdx != null) next[editingIdx] = newItem as Experience;
        else next.push(newItem as Experience);
        update({ work_exp: next });
        break;
      }
      case "project": {
        const next = [...value.projects];
        if (editingIdx != null) next[editingIdx] = newItem as Project;
        else next.push(newItem as Project);
        update({ projects: next });
        break;
      }
    }
  };

  const removeSelection = (type: ModalType, removeIdx: number) => {
    switch (type) {
      case "edu":
        update({
          education: value.education.filter((_, i) => i !== removeIdx),
        });
        break;
      case "project":
        update({ projects: value.projects.filter((_, i) => i !== removeIdx) });
        break;
      case "work":
        update({ work_exp: value.work_exp.filter((_, i) => i !== removeIdx) });
        break;
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value: v } = e.target;
    update({ [name]: v } as Partial<ResumeFieldsValue>);
  };

  const parseList = (text: string) => {
    if (text.trim().length === 0) return [];
    return text
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
  };

  const handleModal = (type: ModalType, index: number | null) => {
    if (index != null) {
      switch (type) {
        case "edu":
          setModalItem(value.education[index]);
          break;
        case "work":
          setModalItem(value.work_exp[index]);
          break;
        case "project":
          setModalItem(value.projects[index]);
          break;
      }
    }
    setEditingIndex(index);
    setModalType(type);
    setModal(true);
  };

  return (
    <>
      {/* full_name */}
      <div className="flex flex-col">
        <h3>name</h3>
        <Input
          placeholder="enter your name"
          className="max-w-3xs"
          name="full_name"
          value={value.full_name}
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
          value={value.email}
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
          value={value.residency}
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
          value={value.github ?? ""}
          onChange={handleInputChange}
        />
      </div>

      {/* about_me */}
      <div className="flex flex-col w-full gap-1">
        <h3>about me</h3>
        <Textarea
          className="w-full"
          name="about_me"
          value={value.about_me}
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
              update({ languages: list });
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
          {value.languages.map((lang, i) => (
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
                  const next = value.languages.filter((_, idx) => idx !== i);
                  update({ languages: next });
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
              update({ frameworks: list });
              setFrameworksText(list.join(", "));
            }}
          >
            save
          </Button>
        </div>
        <div className="flex flex-wrap gap-2 mt-2">
          {value.frameworks.map((fw, i) => (
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
                  const next = value.frameworks.filter((_, idx) => idx !== i);
                  update({ frameworks: next });
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
              update({ developer_tools: list });
              setToolsText(list.join(", "));
            }}
          >
            save
          </Button>
        </div>
        <div className="flex flex-wrap gap-2 mt-2">
          {value.developer_tools.map((tool, i) => (
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
                  const next = value.developer_tools.filter(
                    (_, idx) => idx !== i,
                  );
                  update({ developer_tools: next });
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
          {value.education.map((edu, i) => (
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
          {value.work_exp.map((exp, i) => (
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
          {value.projects.map((proj, i) => (
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
    </>
  );
}

export default ResumeFieldsEditor;
