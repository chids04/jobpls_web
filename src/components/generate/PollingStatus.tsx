import { useQuery } from "@tanstack/react-query";
import { useEffect, useState, useRef } from "react";

// progress indicator component
function ProgressIndicator({ currentStep }: { currentStep: number }) {
  const steps = [
    { name: "Queued", icon: "⏳" },
    { name: "Resume", icon: "📄" },
    { name: "Cover Letter", icon: "📝" },
    { name: "Compiling", icon: "🔄" },
    { name: "Complete", icon: "✅" },
  ];

  return (
    <div className="flex items-center justify-center gap-2 mb-4">
      {steps.map((step, index) => (
        <div
          key={index}
          className={`flex items-center gap-1 px-2 py-1 rounded text-xs ${
            index < currentStep
              ? "bg-green-600/30 text-green-400"
              : index === currentStep
                ? "bg-blue-600/30 text-blue-400"
                : "bg-gray-600/30 text-gray-500"
          }`}
        >
          <span>{step.icon}</span>
          <span>{step.name}</span>
        </div>
      ))}
    </div>
  );
}

const POLLING_INTERVAL = 5000; // poll every 5 seconds

// fetch function with proper error handling and typing
const fetchStatus = async (url: string): Promise<JobStatus> => {
  const res = await fetch(url);

  if (!res.ok) {
    throw new Error(`http error ${res.status}`);
  }

  return res.json();
};

interface PollingStatusProps {
  url: string;
  onPDFsReady?: (cvUrl: string, coverUrl: string) => void;
}

