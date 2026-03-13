import Link from "next/link";
import { getPublicStoreWithProducts } from "@/lib/store-public";
import { isProductAvailable } from "@/lib/store-public";
import { StoreFilters } from "./StoreFilters";
import { ProductCardActions } from "./ProductCardActions";

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
        <p className="text-gray-500">Loja não encontrada</p>
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
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">{store.name}</h1>
        {storeWithSettings.description ? (
          <p className="mt-1 text-gray-600">{storeWithSettings.description}</p>
        ) : (
          <p className="mt-1 text-gray-500">Confira nossos produtos</p>
        )}
        {(storeWithSettings.contactPhone || storeWithSettings.contactEmail) && (
          <div className="mt-4 flex flex-wrap gap-4">
            {storeWithSettings.contactPhone && (
              <a
                href={`https://wa.me/55${storeWithSettings.contactPhone.replace(/\D/g, "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 rounded-lg bg-green-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-green-700"
              >
                WhatsApp
              </a>
            )}
            {storeWithSettings.contactEmail && (
              <a
                href={`mailto:${storeWithSettings.contactEmail}`}
                className="text-sm font-medium text-primary hover:underline"
              >
                {storeWithSettings.contactEmail}
              </a>
            )}
          </div>
        )}
      </div>
      <StoreFilters
        tenantSlug={tenantSlug}
        categories={categories}
        currentCategoryId={categoryId}
        currentSearch={q}
      />
      <div>
        <h2 className="mb-4 text-lg font-semibold text-gray-900">Produtos</h2>
        {products.length === 0 ? (
          <div className="rounded-xl border border-dashed border-gray-300 bg-white p-12 text-center text-gray-500">
            Nenhum produto encontrado.
          </div>
        ) : (
          <>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {products.map((product) => {
                const available = isProductAvailable(product);
                const productUrl = `/loja/${tenantSlug}/produtos/${product.slug}`;
                const checkoutUrl = `/loja/${tenantSlug}/checkout?productId=${product.id}`;
                return (
                  <div
                    key={product.id}
                    className={`overflow-hidden rounded-xl border border-gray-200 bg-white transition-shadow hover:shadow-md ${!available ? "opacity-75" : ""}`}
                  >
                    <Link href={productUrl} className="block">
                      {product.imageUrl && (
                        <div className="aspect-video w-full overflow-hidden bg-gray-100">
                          <img
                            src={product.imageUrl}
                            alt={product.name}
                            className="h-full w-full object-cover"
                          />
                        </div>
                      )}
                      <div className="p-6">
                        <h3 className="font-semibold text-gray-900">{product.name}</h3>
                        {product.category && (
                          <p className="mt-1 text-sm text-gray-500">
                            {product.category.name}
                          </p>
                        )}
                        {product.description && (
                          <p className="mt-2 line-clamp-2 text-sm text-gray-600">
                            {product.description}
                          </p>
                        )}
                        <div className="mt-2 flex items-center justify-between">
                          <p className="text-lg font-bold text-primary">
                            R$ {Number(product.price).toFixed(2)}
                          </p>
                          {!available && (
                            <span className="text-xs text-gray-500">Indisponível</span>
                          )}
                        </div>
                      </div>
                    </Link>
                    <div className="px-6 pb-6">
                      <ProductCardActions
                        tenantSlug={tenantSlug}
                        productId={product.id}
                        checkoutUrl={checkoutUrl}
                        available={available}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
            {pagination && pagination.total > pagination.limit && (
              <div className="mt-6 flex justify-center gap-2">
                {pagination.page > 1 && (
                  <Link
                    href={`/loja/${tenantSlug}?page=${pagination.page - 1}${categoryId ? `&categoryId=${categoryId}` : ""}${q ? `&q=${encodeURIComponent(q)}` : ""}`}
                    className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium hover:bg-gray-50"
                  >
                    Anterior
                  </Link>
                )}
                <span className="flex items-center px-4 py-2 text-sm text-gray-600">
                  Página {pagination.page} de {Math.ceil(pagination.total / pagination.limit)}
                </span>
                {pagination.page * pagination.limit < pagination.total && (
                  <Link
                    href={`/loja/${tenantSlug}?page=${pagination.page + 1}${categoryId ? `&categoryId=${categoryId}` : ""}${q ? `&q=${encodeURIComponent(q)}` : ""}`}
                    className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium hover:bg-gray-50"
                  >
                    Próxima
                  </Link>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
