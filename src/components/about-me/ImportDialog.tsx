import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { Status, StatusVariant } from "@/components/ui/Status";

import { Button } from "@/components/ui/button";
import { ReactNode, useEffect, useRef, useState } from "react";
import { formatPDF } from "@/lib/prompts";
import { Resume, ResumeDataSchema } from "@/lib/schemas";

import { MissingApi } from "@/components/ui/MissingApi";
import { useTemplateStore } from "@/store/useStore";
import { useMutation } from "@tanstack/react-query";

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
  const [status, setStatus] = useState<{
    msg: ReactNode;
    variant: StatusVariant;
  }>({
    msg: "",
    variant: "success",
  });
  const { apiKey } = useTemplateStore();
  const [showMissingApi, setShowMissingApi] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const geminiMutation = useMutation({
    mutationFn: ({
      apiKey,
      data,
      mimeType,
    }: {
      apiKey: string;
      data: ArrayBuffer;
      mimeType: string;
    }) => {
      return formatPDF(apiKey, data, mimeType);
    },

    onSuccess: (response) => {
      if (response.text == undefined) {
        console.log(response);
        setStatus({
          msg: "failed to import document, please try again later",
          variant: "error",
        });

        return;
      }

      const generatedResume = ResumeDataSchema.safeParse(
        JSON.parse(response.text),
      );

      if (generatedResume.error) {
        console.log(generatedResume.error);
        setStatus({
          msg: "failed to import document, please try again later",
          variant: "error",
        });
      } else {
        setStatus({
          msg: "Successfully imported PDF!",
          variant: "success",
        });
        onTemplateCreated(generatedResume.data);
      }
    },

    onError: (error) => {
      if (error.message.includes("429")) {
        setStatus({
          msg: "rate limit hit, please try again later",
          variant: "error",
        });
      } else if (error.message.includes("Unsupported MIME type")) {
        setStatus({
          msg: "unsupported document format",
          variant: "error",
        });
      } else {
        console.log(error);
        setStatus({
          msg: "server error: please try again later",
          variant: "error",
        });
      }
    },
  });

  useEffect(() => {
    if (!apiKey) {
      setShowMissingApi(true);
    }
  }, []);

  useEffect(() => {
    setStatus({
      msg: "",
      variant: "success",
    });
  }, []);

  const onPDFLoaded = async (fileReader: FileReader, mimeType: string) => {
    if (!apiKey) {
      setShowMissingApi(true);
      return;
    }

    if (fileReader.result) {
      setStatus({
        msg: "extracting details from document....",
        variant: "loading",
      });

      geminiMutation.mutate({
        apiKey,
        data: fileReader.result as ArrayBuffer,
        mimeType,
      });
    }
  };

  const handleFileChosen = (file: Blob) => {
    const fileReader = new FileReader();

    fileReader.onload = () => onPDFLoaded(fileReader, file.type);

    fileReader.onerror = (e) => {
      setStatus({
        msg: `failed to load document: ${e.target?.error}`,
        variant: "error",
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
          <DialogTitle className="mb-4">import from file</DialogTitle>
          <DialogDescription asChild>
            <div>
              <div className="flex gap-2 items-center mb-4">
                <Button onClick={selectPDF}>select document</Button>
                <input
                  type="file"
                  ref={inputRef}
                  onChange={(e) => {
                    if (e.target.files) {
                      handleFileChosen(e.target.files[0]);
                    }
                  }}
                  className="hidden"
                ></input>
              </div>

              <p className="text-sm text-slate-400 mb-4 leading-normal">
                This uses an AI model to extract details from your document.
              </p>

              {status.msg && (
                <Status variant={status.variant} message={status.msg} />
              )}
            </div>
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}
