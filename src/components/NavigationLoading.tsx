"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { usePathname } from "next/navigation";
import { ShoppingBag } from "lucide-react";

function getInternalLinkPath(target: EventTarget | null): string | null {
  if (!target || !(target instanceof Node)) return null;
  const el = target as Element;
  if (el.closest?.("[data-prevent-nav]")) return null;
  const anchor = el.closest?.("a[href]");
  if (!anchor || !(anchor instanceof HTMLAnchorElement)) return null;
  const href = anchor.getAttribute("href");
  if (!href || href === "#" || href.startsWith("javascript:")) return null;
  if (anchor.target === "_blank") return null;
  if (!href.startsWith("/") && !href.startsWith(".")) return null;
  try {
    return new URL(href, window.location.origin).pathname;
  } catch {
    return null;
  }
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
          <ShoppingBag className="h-14 w-14 text-primary sm:h-16 sm:w-16" strokeWidth={2} />
        </div>
        <div className="absolute -right-2 -top-1 h-3 w-3 rounded-full bg-primary animate-shopping-bounce [animation-delay:0ms]" />
        <div className="absolute -left-1 -top-2 h-2.5 w-2.5 rounded-full bg-secondary animate-shopping-bounce [animation-delay:150ms]" />
        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 h-2 w-2 rounded-full bg-accent animate-shopping-bounce [animation-delay:300ms]" />
      </div>
      <p className="text-sm font-medium text-navy">Carregando...</p>
    </div>
  </div>
);

export function NavigationLoading() {
  const pathname = usePathname();
  const [isNavigating, setIsNavigating] = useState(false);

  useEffect(() => {
    setIsNavigating(false);
  }, [pathname]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (e.button !== 0) return;
      if (e.metaKey || e.ctrlKey) return;
      const linkPath = getInternalLinkPath(e.target);
      if (!linkPath) return;
      if (linkPath === pathname) return;
      setIsNavigating(true);
    }
    document.addEventListener("click", handleClick, { capture: true });
    return () => document.removeEventListener("click", handleClick, { capture: true });
  }, [pathname]);

  if (!isNavigating) return null;

  const container = getThemeContainer();
  return createPortal(overlayContent, container ?? document.body);
}
