import Link from "next/link";
import { getPublicProduct } from "@/lib/store-public";
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
  const checkoutUrl = `/loja/${tenantSlug}/checkout?productId=${product.id}`;
  return (
    <div>
      <Link
        href={`/loja/${tenantSlug}`}
        className="mb-4 inline-block text-sm text-gray-500 hover:text-gray-700"
      >
        ← Voltar aos produtos
      </Link>
      <div className="rounded-xl border border-gray-200 bg-white p-8 shadow-sm">
        <div className="grid gap-8 lg:grid-cols-2">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>
            {product.category && (
              <p className="mt-2 text-sm text-gray-500">
                {product.category.name}
              </p>
            )}
            <p className="mt-4 text-3xl font-bold text-primary">
              R$ {Number(product.price).toFixed(2)}
            </p>
            <div className="mt-6 flex gap-3">
              <AddToCartButton
                tenantSlug={tenantSlug}
                productId={product.id}
                productName={product.name}
              />
              <Link href={checkoutUrl} className="flex-1">
                <Button variant="outline" fullWidth>
                  Comprar agora
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
