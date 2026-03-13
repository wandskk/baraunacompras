"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

type Category = {
  id: string;
  name: string;
  slug: string;
};

type Props = {
  tenantSlug: string;
  categories: Category[];
  currentCategoryId?: string;
  currentSearch?: string;
};

export function StoreFilters({
  tenantSlug,
  categories,
  currentCategoryId,
  currentSearch,
}: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(currentSearch ?? "");

  function buildUrl(updates: { q?: string; categoryId?: string | null; page?: number }) {
    const params = new URLSearchParams(searchParams.toString());
    if ("q" in updates) {
      if (updates.q) params.set("q", updates.q);
      else params.delete("q");
    }
    if ("categoryId" in updates) {
      if (updates.categoryId) params.set("categoryId", updates.categoryId);
      else params.delete("categoryId");
    }
    if ("page" in updates) params.set("page", String(updates.page));
    const qs = params.toString();
    return `/loja/${tenantSlug}${qs ? `?${qs}` : ""}`;
  }

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    router.push(buildUrl({ q: search.trim() || undefined }));
  }

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-gray-200/80 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-4">
      <form onSubmit={handleSearchSubmit} className="flex flex-1 gap-2 sm:max-w-sm">
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar produtos..."
          aria-label="Buscar produtos"
          className="w-full rounded-lg border border-gray-200 bg-gray-50/50 px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
        <button
          type="submit"
          className="shrink-0 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:opacity-90"
        >
          Buscar
        </button>
      </form>
      {categories.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <Link
            href={buildUrl({ categoryId: undefined })}
            className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
              !currentCategoryId
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
            }`}
          >
            Todos
          </Link>
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={buildUrl({ categoryId: cat.id })}
              className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                currentCategoryId === cat.id
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
              }`}
            >
              {cat.name}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