function b64toArr(base64: string): ArrayBuffer {
  var binaryString = atob(base64);
  var bytes = new Uint8Array(binaryString.length);
  for (var i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
}

// your job status type - moved to top for clarity
type JobStatus =
  | { status: "Pending" }
  | { status: "GeneratingResume" }
  | { status: "GeneratingCover" }
  | { status: "CompilingPDF" }
  | { status: "Finished"; cv: string; cover: string }
  | { status: "Failed" }
  | { status: "UnkownJob" };

function PollingStatus({ url, onPDFsReady }: PollingStatusProps) {
  const { data, isPending, error } = useQuery({
    // unique cache key - queries with same key share cached data
    queryKey: ["jobStatus", url],

    // function that fetches the data - must return a promise
    queryFn: () => fetchStatus(url),

    // polling configuration - function receives query info
    refetchInterval: (query) => {
      // query.state.data contains the latest fetched data
      const latestData = query.state.data;

      // stop polling when job is finished or failed
      if (
        latestData &&
        (latestData.status === "Finished" ||
          latestData.status === "Failed" ||
          latestData.status === "UnkownJob")
      ) {
        console.log("polling stopped - job completed");
        return false; // false stops the interval
      }

      // continue polling every 5 seconds for active jobs
      return POLLING_INTERVAL;
    },

    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  // prevent multiple callback calls for same job completion
  const [hasNotifiedParent, setHasNotifiedParent] = useState(false);

  // use ref to store the latest callback without causing re-renders
  const onPDFsReadyRef = useRef(onPDFsReady);
  onPDFsReadyRef.current = onPDFsReady;

  // handle PDF creation when job finishes - only call once per job
  useEffect(() => {
    if (
      data?.status === "Finished" &&
      onPDFsReadyRef.current &&
      !hasNotifiedParent
    ) {
      setHasNotifiedParent(true);
      try {
        // create blob URLs for PDFs
        const cv_blob = new Blob([b64toArr(data.cv)], {
          type: "application/pdf",
        });
        const cv_url = URL.createObjectURL(cv_blob);

        const cover_blob = new Blob([b64toArr(data.cover)], {
          type: "application/pdf",
        });
        const cover_url = URL.createObjectURL(cover_blob);

        // notify parent component once
        onPDFsReadyRef.current(cv_url, cover_url);
      } catch (error) {
        console.error("error creating PDF blobs:", error);
      }
    }
  }, [
    data?.status,
    hasNotifiedParent,
    data && data.status === "Finished" ? data.cv : null,
    data && data.status === "Finished" ? data.cover : null,
  ]);

  // reset notification flag when polling starts new job
  useEffect(() => {
    if (data?.status && data.status !== "Finished") {
      setHasNotifiedParent(false);
    }
  }, [data?.status]);

  // render the component based on query state
  if (isPending) {
    return (
      <div className="flex items-center gap-2">
        <div className="animate-spin w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
        <span>loading job status...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-700/40 border-red-900 p-3 border-2 text-red-400 rounded">
        <div>❌ error: {error.message}</div>
      </div>
    );
  }

  if (!data) {
    return <div>no job data available</div>;
  }

  // get current step for progress indicator
  const getCurrentStep = () => {
    switch (data.status) {
      case "Pending":
        return 0;
      case "GeneratingResume":
        return 1;
      case "GeneratingCover":
        return 2;
      case "CompilingPDF":
        return 3;
      case "Finished":
        return 4;
      default:
        return 0;
    }
  };

  // render based on job status
  switch (data.status) {
    case "Pending":
      return (
        <div className="bg-blue-700/20 border-blue-900 p-4 border-2 text-blue-400 rounded">
          <ProgressIndicator currentStep={getCurrentStep()} />
          <div className="flex items-center gap-2 justify-center">
            <div className="animate-pulse w-2 h-2 bg-blue-400 rounded-full"></div>
            <span>job is pending</span>
          </div>
          <div className="text-sm text-blue-300 text-center">
            waiting to start...
          </div>
        </div>
      );

    case "GeneratingResume":
      return (
        <div className="bg-yellow-700/20 border-yellow-900 p-4 border-2 text-yellow-400 rounded">
          <ProgressIndicator currentStep={getCurrentStep()} />
          <div className="flex items-center gap-2 justify-center">
            <div className="animate-spin w-4 h-4 border-2 border-yellow-400 border-t-transparent rounded-full"></div>
            <span>generating resume</span>
          </div>
          <div className="text-sm text-yellow-300 text-center">
            creating your resume...
          </div>
        </div>
      );

    case "GeneratingCover":
      return (
        <div className="bg-orange-700/20 border-orange-900 p-4 border-2 text-orange-400 rounded">
          <ProgressIndicator currentStep={getCurrentStep()} />
          <div className="flex items-center gap-2 justify-center">
            <div className="animate-spin w-4 h-4 border-2 border-orange-400 border-t-transparent rounded-full"></div>
            <span>generating cover letter</span>
          </div>
          <div className="text-sm text-orange-300 text-center">
            writing your cover letter...
          </div>
        </div>
      );

    case "CompilingPDF":
      return (
        <div className="bg-purple-700/20 border-purple-900 p-4 border-2 text-purple-400 rounded">
          <ProgressIndicator currentStep={getCurrentStep()} />
          <div className="flex items-center gap-2 justify-center">
            <div className="animate-spin w-4 h-4 border-2 border-purple-400 border-t-transparent rounded-full"></div>
            <span>compiling documents</span>
          </div>
          <div className="text-sm text-purple-300 text-center">
            finalizing documents...
          </div>
        </div>
      );

    case "Finished":
      return (
        <div className="bg-green-700/20 border-green-900 p-4 border-2 text-green-400 rounded">
          <ProgressIndicator currentStep={getCurrentStep()} />
          <div className="flex items-center gap-2 justify-center">
            <span>✅ job completed!</span>
          </div>
          <div className="text-sm text-green-300 text-center">
            your documents are ready
          </div>
        </div>
      );

    case "Failed":
      return (
        <div className="bg-red-700/40 border-red-900 p-3 border-2 text-red-400 rounded">
          <div>❌ job failed</div>
          <div className="text-sm text-red-300">
            something went wrong, please try again
          </div>
        </div>
      );

    case "UnkownJob":
      return (
        <div className="bg-gray-700/40 border-gray-900 p-3 border-2 text-gray-400 rounded">
          <div>❓ unknown job</div>
          <div className="text-sm text-gray-300">job not found or invalid</div>
        </div>
      );

    default:
      return <div>unexpected job status</div>;
  }
}

export default PollingStatus;
