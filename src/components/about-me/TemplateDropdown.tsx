import { useEffect, useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CheckIcon, XIcon } from "lucide-react";
import {
  LS_KEY_TEMPLATES,
  type AboutMeTemplate,
} from "@/components/about-me/types";

export const LS_KEY_SELECTED_ABOUT_ME_TEMPLATE_ID =
  "aboutMe.selectedTemplateId";

export type TemplateDropdownProps = {
  templates?: AboutMeTemplate[];
  onSelect?: (template: AboutMeTemplate | null) => void;
  buttonLabel?: string;
  className?: string;
};

function safeReadLocalStorage<T = unknown>(key: string): T | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function safeWriteLocalStorage(key: string, value: unknown) {
  if (typeof window === "undefined") return;
  try {
    if (value === null) {
      window.localStorage.removeItem(key);
    } else {
      window.localStorage.setItem(key, JSON.stringify(value));
    }
  } catch {}
}

export function TemplateDropdown({
  templates: templatesProp,
  onSelect,
  buttonLabel = "pick",
}: TemplateDropdownProps) {
  const [templates, setTemplates] = useState<AboutMeTemplate[]>(
    templatesProp ?? [],
  );
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    if (templatesProp && Array.isArray(templatesProp)) {
      setTemplates(templatesProp);
      return;
    }
  }, [templatesProp]);

  useEffect(() => {
    const templateId = safeReadLocalStorage<string>(
      LS_KEY_SELECTED_ABOUT_ME_TEMPLATE_ID,
    );

    if (templateId && templates.length > 0) {
      const template = templates.find((t) => t.id === templateId);
      if (template) {
        setSelectedId(templateId);
        onSelect?.(template);
      }
    }
  }, [templates, onSelect]);

  useEffect(() => {
    if (!selectedId || templates.length === 0) return;
    const stillExists = templates.some((t) => t.id === selectedId);
    if (!stillExists) {
      setSelectedId(null);
      safeWriteLocalStorage(LS_KEY_SELECTED_ABOUT_ME_TEMPLATE_ID, null);
      onSelect?.(null);
    }
  }, [templates, selectedId, onSelect]);

  const selectedTemplate = useMemo(
    () =>
      selectedId ? (templates.find((t) => t.id === selectedId) ?? null) : null,
    [templates, selectedId],
  );

  const handleSelect = (tpl: AboutMeTemplate) => {
    setSelectedId(tpl.id);
    safeWriteLocalStorage(LS_KEY_SELECTED_ABOUT_ME_TEMPLATE_ID, tpl.id);
    onSelect?.(tpl);
  };

  const handleClear = () => {
    setSelectedId(null);
    safeWriteLocalStorage(LS_KEY_SELECTED_ABOUT_ME_TEMPLATE_ID, null);
    onSelect?.(null);
  };

  const isEmpty = templates.length === 0;

  return (
    <div className="flex items-center gap-3">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" disabled={isEmpty}>
            {buttonLabel}
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent className="w-64" align="start">
          <DropdownMenuLabel>About Me Templates</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            {isEmpty ? (
              <DropdownMenuItem disabled>No templates found</DropdownMenuItem>
            ) : (
              templates.map((tpl) => (
                <DropdownMenuItem
                  key={tpl.id}
                  onClick={() => handleSelect(tpl)}
                >
                  <span className="truncate">
                    {tpl.templateName || "Untitled template"}
                  </span>
                  {selectedId === tpl.id ? (
                    <CheckIcon className="ml-auto h-4 w-4" />
                  ) : null}
                </DropdownMenuItem>
              ))
            )}
          </DropdownMenuGroup>
          {!isEmpty ? (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleClear}>
                <XIcon className="h-4 w-4" />
                <span>Clear selection</span>
              </DropdownMenuItem>
            </>
          ) : null}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Selected label displayed next to the button */}
      <div className="min-w-0">
        {selectedTemplate ? (
          <span
            title={selectedTemplate.templateName}
            className="inline-flex max-w-xs items-center truncate rounded border border-zinc-700 bg-zinc-800 px-2 py-1 text-xs text-zinc-200"
          >
            selected: {selectedTemplate.templateName}
          </span>
        ) : isEmpty ? (
          <Link
            to="/about-me"
            className="text-sm text-blue-400 hover:text-blue-300 underline transition-colors"
          >
            create your first about me template
          </Link>
        ) : (
          <span className="text-xs text-zinc-400">No template selected</span>
        )}
      </div>
    </div>
  );
}
