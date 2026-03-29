import { createFileRoute } from "@tanstack/react-router";
import { Separator } from "@/components/ui/separator";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import axios from "axios";

import { useSession, signOut } from "@/lib/auth-client";
import { AuthForm } from "@/components/accounts/AuthForm";
import { GeminiKeyConfig } from "@/components/accounts/GeminiKeyConfig";

export const Route = createFileRoute("/account")({
  component: RouteComponent,
});

function RouteComponent() {
  const { data: session, isPending } = useSession();
  const [loading, setLoading] = useState(false);

  const handleUpgrade = async () => {
    setLoading(true);
    try {
      const response = await axios.post("/api/checkout", {
        priceId: "price_your_stripe_price_id_here",
      });

      if (response.data.url) {
        window.location.href = response.data.url;
      }
    } catch (e) {
      console.error("checkout failed", e);
    } finally {
      setLoading(false);
    }
  };

  if (isPending) {
    return <div className="flex justify-center py-20">loading...</div>;
  }

  const userTier = session?.user?.tier ?? "free";

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
            <div className="flex flex-col gap-3">
              <p className="text-zinc-400">
                upgrade to Pro to unlock higher-end models, cloud sync for your
                templates, and faster generation.
              </p>
              <Button
                className="w-full bg-yellow-500 hover:bg-yellow-400 text-black font-bold h-12"
                onClick={handleUpgrade}
                disabled={loading}
              >
                {loading ? "loading..." : "Upgrade to Pro - $10/mo"}
              </Button>
            </div>
          ) : (
            <p className="text-green-400 font-medium">
              thanks for being a Pro member! you have access to all features.
            </p>
          )}
        </div>
      )}

      <Separator />

      <GeminiKeyConfig />
    </div>
  );
}
