"use client";

import { CheckCircle, XCircle, Info, X } from "lucide-react";
import { toast as sonnerToast } from "sonner";

type ToastType = "success" | "error" | "info";

const toastConfig = {
  success: {
    icon: CheckCircle,
    iconClass: "text-emerald-600",
    containerClass:
      "border-emerald-200 bg-white shadow-lg shadow-emerald-950/5",
  },
  error: {
    icon: XCircle,
    iconClass: "text-red-600",
    containerClass: "border-red-200 bg-white shadow-lg shadow-red-950/5",
  },
  info: {
    icon: Info,
    iconClass: "text-blue-600",
    containerClass: "border-blue-200 bg-white shadow-lg shadow-blue-950/5",
  },
} as const;

type ToastContentProps = {
  id: string | number;
  message: string;
  type: ToastType;
};

export function ToastContent({ id, message, type }: ToastContentProps) {
  const config = toastConfig[type];
  const Icon = config.icon;

  return (
    <div
      className={`flex min-w-[320px] max-w-md items-center gap-3 rounded-xl border p-4 ${config.containerClass}`}
    >
      <div
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
          type === "success"
            ? "bg-emerald-100"
            : type === "error"
              ? "bg-red-100"
              : "bg-blue-100"
        }`}
      >
        <Icon className={`h-5 w-5 ${config.iconClass}`} />
      </div>
      <p className="min-w-0 flex-1 text-sm font-medium text-gray-800">
        {message}
      </p>
      <button
        type="button"
        onClick={() => sonnerToast.dismiss(id)}
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2"
        aria-label="Fechar"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
