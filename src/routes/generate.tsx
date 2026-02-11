import { useState, useEffect, ReactNode } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Textarea } from "@/components/ui/textarea";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { useMutation } from "@tanstack/react-query";

import { Separator } from "@/components/ui/separator";

import { usePDFStore, useTemplateStore } from "@/store/useStore";
import { GenerationOutput, GenerationOutputSchema } from "@/lib/schemas";
import { escapeFields, genCV, genCover } from "@/lib/pdf_gen";

import { GeneratedDocs } from "@/components/generate/GeneratedDocs";
import { createPrompt, sendPrompt } from "@/lib/prompts";
import { MissingApi } from "@/components/ui/MissingApi";
import { GenerateContentResponse } from "@google/genai";
import { Status, StatusVariant } from "@/components/ui/Status";
import { DocGenOptions } from "@/components/generate/DocGenOptions";

import { z } from "zod";
import mockResume from "@/mock/resume.json?raw";
import { CV_Type } from "@/lib/types";
// generate page allows users to gen their cv and add a short pre-prompt

export const Route = createFileRoute("/generate")({
  component: GeneratePage,
  ssr: false,
});

function GeneratePage() {
  const {
    selectedCV,
    apiKey,
    templates,
    selectedTemplateId,
    jobDesc,
    specialInstr,
    setJobDesc,
    setSpecialInstr,
    docGenOptions,
  } = useTemplateStore();

  const { setCV, setCover } = usePDFStore();

  const [openMissingDialog, setMissingOpenDialog] = useState(false);
  const [localJobDesc, setLocalJobDesc] = useState("");
  const [localSpecialInstr, setLocalSpecialInstr] = useState("");
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const [pdfUrls, setPdfUrls] = useState<{
    cvUrl: string | undefined;
    coverUrl: string | undefined;
  }>({ cvUrl: undefined, coverUrl: undefined });

  const [status, setStatus] = useState<{
    variant: StatusVariant;
    msg: ReactNode;
  }>({
    variant: "default",
    msg: "",
  });

  const selectedTemplate = selectedTemplateId
    ? templates[selectedTemplateId]
    : null;

  const getCVName = (type: CV_Type | null) => {
    switch (type) {
      case CV_Type.TechCV:
        return "Technical CV";
      case CV_Type.GeneralCV:
        return "General CV";
      default:
        return "None";
    }
  };

  const geminiMutation = useMutation({
    mutationFn: ({
      prompt,
      systemInstruction,
      apiKey,
    }: {
      prompt: string;
      systemInstruction: string;
      apiKey: string;
    }) => {
      return sendPrompt(apiKey ?? "", prompt, systemInstruction);
    },

    onMutate: () => {
      setStatusMessage("Fitting documents for the job.....", "loading");
    },

    onSuccess: (response) => {
      handleLLMResponse(response);
    },

    onError: (error) => {
      setStatusMessage("Failed to generate documents", "error");
    },
  });

  const handleLLMResponse = async (response: GenerateContentResponse) => {
    setStatusMessage(
      "Generated documents, creating PDF for download....",
      "loading",
    );

    if (response.text) {
      const resume = GenerationOutputSchema.safeParse(
        JSON.parse(response.text),
      );

      if (!resume.success) {
        setStatusMessage(
          "Failed to extract LLM response, please try again later",
          "error",
        );
      } else {
        if (docGenOptions.hasCV) {
          await createPDF(resume.data, "cv");
        }
        if (docGenOptions.hasCover) {
          await createPDF(resume.data, "cover");
        }
        setStatusMessage("Documents ready!", "success");
      }
    } else {
      setStatusMessage(
        "Failed to extract LLM response, please try again later",
        "error",
      );
    }
  };

  const missingItems: string[] = [];
  if (selectedCV === null) missingItems.push("CV template");
  if (!selectedTemplate) missingItems.push("About Me template");
  if (jobDesc.trim().length === 0) missingItems.push("Job description");

  const setStatusMessage = (msg: ReactNode, variant: StatusVariant) => {
    setStatus({ msg, variant });
  };

  useEffect(() => {
    if (apiKey == "" || apiKey == null) {
      setMissingOpenDialog(true);
    }
  }, []);

  useEffect(() => {
    setLocalJobDesc(jobDesc);
    setLocalSpecialInstr(specialInstr);
  }, [jobDesc, specialInstr]);

  useEffect(() => {
    const hasChanges =
      localJobDesc !== jobDesc || localSpecialInstr !== specialInstr;
    setHasUnsavedChanges(hasChanges);
  }, [localJobDesc, localSpecialInstr, jobDesc, specialInstr]);

  const createPDF = async (
    llmResponse: GenerationOutput,
    docType: "cv" | "cover",
  ) => {
    try {
      let pdf;

      if (docType == "cv") {
        pdf = await genCV(llmResponse, selectedCV ?? CV_Type.TechCV);
      } else {
        pdf = await genCover(llmResponse);
      }

      if (!pdf) {
        throw new Error("failed to generate pdf");
      }
      const pdfBlob = new Blob([pdf.slice(0)], {
        type: "application/pdf",
      });

      const pdfUrl = URL.createObjectURL(pdfBlob);

      if (docType == "cv") {
        setPdfUrls((prev) => ({
          ...prev,
          cvUrl: pdfUrl,
        }));

        const pdf_b64 = await blobToBase64(pdfBlob);
        setCV(pdf_b64);
      } else {
        setPdfUrls((prev) => ({
          ...prev,
          coverUrl: pdfUrl,
        }));

        const pdf_b64 = await blobToBase64(pdfBlob);
        setCover(pdf_b64);
      }
    } catch (error) {
      setStatusMessage(`Error generating PDF, please try again later`, "error");
    }
  };

  const handleGenerate = async () => {
    if (selectedCV === null || !selectedTemplate) {
      setStatusMessage(`missing: ${missingItems.join(", ")}`, "error");
      return;
    }

    if (!docGenOptions.hasCV && !docGenOptions.hasCover) {
      setStatusMessage(
        "Please select at least one document to generate",
        "error",
      );
      return;
    }

    if (!localJobDesc.trim()) {
      setStatusMessage("Please enter a job description", "error");
      return;
    }

    if (!apiKey) {
      setMissingOpenDialog(true);
      return;
    }

    // save job description and special instructions
    saveToStore();

    const [prompt, systemInstruction] = createPrompt(
      selectedTemplate.resume,
      localJobDesc,
      localSpecialInstr,
      selectedCV,
    );

    geminiMutation.mutate({
      prompt,
      systemInstruction,
      apiKey,
    });
  };

  // manual save function
  const saveToStore = () => {
    setJobDesc(localJobDesc);
    setSpecialInstr(localSpecialInstr);
  };

  const blobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  return (
    <div className="flex flex-col gap-5 items-center">
      <MissingApi isOpen={openMissingDialog} setIsOpen={setMissingOpenDialog} />
      <div className="flex flex-col md:flex-row gap-5 items-center justify-center w-full">
        <div className="flex flex-col max-w-lg w-full gap-5 items-center justify-center">
          <div className="flex flex-col gap-2 w-full max-w-md">
            <div className="flex items-center justify-between">
              <label className="text-sm text-slate-400">
                extra instructions to follow during generation
              </label>
              {hasUnsavedChanges && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={saveToStore}
                  className="
                  text-xs
                  text-yellow-400 border-yellow-500 hover:bg-yellow-500 hover:text-black"
                >
                  💾 Save Changes
                </Button>
              )}
            </div>
            <Textarea
              className={`max-w-md min-h-28 max-h-32 ${hasUnsavedChanges ? "border-yellow-500" : ""}`}
              placeholder="special instructions"
              value={localSpecialInstr}
              onChange={(e) => setLocalSpecialInstr(e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-2 w-full max-w-md">
            <div className="flex items-center justify-between">
              <label className="text-sm text-slate-400">job description</label>
            </div>
            <Textarea
              className="max-w-md min-h-48 max-h-64"
              placeholder="job description"
              value={localJobDesc}
              onChange={(e) => setLocalJobDesc(e.target.value)}
            />
          </div>
        </div>

        <div className="flex flex-col items-center w-full gap-10">
          <div className="flex flex-col items-center justify-center w-full border-b-accent border-2 p-2">
            {selectedCV !== null || selectedCV != undefined ? (
              <>
                <h1 className="text-xl">
                  {"selected cv - "}
                  <span className="font-bold">{getCVName(selectedCV)}</span>
                </h1>
                <Link
                  className="hover:text-blue-400 text-blue-300 hover:underline"
                  to="/cv-template"
                >
                  click to change
                </Link>
              </>
            ) : (
              <div className="flex flex-col items-center bg-red-700/40 border-red-900 p-2 border-2 text-red-400 w-full">
                <h3>no CV template selected</h3>
                <Link
                  className="text-blue-400 hover:underline"
                  to="/cv-template"
                >
                  click to select a cv template
                </Link>
              </div>
            )}
          </div>

          <div className="flex flex-col items-center justify-center w-full border-b-accent border-2 p-2">
            {selectedTemplate ? (
              <>
                <h1 className="text-xl text-center">
                  {"selected about me - "}
                  <span className="font-bold">
                    {selectedTemplate.templateName}
                  </span>
                </h1>
                <Link
                  className="hover:text-blue-400 text-blue-300 hover:underline"
                  to="/about-me"
                >
                  click to edit
                </Link>
              </>
            ) : (
              <div className="flex flex-col items-center bg-red-700/40 border-red-900 p-2 border-2 text-red-400 w-full">
                <h3>no About Me template found</h3>
                <Link className="text-blue-400 hover:underline" to="/about-me">
                  click to create an about me
                </Link>
              </div>
            )}
          </div>

          <DocGenOptions />

          <Button
            onClick={handleGenerate}
            className="w-fit hover:text-black"
            disabled={
              selectedCV === null ||
              !selectedTemplate ||
              geminiMutation.isPending
            }
          >
            generate
          </Button>
        </div>
      </div>

      <Separator />

      {status.msg && <Status variant={status.variant} message={status.msg} />}

      <GeneratedDocs cv={pdfUrls.cvUrl} cover={pdfUrls.coverUrl} />
    </div>
  );
}
