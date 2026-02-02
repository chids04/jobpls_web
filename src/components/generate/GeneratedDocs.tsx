import { usePDFStore } from "@/store/useStore";
import { Document } from "./Document";

// this component is responsible for displaying the generated documents or displaying the ones that have been saved in session storage

interface GeneratedDocsProps {
  cv?: string;
  cover?: string;
}

export function GeneratedDocs({ cv, cover }: GeneratedDocsProps) {
  const pdfs = usePDFStore();
  let fromSessionStorage = false;

  let docs: GeneratedDocsProps = {
    cv: undefined,
    cover: undefined,
  };

  if (cv) {
    docs.cv = cv;
  } else if (pdfs.cv) {
    docs.cv = pdfs.cv;
    fromSessionStorage = true;
  }

  if (cover) {
    docs.cover = cover;
  } else if (pdfs.cover) {
    docs.cover = pdfs.cover;
  }

  return (
    <div className="flex flex-col items-center gap-4 p-6 bg-green-700/20 border-green-900 border-2 rounded-lg">
      <h3 className="text-lg font-semibold text-green-400 text-center">
        {fromSessionStorage
          ? "previously generated documents"
          : "generated documents"}
      </h3>

      {docs.cv && <Document url={docs.cv} name={"CV"} />}
      {docs.cover && <Document url={docs.cover} name={"Cover Letter"} />}
    </div>
  );
}
