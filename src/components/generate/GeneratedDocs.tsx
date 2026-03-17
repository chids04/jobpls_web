import { usePDFStore } from "@/store/useStore";
import { Document } from "./Document";

interface GeneratedDocsProps {
  cv?: string;
  cover?: string;
  documentRef: React.Ref<HTMLDivElement>;
}

export function GeneratedDocs({ cv, cover, documentRef }: GeneratedDocsProps) {
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

  return (
    <div
      ref={documentRef}
      className="flex flex-col items-center gap-4 p-6 bg-green-700/20 border-green-900 border-2 rounded-lg"
    >
      <h3 className="text-lg font-semibold text-green-400 text-center">
        {isFresh ? "generated documents" : "previously generated documents"}
      </h3>

      {finalCv && <Document url={finalCv} name="CV" />}
      {finalCover && <Document url={finalCover} name="Cover Letter" />}
    </div>
  );
}
