"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { ShoppingBag } from "lucide-react";

const LOADING_START = "global-action-loading-start";
const LOADING_END = "global-action-loading-end";

export function startGlobalActionLoading() {
  window.dispatchEvent(new CustomEvent(LOADING_START));
}

export function endGlobalActionLoading() {
  window.dispatchEvent(new CustomEvent(LOADING_END));
}

function getThemeContainer(): HTMLElement | null {
  if (typeof document === "undefined") return null;
  return document.querySelector("[class*='theme-']") as HTMLElement;
}

const overlayContent = (
  <div
    className="fixed inset-0 z-[9999] flex items-center justify-center bg-white/60 backdrop-blur-sm transition-opacity"
    role="status"
    aria-live="polite"
    aria-label="Carregando..."
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
      <p className="text-sm font-medium text-navy">Carregando...</p>
    </div>
  </div>
);

export function GlobalActionLoader() {
  const [loadingCount, setLoadingCount] = useState(0);

  useEffect(() => {
    function handleStart() {
      setLoadingCount((c) => c + 1);
    }
    function handleEnd() {
      setLoadingCount((c) => Math.max(0, c - 1));
    }
    window.addEventListener(LOADING_START, handleStart);
    window.addEventListener(LOADING_END, handleEnd);
    return () => {
      window.removeEventListener(LOADING_START, handleStart);
      window.removeEventListener(LOADING_END, handleEnd);
    };
  }, []);

  if (loadingCount <= 0) return null;

  const container = getThemeContainer();
  return createPortal(overlayContent, container ?? document.body);
}
