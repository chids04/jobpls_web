import { createFileRoute } from "@tanstack/react-router";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { ProjectModal } from "@/components/about-me/ProjectModal";
import { WorkExpModal } from "@/components/about-me/WorkExpModal";

import { useState } from "react";

export const Route = createFileRoute("/about-me")({
  component: RouteComponent,
});

// enums for diff types of enums
enum ModalType {
  WorkExperience,
  Project,
}

function RouteComponent() {
  const [isModal, setModal] = useState(false);
  const [modalType, setModalType] = useState<ModalType>(ModalType.Project);

  const handleModal = (type: ModalType) => {
    setModalType(type);
    setModal(true);
  };

  let modal;
  if (isModal) {
    switch (modalType) {
      case ModalType.Project:
        modal = <ProjectModal onClose={() => setModal(false)} />;
        break;

      case ModalType.WorkExperience:
        modal = <WorkExpModal onClose={() => setModal(false)} />;
        break;
    }
  }

  return (
    <div className="flex flex-col gap-5 max-w-3xl mx-auto px-4 items-center">
      {/*about  me container*/}
      <Input placeholder="enter your name" className="max-w-3xs" />
      <Input type="email" placeholder="enter your email" className="max-w-md" />

      <div className="flex flex-col w-full gap-1">
        <h3>about me</h3>
        <Textarea className="w-full" />
      </div>

      <div className="flex flex-col w-full gap-1">
        <h3>skills</h3>
        <div className="flex flex-row w-ull">
          <Textarea />
          <Button variant="outline">save</Button>
        </div>
      </div>

      <div className="flex flex-row gap-1">
        <h3>work experience</h3>
        <Button
          type="button"
          variant="outline"
          className="text-black"
          onClick={() => handleModal(ModalType.WorkExperience)}
        >
          Add
        </Button>
      </div>

      <div className="flex flex-row gap-1">
        <h3>projects</h3>
        <Button
          type="button"
          variant="outline"
          className="text-black"
          onClick={() => handleModal(ModalType.Project)}
        >
          Add
        </Button>
      </div>

      {isModal ? (
        <div className="fixed inset-0 z-[1000] bg-zinc-950/90 flex items-center justify-center p-4">
          {modal}
        </div>
      ) : null}
    </div>
  );
}
