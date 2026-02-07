import { createFileRoute } from "@tanstack/react-router";
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";

import { Status } from "@/components/ui/Status";

import { useEffect, useState } from "react";

import { useTemplateStore } from "@/store/useStore";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/account")({
  component: RouteComponent,
});

function RouteComponent() {
  const { apiKey, setApiKey } = useTemplateStore();
  const [localApi, setLocalApi] = useState("");
  const [showStatus, setShowStatus] = useState(false);

  useEffect(() => {
    setLocalApi(apiKey ?? "");
  }, []);

  const handleApiSave = () => {
    setApiKey(localApi.trim());

    setShowStatus(true);

    setTimeout(() => setShowStatus(false), 2000);
  };

  return (
    <div className="flex flex-col gap-5">
      <h1 className="text-4xl font-bold">Config</h1>

      <Separator />
      <div>
        <Field>
          <FieldLabel htmlFor="input-api-key">Gemini API Key</FieldLabel>
          <div className="flex gap-2">
            <Input
              id="input-api-key"
              type="password"
              className="max-w-96"
              placeholder="sk-..."
              value={localApi}
              onChange={(e) => setLocalApi(e.target.value)}
            />
            <Button className="w-[80px]" onClick={handleApiSave}>
              save
            </Button>
          </div>
          <FieldDescription>
            Your API key is stored on your device in your browser's local
            storage
          </FieldDescription>
          <FieldDescription>
            Currently, Google Gemini is the only supported LLM
          </FieldDescription>
        </Field>
      </div>
      {showStatus && (
        <Status variant={"success"} message={<p>saved api key</p>} />
      )}
    </div>
  );
}
