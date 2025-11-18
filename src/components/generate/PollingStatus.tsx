import { useQuery } from "@tanstack/react-query";
import { useEffect, useState, useRef } from "react";

class HttpError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

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
    <div className="w-full px-2 mb-4">
      <div className="flex flex-col gap-2 sm:hidden">
        {steps.map((step, index) => (
          <div
            key={index}
            className={`flex items-center justify-center gap-2 px-3 py-2 rounded text-sm ${
              index < currentStep
                ? "bg-green-600/30 text-green-400"
                : index === currentStep
                  ? "bg-blue-600/30 text-blue-400"
                  : "bg-gray-600/30 text-gray-500"
            }`}
          >
            <span className="text-base">{step.icon}</span>
            <span className="font-medium">{step.name}</span>
          </div>
        ))}
      </div>

      {/* Desktop: Horizontal layout */}
      <div className="hidden sm:flex sm:items-center sm:justify-center sm:gap-1 lg:gap-2">
        {steps.map((step, index) => (
          <div
            key={index}
            className={`flex items-center gap-1 px-2 py-1 rounded text-xs lg:text-sm ${
              index < currentStep
                ? "bg-green-600/30 text-green-400"
                : index === currentStep
                  ? "bg-blue-600/30 text-blue-400"
                  : "bg-gray-600/30 text-gray-500"
            }`}
          >
            <span>{step.icon}</span>
            <span className="hidden md:inline">{step.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

const POLLING_INTERVAL = 5000; // poll every 5 seconds

const fetchStatus = async (url: string): Promise<JobStatus> => {
  const res = await fetch(url);

  // 2. Handle 429 specifically
  if (res.status === 429) {
    throw new HttpError("Rate limit exceeded", 429);
  }

  if (!res.ok) {
    throw new HttpError(`http error ${res.status}`, res.status);
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
    queryKey: ["jobStatus", url],
    queryFn: () => fetchStatus(url),

    // 3. Don't retry immediately on rate limit, let the poll interval handle it
    retry: (failureCount, error) => {
      if (error instanceof HttpError && error.status === 429) {
        return false;
      }
      return failureCount < 3;
    },

    refetchInterval: (query) => {
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

      // continue polling every 5 seconds for active jobs (and errors like 429)
      return POLLING_INTERVAL;
    },

    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  const [hasNotifiedParent, setHasNotifiedParent] = useState(false);
  const onPDFsReadyRef = useRef(onPDFsReady);
  onPDFsReadyRef.current = onPDFsReady;

  useEffect(() => {
    if (
      data?.status === "Finished" &&
      onPDFsReadyRef.current &&
      !hasNotifiedParent
    ) {
      setHasNotifiedParent(true);
      try {
        const cv_blob = new Blob([b64toArr(data.cv)], {
          type: "application/pdf",
        });
        const cv_url = URL.createObjectURL(cv_blob);

        const cover_blob = new Blob([b64toArr(data.cover)], {
          type: "application/pdf",
        });
        const cover_url = URL.createObjectURL(cover_blob);

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

  useEffect(() => {
    if (data?.status && data.status !== "Finished") {
      setHasNotifiedParent(false);
    }
  }, [data?.status]);

  if (isPending) {
    return (
      <div className="flex items-center gap-2">
        <div className="animate-spin w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
        <span>loading job status...</span>
      </div>
    );
  }

  if (error) {
    // 4. Specific UI for Rate Limiting
    if (error instanceof HttpError && error.status === 429) {
      return (
        <div className="bg-yellow-700/20 border-yellow-900 p-3 border-2 text-yellow-400 rounded mx-2 sm:mx-0 transition-all duration-300">
          <div className="flex items-center gap-2 font-semibold">
            <span>✋</span>
            <span>Traffic is high</span>
          </div>
          <div className="text-sm text-yellow-300 mt-1">
            We are rate limiting requests. Retrying in a few seconds...
          </div>
        </div>
      );
    }

    // Generic Error
    return (
      <div className="bg-red-700/40 border-red-900 p-3 border-2 text-red-400 rounded">
        <div>❌ error: {error.message}</div>
      </div>
    );
  }

  if (!data) {
    return <div>no job data available</div>;
  }

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

  switch (data.status) {
    case "Pending":
      return (
        <div className="bg-blue-700/20 border-blue-900 p-3 sm:p-4 border-2 text-blue-400 rounded mx-2 sm:mx-0">
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
        <div className="bg-yellow-700/20 border-yellow-900 p-3 sm:p-4 border-2 text-yellow-400 rounded mx-2 sm:mx-0">
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
        <div className="bg-orange-700/20 border-orange-900 p-3 sm:p-4 border-2 text-orange-400 rounded mx-2 sm:mx-0">
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
        <div className="bg-purple-700/20 border-purple-900 p-3 sm:p-4 border-2 text-purple-400 rounded mx-2 sm:mx-0">
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
        <div className="bg-green-700/20 border-green-900 p-3 sm:p-4 border-2 text-green-400 rounded mx-2 sm:mx-0">
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
        <div className="bg-red-700/40 border-red-900 p-3 border-2 text-red-400 rounded mx-2 sm:mx-0">
          <div>❌ job failed</div>
          <div className="text-sm text-red-300">
            something went wrong, please try again
          </div>
        </div>
      );

    case "UnkownJob":
      return (
        <div className="bg-gray-700/40 border-gray-900 p-3 border-2 text-gray-400 rounded mx-2 sm:mx-0">
          <div>❓ unknown job</div>
          <div className="text-sm text-gray-300">job not found or invalid</div>
        </div>
      );

    default:
      return <div>unexpected job status</div>;
  }
}

export default PollingStatus;
