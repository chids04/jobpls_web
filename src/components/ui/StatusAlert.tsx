import React, { ReactNode } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  AlertCircleIcon,
  CheckCircle2Icon,
  InfoIcon,
  AlertTriangleIcon,
  LoaderCircleIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

export type AlertVariant =
  | "default"
  | "destructive"
  | "success"
  | "warning"
  | "loading";

interface StatusAlertProps {
  variant?: AlertVariant;
  title?: string;
  description: ReactNode;
  className?: string;
}

const ICON_MAP = {
  default: InfoIcon,
  destructive: AlertCircleIcon,
  success: CheckCircle2Icon,
  warning: AlertTriangleIcon,
  loading: LoaderCircleIcon,
};

export function StatusAlert({
  variant = "default",
  title,
  description,
  className,
}: StatusAlertProps) {
  const Icon = ICON_MAP[variant];

  // Logic to determine a default title if none provided
  const defaultTitle =
    variant === "destructive"
      ? "Error"
      : variant.charAt(0).toUpperCase() + variant.slice(1);

  return (
    <Alert
      variant={
        variant === "success" || variant === "warning" || variant === "loading"
          ? "default"
          : variant
      }
      className={cn(
        "max-w-md text-left",
        variant === "success" &&
          "border-green-500 text-green-700 dark:text-green-400",
        variant === "warning" &&
          "border-yellow-500 text-yellow-700 dark:text-yellow-400",
        className,
      )}
    >
      <Icon className="h-4 w-4" />
      <AlertTitle>{title || defaultTitle}</AlertTitle>
      <AlertDescription>{description}</AlertDescription>
    </Alert>
  );
}
