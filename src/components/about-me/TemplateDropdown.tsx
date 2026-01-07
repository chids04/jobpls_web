import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CheckIcon, XIcon } from "lucide-react";
import { useStore, ResumeTemplate } from "@/store/useStore";

interface TemplateDropdownProps {
  templates: ResumeTemplate[];
  onSelect?: (template: ResumeTemplate | null) => void;
}

export function TemplateDropdown({
  templates,
  onSelect,
}: TemplateDropdownProps) {
  const { selectedTemplateId, setSelectedTemplateId } = useStore();

  const selectedTemplate = templates.find(
    (t) => t.templateId === selectedTemplateId,
  );

  // notify parent of selection changes
  useEffect(() => {
    onSelect?.(selectedTemplate || null);
  }, [selectedTemplate, onSelect]);

  // validate that selected template still exists
  useEffect(() => {
    if (selectedTemplateId && templates.length > 0) {
      const stillExists = templates.some(
        (t) => t.templateId === selectedTemplateId,
      );
      if (!stillExists) {
        setSelectedTemplateId(null);
      }
    }
  }, [selectedTemplateId, templates, setSelectedTemplateId]);

  const handleSelect = (template: ResumeTemplate) => {
    setSelectedTemplateId(template.templateId);
  };

  const handleClear = () => {
    setSelectedTemplateId(null);
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
                key={template.templateId}
                onClick={() => handleSelect(template)}
                className="flex items-center justify-between"
              >
                <span>{template.templateName}</span>
                {selectedTemplateId === template.templateId && (
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
          <div>name: {selectedTemplate.full_name}</div>
          <div>email: {selectedTemplate.email}</div>
          <div>projects: {selectedTemplate.projects?.length || 0}</div>
          <div>
            work experience: {selectedTemplate.work_exp?.length || 0}
          </div>
          <div>education: {selectedTemplate.education?.length || 0}</div>
        </div>
      )}
    </div>
  );
}

export default TemplateDropdown;
