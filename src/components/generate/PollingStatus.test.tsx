import { render, screen, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, Mock } from "vitest";
import PollingStatus from "./PollingStatus";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactNode } from "react";

global.URL.createObjectURL = vi.fn(() => "mock-blob-url");
global.Blob = vi.fn(() => ({ size: 100, type: "application/pdf" })) as any;

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe("PollingStatus Component", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    global.fetch = vi.fn();
  });

  it("displays the rate limit warning on 429 error", async () => {
    (global.fetch as Mock).mockResolvedValue({
      ok: false,
      status: 429,
      json: async () => ({}),
    });

    render(<PollingStatus url="/api/job/123" />, { wrapper: createWrapper() });

    expect(await screen.findByText(/Traffic is high/i)).toBeInTheDocument();
    expect(
      await screen.findByText(/Retrying in a few seconds/i),
    ).toBeInTheDocument();
  });

  it("calls onPDFsReady exactly once when Finished", async () => {
    const onPDFsReadyMock = vi.fn();

    (global.fetch as Mock).mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        status: "Finished",
        cv: "fake_base64_cv",
        cover: "fake_base64_cover",
      }),
    });

    render(<PollingStatus url="/api/job/123" onPDFsReady={onPDFsReadyMock} />, {
      wrapper: createWrapper(),
    });

    expect(await screen.findByText(/job completed!/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(onPDFsReadyMock).toHaveBeenCalledTimes(1);
      expect(onPDFsReadyMock).toHaveBeenCalledWith(
        "mock-blob-url",
        "mock-blob-url",
      );
    });
  });

  it("updates progress indicator based on status", async () => {
    (global.fetch as Mock).mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ status: "GeneratingResume" }),
    });

    render(<PollingStatus url="/api/job/123" />, { wrapper: createWrapper() });

    expect(
      await screen.findByText(/creating your resume/i),
    ).toBeInTheDocument();

    const resumeStep = screen.getByText("Resume").closest("div");
    expect(resumeStep).toHaveClass("text-blue-400");
  });
});
