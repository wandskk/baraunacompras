import Link from "next/link";
import { getPublicProduct, isProductAvailable } from "@/lib/store-public";
import { Button } from "@/components/ui";
import { AddToCartButton } from "./AddToCartButton";

type PageProps = {
  params: Promise<{ tenantSlug: string; productSlug: string }>;
};

export default async function ProductPage({ params }: PageProps) {
  const { tenantSlug, productSlug } = await params;
  const product = await getPublicProduct(tenantSlug, productSlug);
  if (!product) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <p className="text-gray-500">Produto não encontrado</p>
      </div>
    );
  }
  const available = isProductAvailable(product);
  const stock = product.stock ?? 0;
  const checkoutUrl = `/loja/${tenantSlug}/checkout?productId=${product.id}`;
  const price = Number(product.price);

  return (
    <div>
      <Link
        href={`/loja/${tenantSlug}`}
        className="mb-6 inline-block text-sm text-gray-500 hover:text-gray-700"
      >
        ← Voltar aos produtos
      </Link>
      <article className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="grid gap-8 p-6 sm:p-8 lg:grid-cols-2 lg:gap-12">
          <div className="relative aspect-square overflow-hidden rounded-lg bg-gray-100">
            {product.imageUrl ? (
              <img
                src={product.imageUrl}
                alt={product.name}
                className="h-full w-full object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-gray-400">
                <svg
                  className="h-24 w-24"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
            )}
          </div>
          <div className="flex flex-col">
            {product.category && (
              <Link
                href={`/loja/${tenantSlug}?categoryId=${product.category.id}`}
                className="text-sm font-medium text-primary hover:underline"
              >
                {product.category.name}
              </Link>
            )}
            <h1 className="mt-2 text-2xl font-bold text-gray-900 sm:text-3xl">
              {product.name}
            </h1>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <p className="text-3xl font-bold text-primary">
                R$ {price.toFixed(2)}
              </p>
              {available ? (
                <span className="rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-800">
                  Em estoque{stock > 1 ? ` (${stock} unidades)` : ""}
                </span>
              ) : (
                <span className="rounded-full bg-gray-200 px-3 py-1 text-sm font-medium text-gray-600">
                  Indisponível
                </span>
              )}
            </div>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <AddToCartButton
                tenantSlug={tenantSlug}
                productId={product.id}
                productName={product.name}
                disabled={!available}
              />
              <Link href={checkoutUrl} className="flex-1 sm:flex-initial">
                <Button variant="outline" fullWidth disabled={!available}>
                  Comprar agora
                </Button>
              </Link>
            </div>
            {product.description && (
              <div className="mt-8 border-t border-gray-200 pt-6">
                <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
                  Descrição
                </h2>
                <p className="mt-2 whitespace-pre-line text-gray-600">
                  {product.description}
                </p>
              </div>
            )}
          </div>
        </div>
      </article>
    </div>
  );
}
