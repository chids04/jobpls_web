import { ReactNode } from "react";
import {
  AlertCircleIcon,
  CheckCircle2Icon,
  InfoIcon,
  AlertTriangleIcon,
  LoaderCircleIcon,
} from "lucide-react";

import { Separator } from "./separator";

type StatusVariant = "success" | "loading" | "error";

interface StatusProps {
  variant: StatusVariant;
  message: ReactNode;
}

const ICON_MAP = {
  error: AlertCircleIcon,
  success: CheckCircle2Icon,
  loading: LoaderCircleIcon,
};
export function Status({ variant, message }: StatusProps) {
  const Icon = ICON_MAP[variant];

  return (
    <div className="flex flex-col gap-1 justify-start bg-accent p-3 max-w-sm rounded-lg">
      <div className="flex items-center gap-2">
        <Icon />
        <h3 className="text-xl">{variant}</h3>
      </div>

      <Separator />
      <div>{message}</div>
    </div>
  );
}
