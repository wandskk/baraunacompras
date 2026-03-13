import Link from "next/link";
import { getPublicStoreWithProducts } from "@/lib/store-public";
import { isProductAvailable } from "@/lib/store-public";
import { StoreHero } from "./StoreHero";
import { StoreCategories } from "./StoreCategories";
import { StoreProductCard } from "./StoreProductCard";

type PageProps = {
  params: Promise<{ tenantSlug: string }>;
  searchParams: Promise<{ q?: string; categoryId?: string; page?: string }>;
};

export default async function StoreHomePage({ params, searchParams }: PageProps) {
  const { tenantSlug } = await params;
  const { q, categoryId, page } = await searchParams;
  const data = await getPublicStoreWithProducts(tenantSlug, undefined, {
    q: q ?? undefined,
    categoryId: categoryId ?? undefined,
    page: page ? parseInt(page, 10) : 1,
    limit: 12,
  });
  if (!data) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <p className="text-secondary-foreground">Loja não encontrada</p>
      </div>
    );
  }
  const { store, products, categories, pagination } = data;
  const storeWithSettings = store as typeof store & {
    description?: string | null;
    contactEmail?: string | null;
    contactPhone?: string | null;
  };

  return (
    <div className="flex flex-col">
      {/* Hero section */}
      <StoreHero
        tenantSlug={tenantSlug}
        storeName={store.name}
        description={storeWithSettings.description}
      />

      {/* Categories - horizontal scroll */}
      <StoreCategories
        tenantSlug={tenantSlug}
        categories={categories}
        currentCategoryId={categoryId}
        currentSearch={q}
      />

      {/* Featured products */}
      <section id="produtos" className="py-6 sm:py-8">
        <h2 className="mb-4 text-lg font-semibold text-gray-900 sm:text-xl">
          Produtos em destaque
        </h2>
        {products.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-white py-16 text-center">
            <p className="text-gray-500">Nenhum produto encontrado.</p>
            <p className="mt-1 text-sm text-gray-400">
              Tente outra busca ou categoria.
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-4">
              {products.map((product) => {
                const available = isProductAvailable(product);
                return (
                  <StoreProductCard
                    key={product.id}
                    tenantSlug={tenantSlug}
                    product={product}
                    available={available}
                  />
                );
              })}
            </div>
            {pagination && pagination.total > pagination.limit && (
              <nav
                className="mt-8 flex items-center justify-center gap-2"
                aria-label="Paginação"
              >
                {pagination.page > 1 && (
                  <Link
                    href={`/loja/${tenantSlug}?page=${pagination.page - 1}${categoryId ? `&categoryId=${categoryId}` : ""}${q ? `&q=${encodeURIComponent(q)}` : ""}`}
                    className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
                  >
                    Anterior
                  </Link>
                )}
                <span className="px-4 py-2 text-sm text-gray-600">
                  {pagination.page} de {Math.ceil(pagination.total / pagination.limit)}
                </span>
                {pagination.page * pagination.limit < pagination.total && (
                  <Link
                    href={`/loja/${tenantSlug}?page=${pagination.page + 1}${categoryId ? `&categoryId=${categoryId}` : ""}${q ? `&q=${encodeURIComponent(q)}` : ""}`}
                    className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
                  >
                    Próxima
                  </Link>
                )}
              </nav>
            )}
          </>
        )}
      </section>
    </div>
  );
}
