import { useState, useEffect } from "react";
import { Field, FieldLabel, FieldDescription } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Status } from "@/components/ui/Status";
import { useTemplateStore } from "@/store/useStore";

export function GeminiKeyConfig() {
  const { apiKey, setApiKey } = useTemplateStore();
  const [localApi, setLocalApi] = useState("");
  const [showStatus, setShowStatus] = useState(false);

  useEffect(() => {
    setLocalApi(apiKey ?? "");
  }, [apiKey]);

  const handleApiSave = () => {
    setApiKey(localApi.trim());
    setShowStatus(true);
    setTimeout(() => setShowStatus(false), 2000);
  };

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-2xl font-semibold">free tier config</h2>
      <Field>
        <FieldLabel htmlFor="input-api-key">
          Your Gemini API Key (BYOK)
        </FieldLabel>
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
          free users must provide their own Gemini key. pro users get managed AI
          access automatically.
        </FieldDescription>
      </Field>
      {showStatus && (
        <Status variant={"success"} message={<p>saved api key</p>} />
      )}
    </div>
  );
}
