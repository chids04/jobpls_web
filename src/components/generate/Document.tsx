import { Button } from "@/components/ui/button";
import { ExternalLinkIcon, DownloadIcon } from "lucide-react";

interface DocumentProps {
  url: string;
  name: string;
}

export function Document({ url: blob_url, name }: DocumentProps) {
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

  const downloadPDF = (url: string, name: string) => {
    const link = document.createElement("a");
    link.href = url;
    link.download = `${name}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex flex-col gap-2">
      <span className="text-sm text-green-300 text-center">{name}</span>
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => openPDF(blob_url, name)}
          className="text-green-400 border-green-400 hover:bg-green-400 hover:text-green-900"
        >
          <ExternalLinkIcon className="w-4 h-4 mr-1" />
          View
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => downloadPDF(blob_url, name)}
          className="text-green-400 border-green-400 hover:bg-green-400 hover:text-green-900"
        >
          <DownloadIcon className="w-4 h-4 mr-1" />
          Download
        </Button>
      </div>
    </div>
  );
}
