import { useState, useEffect, useCallback } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { Textarea } from "@/components/ui/textarea";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";

import { Separator } from "@/components/ui/separator";

import { usePDFStore, useTemplateStore } from "@/store/useStore";

import { SERVER_URL } from "@/lib/types";
import { GenerationOutputSchema, Resume } from "@/lib/schemas";
import { sendGenerate } from "@/lib/api";
import { ExternalLinkIcon, DownloadIcon } from "lucide-react";
import { CV_Type, genCV, genCover } from "@/lib/pdf_gen";
import { personaliseCV } from "@/lib/prompts";
import clsx from "clsx";

import MockGeminiOutput from "@/mock/GenerationOutput.json?raw";
import { GeneratedDocs } from "@/components/generate/GeneratedDocs";

// generate page allows users to gen their cv and add a short pre-prompt

export const Route = createFileRoute("/generate")({
  component: GeneratePage,
  ssr: false,
});

function GeneratePage() {
  const {
    selectedCV,
    templates,
    selectedTemplateId,
    jobDesc,
    specialInstr,
    setJobDesc,
    setSpecialInstr,
  } = useTemplateStore();

  const { setCV, setCover } = usePDFStore();

  const selectedTemplate = selectedTemplateId
    ? templates[selectedTemplateId]
    : null;
  const isReady = !!(
    selectedCV &&
    selectedTemplate &&
    jobDesc.trim().length > 0
  );

  const missingItems: string[] = [];
  if (!selectedCV) missingItems.push("CV template");
  if (!selectedTemplate) missingItems.push("About Me template");
  if (jobDesc.trim().length === 0) missingItems.push("Job description");

  // local state for tab-independent editing
  const [localJobDesc, setLocalJobDesc] = useState("");
  const [localSpecialInstr, setLocalSpecialInstr] = useState("");
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const [pollUrl, setPollingUrl] = useState<string>("");
  const [error, setError] = useState("");

  const [pdfUrls, setPdfUrls] = useState<{
    cvUrl: string | undefined;
    coverUrl: string | undefined;
  }>({ cvUrl: undefined, coverUrl: undefined });

  const [status, setStatus] = useState({
    success: true,
    msg: "",
  });

  const setStatusMessage = (msg: string, success: boolean, timeout = true) => {
    setStatus({ msg, success });

    timeout &&
      setTimeout(() => {
        setStatus({ msg: "", success: true });
      }, 2000);
  };

  useEffect(() => {
    setLocalJobDesc(jobDesc);
    setLocalSpecialInstr(specialInstr);
  }, [jobDesc, specialInstr]);

  useEffect(() => {
    const hasChanges =
      localJobDesc !== jobDesc || localSpecialInstr !== specialInstr;
    setHasUnsavedChanges(hasChanges);
  }, [localJobDesc, localSpecialInstr, jobDesc, specialInstr]);

  const handleGenerate = async () => {
    if (!selectedCV || !selectedTemplate) {
      setError(`missing: ${missingItems.join(", ")}`);
      return;
    }

    if (!localJobDesc.trim()) {
      setError("Please enter a job description");
      return;
    }

    setError("");

    saveToStore();

    const resume: Resume = selectedTemplate.resume;

    setStatusMessage("Amending documents for the job....", true, false);

    let aiCV;
    // try {
    //   aiCV = await personaliseCV(
    //     resume,
    //     localJobDesc,
    //     localSpecialInstr,
    //     CV_Type.TechCV,
    //   );
    // } catch (error: any) {
    //   console.log(error);
    //   setStatusMessage(error?.message || "An unknown error occurred", false);
    // }

    // console.log(aiCV);

    // if (aiCV == undefined) {
    //   return;
    // }

    setStatusMessage("finished amending documents", true, false);

    aiCV = GenerationOutputSchema.parse(JSON.parse(MockGeminiOutput));

    let cvUrl;
    let coverUrl;

    try {
      setStatusMessage("Generating CV...", true, false);

      const cv = await genCV(aiCV, CV_Type.TechCV);

      if (!cv) {
        throw new Error("failed to generate cover pdf");
      }
      const cv_blob = new Blob([cv.slice(0)], {
        type: "application/pdf",
      });

      cvUrl = URL.createObjectURL(cv_blob);
    } catch (error) {
      setStatusMessage(
        `cv pdf generation error occured ${error}`,
        false,
        false,
      );
      console.log(error);
    }

    try {
      const cover = await genCover(aiCV);

      if (!cover) {
        throw new Error("pdf gen failed");
      }
      const cover_blob = new Blob([cover.slice(0)], {
        type: "application/pdf",
      });

      coverUrl = URL.createObjectURL(cover_blob);
    } catch (error) {
      setStatusMessage(
        `cover pdf generation error occured ${error}`,
        false,
        false,
      );
      console.log(error);
    }

    setCV(cvUrl);
    setCover(coverUrl);

    setPdfUrls({
      cvUrl,
      coverUrl,
    });
  };

  // manual save function
  const saveToStore = () => {
    setJobDesc(localJobDesc);
    setSpecialInstr(localSpecialInstr);
  };

  return (
    <div className="flex flex-col gap-5 items-center">
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

        {selectedCV && selectedTemplate ? (
          <div className="flex flex-col items-center w-full gap-10">
            <div></div>
            <div className="flex flex-col w-full items-center border-b-accent border-2 p-2">
              <h1 className="text-xl">
                {"selected cv - "}
                <span className="font-bold">{selectedCV.name}</span>
              </h1>
              <Link
                className="hover:text-blue-400 text-blue-300 hover:underline"
                to="/cv-template"
              >
                click to change
              </Link>
            </div>

            <div className="flex flex-col items-center w-full  border-b-accent border-2 p-2">
              <h1 className="text-xl">
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
            </div>

            <Button
              onClick={handleGenerate}
              className="w-fit hover:text-black"
              //disabled={!isReady || generateMutation.isPending}
            >
              generate
            </Button>
          </div>
        ) : (
          <div className="flex flex-col items-center bg-red-700/40 border-red-900 p-2 border-2 text-red-400">
            <h3>no templates found</h3>
            <Link className="text-blue-400 hover:underline" to="/about-me">
              click to create an about me
            </Link>
            <Link className="text-blue-400 hover:underline" to="/cv-template">
              click to select a cv template
            </Link>
          </div>
        )}
      </div>

      <Separator />

      {status.msg && (
        <div
          className={clsx(
            "flex flex-col rounded-lg justify-center items-center p-4",
            status.success === false
              ? "bg-red-900 border-red-800 border-2 text-red-500"
              : "bg-green-900 border-green-800 border-2 text-green-500",
          )}
        >
          <p>{status.msg}</p>
        </div>
      )}

      <GeneratedDocs cv={pdfUrls.cvUrl} cover={pdfUrls.coverUrl} />
    </div>
  );
}
