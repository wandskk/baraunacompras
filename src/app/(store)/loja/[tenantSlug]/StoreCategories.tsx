"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

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

export function StoreCategories({
  tenantSlug,
  categories,
  currentCategoryId,
  currentSearch,
}: Props) {
  const searchParams = useSearchParams();

  function buildUrl(updates: { categoryId?: string | null }) {
    const params = new URLSearchParams(searchParams.toString());
    if ("categoryId" in updates) {
      if (updates.categoryId) params.set("categoryId", updates.categoryId);
      else params.delete("categoryId");
    }
    params.delete("page");
    const qs = params.toString();
    return `/loja/${tenantSlug}${qs ? `?${qs}` : ""}`;
  }

  return (
    <section className="py-4 sm:py-6" aria-label="Categorias">
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide [-webkit-overflow-scrolling:touch]">
        <Link
          href={buildUrl({ categoryId: undefined })}
          className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
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
            className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
              currentCategoryId === cat.id
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
            }`}
          >
            {cat.name}
          </Link>
        ))}
      </div>
    </section>
  );
}
