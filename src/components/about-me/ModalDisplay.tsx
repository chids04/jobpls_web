import { ProjectModal } from "./ProjectModal";
import { WorkExpModal } from "./WorkExpModal";
import { EducationModal } from "./EducationModal";

export type ModalType = "edu" | "work" | "project";

import { Project, Experience, Education } from "@/lib/types";

interface ModalDisplayProps {
  type: ModalType;
  onSave: (
    editingIndex: number | null,
    type: ModalType,
    newItem: Project | Experience | Education,
  ) => void;
  onClose: () => void;
  initialItem: Project | Experience | Education | null;
  editingIndex: number | null;
}

export function ModalDisplay({
  type,
  onSave,
  onClose,
  initialItem,
  editingIndex,
}: ModalDisplayProps) {
  const handleNewSelection = (newItem: Project | Experience | Education) => {
    onSave(editingIndex, type, newItem);
  };

  switch (type) {
    case "project":
      return (
        <ProjectModal
          onClose={onClose}
          onSave={handleNewSelection}
          initial={initialItem as Project}
        />
      );
      break;
    case "work":
      return (
        <WorkExpModal
          onClose={onClose}
          onSave={handleNewSelection}
          initial={initialItem as Experience}
        />
      );
      break;
    case "edu":
      return (
        <EducationModal
          onClose={onClose}
          onSave={handleNewSelection}
          initial={initialItem as Education}
        />
      );
      break;
  }
}
