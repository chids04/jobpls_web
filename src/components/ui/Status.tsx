import { ReactNode } from "react";
import {
  AlertCircleIcon,
  CheckCircle2Icon,
  Loader2Icon, // Standard spinner icon
} from "lucide-react";
import { cn } from "@/lib/utils";

export type StatusVariant = "success" | "loading" | "error" | "default";

interface StatusProps {
  variant: StatusVariant;
  message: ReactNode;
  className?: string;
}

const ICON_MAP = {
  default: null,
  error: AlertCircleIcon,
  success: CheckCircle2Icon,
  loading: Loader2Icon,
};

const VARIANT_STYLES = {
  default: "bg-accent text-accent-foreground",
  success:
    "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800",
  error:
    "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800",
  loading:
    "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800",
};

export function Status({
  variant = "default",
  message,
  className,
}: StatusProps) {
  const Icon = ICON_MAP[variant];

  if (message == "") return <></>;

  return (
    <div
      className={cn(
        "flex items-center gap-3 p-3 rounded-lg border",
        VARIANT_STYLES[variant],
        className,
      )}
    >
      {Icon && (
        <Icon
          className={cn(
            "h-5 w-5 shrink-0",
            variant === "loading" && "animate-spin",
          )}
        />
      )}
      <div className="text-sm font-medium">{message}</div>
    </div>
  );
}
