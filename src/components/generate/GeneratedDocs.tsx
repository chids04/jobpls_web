import { usePDFStore } from "@/store/useStore";
import { Button } from "@/components/ui/button";
import { buildPdfFileName } from "@/lib/pdf_gen";
import { Document } from "./Document";

interface GeneratedDocsProps {
  cv?: string;
  cover?: string;
  documentRef: React.Ref<HTMLDivElement>;
  canEditCV?: boolean;
  canEditCover?: boolean;
  onEditCV?: () => void;
  onEditCover?: () => void;
  // company + creation time for the fresh path; persisted path falls back to the store
  company?: string;
  createdAt?: string | number;
}

export function GeneratedDocs({
  cv,
  cover,
  documentRef,
  canEditCV = false,
  canEditCover = false,
  onEditCV,
  onEditCover,
  company,
  createdAt,
}: GeneratedDocsProps) {
  const pdfs = usePDFStore();

  const base64toUrl = (base64String: string) => {
    try {
      // the base64 string from FileReader.readAsDataURL already includes the data:application/pdf;base64, prefix
      // we can just use fetch to convert it to a blob
      const byteCharacters = atob(base64String.split(",")[1] || base64String);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      return URL.createObjectURL(
        new Blob([byteArray], { type: "application/pdf" }),
      );
    } catch (e) {
      console.error("Base64 conversion failed", e);
      return "";
    }
  };

  const isFresh = !!cv || !!cover;

  const finalCv = isFresh ? cv : pdfs.cv ? base64toUrl(pdfs.cv) : undefined;
  const finalCover = isFresh
    ? cover
    : pdfs.cover
      ? base64toUrl(pdfs.cover)
      : undefined;

  if (!finalCv && !finalCover) return null;

  // fresh generation supplies company/date via props; persisted docs read from the store
  const fileCompany = isFresh ? company : pdfs.company;
  const fileCreatedAt = isFresh ? createdAt : pdfs.createdAt;
  const fileDate = fileCreatedAt ? new Date(fileCreatedAt) : new Date();
  const cvFileName = buildPdfFileName(fileCompany, "CV", fileDate);
  const coverFileName = buildPdfFileName(fileCompany, "Cover Letter", fileDate);

  return (
    <div
      ref={documentRef}
      className="flex flex-col items-center justify-center w-fit gap-4 p-6 bg-green-700/20 border-green-900 border-2 rounded-lg"
    >
      <h3 className="text-lg font-semibold text-green-400 text-center">
        {isFresh ? "generated documents" : "previously generated documents"}
      </h3>

      {finalCv && (
        <div className="flex flex-col gap-2 items-center">
          <Document url={finalCv} name="CV" fileName={cvFileName} />
          {onEditCV && (
            <Button
              type="button"
              variant="outline"
              className="text-black"
              disabled={!canEditCV}
              onClick={onEditCV}
            >
              edit cv
            </Button>
          )}
        </div>
      )}
      {finalCover && (
        <div className="flex flex-col gap-2 items-center">
          <Document
            url={finalCover}
            name="Cover Letter"
            fileName={coverFileName}
          />
          {onEditCover && (
            <Button
              type="button"
              variant="outline"
              className="text-black"
              disabled={!canEditCover}
              onClick={onEditCover}
            >
              edit cover letter
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
