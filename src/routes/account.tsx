import { createFileRoute } from "@tanstack/react-router";
import { Separator } from "@/components/ui/separator";
import { useEffect, useState, ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import axios from "axios";

import { useSession, signOut } from "@/lib/auth-client";
import { AuthForm } from "@/components/accounts/AuthForm";
import { GeminiKeyConfig } from "@/components/accounts/GeminiKeyConfig";
import { useTemplateStore } from "@/store/useStore";
import { useMutation } from "@tanstack/react-query";
import { Status, StatusVariant } from "@/components/ui/Status";
import { FEATURES } from "@/lib/features";

export const Route = createFileRoute("/account")({
  component: RouteComponent,
});

function RouteComponent() {
  const { data: session, isPending } = useSession();
  const { cloudSync, setCloudSync } = useTemplateStore();

  const [status, setStatus] = useState<{
    variant: StatusVariant;
    msg: ReactNode;
  }>({
    variant: "default",
    msg: "",
  });

  const setStatusMessage = (msg: ReactNode, variant: StatusVariant) => {
    setStatus({ msg, variant });
  };

  const userTier = session?.user?.tier ?? "free";

  useEffect(() => {
    if (userTier === "pro" && !cloudSync) {
      setCloudSync(true);
    }
  }, [userTier, cloudSync, setCloudSync]);

  const upgradeMutation = useMutation({
    mutationFn: async () => {
      const response = await axios.post("/api/upgrade");
      return response.data;
    },
    onMutate: () => {
      setStatusMessage("Upgrading your account to Pro...", "loading");
    },
    onSuccess: () => {
      setStatusMessage("Account upgraded successfully! Refreshing...", "success");
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    },
    onError: (error: any) => {
      if (import.meta.env.DEV) console.error("Upgrade failed", error);
      setStatusMessage(
        error.response?.data?.message || "Failed to upgrade account",
        "error"
      );
    },
  });

  if (isPending) {
    return <div className="flex justify-center py-20">loading...</div>;
  }

  return (
    <div className="flex flex-col gap-8 max-w-2xl mx-auto py-10 px-4">
      <div className="flex items-center justify-between">
        <h1 className="text-4xl font-bold">account</h1>
        {session && (
          <Button variant="ghost" onClick={() => signOut()}>
            sign out
          </Button>
        )}
      </div>

      <Separator />

      {!session ? (
        <div className="max-w-md mx-auto w-full">
          <AuthForm />
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-4 p-6 bg-zinc-900 rounded-xl border-2 border-zinc-800">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold">your plan</h2>
              <span
                className={`px-4 py-1 rounded-full text-sm font-bold uppercase ${userTier === "pro" ? "bg-yellow-500 text-black" : "bg-zinc-700 text-zinc-300"}`}
              >
                {userTier}
              </span>
            </div>

            {userTier !== "pro" ? (
              FEATURES.payments ? (
                <div className="flex flex-col gap-3">
                  <p className="text-zinc-400">
                    upgrade to Pro to unlock higher-end models, cloud sync for
                    your templates, and faster generation.
                  </p>
                  <Button
                    className="w-full bg-yellow-500 hover:bg-yellow-400 text-black font-bold h-12"
                    onClick={() => upgradeMutation.mutate()}
                    disabled={upgradeMutation.isPending}
                  >
                    {upgradeMutation.isPending ? "Upgrading..." : "Upgrade to Pro - $10/mo"}
                  </Button>
                </div>
              ) : (
                <p className="text-zinc-400">
                  Pro tier coming soon — you're on the free plan.
                </p>
              )
            ) : (
              <p className="text-green-400 font-medium">
                thanks for being a Pro member! you have access to all features.
              </p>
            )}
          </div>

          {userTier === "pro" && (
            <div className="flex items-center justify-between p-6 bg-zinc-900 rounded-xl border-2 border-zinc-800">
              <div className="flex flex-col gap-1">
                <h2 className="text-xl font-semibold">Cloud Sync</h2>
                <p className="text-sm text-zinc-400">
                  Automatically sync your resume templates to the cloud.
                </p>
              </div>
              <Checkbox
                id="cloud-sync"
                checked={cloudSync}
                onCheckedChange={(checked) => setCloudSync(!!checked)}
                className="size-6 border-zinc-700 data-[state=checked]:bg-yellow-500 data-[state=checked]:border-yellow-500 data-[state=checked]:text-black"
              />
            </div>
          )}
        </div>
      )}

      {status.msg && <Status variant={status.variant} message={status.msg} />}

      <Separator />

      <GeminiKeyConfig />
    </div>
  );
}
