"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useSession } from "@/hooks/useSession";

export function DashboardThemeWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { session } = useSession();
  const [themeClass, setThemeClass] = useState("theme-default");

  useEffect(() => {
    const match = pathname?.match(/^\/dashboard\/stores\/([^/]+)/);
    const applyTheme = (theme: string | null) => {
      setThemeClass(theme ? `theme-${theme}` : "theme-default");
    };

    if (match && session?.tenantId) {
      const storeId = match[1];
      fetch(`/api/tenants/${session.tenantId}/stores/${storeId}`)
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => applyTheme(data?.theme ?? null))
        .catch(() => applyTheme(null));
    } else {
      applyTheme(null);
    }

    const handler = (e: CustomEvent<{ theme: string }>) => {
      applyTheme(e.detail?.theme ?? null);
    };
    window.addEventListener("store-theme-changed", handler as EventListener);
    return () =>
      window.removeEventListener("store-theme-changed", handler as EventListener);
  }, [pathname, session?.tenantId]);

  return (
    <div className={`min-h-screen bg-gray-50 ${themeClass}`}>{children}</div>
  );
}
