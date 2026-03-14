"use client";

import { useState, useEffect } from "react";
import { ShoppingBag } from "lucide-react";

type PageLoadingOverlayProps = {
  show: boolean;
  message?: string;
};

export function PageLoadingOverlay({
  show,
  message = "Carregando...",
}: PageLoadingOverlayProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!show || !mounted) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-white/60 backdrop-blur-sm transition-opacity"
      role="status"
      aria-live="polite"
      aria-label={message}
    >
      <div className="flex flex-col items-center gap-5">
        <div className="relative">
          <div className="animate-shopping-bag flex items-center justify-center">
            <ShoppingBag
              className="h-14 w-14 text-primary sm:h-16 sm:w-16"
              strokeWidth={2}
            />
          </div>
          <div className="absolute -right-2 -top-1 h-3 w-3 rounded-full bg-primary animate-shopping-bounce [animation-delay:0ms]" />
          <div className="absolute -left-1 -top-2 h-2.5 w-2.5 rounded-full bg-secondary animate-shopping-bounce [animation-delay:150ms]" />
          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 h-2 w-2 rounded-full bg-accent animate-shopping-bounce [animation-delay:300ms]" />
        </div>
        <p className="text-sm font-medium text-navy">{message}</p>
      </div>
    </div>
  );
}
