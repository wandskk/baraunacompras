import Link from "next/link";
import { getPublicStoreWithProducts } from "@/lib/store-public";
import { CheckoutForm } from "./CheckoutForm";

type PageProps = {
  params: Promise<{ tenantSlug: string }>;
  searchParams: Promise<{ productId?: string }>;
};

export default async function CheckoutPage({ params, searchParams }: PageProps) {
  const { tenantSlug } = await params;
  const { productId } = await searchParams;
  const data = await getPublicStoreWithProducts(tenantSlug);
  if (!data || !productId) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center gap-4">
        <p className="text-gray-500">Produto não encontrado.</p>
        <Link href={`/loja/${tenantSlug}`} className="text-primary hover:underline">
          Voltar à loja
        </Link>
      </div>
    );
  }
  const product = data.products.find((p) => p.id === productId);
  if (!product) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center gap-4">
        <p className="text-gray-500">Produto não encontrado.</p>
        <Link href={`/loja/${tenantSlug}`} className="text-primary hover:underline">
          Voltar à loja
        </Link>
      </div>
    );
  }
  const price = Number(product.price);
  return (
    <div>
      <Link
        href={`/loja/${tenantSlug}/produtos/${product.slug}`}
        className="mb-4 inline-block text-sm text-gray-500 hover:text-gray-700"
      >
        ← Voltar ao produto
      </Link>
      <div className="mx-auto max-w-lg rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h1 className="text-xl font-bold text-gray-900">Finalizar compra</h1>
        <div className="mt-4 rounded-lg bg-gray-50 p-4">
          <p className="font-medium text-gray-900">{product.name}</p>
          <p className="mt-1 text-lg font-bold text-primary">
            R$ {price.toFixed(2)}
          </p>
        </div>
        <CheckoutForm
          tenantId={data.store.tenantId}
          storeId={data.store.id}
          productId={product.id}
          productName={product.name}
          total={price}
        />
      </div>
    </div>
  );
}
