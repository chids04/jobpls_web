import { createFileRoute } from "@tanstack/react-router";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

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
  const [modalType, setModalType] = useState<ModalType>(
    ModalType.WorkExperience,
  );

  return (
    <div className="flex flex-col gap-5 container mx-auto h-full px-4 items-center">
      {/*about  me container*/}
      <Input placeholder="enter your name" />
      <Input type="email" placeholder="enter your email" />

      <div className="flex flex-col gap-1">
        <h3>about me</h3>
        <Textarea />
      </div>

      <div className="flex flex-col gap-1">
        <h3>skills</h3>
        <Textarea />
      </div>

      <div className="flex flex-col gap-1">
        <h3>work experience</h3>
      </div>

      {isModal ? (
        <div className="fixed inset-0 z-[1000] bg-black bg-opacity-70 flex items-center justify-center p-4">
            {
                switch (modalType) {
                    case ModalType.WorkExperience:
                        (<div></div>)
                    case ModalType.Project:
                        (<div></div>)
                }
            }

        </div>
      ) : null}
    </div>

  );
}
