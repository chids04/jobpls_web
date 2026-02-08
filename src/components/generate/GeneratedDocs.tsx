import { usePDFStore } from "@/store/useStore";
import { Document } from "./Document";

interface GeneratedDocsProps {
  cv?: string;
  cover?: string;
}

export function GeneratedDocs({ cv, cover }: GeneratedDocsProps) {
  const pdfs = usePDFStore();

  const base64toUrl = (base64String: string) => {
    try {
      const base64data = base64String.split(",")[1] || base64String;
      // @ts-ignore - Baseline 2025 feature
      const bytes = Uint8Array.fromBase64(base64data.replace(/\s/g, ""));
      return URL.createObjectURL(new Blob([bytes], { type: "application/pdf" }));
    } catch (e) {
      console.error("Base64 conversion failed", e);
      return "";
    }
  };

  // If a prop is passed, use it (Blob URL). Otherwise, decode store (Base64).
  const finalCv = cv || (pdfs.cv ? base64toUrl(pdfs.cv) : undefined);
  const finalCover = cover || (pdfs.cover ? base64toUrl(pdfs.cover) : undefined);

  // Show "Generated" if EITHER doc is fresh (passed via props)
  const isFresh = !!cv || !!cover;

  if (!finalCv && !finalCover) return null;

  return (
    <div className="flex flex-col items-center gap-4 p-6 bg-green-700/20 border-green-900 border-2 rounded-lg">
      <h3 className="text-lg font-semibold text-green-400 text-center">
        {isFresh ? "generated documents" : "previously generated documents"}
      </h3>

      {finalCv && <Document url={finalCv} name="CV" />}
      {finalCover && <Document url={finalCover} name="Cover Letter" />}
    </div>
  );
}
