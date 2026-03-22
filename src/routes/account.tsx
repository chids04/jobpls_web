import { createFileRoute } from "@tanstack/react-router";
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";

import { Status } from "@/components/ui/Status";

import { useEffect, useState } from "react";

import { useTemplateStore } from "@/store/useStore";
import { Button } from "@/components/ui/button";
import axios from "axios";

export const Route = createFileRoute("/account")({
  component: RouteComponent,
});

function RouteComponent() {
  const { apiKey, setApiKey, userTier, setUserTier } = useTemplateStore();
  const [localApi, setLocalApi] = useState("");
  const [showStatus, setShowStatus] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLocalApi(apiKey ?? "");
  }, []);

  const handleApiSave = () => {
    setApiKey(localApi.trim());
    setShowStatus(true);
    setTimeout(() => setShowStatus(false), 2000);
  };

  const handleUpgrade = async () => {
    setLoading(true);
    try {
      const response = await axios.post("/api/checkout", {
        priceId: "price_your_stripe_price_id_here", // swap this for a real stripe price id
      }, {
        headers: {
          "x-user-id": "mock_user_123", // swap with clerk id later
        }
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

  return (
    <div className="flex flex-col gap-8 max-w-2xl mx-auto py-10">
      <h1 className="text-4xl font-bold">Account</h1>

      <Separator />

      {/* user tier section */}
      <div className="flex flex-col gap-4 p-6 bg-zinc-900 rounded-xl border-2 border-zinc-800">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold">Your Plan</h2>
          <span className={`px-4 py-1 rounded-full text-sm font-bold uppercase ${userTier === "pro" ? "bg-yellow-500 text-black" : "bg-zinc-700 text-zinc-300"}`}>
            {userTier}
          </span>
        </div>

        {userTier === "free" ? (
          <div className="flex flex-col gap-3">
            <p className="text-zinc-400">
              Upgrade to Pro to unlock higher-end models, cloud sync for your templates, and faster generation.
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
            Thanks for being a Pro member! You have access to all features.
          </p>
        )}
      </div>

      <Separator />

      {/* api key section */}
      <div className="flex flex-col gap-4">
        <h2 className="text-2xl font-semibold">Free Tier Config</h2>
        <Field>
          <FieldLabel htmlFor="input-api-key">Your Gemini API Key (BYOK)</FieldLabel>
          <div className="flex gap-2">
            <Input
              id="input-api-key"
              type="password"
              className="flex-1"
              placeholder="sk-..."
              value={localApi}
              onChange={(e) => setLocalApi(e.target.value)}
            />
            <Button className="w-[80px]" onClick={handleApiSave}>
              save
            </Button>
          </div>
          <FieldDescription>
            Free users must provide their own Gemini key. Pro users get managed AI access automatically.
          </FieldDescription>
        </Field>
      </div>

      {showStatus && (
        <Status variant={"success"} message={<p>saved api key</p>} />
      )}
    </div>
  );
}
