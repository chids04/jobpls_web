import { useState, useEffect, useCallback } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { Textarea } from "@/components/ui/textarea";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";

import {
  useGeneratePageData,
  useCurrentJob,
  useLastGeneratedPDF,
} from "@/hooks/useAppStorage";

import { SERVER_URL, ResumeData, type GenerateReq } from "@/lib/types";
import PollingStatus from "@/components/generate/PollingStatus";
import { sendGenerate } from "@/lib/api";
import { ExternalLinkIcon, DownloadIcon } from "lucide-react";

// generate page allows users to gen their cv and add a short pre-prompt

export const Route = createFileRoute("/generate")({
  component: GeneratePage,
  ssr: false,
});

export function GeneratePage() {
  const { cv, template, jobDesc, specialInstr, isReady, missingItems } =
    useGeneratePageData();

  // local state for tab-independent editing
  const [localJobDesc, setLocalJobDesc] = useState("");
  const [localSpecialInstr, setLocalSpecialInstr] = useState("");
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const { generatedPdfs, updateGenerated, clearGenerated } =
    useLastGeneratedPDF();

  const [pollUrl, setPollingUrl] = useState<string>("");
  const [error, setError] = useState("");
  const [currentJobId, setCurrentJobId] = useState<string | null>(null);
  const [pdfUrls, setPdfUrls] = useState<{
    cvUrl: string | null;
    coverUrl: string | null;
  }>({ cvUrl: null, coverUrl: null });

  useEffect(() => {
    setLocalJobDesc(jobDesc.jobDesc);
    setLocalSpecialInstr(specialInstr.specialInstr);
  }, [jobDesc.jobDesc, specialInstr.specialInstr]);

  useEffect(() => {
    const hasChanges =
      localJobDesc !== jobDesc.jobDesc ||
      localSpecialInstr !== specialInstr.specialInstr;
    setHasUnsavedChanges(hasChanges);
  }, [
    localJobDesc,
    localSpecialInstr,
    jobDesc.jobDesc,
    specialInstr.specialInstr,
  ]);

  // tanstack query mutation for the generate request
  const generateMutation = useMutation({
    mutationFn: sendGenerate,
    onSuccess: (jobId: string) => {
      const pollUrl = `${SERVER_URL}/job/${jobId}`;
      setPollingUrl(pollUrl);
      setCurrentJobId(jobId);

      // clear previous pdf urls when starting new generation
      setPdfUrls({ cvUrl: null, coverUrl: null });
      setError("");
    },
    onError: (error: any) => {
      console.error("generate error:", error);
      setError(error.message || "failed to start generation");
    },
  });

  const handleGenerate = async () => {
    // Check if we have required templates
    if (!cv.selectedCV || !template.selectedTemplate) {
      setError(`missing: ${missingItems.join(", ")}`);
      return;
    }

    // Check if local job description is filled
    if (!localJobDesc.trim()) {
      setError("Please enter a job description");
      return;
    }

    setError("");

    // Save to localStorage before submission
    saveToLocalStorage();

    // convert about me template to resume
    const resume: ResumeData = {
      header: {
        full_name: template.selectedTemplate.name,
        email: template.selectedTemplate.email,
        github: template.selectedTemplate.github || undefined,
        residency: "",
      },
      summary: {
        about_me: template.selectedTemplate.summary,
      },
      tech_skills: undefined,

      projects: template.selectedTemplate.projects ?? undefined,
      work_exp: template.selectedTemplate.workExperiences ?? undefined,
    };

    const req: GenerateReq = {
      resume,
      job_desc: localJobDesc,
      special_instr: localSpecialInstr,
    };

    // use the mutation to send the request
    generateMutation.mutate(req);
  };

  // manual save function
  const saveToLocalStorage = () => {
    jobDesc.updateJobDesc(localJobDesc);
    specialInstr.updateSpecialInstr(localSpecialInstr);
  };

  // memoize callback to prevent infinite re-renders in polling component
  const handlePDFsReady = useCallback(
    (cvUrl: string, coverUrl: string) => {
      setPdfUrls({ cvUrl, coverUrl });

      // save pdfs to localstorage for persistence
      updateGenerated({ cv: cvUrl, cover: coverUrl });

      // clear job state since generation is complete
      setCurrentJobId(null);
    },
    [updateGenerated],
  );

  // reset state for new generation - memoized to avoid unnecessary re-renders
  const handleReset = useCallback(() => {
    setPollingUrl("");
    setPdfUrls({ cvUrl: null, coverUrl: null });
    setError("");
    setCurrentJobId(null);
  }, []);

  // open pdf in new tab - memoized since it doesn't depend on state
  const openPDF = useCallback((url: string, filename: string) => {
    const link = document.createElement("a");
    link.href = url;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.setAttribute("aria-label", `Open ${filename} in new tab`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, []);

  // trigger pdf download - memoized since it doesn't depend on state
  const downloadPDF = useCallback((url: string, filename: string) => {
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, []);

  // cleanup blob urls to prevent memory leaks
  useEffect(() => {
    return () => {
      if (pdfUrls.cvUrl) {
        URL.revokeObjectURL(pdfUrls.cvUrl);
      }
      if (pdfUrls.coverUrl) {
        URL.revokeObjectURL(pdfUrls.coverUrl);
      }
    };
  }, [pdfUrls.cvUrl, pdfUrls.coverUrl]);

  return (
    <div className="flex flex-col gap-5 items-center">
      <div className="flex flex-col md:flex-row gap-5 items-center justify-center w-full">
        <div className="flex flex-col max-w-lg w-full gap-5 items-center justify-center">
          <div className="flex flex-col gap-2 w-full max-w-md">
            <div className="flex items-center justify-between">
              <label className="text-sm text-slate-400">
                Special Instructions
              </label>
              {hasUnsavedChanges && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={saveToLocalStorage}
                  className="text-xs text-yellow-400 border-yellow-500 hover:bg-yellow-500 hover:text-black"
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
              <label className="text-sm text-slate-400">Job Description</label>
              {hasUnsavedChanges && (
                <span className="text-xs text-yellow-400">
                  ● Unsaved changes
                </span>
              )}
            </div>
            <Textarea
              className={`max-w-md min-h-48 max-h-64 ${hasUnsavedChanges ? "border-yellow-500" : ""}`}
              placeholder="job description"
              value={localJobDesc}
              onChange={(e) => setLocalJobDesc(e.target.value)}
            />
          </div>
        </div>

        {cv.selectedCV && template.selectedTemplate ? (
          <div className="flex flex-col gap-10">
            <div className="flex flex-col items-center border-b-accent border-2 p-2">
              <h1 className="text-xl">
                selected cv -{" "}
                <span className="font-bold">{cv.selectedCV.name}</span>
              </h1>
              <Link
                className="hover:text-blue-400 hover:underline"
                to="/cv-template"
              >
                click to change
              </Link>
            </div>

            <div className="flex flex-col items-center border-b-accent border-2 p-2">
              <h1 className="text-xl">
                selected about me -{" "}
                <span className="font-bold">
                  {template.selectedTemplate.templateName}
                </span>
              </h1>
              <Link
                className="hover:text-blue-400 hover:underline"
                to="/about-me"
              >
                click to edit
              </Link>
            </div>
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

      {/* display last generated pdfs from localstorage */}
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
              {/* resume buttons */}
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

              {/* cover letter buttons */}
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
              These are your previously generated documents from localStorage.
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

      <div className="h-fit">
        <Button
          onClick={handleGenerate}
          disabled={!isReady || generateMutation.isPending}
        >
          {generateMutation.isPending ? "generating..." : "generate"}
        </Button>
      </div>

      {error && (
        <div className="flex items-center max-w-sm bg-red-700/40 border-red-900 p-2 border-2 text-red-400">
          <p>{error}</p>
        </div>
      )}

      {!isReady && missingItems.length > 0 && (
        <div className="flex items-center max-w-sm bg-yellow-700/40 border-yellow-900 p-2 border-2 text-yellow-400">
          <p>missing: {missingItems.join(", ")}</p>
        </div>
      )}

      {pollUrl && <PollingStatus url={pollUrl} onPDFsReady={handlePDFsReady} />}

      {pdfUrls.cvUrl && pdfUrls.coverUrl && (
        <div className="flex flex-col items-center gap-4 mt-6 p-6 bg-green-700/20 border-green-900 border-2 rounded-lg">
          <h3 className="text-lg font-semibold text-green-400">
            🎉 Documents Ready!
          </h3>

          <div className="flex flex-col sm:flex-row gap-4">
            {/* resume buttons */}
            <div className="flex flex-col gap-2">
              <span className="text-sm text-green-300 text-center">Resume</span>
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
