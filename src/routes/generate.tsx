import { useState, useEffect, useCallback } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { Textarea } from "@/components/ui/textarea";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";

import { usePDFStore, useTemplateStore } from "@/store/useStore";

import { SERVER_URL } from "@/lib/types";
import { Resume } from "@/lib/schemas";
import { sendGenerate } from "@/lib/api";
import { ExternalLinkIcon, DownloadIcon } from "lucide-react";
import { CV_Type, genCV } from "@/lib/pdf_gen";
import { personaliseCV } from "@/lib/prompts";
import clsx from "clsx";

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

  const { cv, cover, setCV, setCover, clearPDFs } = usePDFStore();

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
    cvUrl: string | null;
    coverUrl: string | null;
  }>({ cvUrl: null, coverUrl: null });

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

  // tanstack query mutation for the generate request
  const generateMutation = useMutation({
    mutationFn: sendGenerate,
    onSuccess: (jobId: string) => {
      const pollUrl = `${SERVER_URL}/job/${jobId}`;
      setPollingUrl(pollUrl);

      // clear previous pdf urls when starting new generation
      setPdfUrls({ cvUrl: null, coverUrl: null });
      setError("");
    },
    // 3. dont't retry immediately on rate limit, let the poll interval handle it
    onError: (error: any) => {
      console.error("generate error:", error);
      setError(error.message || "failed to start generation");
    },
  });

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

    setStatusMessage("personalising doc", true, false);

    let aiCV;

    try {
      aiCV = await personaliseCV(
        resume,
        localJobDesc,
        localSpecialInstr,
        CV_Type.TechCV,
      );
    } catch (error: any) {
      console.log(error);
      setStatusMessage(error?.message || "An unknown error occurred", false);
    }

    console.log(aiCV);

    if (aiCV == undefined) {
      return;
    }

    setStatusMessage("personalised doc", true);

    genCV(aiCV.resume, CV_Type.TechCV)
      .then((p) => {
        if (p == undefined) {
          throw new Error("pdf gen failed");
        }

        const cv_blob = new Blob([p.slice(0)], {
          type: "application/pdf",
        });

        const cv_url = URL.createObjectURL(cv_blob);

        console.log(cv_url);

        handlePDFsReady(cv_url, "hello");
      })
      .catch((error) => {
        console.log(`pdf generation error occured ${error}`);
        setStatusMessage(`pdf generation error occured ${error}`, false, false);
      });
  };

  // manual save function
  const saveToStore = () => {
    setJobDesc(localJobDesc);
    setSpecialInstr(localSpecialInstr);
  };

  const handlePDFsReady = (cvUrl: string, coverUrl: string) => {
    setCV(cvUrl);
    setCover(coverUrl);
  };

  // reset state for new generation - memoized to avoid unnecessary re-renders
  const handleReset = useCallback(() => {
    setPollingUrl("");
    setPdfUrls({ cvUrl: null, coverUrl: null });
    setError("");
  }, []);

  // open pdf in new tab
  const openPDF = (url: string, filename: string) => {
    const link = document.createElement("a");
    link.href = url;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.setAttribute("aria-label", `Open ${filename} in new tab`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // trigger pdf download
  const downloadPDF = (url: string, filename: string) => {
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
              disabled={!isReady || generateMutation.isPending}
            >
              {generateMutation.isPending ? "generating..." : "generate"}
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

      {status.msg && (
        <div
          className={clsx(
            "flex flex-col justify-center items-center p-4",
            status.success === false
              ? "bg-red-900 border-red-800 border-2 text-red-500"
              : "bg-green-900 border-green-800 border-2 text-green-500",
          )}
        >
          <p>{status.msg}</p>
        </div>
      )}
      {/*
      {generatedPdfs &&
        generatedPdfs.cv &&
        generatedPdfs.cover &&
        !pollUrl &&
        !pdfUrls.cvUrl && (
          <div className="flex flex-col items-center gap-4 mt-6 p-6 bg-slate-700/20 border-slate-600 border-2 rounded-lg">
            <h3 className="text-lg font-semibold text-slate-300">
              📁 Previously Generated Documents
            </h3>

            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex flex-col gap-2">
                <span className="text-sm text-slate-400 text-center">
                  Last Resume
                </span>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      openPDF(generatedPdfs.cv!, "last-resume.pdf")
                    }
                    className="text-slate-300 border-slate-500 hover:bg-slate-500 hover:text-white"
                  >
                    <ExternalLinkIcon className="w-4 h-4 mr-1" />
                    View
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      downloadPDF(generatedPdfs.cv!, "last-resume.pdf")
                    }
                    className="text-slate-300 border-slate-500 hover:bg-slate-500 hover:text-white"
                  >
                    <DownloadIcon className="w-4 h-4 mr-1" />
                    Download
                  </Button>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <span className="text-sm text-slate-400 text-center">
                  Last Cover Letter
                </span>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      openPDF(generatedPdfs.cover!, "last-cover-letter.pdf")
                    }
                    className="text-slate-300 border-slate-500 hover:bg-slate-500 hover:text-white"
                  >
                    <ExternalLinkIcon className="w-4 h-4 mr-1" />
                    View
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      downloadPDF(generatedPdfs.cover!, "last-cover-letter.pdf")
                    }
                    className="text-slate-300 border-slate-500 hover:bg-slate-500 hover:text-white"
                  >
                    <DownloadIcon className="w-4 h-4 mr-1" />
                    Download
                  </Button>
                </div>
              </div>
            </div>
            <p className="text-xs text-slate-400 text-center max-w-md">
              These are your previously generated documents.
            </p>

            <Button
              variant="ghost"
              onClick={() => clearGenerated()}
              className="text-slate-400 hover:text-slate-300 hover:bg-slate-500/20"
              size="sm"
            >
              Clear Saved Documents
            </Button>
          </div>
        )}
    */}

      {error && (
        <div className="flex items-center max-w-sm bg-red-700/40 border-red-900 p-2 border-2 text-red-400">
          <p>{error}</p>
        </div>
      )}

      {true && (
        <div className="flex flex-col items-center gap-4 mt-6 p-6 bg-green-700/20 border-green-900 border-2 rounded-lg">
          <h3 className="text-lg font-semibold text-green-400">
            generated items
          </h3>

          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex flex-col gap-2">
              <span className="text-sm text-green-300 text-center">CV</span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => openPDF(pdfUrls.cvUrl!, "resume.pdf")}
                  className="text-green-400 border-green-400 hover:bg-green-400 hover:text-green-900"
                >
                  <ExternalLinkIcon className="w-4 h-4 mr-1" />
                  View
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => downloadPDF(pdfUrls.cvUrl!, "resume.pdf")}
                  className="text-green-400 border-green-400 hover:bg-green-400 hover:text-green-900"
                >
                  <DownloadIcon className="w-4 h-4 mr-1" />
                  Download
                </Button>
              </div>
            </div>

            {/* cover letter buttons */}
            <div className="flex flex-col gap-2">
              <span className="text-sm text-green-300 text-center">
                Cover Letter
              </span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => openPDF(pdfUrls.coverUrl!, "cover-letter.pdf")}
                  className="text-green-400 border-green-400 hover:bg-green-400 hover:text-green-900"
                >
                  <ExternalLinkIcon className="w-4 h-4 mr-1" />
                  View
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    downloadPDF(pdfUrls.coverUrl!, "cover-letter.pdf")
                  }
                  className="text-green-400 border-green-400 hover:bg-green-400 hover:text-green-900"
                >
                  <DownloadIcon className="w-4 h-4 mr-1" />
                  Download
                </Button>
              </div>
            </div>
          </div>

          <p className="text-xs text-green-300 text-center max-w-md">
            Your documents have been generated successfully. You can view them
            in your browser or download them to your device.
          </p>

          <Button
            variant="ghost"
            onClick={handleReset}
            className="text-green-400 hover:text-green-300 hover:bg-green-400/20"
          >
            Generate Another
          </Button>
        </div>
      )}
    </div>
  );
}
