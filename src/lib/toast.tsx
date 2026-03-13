"use client";

import { toast as sonnerToast } from "sonner";
import { ToastContent } from "@/components/ui/ToastContent";

type ToastType = "success" | "error" | "info";

function showToast(message: string, type: ToastType) {
  sonnerToast.custom(
    (id) => <ToastContent id={id} message={message} type={type} />,
    {
      duration: type === "error" ? 5000 : 4000,
    },
  );
}

/**
 * Utilitário de toast unificado para o projeto.
 * Toast com ícone, cor, texto e botão para fechar.
 */
export const toast = {
  success: (message: string) => showToast(message, "success"),
  error: (message: string) => showToast(message, "error"),
  info: (message: string) => showToast(message, "info"),
  promise: <T,>(
    promise: Promise<T>,
    messages: {
      loading: string;
      success: string;
      error: string;
    },
  ) => sonnerToast.promise(promise, messages),
};
