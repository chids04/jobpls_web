import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { StatusAlert, AlertVariant } from "@/components/ui/StatusAlert";

import { Button } from "@/components/ui/button";
import { useEffect, useRef, useState } from "react";
import { formatPDF } from "@/lib/prompts";
import { Resume } from "@/lib/schemas";

import { MissingApi } from "@/components/ui/MissingApi";
import { useTemplateStore } from "@/store/useStore";

interface ImportDialogProps {
  onTemplateCreated: (template: Resume) => void;
  isDialogOpen: boolean;
  onDialogOpenChange: (open: boolean) => void;
}

export function ImportDialog({
  onTemplateCreated,
  isDialogOpen,
  onDialogOpenChange,
}: ImportDialogProps) {
  const [status, setStatus] = useState<{ msg: string; variant: AlertVariant }>({
    msg: "",
    variant: "success",
  });

  const { apiKey } = useTemplateStore();

  const [showMissingApi, setShowMissingApi] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!apiKey) {
      setShowMissingApi(true);
    }
  }, []);

  const onPDFLoaded = async (fileReader: FileReader, mimeType: string) => {
    if (fileReader.result) {
      try {
        setStatus({
          msg: "converting file to template",
          variant: "loading",
        });

        const resume = await formatPDF(
          fileReader.result as ArrayBuffer,
          mimeType,
        );

        setStatus({
          msg: "successfully created pdf template",
          variant: "success",
        });

        console.log(resume);
        onTemplateCreated(resume);
      } catch (error) {
        console.log(error);
        setStatus({
          msg: "Failed to convert file to template, try a different file",
          variant: "destructive",
        });
      }
    }
  };

  const handleFileChosen = (file: Blob) => {
    const fileReader = new FileReader();

    fileReader.onload = () => {
      const pdf_data = fileReader.result;
      console.log(pdf_data);
      console.log(file.type);
    };

    fileReader.onload = () => onPDFLoaded(fileReader, file.type);

    fileReader.onerror = (e) => {
      setStatus({
        msg: `failed to load document: ${e.target?.error}`,
        variant: "destructive",
      });
    };

    fileReader.readAsArrayBuffer(file);
  };
  const selectPDF = () => {
    if (inputRef.current) {
      inputRef.current.click();
    }
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={onDialogOpenChange}>
      <DialogContent>
        <MissingApi isOpen={showMissingApi} setIsOpen={setShowMissingApi} />
        <DialogHeader>
          <DialogTitle>Import From File</DialogTitle>
          <DialogDescription asChild>
            <div>
              <div className="flex gap-2 items-center mb-4">
                <Button onClick={selectPDF}>select pdf</Button>
                <input
                  type="file"
                  ref={inputRef}
                  onChange={(e) => {
                    handleFileChosen(e.target.files[0]);
                  }}
                ></input>
              </div>

              {status.msg && (
                <StatusAlert
                  variant={status.variant}
                  description={status.msg}
                />
              )}
            </div>
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}
