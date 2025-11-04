import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CheckIcon, XIcon } from "lucide-react";
import { useSelectedAboutMeTemplate } from "@/hooks/useAppStorage";
import { type AboutMeTemplate } from "lib/types";

interface TemplateDropdownProps {
  templates: AboutMeTemplate[];
  onSelect?: (template: AboutMeTemplate | null) => void;
}

export function TemplateDropdown({
  templates,
  onSelect,
}: TemplateDropdownProps) {
  const { selectedTemplate, selectedId, selectTemplate, clearSelection } =
    useSelectedAboutMeTemplate();

  // notify parent of selection changes
  useEffect(() => {
    onSelect?.(selectedTemplate || null);
  }, [selectedTemplate, onSelect]);

  // validate that selected template still exists
  useEffect(() => {
    if (selectedId && templates.length > 0) {
      const stillExists = templates.some((t) => t.id === selectedId);
      if (!stillExists) {
        clearSelection();
      }
    }
  }, [selectedId, templates, clearSelection]);

  const handleSelect = (template: AboutMeTemplate) => {
    selectTemplate(template);
  };

  const handleClear = () => {
    clearSelection();
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="min-w-[200px] justify-between">
            {selectedTemplate?.templateName || "select a template"}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="min-w-[200px]">
          {templates.length === 0 ? (
            <DropdownMenuItem disabled>no templates available</DropdownMenuItem>
          ) : (
            templates.map((template) => (
              <DropdownMenuItem
                key={template.id}
                onClick={() => handleSelect(template)}
                className="flex items-center justify-between"
              >
                <span>{template.templateName}</span>
                {selectedId === template.id && (
                  <CheckIcon className="h-4 w-4 text-green-500" />
                )}
              </DropdownMenuItem>
            ))
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {selectedTemplate && (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleClear}
          className="text-red-400 hover:text-red-300"
        >
          <XIcon className="h-4 w-4 mr-1" />
          clear selection
        </Button>
      )}

      {selectedTemplate && (
        <div className="text-xs text-zinc-400 text-center max-w-xs">
          <div>name: {selectedTemplate.name}</div>
          <div>email: {selectedTemplate.email}</div>
          <div>projects: {selectedTemplate.projects.length}</div>
          <div>work experience: {selectedTemplate.workExperiences.length}</div>
          <div>education: {selectedTemplate.education.length}</div>
        </div>
      )}
    </div>
  );
}
