import Link from "next/link";
import { getPublicStoreWithProducts } from "@/lib/store-public";

type PageProps = {
  params: Promise<{ tenantSlug: string }>;
};

export default async function StoreHomePage({ params }: PageProps) {
  const { tenantSlug } = await params;
  const data = await getPublicStoreWithProducts(tenantSlug);
  if (!data) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <p className="text-gray-500">Loja não encontrada</p>
      </div>
    );
  }
  const { store, products, categories } = data;
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">{store.name}</h1>
        <p className="mt-1 text-gray-500">
          Confira nossos produtos
        </p>
      </div>
      {categories.length > 0 && (
        <div className="mb-6">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">
            Categorias
          </h2>
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <span
                key={cat.id}
                className="rounded-full bg-secondary px-3 py-1 text-sm font-medium text-secondary-foreground"
              >
                {cat.name}
              </span>
            ))}
          </div>
        </div>
      )}
      <div>
        <h2 className="mb-4 text-lg font-semibold text-gray-900">Produtos</h2>
        {products.length === 0 ? (
          <div className="rounded-xl border border-dashed border-gray-300 bg-white p-12 text-center text-gray-500">
            Nenhum produto disponível no momento.
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => (
              <Link
                key={product.id}
                href={`/loja/${tenantSlug}/produtos/${product.slug}`}
                className="block overflow-hidden rounded-xl border border-gray-200 bg-white transition-shadow hover:shadow-md"
              >
                <div className="p-6">
                  <h3 className="font-semibold text-gray-900">{product.name}</h3>
                  {product.category && (
                    <p className="mt-1 text-sm text-gray-500">
                      {product.category.name}
                    </p>
                  )}
                  <p className="mt-2 text-lg font-bold text-primary">
                    R$ {Number(product.price).toFixed(2)}
                  </p>
                  <span className="mt-4 block w-full rounded-lg bg-primary py-2 text-center font-medium text-primary-foreground transition-opacity hover:opacity-90">
                    Ver produto
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
