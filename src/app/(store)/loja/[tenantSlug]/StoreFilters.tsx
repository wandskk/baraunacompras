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

  function buildUrl(updates: { q?: string; categoryId?: string; page?: number }) {
    const params = new URLSearchParams(searchParams.toString());
    if (updates.q !== undefined) {
      if (updates.q) params.set("q", updates.q);
      else params.delete("q");
    }
    if (updates.categoryId !== undefined) {
      if (updates.categoryId) params.set("categoryId", updates.categoryId);
      else params.delete("categoryId");
    }
    if (updates.page !== undefined) params.set("page", String(updates.page));
    const qs = params.toString();
    return `/loja/${tenantSlug}${qs ? `?${qs}` : ""}`;
  }

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    router.push(buildUrl({ q: search.trim() || undefined }));
  }

  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <form onSubmit={handleSearchSubmit} className="flex gap-2">
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar produtos..."
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
        <button
          type="submit"
          className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          Buscar
        </button>
      </form>
      {categories.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <Link
            href={buildUrl({ categoryId: undefined })}
            className={`rounded-full px-3 py-1 text-sm font-medium ${
              !currentCategoryId
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-secondary-foreground hover:opacity-90"
            }`}
          >
            Todos
          </Link>
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={buildUrl({ categoryId: cat.id })}
              className={`rounded-full px-3 py-1 text-sm font-medium ${
                currentCategoryId === cat.id
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground hover:opacity-90"
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
