import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { CoverData } from "@/lib/schemas";

export type CoverEditDialogProps = {
  open: boolean;
  initial: CoverData | null;
  onCancel: () => void;
  onRegenerate: (edited: CoverData) => Promise<void> | void;
  isGenerating?: boolean;
};

const emptyCover = (): CoverData => ({
  hiring_manager: "",
  company_name: "",
  salutation: "",
  paragraphs: [],
});

export function CoverEditDialog({
  open,
  initial,
  onCancel,
  onRegenerate,
  isGenerating = false,
}: CoverEditDialogProps) {
  const [data, setData] = useState<CoverData>(() => initial ?? emptyCover());

  useEffect(() => {
    if (open) setData(initial ?? emptyCover());
  }, [open, initial]);

  /* prevent body scroll while open */
  useEffect(() => {
    if (!open) return;

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
  }, [open]);

  if (!open) return null;

  const updateParagraph = (index: number, text: string) => {
    const next = [...data.paragraphs];
    next[index] = text;
    setData({ ...data, paragraphs: next });
  };

  const addParagraph = () => {
    setData({ ...data, paragraphs: [...data.paragraphs, ""] });
  };

  const removeParagraph = (index: number) => {
    setData({
      ...data,
      paragraphs: data.paragraphs.filter((_, i) => i !== index),
    });
  };

  const moveParagraph = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= data.paragraphs.length) return;
    const next = [...data.paragraphs];
    [next[index], next[target]] = [next[target], next[index]];
    setData({ ...data, paragraphs: next });
  };

  const handleRegenerate = async () => {
    await onRegenerate(data);
  };

  return (
    <div className="fixed inset-0 z-1000 bg-zinc-950/90 flex items-start justify-center overflow-y-auto p-4">
      <div className="flex flex-col gap-5 px-4 max-w-4xl items-center py-6 border-2 mx-auto w-full bg-zinc-900">
        <h2 className="text-xl font-bold">edit cover letter</h2>

        <div className="flex flex-col max-w-md w-full">
          <h3>hiring manager</h3>
          <Input
            placeholder="e.g. Jane Smith"
            className="max-w-md"
            value={data.hiring_manager}
            onChange={(e) =>
              setData({ ...data, hiring_manager: e.target.value })
            }
          />
        </div>

        <div className="flex flex-col max-w-md w-full">
          <h3>company name</h3>
          <Input
            placeholder="company name"
            className="max-w-md"
            value={data.company_name}
            onChange={(e) =>
              setData({ ...data, company_name: e.target.value })
            }
          />
        </div>

        <div className="flex flex-col max-w-md w-full">
          <h3>salutation</h3>
          <Input
            placeholder="e.g. Dear Hiring Manager,"
            className="max-w-md"
            value={data.salutation}
            onChange={(e) => setData({ ...data, salutation: e.target.value })}
          />
        </div>

        <div className="flex flex-col w-full gap-2">
          <div className="flex items-center gap-2">
            <h3 className="flex-1">paragraphs</h3>
            <Button
              type="button"
              variant="outline"
              className="text-black"
              onClick={addParagraph}
            >
              add
            </Button>
          </div>

          <div className="flex flex-col gap-3">
            {data.paragraphs.map((p, i) => (
              <div
                key={i}
                className="flex flex-col gap-2 rounded border border-zinc-700 bg-zinc-800 p-2"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs text-zinc-400">
                    paragraph {i + 1}
                  </span>
                  <div className="flex gap-1">
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() => moveParagraph(i, -1)}
                      disabled={i === 0}
                    >
                      ↑
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() => moveParagraph(i, 1)}
                      disabled={i === data.paragraphs.length - 1}
                    >
                      ↓
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="destructive"
                      onClick={() => removeParagraph(i)}
                    >
                      delete
                    </Button>
                  </div>
                </div>
                <Textarea
                  className="w-full min-h-32"
                  value={p}
                  onChange={(e) => updateParagraph(i, e.target.value)}
                />
              </div>
            ))}
          </div>
        </div>

        <div className="sticky bottom-0 left-0 right-0 bg-zinc-900/60 backdrop-blur border-t border-zinc-800 w-full py-3 mt-6">
          <div className="max-w-3xl mx-auto px-4 flex items-center justify-between">
            <Button
              type="button"
              variant="ghost"
              onClick={onCancel}
              disabled={isGenerating}
            >
              cancel
            </Button>
            <Button
              type="button"
              className="text-black"
              onClick={handleRegenerate}
              disabled={isGenerating}
            >
              {isGenerating ? "generating..." : "generate pdf"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CoverEditDialog;
