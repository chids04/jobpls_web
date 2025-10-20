import { createFileRoute } from "@tanstack/react-router";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { ProjectModal } from "@/components/about-me/ProjectModal";
import type { ProjectForm } from "@/components/about-me/ProjectModal";
import {
  WorkExpModal,
  type WorkExpForm,
} from "@/components/about-me/WorkExpModal";

import { useEffect, useState } from "react";

// using ProjectForm type from ProjectModal

export const Route = createFileRoute("/about-me")({
  component: RouteComponent,
});

// enums for diff types of enums
enum ModalType {
  WorkExperience,
  Project,
}

function RouteComponent() {
  const [name, setName] = useState("");
  const [summary, setSummary] = useState("");
  const [email, setEmail] = useState("");
  const [isModal, setModal] = useState(false);
  const [modalType, setModalType] = useState<ModalType>(ModalType.Project);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [projects, setProjects] = useState<ProjectForm[]>([]);
  const [workExperiences, setWorkExperiences] = useState<WorkExpForm[]>([]);
  const [skillsText, setSkillsText] = useState("");
  const [skills, setSkills] = useState<string[]>([]);

  useEffect(() => {
    try {
      const name = localStorage.getItem("aboutMe.name");
      const summary = localStorage.getItem("aboutMe.summary");
      const email = localStorage.getItem("aboutMe.email");
      const proj = localStorage.getItem("aboutMe.projects");
      const exp = localStorage.getItem("aboutMe.workExperiences");
      const skl = localStorage.getItem("aboutMe.skills");
      if (proj) setProjects(JSON.parse(proj));
      if (name) setName(name);
      if (summary) setSummary(summary);
      if (email) setEmail(email);
      if (exp) setWorkExperiences(JSON.parse(exp));
      if (skl) {
        const parsed = JSON.parse(skl) as string[];
        setSkills(parsed);
        setSkillsText(parsed.join(", "));
      }
    } catch (e) {
      console.error("Failed to load from localStorage", e);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem("aboutMe.name", name);
      localStorage.setItem("aboutMe.email", email);
      localStorage.setItem("aboutMe.summary", summary);
      localStorage.setItem("aboutMe.projects", JSON.stringify(projects));
      localStorage.setItem(
        "aboutMe.workExperiences",
        JSON.stringify(workExperiences),
      );
      localStorage.setItem("aboutMe.skills", JSON.stringify(skills));
    } catch (e) {
      console.error("Failed to save to localStorage", e);
    }
  }, [projects, workExperiences, skills, name, email, summary]);

  const handleModal = (type: ModalType, index: number | null) => {
    setEditingIndex(index);
    setModalType(type);
    setModal(true);
  };

  // prevents scrolling main content when modal is open
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

  let modal;
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
    }
  }

  return (
    <div className="flex flex-col gap-5 max-w-3xl mx-auto px-4 items-center">
      {/*about  me container*/}
      <div className="flex flex-col">
        <h3>name</h3>
        <Input
          placeholder="enter your name"
          className="max-w-3xs"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>

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

      <div className="flex flex-col w-full gap-1">
        <h3>about me</h3>
        <Textarea
          className="w-full"
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
        />
      </div>

      <div className="flex flex-col w-full gap-1">
        <h3>skills</h3>
        <div className="flex flex-row gap-2 w-full">
          <Textarea
            className="w-full"
            placeholder="e.g. React, TypeScript, Tailwind"
            value={skillsText}
            onChange={(e) => setSkillsText(e.target.value)}
          />
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              const list = skillsText
                .split(",")
                .map((s) => s.trim())
                .filter(Boolean);
              setSkills(list);
              setSkillsText(list.join(", "));
            }}
          >
            save
          </Button>
        </div>
        <p className="text-xs text-zinc-400">
          Enter skills as a comma-separated list.
        </p>
        <div className="flex flex-wrap gap-2 mt-2">
          {skills.map((skill, i) => (
            <div
              key={i}
              className="flex items-center gap-2 rounded border border-zinc-700 bg-zinc-800 px-2 py-1 text-sm"
            >
              <span>{skill}</span>
              <Button
                type="button"
                size="sm"
                variant="destructive"
                onClick={() => setSkills(skills.filter((_, idx) => idx !== i))}
              >
                delete
              </Button>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-2 w-full">
        <div className="flex items-center gap-2">
          <h3 className="flex-1">work experience</h3>
          <Button
            type="button"
            variant="outline"
            className="text-black"
            onClick={() => handleModal(ModalType.WorkExperience, null)}
          >
            Add
          </Button>
        </div>
        <div className="flex flex-wrap gap-3">
          {workExperiences.map((exp, i) => (
            <div
              key={i}
              className="rounded border border-zinc-700 bg-zinc-800 px-3 py-2"
            >
              <div className="text-sm font-medium">
                {exp.jobTitle} @ {exp.company}
              </div>
              <div className="text-xs text-zinc-400">
                {exp.dateFrom} -{" "}
                {exp.ongoing || !exp.dateTo ? "present" : exp.dateTo}
              </div>
              <div className="mt-1 flex gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => handleModal(ModalType.WorkExperience, i)}
                >
                  Edit
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
                  Delete
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-2 w-full">
        <div className="flex items-center gap-2">
          <h3 className="flex-1">projects</h3>
          <Button
            type="button"
            variant="outline"
            className="text-black"
            onClick={() => handleModal(ModalType.Project, null)}
          >
            Add
          </Button>
        </div>
        <div className="flex flex-wrap gap-3">
          {projects.map((proj, i) => (
            <div
              key={i}
              className="rounded border border-zinc-700 bg-zinc-800 px-3 py-2"
            >
              <div className="text-sm font-medium">{proj.projectName}</div>
              <div className="text-xs text-zinc-400">
                {proj.dateFrom} -{" "}
                {proj.ongoing || !proj.dateTo ? "present" : proj.dateTo}
              </div>
              <div className="mt-1 flex gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => handleModal(ModalType.Project, i)}
                >
                  Edit
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  onClick={() =>
                    setProjects(projects.filter((_, idx) => idx !== i))
                  }
                >
                  Delete
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {isModal ? (
        <div className="fixed inset-0 z-[1000] bg-zinc-950/90 flex items-center justify-center p-4">
          {modal}
        </div>
      ) : null}
    </div>
  );
}
